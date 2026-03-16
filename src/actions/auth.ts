'use server';

import { createClient } from '@/lib/supabase/server';
import { safeStr } from '@/helpers/data.helpers';
import type { Provider, User } from '@supabase/supabase-js';
import { SITE_URL } from '@/config/constants';
import { OnboardingValues } from '@/lib/schemas/onboarding';
import { getResetPasswordEmailHTML } from '@/templates/emails/getResetPasswordEmail';
import { sendEmail } from './sendEmail';
import { redirect } from 'next/navigation';
import { uploadFile } from './uploadFile';
import { capitalizeWords } from '@/helpers/formatters.helpers';
import { getOnboardingEmailHTML } from '@/templates/emails/getOnboardingEmail';

export const signUp = async (email: string) => {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true, error: null };
};

export const completeProfile = async ({
  full_name,
  password,
}: {
  full_name: string;
  password: string;
}) => {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase.auth.updateUser({
    password,
    data: {
      full_name: safeStr(full_name),
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  const { error: profileError } = await supabase.from('user_profiles').upsert(
    {
      id: user.id,
      full_name: safeStr(full_name),
      email: safeStr(user.email),
      avatar_url: null,
      is_email_verified: true,
      created_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (profileError) {
    throw new Error(profileError.message);
  }

  return { success: true };
};

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  if (!email || !password) return { error: 'Invalid form input' };

  const supabase = await createClient();

  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) return { error: authError.message };
  return {
    success: true,
  };
};

const signInWith = async (provider: Provider) => {
  const supabase = await createClient();

  const auth_callback_url = `${SITE_URL}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: auth_callback_url,
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  redirect(data.url);
};

export const signInWithGoogle = async () => await signInWith('google');

export const logout = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { success: true };
};

export const verifyOtp = async (email: string, token: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error) {
    return { success: false, session: null };
  }
  return { success: true, session: data.session };
};

export const resendOtp = async (email: string) => {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
};

export const getUser = async (): Promise<User | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) return null;

  return data.user;
};

export const getUserProfile = async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: 'User not authenticated',
    };
  }

  const [
    { data: profile, error: profileError },
    { data: userRole, error: userRoleError },
  ] = await Promise.all([
    supabase.from('user_profiles').select().eq('id', user.id).single(),
    supabase.from('user_roles').select().eq('user_id', user.id).single(),
  ]);

  if (profileError || userRoleError) {
    return {
      success: false,
      error: 'Failed to fetch user profile',
    };
  }

  // Merge OAuth avatar and metadata with profile data
  const enrichedProfile = {
    ...profile,
    role: userRole?.role,
    image_url: user.user_metadata?.avatar_url || profile?.avatar_url,
    full_name: profile?.full_name || user.user_metadata?.full_name || 'User',
  };

  return {
    success: true,
    data: enrichedProfile,
  };
};

export const resetPassword = async (password: string, email: string) => {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'User not authenticated' };
  }

  const { error: updateError } = await supabase.auth.updateUser({ password });

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // access profile table for user full name
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  // send password reset notification email
  const customerName = capitalizeWords(safeStr(profile?.full_name));

  const html = getResetPasswordEmailHTML({ customerName });

  await sendEmail({
    to: email,
    subject: `Your password reset was successful`,
    html,
    from: 'Homesphere <support@resend.dev>',
  });

  return {
    success: true,
  };
};

export const resetPasswordForEmail = async (email: string) => {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true, error: null };
};

export const completeOnboarding = async ({
  data,
}: {
  data: OnboardingValues;
}) => {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  if (!data.meansOfIdentification && !data.selfieImage) {
    throw new Error(
      'Either means of identification or selfie image file is required'
    );
  }

  const uploads = await Promise.all([
    uploadFile(data.selfieImage, 'verification-documents', '', user.id, false),
    uploadFile(
      data.meansOfIdentification,
      'verification-documents',
      '',
      user.id,
      false
    ),
  ]);

  const [selfieImg, verificationImg] = uploads;

  uploads.forEach(upload => {
    if (upload.error || !upload.filePath) {
      throw new Error(upload.error ?? 'Upload failed');
    }
  });

  const verification_status = 'documents_submitted';

  const { error: profileError } = await supabase.from('user_profiles').upsert(
    {
      id: user.id,
      phone: data.phone,
      nationality: data.nationality,
      bio: data.bio,
      interest: data.interest,
      city: data.city,
      date_of_birth: data.dateOfBirth,
      updated_at: new Date().toISOString(),
      verification_img: verificationImg.filePath,
      selfie_img: selfieImg.filePath,
      verification_status,
      id_type: data.idType,
      id_number: data.idNumber,
      onboarding_completed: true,
    },
    { onConflict: 'id' }
  );

  if (profileError) {
    throw new Error(profileError.message);
  }

  const { error: roleUpdateError } = await supabase
    .from('user_roles')
    .update({
      role: data.role,
    })
    .eq('user_id', user.id);

  if (roleUpdateError) {
    throw new Error(roleUpdateError.message);
  }

  if (user.id && user.email) {
    const html = getOnboardingEmailHTML(
      capitalizeWords(safeStr(user.user_metadata?.full_name))
    );
    // send onboarding confirmation email
    await sendEmail({
      to: user.email,
      subject: `Welcome to HomeSphere! Your onboarding is complete. Verification underway...`,
      html,
      from: 'HomeSphere <onboarding@resend.dev>',
    });
  }

  return { success: true };
};
