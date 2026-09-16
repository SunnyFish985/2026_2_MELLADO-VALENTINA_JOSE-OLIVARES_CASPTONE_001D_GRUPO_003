import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createFoodRecord } from '../services/foodRecordService'; // Asegúrate de que la ruta a tu servicio sea correcta

export default function FoodRecordScreen({ route, navigation }: any) {
  const { idBebe } = route.params;

  const [tipo, setTipo] = useState<'breast' | 'formula' | 'homemade' | 'commercial'>('breast');
  const [cantidad, setCantidad] = useState('');
  const [lado, setLado] = useState<'left' | 'right' | 'both' | undefined>(undefined);
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
      const esFormulaOIndustrial = tipo === 'formula' || tipo === 'commercial';

      await createFoodRecord({
        babyId: idBebe,
        foodType: tipo,
        recordedAt: fechaHora.toISOString(),
        amount: cantidad ? parseFloat(cantidad) : undefined,
        breastSide: tipo === 'breast' ? lado : undefined,
        ingredients: esFormulaOIndustrial ? ingredientes : undefined,
        brand: esFormulaOIndustrial ? marca : undefined,
        batchNumber: esFormulaOIndustrial ? numeroLote : undefined,
      });

      Alert.alert('Éxito', 'Comida registrada correctamente');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo registrar la comida');
    } finally {
      setCargando(false);
    }
  };

  const mostrarCamposExtra = tipo === 'formula' || tipo === 'commercial';

  // Opciones visuales traducidas al inglés interno
  const opcionesComida: { key: 'breast' | 'formula' | 'homemade' | 'commercial'; label: string }[] = [
    { key: 'breast', label: 'PECHO' },
    { key: 'formula', label: 'FÓRMULA' },
    { key: 'homemade', label: 'CASERA' },
    { key: 'commercial', label: 'INDUSTRIAL' },
  ];

  const opcionesLado: { key: 'left' | 'right' | 'both'; label: string }[] = [
    { key: 'left', label: 'Izquierdo' },
    { key: 'right', label: 'Derecho' },
    { key: 'both', label: 'Ambos' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.label}>¿Qué comió?</Text>
        <View style={styles.rowTabs}>
          {opcionesComida.map((opcion) => (
            <TouchableOpacity
              key={opcion.key}
              style={[styles.tabButton, tipo === opcion.key && styles.tabActive]}
              onPress={() => setTipo(opcion.key)}
            >
              <Text style={[styles.tabText, tipo === opcion.key && styles.tabTextActive, { fontSize: 12 }]}>
                {opcion.label}
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

        {tipo === 'breast' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lado del pecho</Text>
            <View style={styles.rowTabs}>
              {opcionesLado.map((opc) => (
                <TouchableOpacity
                  key={opc.key}
                  style={[styles.tabButton, lado === opc.key && styles.tabActive]}
                  onPress={() => setLado(opc.key)}
                >
                  <Text style={[styles.tabText, lado === opc.key && styles.tabTextActive]}>
                    {opc.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {tipo !== 'breast' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cantidad (ml o gramos)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 120"
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
