'use server';

import { createClient } from '@/lib/supabase/server';

export async function uploadFile(
  file: File | string,
  bucket: string,
  folder = '',
  Id?: string,
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

    // HANDLE FILE
    if (file instanceof File) {
      if (file.size === 0) {
        return {
          filePath: null,
          url: null,
          success: false,
          error: 'File is empty',
        };
      }

      uploadData = file;
      fileExt = file.name.split('.').pop() ?? 'bin';
      contentType = file.type || contentType;
    }

    // HANDLE STRING
    else if (typeof file === 'string') {
      // BASE64 IMAGE
      if (file.startsWith('data:')) {
        const [meta, base64Data] = file.split(',', 2);
        const mime = meta.match(/:(.*?);/)?.[1];

        contentType = mime ?? contentType;
        fileExt = mime?.split('/')[1] ?? 'bin';

        uploadData = Uint8Array.from(Buffer.from(base64Data, 'base64'));
      }

      // URL
      else if (/^https?:\/\//.test(file)) {
        const res = await fetch(file);

        if (!res.ok) {
          return {
            filePath: null,
            url: null,
            success: false,
            error: 'Failed to fetch file from URL',
          };
        }

        const buffer = await res.arrayBuffer();

        uploadData = new Uint8Array(buffer);
        contentType = res.headers.get('content-type') ?? contentType;
        fileExt = contentType.split('/')[1] ?? 'bin';
      } else {
        return {
          filePath: null,
          url: null,
          success: false,
          error: 'Unsupported file type',
        };
      }
    }

    if (!uploadData) {
      return {
        filePath: null,
        url: null,
        success: false,
        error: 'No valid file data to upload',
      };
    }

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}.${fileExt}`;

    const filePath = folder
      ? `${folder}/${fileName}`
      : Id
        ? `id_${Id}/${fileName}`
        : `id_${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, uploadData, {
        upsert: true,
        contentType,
      });

    if (uploadError) {
      return {
        filePath: null,
        url: null,
        success: false,
        error: uploadError.message,
      };
    }

    if (isPublic) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

      return {
        filePath,
        url: data.publicUrl,
        success: true,
        error: null,
      };
    }

    return {
      filePath,
      url: null,
      success: true,
      error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';

    return {
      filePath: null,
      url: null,
      success: false,
      error: message,
    };
  }
}
