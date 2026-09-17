import React, { useState } from 'react';
import { View, TextInput, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

import { registerUser } from '../services/authService';
import { Gender } from '../types/database.types';

const GENDERS: { label: string; value: Gender }[] = [
  { label: 'Femenino', value: 'female' },
  { label: 'Masculino', value: 'male' },
  { label: 'Otro', value: 'other' },
  { label: 'Prefiero no decir', value: 'prefer_not_to_say' },
];

export default function SignUpScreen({ navigation }: any) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [paternalLastName, setPaternalLastName] = useState('');
  const [maternalLastName, setMaternalLastName] = useState('');

  const [birthDate, setBirthDate] = useState('');

  const [dateObj, setDateObj] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [gender, setGender] = useState<Gender>('prefer_not_to_say');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowPicker(false);

    const currentDate = selectedDate || (event instanceof Date ? event : dateObj);

    if (currentDate && (event?.type === 'set' || !event?.type)) {
      setDateObj(currentDate);

      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      setBirthDate(`${year}-${month}-${day}`);
    }
  };

  async function handleRegistry() {
    setError('');

    if (!email || !password || !confirmPassword || !username || !firstName || !paternalLastName || !maternalLastName || !birthDate) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {

      await registerUser({
        email,
        password,
        username,
        firstName,
        paternalLastName,
        maternalLastName,
        birthDate,
        gender,
      });

    } catch (e: any) {

      if (e.message?.includes('duplicate key') || e.message?.includes('username')) {
        setError('Ese nombre de usuario ya está en uso, elige otro');
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.headerTitle}>Crear cuenta</Text>
        <Text style={styles.headerSubtitle}>Únete y comienza a registrar los hitos de tu bebé.</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Datos de Acceso</Text>
          <TextInput style={styles.input} placeholder="Correo electrónico" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
          <TextInput style={styles.input} placeholder="Confirmar contraseña" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
          <TextInput style={styles.input} placeholder="Nombre de usuario" autoCapitalize="none" value={username} onChangeText={setUsername} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Datos Personales</Text>
          <TextInput style={styles.input} placeholder="Nombres" value={firstName} onChangeText={setFirstName} />
          <TextInput style={styles.input} placeholder="Apellido paterno" value={paternalLastName} onChangeText={setPaternalLastName} />
          <TextInput style={styles.input} placeholder="Apellido materno" value={maternalLastName} onChangeText={setMaternalLastName} />

          <Text style={styles.label}>Fecha de nacimiento</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker(true)}>
            <Text style={[styles.dateBtnText, !birthDate && { color: '#A0AEC0' }]}>
              {birthDate || 'Seleccionar fecha (YYYY-MM-DD)'}
            </Text>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={dateObj}
              mode="date"
              display="default"
              onValueChange={onChangeDate}
              maximumDate={new Date()}
            />
          )}

          <Text style={styles.label}>Género</Text>
          <View style={styles.rowTabs}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g.value}
                style={[styles.tabButton, gender === g.value && styles.tabActive]}
                onPress={() => setGender(g.value)}
              >
                <Text style={[styles.tabText, gender === g.value && styles.tabTextActive]}>
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.btnGuardar}
          onPress={handleRegistry}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.btnTextWhite}>Completar Registro</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  scroll: { padding: 20 },

  headerTitle: { fontSize: 28, fontWeight: '800', color: '#2D3748', marginBottom: 4, textAlign: 'center' },
  headerSubtitle: { fontSize: 14, color: '#718096', marginBottom: 24, textAlign: 'center' },

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
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#4A5568', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#4A5568', marginBottom: 8, marginTop: 8 },

  input: {
    backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 10, padding: 14, fontSize: 16, color: '#2D3748', marginBottom: 12
  },

  dateBtn: {
    backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 10, padding: 14, marginBottom: 12, justifyContent: 'center'
  },
  dateBtnText: { fontSize: 16, color: '#2D3748' },

  rowTabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  tabButton: {
    paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#EDF2F7',
    borderRadius: 10, alignItems: 'center'
  },
  tabActive: { backgroundColor: '#38B2AC' },
  tabText: { color: '#718096', fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#FFFFFF' },

  btnGuardar: {
    backgroundColor: '#FF7A8A', paddingVertical: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 8, marginBottom: 40, shadowColor: '#FF7A8A',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4
  },
  btnTextWhite: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

  error: { color: '#E53E3E', textAlign: 'center', marginBottom: 16, fontSize: 14 }
});
