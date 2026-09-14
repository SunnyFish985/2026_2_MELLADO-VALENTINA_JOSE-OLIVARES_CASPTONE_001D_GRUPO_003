import { supabase } from '../lib/supabase';

export interface DatosComida {
  id_bebe: string;
  tipo_comida: 'pecho' | 'formula' | 'casera' | 'industrial';
  cantidad_comida?: number;
  lado_pecho?: 'izquierdo' | 'derecho' | 'ambos';
  ingredientes?: string;
  marca?: string;
  numero_lote?: string;
}

export async function crearRegistroComida(datos: DatosComida) {
  const { data: { user }, error: errorUsuario } = await supabase.auth.getUser();
  if (errorUsuario || !user) throw new Error('No hay sesión activa');

  const { error } = await supabase.from('Registro_Comida').insert({
    ...datos,
    id_usuario: user.id,
  });

  if (error) throw error;
}
export async function obtenerHistorialComidas(idBebe: string) {
  const { data: { user }, error: errorUsuario } = await supabase.auth.getUser();
  if (errorUsuario || !user) throw new Error('No hay sesión activa');

  const { data, error } = await supabase
    .from('Registro_Comida')
    .select('*')
    .eq('id_bebe', idBebe)
    .order('fecha_hora_comida', { ascending: false }); // false = los más nuevos primero

  if (error) throw error;
  return data;
}
