import { supabase } from '../lib/supabase';
import { Genero } from '../types/database.types';

// Todos estos campos son obligatorios porque la tabla Usuario los
// exige (NOT NULL). Si falta alguno, el trigger handle_new_user
// fallará al crear la fila y el registro completo se revierte.
export interface DatosNuevoUsuario {
  email: string;
  password: string;
  nombre_usuario: string;
  nombres_u: string;
  apellido_paterno_u: string;
  apellido_materno_u: string;
  fecha_nacimiento_u: string; // 'YYYY-MM-DD'
  genero_u: Genero;
}

// Registra un usuario nuevo. Todo lo que va dentro de options.data
// llega como "raw_user_meta_data" al trigger handle_new_user (sección
// 1.3), que lo usa para crear la fila espejo en public.Usuario.
export async function registrarUsuario(datos: DatosNuevoUsuario) {
  const { data, error } = await supabase.auth.signUp({
    email: datos.email,
    password: datos.password,
    options: {
      data: {
        nombre_usuario: datos.nombre_usuario,
        nombres_u: datos.nombres_u,
        apellido_paterno_u: datos.apellido_paterno_u,
        apellido_materno_u: datos.apellido_materno_u,
        fecha_nacimiento_u: datos.fecha_nacimiento_u,
        genero_u: datos.genero_u,
      },
    },
  });

  console.log(process.env.EXPO_PUBLIC_SUPABASE_URL)
  console.log(datos)

  if (error) throw error;
  return data;
}

export async function iniciarSesion(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}