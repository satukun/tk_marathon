import { createClient } from '@supabase/supabase-js';

// 開発用のデフォルト値を設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wazyihwhrrcycvmcwnta.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhenlpaHdocnJjeWN2bWN3bnRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MTMzNTIsImV4cCI6MjA1NDA4OTM1Mn0.-boLjBzJ_4CcNIu_jB1oznvajryaev98kWsGLscEtcc';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export type Runner = {
  id: string;
  runner_id: string;
  nickname: string;
  language: string;
  target_time: string;
  message: string;
  created_at: string;
  age_group?: string;
  gender?: string;
  runner_name?: string;
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
  message: string;
  age_group?: string;
  gender?: string;
  runner_name?: string;
}): Promise<void> {
  const { error: insertError } = await supabase
    .from('runners')
    .insert([runner]);

  if (insertError) {
    console.error('Error adding runner:', insertError);
    throw insertError;
  }

  const { data: allRunners } = await supabase
    .from('runners')
    .select('id, created_at')
    .order('created_at', { ascending: false });

  if (allRunners && allRunners.length > 10) {
    const oldRunnerIds = allRunners
      .slice(10)
      .map(runner => runner.id);

    if (oldRunnerIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('runners')
        .delete()
        .in('id', oldRunnerIds);

      if (deleteError) {
        console.error('Error deleting old runners:', deleteError);
      }
    }
  }
}

export async function updateRunner(
  runnerId: string,
  updates: {
    age_group?: string;
    gender?: string;
    runner_name?: string;
    photo_url?: string;
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

// 画像アップロード用の関数
export async function uploadRunnerPhoto(
  runnerId: string, 
  photoBlob: Blob
): Promise<string> {
  // ファイル名を生成（タイムスタンプを含めて一意にする）
  const fileName = `${runnerId}_${Date.now()}.jpg`;
  const filePath = `photos/${fileName}`;

  // Storageにアップロード
  const { error: uploadError } = await supabase.storage
    .from('runner-photos')
    .upload(filePath, photoBlob, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Error uploading photo:', uploadError);
    throw uploadError;
  }

  // 公開URLを取得
  const { data } = supabase.storage
    .from('runner-photos')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// 画像の削除用の関数
export async function deleteRunnerPhoto(photoPath: string): Promise<void> {
  const { error } = await supabase.storage
    .from('runner-photos')
    .remove([photoPath]);

  if (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
}