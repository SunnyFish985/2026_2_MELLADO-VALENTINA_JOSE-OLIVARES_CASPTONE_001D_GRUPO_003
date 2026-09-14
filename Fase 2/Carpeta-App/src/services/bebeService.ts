import { supabase } from '../lib/supabase';
import { Bebe } from '../types/database.types';

// CAMBIO: ya ningún campo es opcional (?) porque la tabla Bebe exige
// TODOS estos datos como NOT NULL. Si el formulario no completa uno,
// Supabase devolverá un error y el insert no se ejecutará.
interface DatosNuevoBebe {
  nombres_b: string;
  apellido_paterno_b: string;
  apellido_materno_b: string;
  fecha_nacimiento_b: string; // formato 'YYYY-MM-DD'
  hora_nacimiento_b: string; // formato 'HH:MM'
  peso_nacimiento_g_b: number;
  altura_nacimiento_cm_b: number;
  semanas_gestacion_b: number;
  sexo_b: 'M' | 'F' | 'Otro';
}

export async function crearBebeYAsignarAdmin(datos: DatosNuevoBebe) {
  // 1. Obtenemos el usuario logueado actualmente
  const { data: { user }, error: errorUsuario } = await supabase.auth.getUser();
  if (errorUsuario || !user) throw new Error('No hay sesión activa');

  console.log("antes de insertar")
  console.log(datos)

  // 2. Insertamos el bebé
  const { data: bebeCreado, error: errorBebe } = await supabase
    .from('Bebe')
    .insert(datos)
    .select()
    .single(); // .single() = esperamos y devolvemos solo 1 fila, no un arreglo

  if (errorBebe) throw errorBebe;
  
    console.log("despues de insertar")

  // 3. Generamos el código de invitación llamando a la función SQL
  const { data: codigo, error: errorCodigo } = await supabase
    .rpc('generar_codigo_invitacion');
    // .rpc() = "Remote Procedure Call", así se invocan funciones SQL
    // personalizadas (las que creamos en el script) desde el cliente.

  if (errorCodigo) throw errorCodigo;

  // 4. Creamos el vínculo Usuario_Bebe, marcándolo como administrador
  const { error: errorVinculo } = await supabase
    .from('Usuario_Bebe')
    .insert({
      id_usuario: user.id,
      id_bebe: (bebeCreado as Bebe).id_bebe,
      rol: 'administrador',
      nivel_permiso: 'completo',
      codigo_invitacion: codigo,
      estado_invitacion: 'aceptada',
    });

  if (errorVinculo) throw errorVinculo;

  return { bebe: bebeCreado as Bebe, codigoInvitacion: codigo as string };
}

export async function unirseConCodigo(codigo: string) {
  const { data: { user }, error: errorUsuario } = await supabase.auth.getUser();
  if (errorUsuario || !user) throw new Error('No hay sesión activa');

  // 1. Buscamos si el código existe
  const { data: vinculoExistente, error: errorBusqueda } = await supabase
    .from('Usuario_Bebe')
    .select('id_bebe')
    .eq('codigo_invitacion', codigo.toUpperCase())
    .single();

  if (errorBusqueda || !vinculoExistente) {
    throw new Error('El código de invitación no existe');
  }

  // 2. Creamos el vínculo para el usuario actual, como "cuidador"
  const { error: errorInsert } = await supabase
    .from('Usuario_Bebe')
    .insert({
      id_usuario: user.id,
      id_bebe: vinculoExistente.id_bebe,
      rol: 'cuidador',
      nivel_permiso: 'completo',
      estado_invitacion: 'aceptada',
      // Nota: no repetimos el mismo codigo_invitacion aquí porque la
      // columna es "unique" (un código = un dueño). Este nuevo cuidador
      // queda vinculado al bebé, pero sin ser dueño del código original.
    });

  if (errorInsert) throw errorInsert;
}