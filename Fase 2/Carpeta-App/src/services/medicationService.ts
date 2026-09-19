import { supabase } from '../lib/supabase';

export type MedicationLogStatus = 'administered' | 'skipped' | 'delayed';

export interface NewMedicationData {
  babyId: string;
  medicationName: string;
  doseAmount: number;
  doseUnit: string;
  frequencyHours: number;
  startDate: string;
  endDate?: string;
  doctorName?: string;
  doctorRut?: string;
}

export interface NewMedicationLogData {
  medicationId: string;
  scheduledAt: string;
  status: MedicationLogStatus;
  notes?: string;
}

async function getSessionUserId() {
  const { data: sessionData, error } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;

  if (error || !userId) throw new Error('No hay sesión activa');
  return userId;
}

export async function createMedication(data: NewMedicationData) {
  const userId = await getSessionUserId();

  const { error } = await supabase.from('medications').insert({
    baby_id: data.babyId,
    user_id: userId,
    medication_name: data.medicationName,
    dose_amount: data.doseAmount,
    dose_unit: data.doseUnit,
    frequency_hours: data.frequencyHours,
    start_date: data.startDate,
    end_date: data.endDate || null,
    doctor_name: data.doctorName || null,
    doctor_rut: data.doctorRut || null,
  });

  if (error) throw error;
}

export async function getMedications(babyId: string) {
  const userId = await getSessionUserId();

  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('baby_id', babyId)
    .eq('user_id', userId)
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getMedicationLogs(medicationId: string) {
  await getSessionUserId();

  const { data, error } = await supabase
    .from('medication_logs')
    .select('*')
    .eq('medication_id', medicationId)
    .order('scheduled_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createMedicationLog(data: NewMedicationLogData) {
  const userId = await getSessionUserId();

  const { error } = await supabase.from('medication_logs').insert({
    medication_id: data.medicationId,
    user_id: userId,
    scheduled_at: data.scheduledAt,
    status: data.status,
    notes: data.notes || null,
  });

  if (error) throw error;
}
