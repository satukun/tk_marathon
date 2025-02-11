import { createClient } from '@supabase/supabase-js';

// 開発用のデフォルト値を設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wazyihwhrrcycvmcwnta.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhenlpaHdocnJjeWN2bWN3bnRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MTMzNTIsImV4cCI6MjA1NDA4OTM1Mn0.-boLjBzJ_4CcNIu_jB1oznvajryaev98kWsGLscEtcc';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: false
    }
  }
);

export type Runner = {
  id: string;
  runner_id: string;
  nickname: string;
  language: string;
  target_time: string;
  target_time_number: number;
  message: string;
  message_number: number;
  upper_phrase: string;
  lower_phrase: string;
  created_at: string;
  photo_url?: string;
};

export async function getRunners(): Promise<Runner[]> {
  const { data, error } = await supabase
    .from('runners')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching runners:', error);
    throw error;
  }

  return data || [];
}

export async function getRunner(runnerId: string): Promise<Runner | null> {
  const { data, error } = await supabase
    .from('runners')
    .select('*')
    .eq('runner_id', runnerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching runner:', error);
    throw error;
  }

  return data;
}

export async function addRunner(runner: {
  runner_id: string;
  nickname: string;
  language: string;
  target_time: string;
  target_time_number: number;
  message: string;
  message_number: number;
  upper_phrase: string;
  lower_phrase: string;
}): Promise<void> {
  try {
    const { error: insertError } = await supabase
      .from('runners')
      .insert([runner]);

    if (insertError) {
      console.error('Error adding runner:', insertError);
      throw insertError;
    }
  } catch (error) {
    console.error('Failed to add runner:', error);
    throw error;
  }
}

export async function updateRunner(
  runnerId: string,
  updates: {
    photo_url?: string;
    age_group?: string;
    gender?: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from('runners')
    .update(updates)
    .eq('runner_id', runnerId);

  if (error) {
    console.error('Error updating runner:', error);
    throw error;
  }
}