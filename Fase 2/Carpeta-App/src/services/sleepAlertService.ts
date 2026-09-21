import { supabase } from '../lib/supabase';

export interface SleepAlert {
  alert_type: string;
  priority: 'info' | 'observation' | 'warning';
  title: string;
  message: string;

  records_count: number;
  average_duration_minutes: number | null;

  nap_count: number;
  night_count: number;

  quiet_count: number;
  restless_count: number;
  bad_count: number;

  average_interruptions: number | null;
  total_interruptions: number;

  observed_characteristics: string | null;
  related_id: string | null;
}

export async function getSleepAlerts(
  babyId: string
): Promise<SleepAlert[]> {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  const userId = sessionData.session?.user.id;

  if (sessionError || !userId) {
    throw new Error('No hay sesión activa');
  }

  const { data, error } = await supabase.rpc(
    'get_sleep_alerts',
    {
      p_baby_id: babyId,
    }
  );

  if (error) {
    throw error;
  }

  return data ?? [];
}
