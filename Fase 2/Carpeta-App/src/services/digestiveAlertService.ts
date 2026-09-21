import { supabase } from '../lib/supabase';

export interface DigestiveAlert {
  alert_type: string;
  priority: 'info' | 'observation' | 'warning';
  title: string;
  message: string;
  observations_count: number;
  concerning_count: number;
  observation_score: number;
  observed_characteristics: string | null;
  related_id: string | null;
}

export async function getDigestiveAlerts(
  babyId: string
): Promise<DigestiveAlert[]> {
  const { data: { session }, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    throw new Error('No hay sesión activa');
  }

  const { data, error } = await supabase.rpc(
    'get_digestive_alerts',
    {
      p_baby_id: babyId,
    }
  );

  if (error) {
    console.error('Error obteniendo alertas digestivas:', error);
    throw error;
  }

  return data ?? [];
}
