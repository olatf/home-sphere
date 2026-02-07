'use server';

import { createClient } from '@/lib/supabase/server';
/**
 * Dynamically uploads a file to any Supabase Storage bucket (server-side safe).
 *
 * @param file - The file to upload (from client input)
 * @param bucket - The name of the Supabase Storage bucket (e.g. "avatarurls", "event_images")
 * @param folder - Optional folder path inside the bucket (e.g. "user_avatars/", "financial_csvs")
 * @param Id - Optional identifier to include in metadata and file path (e.g. user ID, organization ID)
 * @returns The public URL of the uploaded file
 */

export async function uploadFile(
  file: File,
  bucket: string,
  folder = '',
  Id?: string
): Promise<{
  publicUrl: string | null;
  success: boolean;
  error: string | null;
}> {
  const supabase = await createClient();

  try {
    // Validate file
    if (!file || file.size === 0) {
      return {
        publicUrl: null,
        success: false,
        error: 'File is empty or invalid',
      };
    }

    // Get authenticated user to ensure RLS works properly
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        publicUrl: null,
        success: false,
        error: 'User authentication failed. Please log in.',
      };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}.${fileExt}`;

    // Build file path with user ID for RLS compliance
    const filePath = folder
      ? `${folder}/${fileName}`
      : Id
        ? `id_${Id}/${fileName}`
        : `id_${user.id}/${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        publicUrl: null,
        success: false,
        error: error.message || 'Failed to upload file',
      };
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return {
      publicUrl: data?.publicUrl || null,
      success: true,
      error: null,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to upload file.';
    console.error('Upload error:', errorMessage);

    return {
      publicUrl: null,
      success: false,
      error: errorMessage,
    };
  }
}
