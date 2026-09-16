import { supabase } from '../lib/supabase';
import { Baby } from '../types/database.types';

export interface NewBabyData {
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  birthWeightG: number;
  birthHeightCm: number;
  gestationWeeks: number;
  sex: 'M' | 'F' | 'Other';
}

export async function createBabyAndAssignAdmin(data: NewBabyData) {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData?.session?.user) throw new Error('No hay sesión activa');

  // Llamamos a la función RPC que creamos en Supabase
  const { data: result, error: rpcError } = await supabase.rpc('create_baby_with_admin', {
    p_first_name: data.firstName,
    p_paternal_last_name: data.paternalLastName,
    p_maternal_last_name: data.maternalLastName,
    p_birth_date: data.birthDate,
    p_birth_time: data.birthTime,
    p_birth_weight_g: data.birthWeightG,
    p_birth_height_cm: data.birthHeightCm,
    p_gestation_weeks: data.gestationWeeks,
    p_sex: data.sex
  });

  if (rpcError) throw rpcError;

  // Retornamos el código de invitación que la función nos devolvió
  return {
    inviteCode: result.inviteCode
  };
}

export async function joinWithCode(code: string) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('No hay sesión activa');

  // 1. Buscamos el código en 'user_babies'
  const { data: existingLink, error: searchError } = await supabase
    .from('user_babies')
    .select('baby_id')
    .eq('invite_code', code.toUpperCase())
    .single();

  if (searchError || !existingLink) {
    throw new Error('El código de invitación no existe o es inválido');
  }

  // 2. Creamos el vínculo para el cuidador
  const { error: insertError } = await supabase
    .from('user_babies')
    .insert({
      user_id: user.id,
      baby_id: existingLink.baby_id,
      role: 'caregiver',
      permission_level: 'full',
      invite_status: 'accepted',
    });

  if (insertError) throw insertError;
}
