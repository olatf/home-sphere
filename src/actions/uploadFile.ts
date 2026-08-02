'use server';

import { createClient } from '@/lib/supabase/server';

export async function uploadFile(
  file: File | string,
  bucket: string,
  folder = '',
  isPublic = true
): Promise<{
  filePath: string | null;
  url: string | null;
  success: boolean;
  error: string | null;
}> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        filePath: null,
        url: null,
        success: false,
        error: 'User authentication failed.',
      };
    }

    let uploadData: File | Blob | Uint8Array | undefined;
    let fileExt = 'bin';
    let contentType = 'application/octet-stream';

    //  Handle File object
    if (file instanceof File) {
      if (file.size === 0) {
        return {
          filePath: null,
          url: null,
          success: false,
          error: 'File is empty.',
        };
      }
      uploadData = file;
      fileExt = file.name.split('.').pop() ?? 'bin';
      contentType = file.type || contentType;
    }

    // Handle base64 data URL
    else if (typeof file === 'string' && file.startsWith('data:')) {
      const [meta, base64Data] = file.split(',', 2);
      const mime = meta.match(/:(.*?);/)?.[1];
      contentType = mime ?? contentType;
      fileExt = mime?.split('/')[1] ?? 'bin';
      uploadData = Uint8Array.from(Buffer.from(base64Data, 'base64'));
    }

    // Handle remote URL
    else if (typeof file === 'string' && /^https?:\/\//.test(file)) {
      const res = await fetch(file);
      if (!res.ok) {
        return {
          filePath: null,
          url: null,
          success: false,
          error: 'Failed to fetch file from URL.',
        };
      }
      const buffer = await res.arrayBuffer();
      uploadData = new Uint8Array(buffer);
      contentType = res.headers.get('content-type') ?? contentType;
      fileExt = contentType.split('/')[1]?.split(';')[0] ?? 'bin'; // strip '; charset=...' if present
    } else {
      return {
        filePath: null,
        url: null,
        success: false,
        error: 'Unsupported file input.',
      };
    }

    if (!uploadData) {
      return {
        filePath: null,
        url: null,
        success: false,
        error: 'No valid file data to upload.',
      };
    }

    // ── Build file path ────────────────────────────────────────────
    // RLS policy: (storage.foldername(name))[1] = auth.uid()
    // So the path MUST start with the user's ID.
    //
    // Structure:  {userId}/{folder}/{timestamp}-{random}.{ext}
    //
    // Examples:
    //   properties bucket:          abc123/feature-images/1234567890-x9k2.jpg
    //   properties bucket:          abc123/gallery/1234567890-x9k2.jpg
    //   proof-of-ownership bucket:  abc123/1234567890-x9k2.pdf
    //   avatars bucket:             abc123/1234567890-x9k2.jpg
    //   kyc-documents bucket:       abc123/1234567890-x9k2.jpg

    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = folder
      ? `${user.id}/${folder}/${uniqueName}` // e.g. userId/feature-images/file.jpg
      : `${user.id}/${uniqueName}`; // e.g. userId/file.jpg

    // Upload
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, uploadData, { upsert: true, contentType });

    if (uploadError) {
      return {
        filePath: null,
        url: null,
        success: false,
        error: uploadError.message,
      };
    }

    // Return URL
    if (isPublic) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return { filePath, url: data.publicUrl, success: true, error: null };
    }

    // Private bucket — caller must generate a signed URL when needed
    return { filePath, url: null, success: true, error: null };
  } catch (error) {
    return {
      filePath: null,
      url: null,
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed.',
    };
  }
}

// ─── Helper: generate a signed URL for private bucket files ───────
// Use this in server components or server actions when you need to
// display a private file (proof of ownership, KYC documents, etc.)
//
// Example:
//   const signedUrl = await getSignedUrl('proof-of-ownership', filePath);

export async function getSignedUrl(
  bucket: string,
  filePath: string,
  expiresInSeconds = 3600 // 1 hour default
): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresInSeconds);

  if (error) return { url: null, error: error.message };
  return { url: data.signedUrl, error: null };
}

// for deleting files
export async function deleteFile(
  bucket: string,
  filePath: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase.storage.from(bucket).remove([filePath]);

  if (error) return { success: false, error: error.message };
  return { success: true, error: null };
}

export async function deleteFileByUrl(
  url: string
): Promise<{ success: boolean; error: string | null }> {
  if (!url) return { success: false, error: 'No URL provided' };

  try {
    const parsed = new URL(url);

    // pathname looks like: /storage/v1/object/public/{bucket}/{rest/of/path}
    // or:                  /storage/v1/object/sign/{bucket}/{rest/of/path}
    const pathParts = parsed.pathname.split('/');

    // Expected: ['', 'storage', 'v1', 'object', 'public'|'sign', bucket, ...filePath]
    const objectIndex = pathParts.indexOf('object');
    if (objectIndex === -1) {
      return { success: false, error: 'Not a valid Supabase storage URL' };
    }

    // index:  0    1        2   3       4             5       6+
    // parts: ['', 'storage','v1','object','public', 'bucket', 'folder', 'file.jpg']
    const bucket = pathParts[objectIndex + 2]; // e.g. 'properties'
    const filePath = pathParts.slice(objectIndex + 3).join('/'); // e.g. 'userId/feature-images/file.jpg'

    if (!bucket || !filePath) {
      return {
        success: false,
        error: 'Could not parse bucket or file path from URL',
      };
    }

    return await deleteFile(bucket, filePath);
  } catch {
    return { success: false, error: 'Invalid URL' };
  }
}
