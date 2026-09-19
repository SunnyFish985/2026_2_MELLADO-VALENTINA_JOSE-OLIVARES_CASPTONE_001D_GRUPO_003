import { supabase } from '../lib/supabase';

export interface FoodRecordData {
  babyId: string;
  foodType: 'breast' | 'formula' | 'homemade' | 'commercial';
  amount?: number;
  breastSide?: 'left' | 'right' | 'both';
  ingredients?: string;
  brand?: string;
  batchNumber?: string;
  recordedAt?: string; // Fecha y hora seleccionada
}

export async function createFoodRecord(data: FoodRecordData) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.user) throw new Error('No hay sesión activa');

  const dbPayload = {
    baby_id: data.babyId,
    user_id: session.user.id,
    food_type: data.foodType,
    amount: data.amount,
    breast_side: data.breastSide,
    ingredients: data.ingredients,
    brand: data.brand,
    batch_number: data.batchNumber,
    recorded_at: data.recordedAt,
  };

  const { error } = await supabase
    .from('food_records')
    .insert(dbPayload);

  if (error) throw error;
}

export async function getFoodHistory(babyId: string) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.user) throw new Error('No hay sesión activa');

  const { data, error } = await supabase
    .from('food_records')
    .select('*')
    .eq('baby_id', babyId)
    .order('recorded_at', { ascending: false });

  if (error) throw error;
  return data;
}
