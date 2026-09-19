import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, 
    TouchableOpacity, ActivityIndicator, Alert, 
    KeyboardAvoidingView, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createSleepRecord } from '../services/sleepRecordService';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { checkShouldShowSleepTip } from '../services/sleepRecordService';

export default function SleepRecordScreen({ route, navigation }: any) {
  const { idBebe } = route.params;

  const [showTip, setShowTip] = useState(false);

  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [showPicker, setShowPicker] = useState(false);
  const [currentPickerInfo, setCurrentPickerInfo] = useState<'start' | 'end'>('start');

  const [sleepType, setSleepType] = useState<'nap' | 'night'>('night');
  const [sleepLocation, setSleepLocation] = useState<'crib' | 'stroller' | 'parents_bed' | 'arms' | 'other'>('crib');
  const [sleepQuality, setSleepQuality] = useState<'quiet' | 'restless' | 'bad'>('quiet');
  
  const [interruptions, setInterruptions] = useState('0');
  const [notes, setNotes] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function verifyTip() {
      try {
        const shouldShow = await checkShouldShowSleepTip(idBebe);
        setShowTip(shouldShow);
      } catch (error) {
        console.log('Error verificando tip:', error);
      }
    }
    verifyTip();
  }, [idBebe]);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (event.type === 'set' && selectedDate) {
      if (currentPickerInfo === 'start') {
        setStartTime(selectedDate);
      } else {
        setEndTime(selectedDate);
      }
    }
  };

  const openPicker = (mode: 'date' | 'time', target: 'start' | 'end') => {
    setPickerMode(mode);
    setCurrentPickerInfo(target);
    setShowPicker(true);
  };

  const handleSave = async () => {
    setError('');
    
    // Validación de tiempos
    if (endTime <= startTime) {
      setError('La hora de fin debe ser posterior a la hora de inicio.');
      return;
    }

    const diffMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.round(diffMs / 60000);

    setIsLoading(true);
    try {
      await createSleepRecord({
        babyId: idBebe,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        durationMinutes,
        sleepType,
        sleepLocation,
        sleepQuality,
        interruptionsCount: parseInt(interruptions) || 0,
        notes,
      });

      Alert.alert('Registro exitoso', 'El descanso del bebé ha sido guardado.');
      navigation.goBack();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[
          styles.scroll, 
          { flexGrow: 1, paddingBottom: 150 }
        ]}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraHeight={120}
      extraScrollHeight={120}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      >
      
        {/* <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>💡 Tip de Seguridad</Text>
          <Text style={styles.tipText}>
            Si tu bebé tiene menos de 6 meses, recuerda siempre acostarlo boca arriba y en un espacio despejado para prevenir el Síndrome de Muerte Súbita.
          </Text>
        </View> */}

        {showTip && (
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>💡 Tip de Seguridad</Text>
            <Text style={styles.tipText}>
              Si tu bebé tiene menos de 6 meses, recuerda siempre acostarlo boca arriba y en un espacio despejado para prevenir el Síndrome de Muerte Súbita.
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tiempos de Sueño</Text>
          
          <Text style={styles.label}>Inicio del sueño</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity style={styles.dateBtn} onPress={() => openPicker('date', 'start')}>
              <Text style={styles.dateBtnText}>{startTime.toLocaleDateString()}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateBtn} onPress={() => openPicker('time', 'start')}>
              <Text style={styles.dateBtnText}>
                {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Fin del sueño</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity style={styles.dateBtn} onPress={() => openPicker('date', 'end')}>
              <Text style={styles.dateBtnText}>{endTime.toLocaleDateString()}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateBtn} onPress={() => openPicker('time', 'end')}>
              <Text style={styles.dateBtnText}>
                {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>

          {showPicker && (
            <DateTimePicker
              value={currentPickerInfo === 'start' ? startTime : endTime}
              mode={pickerMode}
              is24Hour={true}
              onChange={onChangeDate}
            />
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Detalles del Descanso</Text>

          <Text style={styles.label}>Tipo de Sueño</Text>
          <View style={styles.rowTabs}>
            {[
              { id: 'nap', label: 'Siesta (Día)' }, 
              { id: 'night', label: 'Noche' }
            ].map((opcion) => (
              <TouchableOpacity
                key={opcion.id}
                style={[styles.tabButton, sleepType === opcion.id && styles.tabActiveBlue]}
                onPress={() => setSleepType(opcion.id as any)}
              >
                <Text style={[styles.tabText, sleepType === opcion.id && styles.tabTextActive]}>
                  {opcion.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Lugar</Text>
          <View style={styles.rowTabsWrap}>
            {[
              { id: 'crib', label: 'Cuna' }, 
              { id: 'parents_bed', label: 'Colecho' },
              { id: 'arms', label: 'Brazos' },
              { id: 'stroller', label: 'Coche' },
              { id: 'other', label: 'Otro' }
            ].map((opcion) => (
              <TouchableOpacity
                key={opcion.id}
                style={[styles.tabButton, styles.tabWrap, sleepLocation === opcion.id && styles.tabActiveBlue]}
                onPress={() => setSleepLocation(opcion.id as any)}
              >
                <Text style={[styles.tabText, sleepLocation === opcion.id && styles.tabTextActive]}>
                  {opcion.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Calidad</Text>
          <View style={styles.rowTabs}>
            {[
              { id: 'quiet', label: 'Tranquilo' }, 
              { id: 'restless', label: 'Inquieto' },
              { id: 'bad', label: 'Malo' }
            ].map((opcion) => (
              <TouchableOpacity
                key={opcion.id}
                style={[styles.tabButton, sleepQuality === opcion.id && styles.tabActiveBlue]}
                onPress={() => setSleepQuality(opcion.id as any)}
              >
                <Text style={[styles.tabText, sleepQuality === opcion.id && styles.tabTextActive]}>
                  {opcion.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Despertares (Interrupciones)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="0" 
            keyboardType="numeric" 
            value={interruptions} 
            onChangeText={setInterruptions} 
          />

          <Text style={styles.label}>Notas adicionales</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ej: Se despertó llorando, le costó conciliar, etc."
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.btnGuardar} onPress={handleSave} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.btnTextWhite}>Guardar Registro de Sueño</Text>
          )}
        </TouchableOpacity>

      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  scroll: { padding: 20 },

  tipBox: {
    backgroundColor: '#EBF8FF', // Celeste claro
    padding: 16, borderRadius: 12, marginBottom: 16,
    borderLeftWidth: 4, borderLeftColor: '#3182CE'
  },
  tipTitle: { fontSize: 16, fontWeight: 'bold', color: '#2B6CB0', marginBottom: 4 },
  tipText: { fontSize: 14, color: '#2D3748', lineHeight: 20 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2D3748', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#4A5568', marginBottom: 8, marginTop: 8 },

  input: {
    backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 10, padding: 14, fontSize: 16, color: '#2D3748', marginBottom: 8
  },
  textArea: { height: 80, textAlignVertical: 'top' },

  dateRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  dateBtn: {
    flex: 1, backgroundColor: '#F7FAFC', paddingVertical: 14,
    borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0'
  },
  dateBtnText: { color: '#2D3748', fontSize: 16, fontWeight: '500' },

  rowTabs: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  rowTabsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  tabButton: {
    flex: 1, paddingVertical: 12, backgroundColor: '#EDF2F7',
    borderRadius: 10, alignItems: 'center'
  },
  tabWrap: { minWidth: '30%', flex: 0, paddingHorizontal: 10 },
  tabActiveBlue: { backgroundColor: '#4299E1' }, // Azul para el sueño
  tabText: { color: '#718096', fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#FFFFFF' },

  btnGuardar: {
    backgroundColor: '#2B6CB0', // Azul oscuro
    paddingVertical: 16, borderRadius: 12, alignItems: 'center',
    marginTop: 8, marginBottom: 40, shadowColor: '#2B6CB0',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4
  },
  btnTextWhite: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  error: { color: '#E53E3E', textAlign: 'center', marginBottom: 16, fontSize: 14 }
});