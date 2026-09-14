import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Leemos las variables de entorno definidas en .env
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Creamos UNA sola instancia del cliente. La importaremos desde
// cualquier parte de la app que necesite hablar con Supabase.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Le decimos a Supabase que guarde la sesión (el token del usuario
    // logueado) usando AsyncStorage, que es el "almacenamiento local"
    // del celular. Así, si el usuario cierra la app, sigue logueado
    // la próxima vez que la abra.
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // esto es para apps web, no lo necesitamos en mobile
  },
});