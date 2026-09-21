import React, {useEffect ,useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createDiaperRecord } from '../services/diaperRecordService';
import { getDigestiveAlerts } from '../services/digestiveAlertService';
import DigestiveAlertCard from '../components/DigestiveAlertCard';
import type { DigestiveAlert } from '../services/digestiveAlertService';

export default function DiaperRecordScreen({ route, navigation }: any) {
  const { idBebe } = route.params;

  // Estados principales
  const [wasteType, setWasteType] = useState<'pee' | 'poop' | 'mixed' | 'dry'>('pee');
  const [hadLeak, setHadLeak] = useState(false);
  const [notes, setNotes] = useState('');

  // Estados para opciones con "Otro" (Input libre)
  const [peeColorOption, setPeeColorOption] = useState<string>('light_yellow');
  const [customPeeColor, setCustomPeeColor] = useState('');

  const [poopColorOption, setPoopColorOption] = useState<string>('mustard');
  const [customPoopColor, setCustomPoopColor] = useState('');

  const [poopTextureOption, setPoopTextureOption] = useState<string>('soft');
  const [customPoopTexture, setCustomPoopTexture] = useState('');

  const [poopOdorOption, setPoopOdorOption] = useState<string>('normal');
  const [customPoopOdor, setCustomPoopOdor] = useState('');

  // Fecha y hora
  const [dateTime, setDateTime] = useState(new Date());
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [showPicker, setShowPicker] = useState(false);

  const [loading, setLoading] = useState(false);
  const [digestiveAlert, setDigestiveAlert] = useState<DigestiveAlert | null>(null);
  const [loadingDigestiveAlert, setLoadingDigestiveAlert] = useState(false);


  const loadDigestiveAlerts = async () => {
    try {
      setLoadingDigestiveAlert(true);

      const alerts = await getDigestiveAlerts(idBebe);

      if (alerts.length > 0) {
        setDigestiveAlert(alerts[0]);
      } else {
        setDigestiveAlert(null);
      }
    } catch (error) {
      console.error('Error cargando alertas digestivas:', error);
      setDigestiveAlert(null);
    } finally {
      setLoadingDigestiveAlert(false);
    }
  };

  useEffect(() => {
    loadDigestiveAlerts();
  }, [idBebe]);

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

  const saveDiaper = async () => {
    setLoading(true);

    try {
      const isPoop = wasteType === 'poop' || wasteType === 'mixed';
      const isPee = wasteType === 'pee' || wasteType === 'mixed';

      const changeDate = dateTime.toISOString().split('T')[0];
      const changeTime = dateTime.toTimeString().split(' ')[0];

      const finalPeeColor =
        peeColorOption === 'other' ? customPeeColor : peeColorOption;

      const finalPoopColor =
        poopColorOption === 'other' ? customPoopColor : poopColorOption;

      const finalPoopTexture =
        poopTextureOption === 'other'
          ? customPoopTexture
          : poopTextureOption;

      const finalPoopOdor =
        poopOdorOption === 'other'
          ? customPoopOdor
          : poopOdorOption;

      await createDiaperRecord({
        babyId: idBebe,
        changeDate,
        changeTime,
        wasteType,
        hadLeak,
        notes,
        peeColor: isPee ? finalPeeColor : undefined,
        poopColor: isPoop ? finalPoopColor : undefined,
        poopTexture: isPoop ? finalPoopTexture : undefined,
        poopOdor: isPoop ? finalPoopOdor : undefined,
      });

      const alerts = await getDigestiveAlerts(idBebe);

      if (alerts.length > 0) {
        setDigestiveAlert(alerts[0]);
      } else {
        setDigestiveAlert(null);
      }

      Alert.alert(
        'Éxito',
        'Pañal registrado correctamente'
      );

    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'No se pudo registrar el pañal'
      );
    } finally {
      setLoading(false);
    }
  };

  // Diccionarios visuales (Interno inglés -> UI Español)
  const wasteOptions = [
    { key: 'pee', label: 'SOLO ORINA' },
    { key: 'poop', label: 'SOLO FECAS' },
    { key: 'mixed', label: 'AMBOS' },
    { key: 'dry', label: 'SECO' },
  ];

  const poopColorOptions = [
    { key: 'mustard', label: 'Mostaza' },
    { key: 'green', label: 'Verde' },
    { key: 'dark_green', label: 'Verde oscuro' },
    { key: 'brown', label: 'Café' },
    { key: 'black', label: 'Negro' },
    { key: 'red', label: 'Rojo' },
    { key: 'white', label: 'Blanco' },
    { key: 'other', label: 'Otro' },
  ];

  const poopTextureOptions = [
    { key: 'sticky', label: 'Pegajosa' },
    { key: 'soft', label: 'Blanda' },
    { key: 'watery', label: 'Acuosa' },
    { key: 'creamy', label: 'Cremosa' },
    { key: 'pellets', label: 'Bolitas' },
    { key: 'lumpy', label: 'Grumosa' },
    { key: 'other', label: 'Otro' },
  ];

  const poopOdorOptions = [
    { key: 'normal', label: 'Normal' },
    { key: 'mild', label: 'Suave' },
    { key: 'slightly_acidic', label: 'Lig. Ácido' },
    { key: 'rotten_egg', label: 'Huevo podrido' },
    { key: 'other', label: 'Otro' },
  ];

  const peeColorOptions = [
    { key: 'light_yellow', label: 'Amarillo claro' },
    { key: 'dark_yellow', label: 'Amarillo oscuro' },
    { key: 'orange', label: 'Naranjo/Rosado' },
    { key: 'other', label: 'Otro' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {digestiveAlert && (
          <DigestiveAlertCard alert={digestiveAlert} />
        )}

        <Text style={styles.label}>¿Qué contenía el pañal?</Text>
        <View style={styles.rowTabsWrap}>
          {wasteOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[styles.tabButton, wasteType === option.key && styles.tabActive]}
              onPress={() => setWasteType(option.key as any)}
            >
              <Text style={[styles.tabText, wasteType === option.key && styles.tabTextActive, { fontSize: 11 }]}>
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

        {/* SECCIÓN FECAS */}
        {(wasteType === 'poop' || wasteType === 'mixed') && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Color de las fecas</Text>
              <View style={styles.rowTabsWrap}>
                {poopColorOptions.map((optn) => (
                  <TouchableOpacity
                    key={optn.key}
                    style={[styles.tabChip, poopColorOption === optn.key && styles.tabActive]}
                    onPress={() => setPoopColorOption(optn.key)}
                  >
                    <Text style={[styles.tabText, poopColorOption === optn.key && styles.tabTextActive]}>
                      {optn.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {poopColorOption === 'other' && (
                <TextInput style={styles.input} placeholder="Describe el color..." value={customPoopColor} onChangeText={setCustomPoopColor} />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Textura de las fecas</Text>
              <View style={styles.rowTabsWrap}>
                {poopTextureOptions.map((optn) => (
                  <TouchableOpacity
                    key={optn.key}
                    style={[styles.tabChip, poopTextureOption === optn.key && styles.tabActive]}
                    onPress={() => setPoopTextureOption(optn.key)}
                  >
                    <Text style={[styles.tabText, poopTextureOption === optn.key && styles.tabTextActive]}>
                      {optn.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {poopTextureOption === 'other' && (
                <TextInput style={styles.input} placeholder="Describe la textura..." value={customPoopTexture} onChangeText={setCustomPoopTexture} />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Olor de las fecas</Text>
              <View style={styles.rowTabsWrap}>
                {poopOdorOptions.map((optn) => (
                  <TouchableOpacity
                    key={optn.key}
                    style={[styles.tabChip, poopOdorOption === optn.key && styles.tabActive]}
                    onPress={() => setPoopOdorOption(optn.key)}
                  >
                    <Text style={[styles.tabText, poopOdorOption === optn.key && styles.tabTextActive]}>
                      {optn.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {poopOdorOption === 'other' && (
                <TextInput style={styles.input} placeholder="Describe el olor..." value={customPoopOdor} onChangeText={setCustomPoopOdor} />
              )}
            </View>
          </>
        )}

        {/* SECCIÓN ORINA */}
        {(wasteType === 'pee' || wasteType === 'mixed') && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Color de la orina</Text>
            <View style={styles.rowTabsWrap}>
              {peeColorOptions.map((optn) => (
                <TouchableOpacity
                  key={optn.key}
                  style={[styles.tabChip, peeColorOption === optn.key && styles.tabActive]}
                  onPress={() => setPeeColorOption(optn.key)}
                >
                  <Text style={[styles.tabText, peeColorOption === optn.key && styles.tabTextActive]}>
                    {optn.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {peeColorOption === 'other' && (
              <TextInput style={styles.input} placeholder="Describe el color..." value={customPeeColor} onChangeText={setCustomPeeColor} />
            )}
          </View>
        )}

        {/* FUGAS Y NOTAS */}
        <View style={[styles.inputGroup, styles.switchRow]}>
          <Text style={styles.label}>¿Hubo fugas de pañal?</Text>
          <Switch value={hadLeak} onValueChange={setHadLeak} trackColor={{ false: '#E2E8F0', true: '#38B2AC' }} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notas adicionales (Opcional)</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Ej. Lloró al hacer fuerza, rabeo mucho, etc."
            multiline
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <TouchableOpacity style={styles.btnGuardar} onPress={saveDiaper} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnTextWhite}>Guardar Registro</Text>}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  scroll: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#4A5568', marginBottom: 8, marginTop: 16 },

  rowTabsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },

  tabButton: {
    flex: 1, minWidth: '22%', paddingVertical: 12, backgroundColor: '#EDF2F7',
    borderRadius: 10, alignItems: 'center', justifyContent: 'center'
  },
  tabChip: {
    paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#EDF2F7',
    borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 4
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
    borderRadius: 10, padding: 14, fontSize: 16, color: '#2D3748', marginTop: 8
  },

  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 },

  btnGuardar: {
    backgroundColor: '#38B2AC', paddingVertical: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 32, marginBottom: 40, shadowColor: '#38B2AC',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4
  },
  btnTextWhite: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});
