import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createMedication } from '../services/medicationService';

export default function MedicationRecordScreen({ route, navigation }: any) {
  const { idBebe } = route.params;
  const [medicationName, setMedicationName] = useState('');
  const [doseAmount, setDoseAmount] = useState('');
  const [doseUnit, setDoseUnit] = useState('ml');
  const [frequencyHours, setFrequencyHours] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [doctorName, setDoctorName] = useState('');
  const [doctorRut, setDoctorRut] = useState('');
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end'>('start');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const openPicker = (mode: 'date' | 'time', target: 'start' | 'end') => {
    setPickerTarget(target);
    setPickerMode(mode);
    setShowPicker(true);
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (event.type !== 'set' || !selectedDate) return;

    const currentValue = pickerTarget === 'start' ? startDate : endDate || startDate;
    const nextValue = new Date(currentValue);

    if (pickerMode === 'date') {
      nextValue.setFullYear(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
      );
    } else {
      nextValue.setHours(
        selectedDate.getHours(),
        selectedDate.getMinutes(),
        selectedDate.getSeconds(),
        selectedDate.getMilliseconds(),
      );
    }

    if (pickerTarget === 'start') {
      setStartDate(nextValue);
    } else {
      setEndDate(nextValue);
    }
  };

  const handleSave = async () => {
    setError('');
    const parsedDose = Number(doseAmount);
    const parsedFrequency = Number(frequencyHours);

    if (!medicationName.trim() || !doseAmount || !doseUnit.trim() || !frequencyHours) {
      setError('Completa los campos obligatorios');
      return;
    }

    if (parsedDose <= 0 || parsedFrequency <= 0) {
      setError('La dosis y la frecuencia deben ser mayores que cero');
      return;
    }

    if (endDate && endDate < startDate) {
      setError('La fecha de término no puede ser anterior al inicio');
      return;
    }

    setLoading(true);
    try {
      await createMedication({
        babyId: idBebe,
        medicationName: medicationName.trim(),
        doseAmount: parsedDose,
        doseUnit: doseUnit.trim(),
        frequencyHours: parsedFrequency,
        startDate: startDate.toISOString(),
        endDate: endDate?.toISOString(),
        doctorName: doctorName.trim(),
        doctorRut: doctorRut.trim(),
      });
      navigation.goBack();
    } catch (e: any) {
      setError(e.message || 'No se pudo registrar el medicamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Datos del medicamento</Text>
          <Text style={styles.label}>Nombre *</Text>
          <TextInput style={styles.input} placeholder="Ej: Paracetamol" value={medicationName} onChangeText={setMedicationName} />

          <Text style={styles.label}>Dosis *</Text>
          <View style={styles.inlineRow}>
            <TextInput style={[styles.input, styles.amountInput]} placeholder="Ej: 5" keyboardType="decimal-pad" value={doseAmount} onChangeText={setDoseAmount} />
            <TextInput style={[styles.input, styles.unitInput]} placeholder="ml, gotas, mg" value={doseUnit} onChangeText={setDoseUnit} />
          </View>

          <Text style={styles.label}>Cada cuántas horas *</Text>
          <TextInput style={styles.input} placeholder="Ej: 8" keyboardType="numeric" value={frequencyHours} onChangeText={setFrequencyHours} />

          <Text style={styles.label}>Inicio del tratamiento *</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity style={styles.dateButton} onPress={() => openPicker('date', 'start')}>
              <Text style={styles.dateText}>{startDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateButton} onPress={() => openPicker('time', 'start')}>
              <Text style={styles.dateText}>
                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Término del tratamiento (opcional)</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity style={styles.dateButton} onPress={() => openPicker('date', 'end')}>
              <Text style={[styles.dateText, !endDate && styles.placeholder]}>
                {endDate ? endDate.toLocaleDateString() : 'Fecha'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateButton} onPress={() => openPicker('time', 'end')}>
              <Text style={[styles.dateText, !endDate && styles.placeholder]}>
                {endDate ? endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Hora'}
              </Text>
            </TouchableOpacity>
          </View>

          {showPicker && (
            <DateTimePicker
              value={pickerTarget === 'start' ? startDate : endDate || startDate}
              mode={pickerMode}
              is24Hour={true}
              onChange={onChangeDate}
            />
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Información médica (opcional)</Text>
          <TextInput style={styles.input} placeholder="Nombre del doctor" value={doctorName} onChangeText={setDoctorName} />
          <TextInput style={styles.input} placeholder="RUT del doctor" value={doctorRut} onChangeText={setDoctorRut} />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Guardar medicamento</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  scroll: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2D3748', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#4A5568', marginTop: 8, marginBottom: 8 },
  input: { flex: 1, backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 14, fontSize: 16, color: '#2D3748', marginBottom: 8 },
  inlineRow: { flexDirection: 'row', gap: 10 },
  amountInput: { flex: 1 },
  unitInput: { flex: 1.5 },
  dateRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  dateButton: { flex: 1, backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 14, alignItems: 'center' },
  dateText: { color: '#2D3748', fontSize: 15 },
  placeholder: { color: '#A0AEC0' },
  saveButton: { backgroundColor: '#38B2AC', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  error: { color: '#E53E3E', textAlign: 'center', marginBottom: 16 },
});
