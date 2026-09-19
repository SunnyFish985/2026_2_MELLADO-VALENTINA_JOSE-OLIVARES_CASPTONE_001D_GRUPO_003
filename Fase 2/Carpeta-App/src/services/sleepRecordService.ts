import { supabase } from '../lib/supabase';

export interface NewSleepData {
  babyId: string;
  startTime: string; // Formato ISO 8601 (TIMESTAMPTZ)
  endTime: string;   // Formato ISO 8601 (TIMESTAMPTZ)
  durationMinutes: number;
  sleepType: 'nap' | 'night';
  sleepLocation: 'crib' | 'stroller' | 'parents_bed' | 'arms' | 'other';
  sleepQuality: 'quiet' | 'restless' | 'bad';
  interruptionsCount: number;
  notes?: string;
}

export async function createSleepRecord(data: NewSleepData) {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData?.session?.user) throw new Error('No hay sesión activa');

  const dbPayload = {
    baby_id: data.babyId,
    user_id: sessionData.session.user.id,
    start_time: data.startTime,
    end_time: data.endTime,
    duration_minutes: data.durationMinutes,
    sleep_type: data.sleepType,
    sleep_location: data.sleepLocation,
    sleep_quality: data.sleepQuality,
    interruptions_count: data.interruptionsCount,
    notes: data.notes
  };

  const { error } = await supabase
    .from('sleep_records')
    .insert(dbPayload);

  if (error) throw error;
}

export async function getSleepHistory(babyId: string) {
  const { data, error } = await supabase
    .from('sleep_records')
    .select('*')
    .eq('baby_id', babyId)
    .order('start_time', { ascending: false });

  if (error) throw error;
  return data;
}

export async function checkShouldShowSleepTip(babyId: string): Promise<boolean> {
  // 1. Obtener la fecha de nacimiento del bebé
  const { data: baby, error: babyErr } = await supabase
    .from('babies')
    .select('birth_date')
    .eq('id', babyId)
    .single();

  if (babyErr || !baby?.birth_date) return false;

  // // 2. Contar si ya tiene registros de sueño
  // const { count, error: countErr } = await supabase
  //   .from('sleep_records')
  //   .select('*', { count: 'exact', head: true })
  //   .eq('baby_id', babyId);

  // if (countErr || (count && count > 0)) {
  //   // Si hay error o si el conteo es mayor a 0 (no es el primer registro)
  //   return false;
  // }

  // 3. Calcular la edad en meses
  const birthDate = new Date(baby.birth_date);
  const today = new Date();
  
  // Diferencia en meses aproximada
  const ageInMonths = (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.4);

  // Retorna true solo si tiene menos de 6 meses (y ya sabemos que es el primer registro)
  return ageInMonths < 6;
}