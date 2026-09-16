import { supabase } from '../lib/supabase';
import { Gender } from '../types/database.types';

// Las variables cambian a camelCase y en inglés
export interface NewUserData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  birthDate: string; // 'YYYY-MM-DD'
  gender: Gender;
}

// Registra un usuario nuevo. Todo lo que va dentro de options.data
// llega como "raw_user_meta_data" al trigger handle_new_user,
// que lo usa para crear la fila espejo en public.users.
export async function registerUser(data: NewUserData) {
  // Renombramos 'data' a 'responseData' para que no choque con el parámetro 'data'
  const { data: responseData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      // Mapeamos de camelCase (frontend) a snake_case (para el trigger de Supabase)
      data: {
        username: data.username,
        first_name: data.firstName,
        paternal_last_name: data.paternalLastName,
        maternal_last_name: data.maternalLastName,
        birth_date: data.birthDate,
        gender: data.gender,
      },
    },
  });

  console.log(process.env.EXPO_PUBLIC_SUPABASE_URL);
  console.log(data);

  if (error) throw error;
  return responseData;
}

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
