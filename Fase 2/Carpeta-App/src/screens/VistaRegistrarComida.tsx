import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';

export default function VistaRegistrarComida({ route, navigation }: any) {
  const { idBebe } = route.params;

  const [tipo, setTipo] = useState('pecho');
  const [cantidad, setCantidad] = useState('');
  const [lado, setLado] = useState('');
  const [ingredientes, setIngredientes] = useState('');
  const [marca, setMarca] = useState('');
  const [numeroLote, setNumeroLote] = useState('');

  const [fechaHora, setFechaHora] = useState(new Date());
  const [modoPicker, setModoPicker] = useState<'date' | 'time'>('date');
  const [mostrarPicker, setMostrarPicker] = useState(false);

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

  const guardarComida = async () => {
    setCargando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No hay usuario activo');

      const esFormulaOIndustrial = tipo === 'formula' || tipo === 'industrial';

      const { error } = await supabase.from('Registro_Comida').insert({
        id_bebe: idBebe,
        id_usuario: user.id,
        tipo_comida: tipo,
        fecha_hora_comida: fechaHora.toISOString(),
        cantidad_comida: cantidad ? parseFloat(cantidad) : null,
        lado_pecho: tipo === 'pecho' ? lado : null,
        ingredientes: esFormulaOIndustrial ? ingredientes : null,
        marca: esFormulaOIndustrial ? marca : null,
        numero_lote: esFormulaOIndustrial ? numeroLote : null,
      });

      if (error) throw error;

      Alert.alert('Éxito', 'Comida registrada correctamente');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setCargando(false);
    }
  };

  const mostrarCamposExtra = tipo === 'formula' || tipo === 'industrial';

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.label}>¿Qué comió?</Text>
        <View style={styles.rowTabs}>
          {['pecho', 'formula', 'casera', 'industrial'].map((opcion) => (
            <TouchableOpacity
              key={opcion}
              style={[styles.tabButton, tipo === opcion && styles.tabActive]}
              onPress={() => setTipo(opcion)}
            >
              <Text style={[styles.tabText, tipo === opcion && styles.tabTextActive, { fontSize: 12 }]}>
                {/* Visualmente mostramos la tilde, pero el valor real es sin tilde */}
                {opcion === 'formula' ? 'FÓRMULA' : opcion.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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

        {tipo === 'pecho' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lado del pecho</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Izquierdo, Derecho, Ambos"
              value={lado}
              onChangeText={setLado}
            />
          </View>
        )}

        {(tipo === 'formula' || tipo === 'casera' || tipo === 'industrial') && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cantidad</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 120 (ml o gramos)"
              keyboardType="numeric"
              value={cantidad}
              onChangeText={setCantidad}
            />
          </View>
        )}

        {mostrarCamposExtra && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ingredientes</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Leche de vaca, Hierro"
                value={ingredientes}
                onChangeText={setIngredientes}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Marca</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Nestlé, Enfamil"
                value={marca}
                onChangeText={setMarca}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Número de Lote</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. L-123456"
                value={numeroLote}
                onChangeText={setNumeroLote}
              />
            </View>
          </>
        )}

        <TouchableOpacity
          style={styles.btnGuardar}
          onPress={guardarComida}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.btnTextWhite}>Guardar Registro</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  scroll: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#4A5568', marginBottom: 8, marginTop: 16 },

  rowTabs: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  tabButton: {
    flex: 1, paddingVertical: 12, backgroundColor: '#EDF2F7',
    borderRadius: 10, alignItems: 'center'
  },
  tabActive: { backgroundColor: '#38B2AC' },
  tabText: { color: '#718096', fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: '#FFFFFF' },

  dateRow: { flexDirection: 'row', gap: 12 },
  dateBtn: {
    flex: 1, backgroundColor: '#FFFFFF', paddingVertical: 14,
    borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0'
  },
  dateBtnText: { color: '#2D3748', fontSize: 16, fontWeight: '500' },

  inputGroup: { marginTop: 10 },
  input: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 10, padding: 14, fontSize: 16, color: '#2D3748'
  },

  btnGuardar: {
    backgroundColor: '#FF7A8A', paddingVertical: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 32, shadowColor: '#FF7A8A',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4
  },
  btnTextWhite: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});
