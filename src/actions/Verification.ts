'use server';

import { getErrorMessage } from '@/helpers/error.helpers';
import { createClient } from '@/lib/supabase/server';

export async function getSignedDocUrl(
  filePath: string,
  bucket: string,
  expiresIn = 60 * 10 // 10 minutes default
): Promise<{
  url: string | null;
  success: boolean;
  error: string | null;
}> {
  try {
    if (!filePath) {
      return {
        url: null,
        success: false,
        error: 'File path is required',
      };
    }

    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      return {
        url: null,
        success: false,
        error: error.message,
      };
    }

    return {
      url: data?.signedUrl ?? null,
      success: true,
      error: null,
    };
  } catch (err) {
    return {
      url: null,
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create signed URL',
    };
  }
}

export async function handleDocumentSubmit(formData: FormData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const file = formData.get('documents') as File | null;

    if (!file || file.size === 0) {
      return { success: false, error: 'File is required' };
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('verification_img')
      .eq('id', user.id)
      .single();

    if (profile?.verification_img) {
      await supabase.storage
        .from('verification-documents')
        .remove([profile.verification_img]);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}.${fileExt}`;

    const filePath = `id_${user.id}/${fileName}`;

    // Upload new file
    const { error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    //  Update profile with file path (NOT URL)
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        verification_img: filePath,
        id_type: formData.get('id_type') as string,
        verification_status: 'documents_submitted',
      })
      .eq('id', user.id);

    if (updateError) {
      const errorMessage = getErrorMessage(updateError);
      return { success: false, error: errorMessage };
    }

    return {
      success: true,
      filePath,
    };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
