// Nota: casi todos los campos de Usuario y Bebe son obligatorios ahora
// en la base de datos (NOT NULL), así que aquí NO llevan "| null".
// Esto ayuda a TypeScript a "recordarte" en el formulario que un campo
// es obligatorio, porque si intentas guardar undefined, marcará error.

export type Genero = 'femenino' | 'masculino' | 'otro' | 'preferiria_no_decir';

export interface Usuario {
  id_usuario: string;
  nombre_usuario: string;
  nombres_u: string;
  apellido_paterno_u: string;
  apellido_materno_u: string;
  fecha_nacimiento_u: string; // formato 'YYYY-MM-DD'
  genero_u: Genero;
  fecha_registro_u: string;
}

export interface Bebe {
  id_bebe: string;
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

export interface UsuarioBebe {
  id_usuario_bebe: string;
  id_usuario: string;
  id_bebe: string;
  rol: 'administrador' | 'cuidador';
  nivel_permiso: 'completo' | 'lectura';
  codigo_invitacion: string | null;
  estado_invitacion: 'pendiente' | 'aceptada';
}

export interface RegistroComida {
  id_comida: string;
  id_bebe: string;
  id_usuario: string;
  tipo_comida: 'pecho' | 'formula' | 'casera' | 'industrial';
  fecha_hora_comida: string; // ISO string, ej. '2026-09-10T14:30:00Z'
  cantidad_comida: number | null;
  lado_pecho: 'izquierdo' | 'derecho' | 'ambos' | null;
  ingredientes: string | null;
  marca: string | null;
  numero_lote: string | null;
}