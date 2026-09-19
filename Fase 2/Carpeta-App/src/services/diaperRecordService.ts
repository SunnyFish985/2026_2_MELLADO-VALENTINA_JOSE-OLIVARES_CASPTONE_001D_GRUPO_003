import { supabase } from '../lib/supabase';

export interface DiaperRecordData {
  babyId: string;
  wasteType: string;
  peeColor?: string;
  poopColor?: string;
  poopTexture?: string;
  poopOdor?: string;
  hadLeak?: boolean;
  diaperType?: string;
  diaperBrand?: string;
  notes?: string;
  changeDate: string; 
  changeTime: string; 
}

export async function createDiaperRecord(data: DiaperRecordData) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.user) throw new Error('No hay sesión activa');

  const dbPayload = {
    baby_id: data.babyId,
    user_id: session.user.id,
    waste_type: data.wasteType,
    pee_color: data.peeColor,
    poop_color: data.poopColor,
    poop_texture: data.poopTexture,
    poop_odor: data.poopOdor,
    had_leak: data.hadLeak,
    diaper_type: data.diaperType,
    diaper_brand: data.diaperBrand,
    notes: data.notes,
    change_date: data.changeDate,
    change_time: data.changeTime,
  };

  const { error } = await supabase
    .from('diaper_records')
    .insert(dbPayload);

  if (error) throw error;
}

export async function getDiaperHistory(babyId: string) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.user) throw new Error('No hay sesión activa');

  const { data, error } = await supabase
    .from('diaper_records')
    .select('*')
    .eq('baby_id', babyId)
    .order('change_date', { ascending: false })
    .order('change_time', { ascending: false });

  if (error) throw error;
  return data;
}