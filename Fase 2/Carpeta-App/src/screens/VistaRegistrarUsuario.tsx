import React, { useState } from 'react';
import { View, TextInput, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { registrarUsuario } from '../services/authService';
import { Genero } from '../types/database.types';

const GENEROS: { label: string; value: Genero }[] = [
  { label: 'Femenino', value: 'femenino' },
  { label: 'Masculino', value: 'masculino' },
  { label: 'Otro', value: 'otro' },
  { label: 'Prefiero no decir', value: 'preferiria_no_decir' },
];

export default function VistaRegistrarUsuario({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');

  const [fechaNacimiento, setFechaNacimiento] = useState('');

  const [fechaObj, setFechaObj] = useState(new Date());
  const [mostrarPicker, setMostrarPicker] = useState(false);

  const [genero, setGenero] = useState<Genero>('preferiria_no_decir');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const onChangeFecha = (event: any, selectedDate?: Date) => {
    setMostrarPicker(false);

    const currentDate = selectedDate || (event instanceof Date ? event : fechaObj);

    if (currentDate && (event?.type === 'set' || !event?.type)) {
      setFechaObj(currentDate);

      const anio = currentDate.getFullYear();
      const mes = String(currentDate.getMonth() + 1).padStart(2, '0');
      const dia = String(currentDate.getDate()).padStart(2, '0');
      setFechaNacimiento(`${anio}-${mes}-${dia}`);
    }
  };

  async function handleRegistro() {
    setError('');

    if (!email || !password || !confirmPassword || !nombreUsuario || !nombres || !apellidoPaterno || !apellidoMaterno || !fechaNacimiento) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setCargando(true);
    try {
      await registrarUsuario({
        email,
        password,
        nombre_usuario: nombreUsuario,
        nombres_u: nombres,
        apellido_paterno_u: apellidoPaterno,
        apellido_materno_u: apellidoMaterno,
        fecha_nacimiento_u: fechaNacimiento,
        genero_u: genero,
      });
    } catch (e: any) {
      if (e.message?.includes('duplicate key') || e.message?.includes('nombre_usuario')) {
        setError('Ese nombre de usuario ya está en uso, elige otro');
      } else {
        setError(e.message);
      }
    } finally {
      setCargando(false);
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
          <TextInput style={styles.input} placeholder="Nombre de usuario" autoCapitalize="none" value={nombreUsuario} onChangeText={setNombreUsuario} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Datos Personales</Text>
          <TextInput style={styles.input} placeholder="Nombres" value={nombres} onChangeText={setNombres} />
          <TextInput style={styles.input} placeholder="Apellido paterno" value={apellidoPaterno} onChangeText={setApellidoPaterno} />
          <TextInput style={styles.input} placeholder="Apellido materno" value={apellidoMaterno} onChangeText={setApellidoMaterno} />

          <Text style={styles.label}>Fecha de nacimiento</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setMostrarPicker(true)}>
            <Text style={[styles.dateBtnText, !fechaNacimiento && { color: '#A0AEC0' }]}>
              {fechaNacimiento || 'Seleccionar fecha (YYYY-MM-DD)'}
            </Text>
          </TouchableOpacity>

          {mostrarPicker && (
            <DateTimePicker
              value={fechaObj}
              mode="date"
              display="default"
              onValueChange={onChangeFecha}
              maximumDate={new Date()}
            />
          )}

          <Text style={styles.label}>Género</Text>
          <View style={styles.rowTabs}>
            {GENEROS.map((g) => (
              <TouchableOpacity
                key={g.value}
                style={[styles.tabButton, genero === g.value && styles.tabActive]}
                onPress={() => setGenero(g.value)}
              >
                <Text style={[styles.tabText, genero === g.value && styles.tabTextActive]}>
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.btnGuardar}
          onPress={handleRegistro}
          disabled={cargando}
        >
          {cargando ? (
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
