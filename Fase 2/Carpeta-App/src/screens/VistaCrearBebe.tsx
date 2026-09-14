import React, { useState } from 'react';
import { View, TextInput, Text, Alert, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { crearBebeYAsignarAdmin } from '../services/bebeService';

export default function VistaCrearBebe({ navigation }: any) {
  const [nombres, setNombres] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');

  // Estados para el calendario nativo
  const [fechaHora, setFechaHora] = useState(new Date());
  const [modoPicker, setModoPicker] = useState<'date' | 'time'>('date');
  const [mostrarPicker, setMostrarPicker] = useState(false);

  const [pesoGramos, setPesoGramos] = useState('');
  const [alturaCm, setAlturaCm] = useState('');
  const [semanasGestacion, setSemanasGestacion] = useState('');
  const [sexo, setSexo] = useState<'M' | 'F' | 'Otro'>('M');

  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const onChangeFecha = (event: any, selectedDate?: Date) => {
    setMostrarPicker(false);
    if (event.type === 'set' && selectedDate) {
      setFechaHora(selectedDate);
    }
  };

  const abrirPicker = (modo: 'date' | 'time') => {
    setModoPicker(modo);
    setMostrarPicker(true);
  };

  async function handleCrear() {
    setError('');

    if (!nombres || !apellidoPaterno || !apellidoMaterno || !pesoGramos || !alturaCm || !semanasGestacion) {
      setError('Todos los campos son obligatorios');
      return;
    }

    setCargando(true);
    try {
      // Extraemos la fecha en formato YYYY-MM-DD
      const anio = fechaHora.getFullYear();
      const mes = String(fechaHora.getMonth() + 1).padStart(2, '0');
      const dia = String(fechaHora.getDate()).padStart(2, '0');
      const fechaString = `${anio}-${mes}-${dia}`;

      // Extraemos la hora en formato HH:MM
      const horas = String(fechaHora.getHours()).padStart(2, '0');
      const minutos = String(fechaHora.getMinutes()).padStart(2, '0');
      const horaString = `${horas}:${minutos}`;

      const { codigoInvitacion } = await crearBebeYAsignarAdmin({
        nombres_b: nombres,
        apellido_paterno_b: apellidoPaterno,
        apellido_materno_b: apellidoMaterno,
        fecha_nacimiento_b: fechaString,
        hora_nacimiento_b: horaString,
        peso_nacimiento_g_b: Number(pesoGramos),
        altura_nacimiento_cm_b: Number(alturaCm),
        semanas_gestacion_b: Number(semanasGestacion),
        sexo_b: sexo,
      });

      Alert.alert(
        '¡Bebé creado!',
        `Comparte este código con otros cuidadores: ${codigoInvitacion}`
      );
      navigation.navigate('Home');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Identidad</Text>

          <TextInput style={styles.input} placeholder="Nombres" value={nombres} onChangeText={setNombres} />
          <TextInput style={styles.input} placeholder="Apellido paterno" value={apellidoPaterno} onChangeText={setApellidoPaterno} />
          <TextInput style={styles.input} placeholder="Apellido materno" value={apellidoMaterno} onChangeText={setApellidoMaterno} />

          <Text style={styles.label}>Sexo</Text>
          <View style={styles.rowTabs}>
            {['M', 'F', 'Otro'].map((opcion) => (
              <TouchableOpacity
                key={opcion}
                style={[styles.tabButton, sexo === opcion && styles.tabActive]}
                onPress={() => setSexo(opcion as 'M' | 'F' | 'Otro')}
              >
                <Text style={[styles.tabText, sexo === opcion && styles.tabTextActive]}>
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
            <TouchableOpacity style={styles.dateBtn} onPress={() => abrirPicker('date')}>
              <Text style={styles.dateBtnText}>{fechaHora.toLocaleDateString()}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateBtn} onPress={() => abrirPicker('time')}>
              <Text style={styles.dateBtnText}>
                {fechaHora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>

          {mostrarPicker && (
            <DateTimePicker
              value={fechaHora}
              mode={modoPicker}
              is24Hour={true}
              onChange={onChangeFecha}
            />
          )}

          <TextInput style={[styles.input, { marginTop: 16 }]} placeholder="Peso al nacer (gramos)" keyboardType="numeric" value={pesoGramos} onChangeText={setPesoGramos} />
          <TextInput style={styles.input} placeholder="Altura al nacer (cm)" keyboardType="numeric" value={alturaCm} onChangeText={setAlturaCm} />
          <TextInput style={styles.input} placeholder="Semanas de gestación" keyboardType="numeric" value={semanasGestacion} onChangeText={setSemanasGestacion} />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.btnGuardar}
          onPress={handleCrear}
          disabled={cargando}
        >
          {cargando ? (
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
