import React, { useState } from 'react';
import { View, TextInput, Text, Alert, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
// Importamos la nueva función refactorizada
import { createBabyAndAssignAdmin } from '../services/babyService';

export default function CreateBabyScreen({ navigation }: any) {
  // Estados actualizados a camelCase (inglés)
  const [firstName, setFirstName] = useState('');
  const [paternalLastName, setPaternalLastName] = useState('');
  const [maternalLastName, setMaternalLastName] = useState('');

  // Estados para el calendario nativo
  const [dateTime, setDateTime] = useState(new Date());
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [showPicker, setShowPicker] = useState(false);

  const [weightGrams, setWeightGrams] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [gestationWeeks, setGestationWeeks] = useState('');
  // Actualizamos el tipo para incluir 'Other'
  const [sex, setSex] = useState<'M' | 'F' | 'Other'>('M');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (event.type === 'set' && selectedDate) {
      setDateTime(selectedDate);
    }
  };

  const openPicker = (mode: 'date' | 'time') => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  async function handleCreate() {
    setError('');

    if (!firstName || !paternalLastName || !maternalLastName || !weightGrams || !heightCm || !gestationWeeks) {
      setError('Todos los campos son obligatorios');
      return;
    }

    setIsLoading(true);
    try {
      // Extraemos la fecha en formato YYYY-MM-DD
      const year = dateTime.getFullYear();
      const month = String(dateTime.getMonth() + 1).padStart(2, '0');
      const day = String(dateTime.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      // Extraemos la hora en formato HH:MM
      const hours = String(dateTime.getHours()).padStart(2, '0');
      const minutes = String(dateTime.getMinutes()).padStart(2, '0');
      const timeString = `${hours}:${minutes}`;

      // Llamamos a la función con las llaves en inglés que espera la interfaz
      const { inviteCode } = await createBabyAndAssignAdmin({
        firstName,
        paternalLastName,
        maternalLastName,
        birthDate: dateString,
        birthTime: timeString,
        birthWeightG: Number(weightGrams),
        birthHeightCm: Number(heightCm),
        gestationWeeks: Number(gestationWeeks),
        sex,
      });

      Alert.alert(
        '¡Bebé creado!',
        `Comparte este código con otros cuidadores: ${inviteCode}`
      );
      navigation.navigate('Home');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Identidad</Text>

          <TextInput style={styles.input} placeholder="Nombres" value={firstName} onChangeText={setFirstName} />
          <TextInput style={styles.input} placeholder="Apellido paterno" value={paternalLastName} onChangeText={setPaternalLastName} />
          <TextInput style={styles.input} placeholder="Apellido materno" value={maternalLastName} onChangeText={setMaternalLastName} />

          <Text style={styles.label}>Sexo</Text>
          <View style={styles.rowTabs}>
            {/* Iteramos sobre los valores en inglés, pero mostramos el texto en español */}
            {['M', 'F', 'Other'].map((opcion) => (
              <TouchableOpacity
                key={opcion}
                style={[styles.tabButton, sex === opcion && styles.tabActive]}
                onPress={() => setSex(opcion as 'M' | 'F' | 'Other')}
              >
                <Text style={[styles.tabText, sex === opcion && styles.tabTextActive]}>
                  {opcion === 'M' ? 'MASCULINO' : opcion === 'F' ? 'FEMENINO' : 'OTRO'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Nacimiento</Text>

          <Text style={styles.label}>Fecha y Hora</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity style={styles.dateBtn} onPress={() => openPicker('date')}>
              <Text style={styles.dateBtnText}>{dateTime.toLocaleDateString()}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateBtn} onPress={() => openPicker('time')}>
              <Text style={styles.dateBtnText}>
                {dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>

          {showPicker && (
            <DateTimePicker
              value={dateTime}
              mode={pickerMode}
              is24Hour={true}
              onChange={onChangeDate}
            />
          )}

          <TextInput style={[styles.input, { marginTop: 16 }]} placeholder="Peso al nacer (gramos)" keyboardType="numeric" value={weightGrams} onChangeText={setWeightGrams} />
          <TextInput style={styles.input} placeholder="Altura al nacer (cm)" keyboardType="numeric" value={heightCm} onChangeText={setHeightCm} />
          <TextInput style={styles.input} placeholder="Semanas de gestación" keyboardType="numeric" value={gestationWeeks} onChangeText={setGestationWeeks} />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.btnGuardar}
          onPress={handleCreate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.btnTextWhite}>Crear Perfil del Bebé</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  scroll: { padding: 20 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2D3748', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#4A5568', marginBottom: 8, marginTop: 8 },

  input: {
    backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 10, padding: 14, fontSize: 16, color: '#2D3748', marginBottom: 12
  },

  rowTabs: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  tabButton: {
    flex: 1, paddingVertical: 12, backgroundColor: '#EDF2F7',
    borderRadius: 10, alignItems: 'center'
  },
  tabActive: { backgroundColor: '#FF7A8A' },
  tabText: { color: '#718096', fontWeight: '600', fontSize: 12 },
  tabTextActive: { color: '#FFFFFF' },

  dateRow: { flexDirection: 'row', gap: 12 },
  dateBtn: {
    flex: 1, backgroundColor: '#F7FAFC', paddingVertical: 14,
    borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0'
  },
  dateBtnText: { color: '#2D3748', fontSize: 16, fontWeight: '500' },

  btnGuardar: {
    backgroundColor: '#38B2AC', paddingVertical: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 8, marginBottom: 40, shadowColor: '#38B2AC',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4
  },
  btnTextWhite: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

  error: { color: '#E53E3E', textAlign: 'center', marginBottom: 16, fontSize: 14 }
});
