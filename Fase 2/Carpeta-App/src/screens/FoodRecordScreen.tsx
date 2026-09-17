import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createFoodRecord } from '../services/foodRecordService'; // Asegúrate de que la ruta a tu servicio sea correcta

export default function FoodRecordScreen({ route, navigation }: any) {
  const { idBebe } = route.params;

  const [type, setType] = useState<'breast' | 'formula' | 'homemade' | 'commercial'>('breast');
  const [amount, setAmount] = useState('');
  const [side, setSide] = useState<'left' | 'right' | 'both' | undefined>(undefined);
  const [ingredients, setIngredients] = useState('');
  const [brand, setBrand] = useState('');
  const [batchNumber, setBatchNumber] = useState('');

  const [dateTime, setDateTime] = useState(new Date());
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [showPicker, setShowPicker] = useState(false);

  const [loading, setLoading] = useState(false);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (event.type === 'set' && selectedDate) {
      setDateTime(selectedDate);
    }
  };

  const openPicker = (modo: 'date' | 'time') => {
    setPickerMode(modo);
    setShowPicker(true);
  };

  const saveFood = async () => {
    setLoading(true);
    try {
      const esFormulaOIndustrial = type === 'formula' || type === 'commercial';

      await createFoodRecord({
        babyId: idBebe,
        foodType: type,
        recordedAt: dateTime.toISOString(),
        amount: amount ? parseFloat(amount) : undefined,
        breastSide: type === 'breast' ? side : undefined,
        ingredients: esFormulaOIndustrial ? ingredients : undefined,
        brand: esFormulaOIndustrial ? brand : undefined,
        batchNumber: esFormulaOIndustrial ? batchNumber : undefined,
      });

      Alert.alert('Éxito', 'Comida registrada correctamente');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo registrar la comida');
    } finally {
      setLoading(false);
    }
  };

  const showExtraFields = type === 'formula' || type === 'commercial';

  // Opciones visuales traducidas al inglés interno
  const foodOptions: { key: 'breast' | 'formula' | 'homemade' | 'commercial'; label: string }[] = [
    { key: 'breast', label: 'PECHO' },
    { key: 'formula', label: 'FÓRMULA' },
    { key: 'homemade', label: 'CASERA' },
    { key: 'commercial', label: 'INDUSTRIAL' },
  ];

  const sideOptions: { key: 'left' | 'right' | 'both'; label: string }[] = [
    { key: 'left', label: 'Izquierdo' },
    { key: 'right', label: 'Derecho' },
    { key: 'both', label: 'Ambos' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.label}>¿Qué comió?</Text>
        <View style={styles.rowTabs}>
          {foodOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[styles.tabButton, type === option.key && styles.tabActive]}
              onPress={() => setType(option.key)}
            >
              <Text style={[styles.tabText, type === option.key && styles.tabTextActive, { fontSize: 12 }]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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

        {type === 'breast' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lado del pecho</Text>
            <View style={styles.rowTabs}>
              {sideOptions.map((optn) => (
                <TouchableOpacity
                  key={optn.key}
                  style={[styles.tabButton, side === optn.key && styles.tabActive]}
                  onPress={() => setSide(optn.key)}
                >
                  <Text style={[styles.tabText, side === optn.key && styles.tabTextActive]}>
                    {optn.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {type !== 'breast' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cantidad (ml o gramos)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 120"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        )}

        {showExtraFields && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ingredientes</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Leche de vaca, Hierro"
                value={ingredients}
                onChangeText={setIngredients}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Marca</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Nestlé, Enfamil"
                value={brand}
                onChangeText={setBrand}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Número de Lote</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. L-123456"
                value={batchNumber}
                onChangeText={setBatchNumber}
              />
            </View>
          </>
        )}

        <TouchableOpacity
          style={styles.btnGuardar}
          onPress={saveFood}
          disabled={loading}
        >
          {loading ? (
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
