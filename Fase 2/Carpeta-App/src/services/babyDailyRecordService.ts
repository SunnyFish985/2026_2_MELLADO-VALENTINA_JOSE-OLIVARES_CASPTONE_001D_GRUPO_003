import { supabase } from '../lib/supabase';

export type DailyRecord = {
  id: string;
  type: 'Comida' | 'Pañal' | 'Sueño' | 'Medicamento';
  date: string;
  time: string;
  summary: string;
  details: any;
};

const localDate = (value: string | Date) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const timeFrom = (value: string | null | undefined) => {
  if (!value) return '';
  if (/^\d{2}:\d{2}/.test(value)) return value.substring(0, 5);
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export async function getBabyDailyRecords(babyId: string, date: string): Promise<DailyRecord[]> {
  const [foods, diapers, sleeps, medications] = await Promise.all([
    supabase.from('food_records').select('*').eq('baby_id', babyId),
    supabase.from('diaper_records').select('*').eq('baby_id', babyId),
    supabase.from('sleep_records').select('*').eq('baby_id', babyId),
    supabase.from('medications').select('*').eq('baby_id', babyId),
  ]);

  const medicationIds = (medications.data || []).map((item) => item.id);
  const medicationLogs = medicationIds.length
    ? await supabase.from('medication_logs').select('*').in('medication_id', medicationIds)
    : { data: [], error: null };

  const errors = [foods.error, diapers.error, sleeps.error, medications.error, medicationLogs.error].filter(Boolean);
  if (errors.length) throw errors[0];

  const records: DailyRecord[] = [];
  (foods.data || []).forEach((item) => {
    if (localDate(item.recorded_at) === date) records.push({ id: `food-${item.id}`, type: 'Comida', date, time: timeFrom(item.recorded_at), summary: item.food_type, details: item });
  });
  (diapers.data || []).forEach((item) => {
    if (item.change_date === date) records.push({ id: `diaper-${item.id}`, type: 'Pañal', date, time: timeFrom(item.change_time), summary: item.waste_type, details: item });
  });
  (sleeps.data || []).forEach((item) => {
    if (localDate(item.start_time) === date) records.push({ id: `sleep-${item.id}`, type: 'Sueño', date, time: timeFrom(item.start_time), summary: item.sleep_type, details: item });
  });
  (medicationLogs.data || []).forEach((item) => {
    const medication = (medications.data || []).find((entry) => entry.id === item.medication_id);
    if (localDate(item.scheduled_at) === date) records.push({ id: `medication-${item.id}`, type: 'Medicamento', date, time: timeFrom(item.scheduled_at), summary: medication?.medication_name || 'Toma registrada', details: { ...item, medication } });
  });

  return records.sort((a, b) => a.time.localeCompare(b.time));
}

export async function getBabyRecordsForMonth(babyId: string, month: string) {
  const dates = new Set<string>();
  const today = new Date();
  const [year, monthNumber] = month.split('-').map(Number);
  const daysInMonth = new Date(year, monthNumber, 0).getDate();

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${year}-${String(monthNumber).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const records = await getBabyDailyRecords(babyId, date);
    if (records.length) dates.add(date);
  }

  return { dates, today };
}