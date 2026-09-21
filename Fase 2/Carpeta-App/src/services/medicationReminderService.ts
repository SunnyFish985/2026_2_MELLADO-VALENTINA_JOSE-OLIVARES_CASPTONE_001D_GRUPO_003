import { getMedicationLogs } from './medicationService';

export interface MedicationReminder {
  medicationId: string;
  medicationName: string;
  doseAmount: number;
  doseUnit: string;
  scheduledAt: string;
  isOverdue: boolean;
}

interface Medication {
  id: string;
  medication_name: string;
  dose_amount: number;
  dose_unit: string;
  frequency_hours: number;
  start_date: string;
  end_date: string | null;
}

interface MedicationLog {
  id: string;
  medication_id: string;
  scheduled_at: string;
  taken_at: string;
  status: 'administered' | 'skipped' | 'delayed';
  notes?: string | null;
}

/**
 * Calcula la dosis pendiente más reciente o,
 * si no existe ninguna pendiente, la próxima dosis futura.
 */
export async function getNextMedicationDose(
  medication: Medication,
): Promise<MedicationReminder | null> {
  const now = new Date();
  const startDate = new Date(medication.start_date);

  // El tratamiento todavía no comienza.
  if (startDate > now) {
    return {
      medicationId: medication.id,
      medicationName: medication.medication_name,
      doseAmount: medication.dose_amount,
      doseUnit: medication.dose_unit,
      scheduledAt: startDate.toISOString(),
      isOverdue: false,
    };
  }

  // Si el tratamiento ya terminó, no mostramos recordatorio.
  if (medication.end_date) {
    const endDate = new Date(medication.end_date);

    if (endDate < now) {
      return null;
    }
  }

  const frequencyMs =
    medication.frequency_hours * 60 * 60 * 1000;

  if (frequencyMs <= 0) {
    return null;
  }

  const logs = (await getMedicationLogs(
    medication.id,
  )) as MedicationLog[];

  /*
   * Primero generamos todas las dosis programadas
   * desde el inicio hasta el momento actual.
   */
  const scheduledDoses: Date[] = [];

  let scheduledAt = new Date(startDate);

  while (scheduledAt <= now) {
    scheduledDoses.push(new Date(scheduledAt));

    scheduledAt = new Date(
      scheduledAt.getTime() + frequencyMs,
    );
  }

  /*
   * Buscamos las dosis que todavía no han sido
   * gestionadas en medication_logs.
   */
  const pendingDoses = scheduledDoses.filter((dose) => {
    const alreadyHandled = logs.some((log) => {
      const logScheduledAt = new Date(log.scheduled_at);

      const difference = Math.abs(
        logScheduledAt.getTime() - dose.getTime(),
      );

      // Tolerancia de 1 minuto.
      const sameScheduledDose =
        difference <= 60 * 1000;

      return (
        sameScheduledDose &&
        (log.status === 'administered' ||
          log.status === 'skipped' ||
          log.status === 'delayed')
      );
    });

    return !alreadyHandled;
  });

  /*
   * Si existen dosis pendientes, usamos la más reciente.
   *
   * Ejemplo:
   *
   * 18/09 10:00  pendiente
   * 19/09 02:00  pendiente
   * 19/09 18:00  pendiente
   * 20/09 10:00  pendiente ← se selecciona esta
   */
  if (pendingDoses.length > 0) {
    const latestPendingDose =
      pendingDoses[pendingDoses.length - 1];

    return {
      medicationId: medication.id,
      medicationName: medication.medication_name,
      doseAmount: medication.dose_amount,
      doseUnit: medication.dose_unit,
      scheduledAt: latestPendingDose.toISOString(),
      isOverdue: true,
    };
  }

  /*
   * Si todas las dosis anteriores ya fueron gestionadas,
   * scheduledAt representa la siguiente dosis futura.
   */
  return {
    medicationId: medication.id,
    medicationName: medication.medication_name,
    doseAmount: medication.dose_amount,
    doseUnit: medication.dose_unit,
    scheduledAt: scheduledAt.toISOString(),
    isOverdue: false,
  };
}

/**
 * Obtiene la próxima dosis o dosis pendiente
 * de todos los medicamentos.
 */
export async function getMedicationReminders(
  medications: Medication[],
): Promise<MedicationReminder[]> {
  const reminders: MedicationReminder[] = [];

  for (const medication of medications) {
    const reminder =
      await getNextMedicationDose(medication);

    if (reminder) {
      reminders.push(reminder);
    }
  }

  // Ordenamos por fecha programada.
  reminders.sort(
    (a, b) =>
      new Date(a.scheduledAt).getTime() -
      new Date(b.scheduledAt).getTime(),
  );

  return reminders;
}
