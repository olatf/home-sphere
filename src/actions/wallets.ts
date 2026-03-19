'use server';

import bcrypt from 'bcryptjs';
import { createClient } from '@/lib/supabase/server';

export const setWalletPin = async (pin: string) => {
  if (pin.length !== 4) {
    return { success: false, error: 'PIN must be 4 digits' };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const hash = await bcrypt.hash(pin, 10);

  const { error } = await supabase.from('wallet_pins').upsert(
    {
      user_id: user.id,
      pin_hash: hash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true };
};

export async function verifyPin(pin: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from('wallet_pins')
    .select('pin_hash')
    .eq('user_id', user!.id)
    .single();

  if (!data) {
    return {
      success: false,
      error: 'PIN not set',
    };
  }

  const valid = await bcrypt.compare(pin, data.pin_hash);

  if (!valid) {
    return {
      success: false,
      error: 'Invalid PIN',
    };
  }

  return {
    success: true,
  };
}

export async function updateWalletPin(NewPin: string, oldPin: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hash = await bcrypt.hash(NewPin, 10);

  const result = await verifyPin(oldPin);

  if (result.error) {
    return {
      success: false,
      error: result.error,
    };
  }

  const res = await supabase.from('wallet_pins').upsert(
    {
      user_id: user!.id,
      pin_hash: hash,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id',
    }
  );

  if (res.error) {
    return {
      success: false,
      error: res.error.message,
    };
  }
  return {
    success: true,
  };
}

export const getUserWallet = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data: walletData, error: walletError } = await supabase
    .from('wallets')
    .select()
    .eq('user_id', user.id)
    .single();

  if (walletError) {
    return { success: false, error: walletError.message };
  }

  const { data: pinData, error: pinError } = await supabase
    .from('wallet_pins')
    .select('pin_hash')
    .eq('user_id', user.id)
    .maybeSingle();

  if (pinError) console.error('Error fetching pin:', pinError.message);

  const refindedData = { ...walletData, hasSetPin: !!pinData };

  return { success: true, data: refindedData };
};

export const getUserWalletTransactions = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data ?? [] };
};
