import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createMedicationLog, getMedicationLogs, MedicationLogStatus } from '../services/medicationService';

const STATUS_OPTIONS: { value: MedicationLogStatus; label: string }[] = [
  { value: 'administered', label: 'Administrada' },
  { value: 'skipped', label: 'Omitida' },
  { value: 'delayed', label: 'Atrasada' },
];

export default function MedicationLogScreen({ route }: any) {
  const { medication, scheduledAt: initialScheduledAt, selectedDate } = route.params;
  const [scheduledAt, setScheduledAt] = useState(
    initialScheduledAt ? new Date(initialScheduledAt) : new Date()
  );
  const hasScheduledTime = !!initialScheduledAt;
  const [status, setStatus] = useState<MedicationLogStatus>('administered');
  const [notes, setNotes] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState('');

  const loadLogs = useCallback(async () => {
    try {
      setLogs(await getMedicationLogs(medication.id));
    } catch (e: any) {
      setError(e.message || 'No se pudieron cargar las tomas');
    } finally {
      setLoadingLogs(false);
    }
  }, [medication.id]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const visibleLogs = showAll || !selectedDate ? logs : logs.filter((log) => {
    const date = new Date(log.scheduled_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return key === selectedDate;
  });

  const handleSave = async () => {
    setError('');
    setLoading(true);
    try {
      await createMedicationLog({
        medicationId: medication.id,
        scheduledAt: scheduledAt.toISOString(),
        status,
        notes: notes.trim(),
      });
      setNotes('');
      await loadLogs();
    } catch (e: any) {
      setError(e.message || 'No se pudo registrar la toma');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>{medication.medication_name}</Text>
          <Text style={styles.detail}>Dosis: {medication.dose_amount} {medication.dose_unit}</Text>
          <Text style={styles.detail}>Cada {medication.frequency_hours} horas</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Registrar toma</Text>
          <Text style={styles.label}>Cuándo correspondía</Text>

          {hasScheduledTime ? (
            <View style={styles.scheduledInfo}>
              <Text style={styles.scheduledText}>
                {scheduledAt.toLocaleString()}
              </Text>

              <Text style={styles.scheduledHint}>
                Horario definido por el recordatorio
              </Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  setPickerMode('date');
                  setShowPicker(true);
                }}
              >
                <Text style={styles.dateText}>
                  {scheduledAt.toLocaleString()}
                </Text>
              </TouchableOpacity>

              {showPicker && (
                <DateTimePicker
                  value={scheduledAt}
                  mode={pickerMode}
                  onChange={(event, date) => {
                    if (event.type !== 'set' || !date) {
                      setShowPicker(false);
                      return;
                    }

                    setScheduledAt(date);

                    if (pickerMode === 'date') {
                      setPickerMode('time');
                      return;
                    }

                    setShowPicker(false);
                  }}
                />
              )}
            </>
          )}

          <Text style={styles.label}>Estado</Text>
          <View style={styles.statusRow}>
            {STATUS_OPTIONS.map((option) => (
              <TouchableOpacity key={option.value} style={[styles.statusButton, status === option.value && styles.statusSelected]} onPress={() => setStatus(option.value)}>
                <Text style={[styles.statusText, status === option.value && styles.statusTextSelected]}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Notas (opcional)</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Ej: La tomó después de comer" multiline value={notes} onChangeText={setNotes} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Guardar toma</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Historial de tomas</Text>
          {selectedDate ? <View style={styles.filterRow}><TouchableOpacity style={[styles.filterButton, !showAll && styles.filterSelected]} onPress={() => setShowAll(false)}><Text style={styles.filterText}>Solo este día</Text></TouchableOpacity><TouchableOpacity style={[styles.filterButton, showAll && styles.filterSelected]} onPress={() => setShowAll(true)}><Text style={styles.filterText}>Todos</Text></TouchableOpacity></View> : null}
          {loadingLogs ? <ActivityIndicator color="#2C5282" /> : visibleLogs.length === 0 ? <Text style={styles.empty}>{selectedDate && !showAll ? 'No existen registros de hoy' : 'Aún no hay tomas registradas.'}</Text> : visibleLogs.map((log) => (
            <View key={log.id} style={styles.logRow}>
              <View style={styles.logInfo}>
                <Text style={styles.logDate}>{new Date(log.scheduled_at).toLocaleString()}</Text>
                <Text style={styles.logTaken}>Registrada: {new Date(log.taken_at).toLocaleString()}</Text>
                {log.notes ? <Text style={styles.logNotes}>{log.notes}</Text> : null}
              </View>
              <Text style={styles.logStatus}>{STATUS_OPTIONS.find((option) => option.value === log.status)?.label || log.status}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  scroll: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3 },
  title: { fontSize: 22, fontWeight: '700', color: '#2D3748', marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2D3748', marginBottom: 14 },
  detail: { color: '#4A5568', fontSize: 15, marginBottom: 4 },
  label: { fontSize: 14, fontWeight: '600', color: '#4A5568', marginTop: 8, marginBottom: 8 },
  dateButton: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 14 },
  dateText: { color: '#2D3748', fontSize: 15 },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusButton: { flex: 1, backgroundColor: '#EDF2F7', paddingVertical: 11, borderRadius: 9, alignItems: 'center' },
  statusSelected: { backgroundColor: '#2C5282' },
  statusText: { color: '#4A5568', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  statusTextSelected: { color: '#FFFFFF' },
  input: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 14, fontSize: 16, color: '#2D3748' },
  textArea: { height: 80, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#38B2AC', paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginTop: 14 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  error: { color: '#E53E3E', textAlign: 'center', marginTop: 12 },
  empty: { color: '#A0AEC0', textAlign: 'center' },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#EDF2F7', paddingVertical: 12, gap: 8 },
  logInfo: { flex: 1 },
  logDate: { color: '#2D3748', fontWeight: '700', marginBottom: 4 },
  logTaken: { color: '#718096', fontSize: 12 },
  logNotes: { color: '#4A5568', fontSize: 13, marginTop: 4 },
  logStatus: { color: '#2C5282', fontWeight: '700', fontSize: 12, textAlign: 'right' },
  scheduledInfo: {
    backgroundColor: '#E6FFFA',
    borderWidth: 1,
    borderColor: '#B2F5EA',
    borderRadius: 10,
    padding: 14,
  },

  scheduledText: {
    color: '#234E52',
    fontSize: 16,
    fontWeight: '700',
  },

  scheduledHint: {
    color: '#4A5568',
    fontSize: 12,
    marginTop: 5,
  },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  filterButton: { flex: 1, paddingVertical: 10, borderRadius: 9, backgroundColor: '#EDF2F7', alignItems: 'center' },
  filterSelected: { backgroundColor: '#2C5282' },
  filterText: { color: '#2D3748', fontWeight: '700' },
});
