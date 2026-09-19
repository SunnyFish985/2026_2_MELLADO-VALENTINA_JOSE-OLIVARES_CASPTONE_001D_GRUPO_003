import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMedications } from '../services/medicationService';

const formatDate = (value: string) => new Date(value).toLocaleString();

export default function MedicationHistoryScreen({ route, navigation }: any) {
  const { idBebe } = route.params;
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMedications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setMedications(await getMedications(idBebe));
    } catch (e: any) {
      setError(e.message || 'No se pudieron cargar los medicamentos');
    } finally {
      setLoading(false);
    }
  }, [idBebe]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadMedications);
    return unsubscribe;
  }, [loadMedications, navigation]);

  const renderMedication = ({ item }: { item: any }) => {
    const isActive = !item.end_date || new Date(item.end_date) >= new Date();

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{item.medication_name}</Text>
          <Text style={[styles.status, isActive ? styles.active : styles.finished]}>{isActive ? 'Activo' : 'Finalizado'}</Text>
        </View>
        <Text style={styles.detail}>Dosis: {item.dose_amount} {item.dose_unit}</Text>
        <Text style={styles.detail}>Frecuencia: cada {item.frequency_hours} horas</Text>
        <Text style={styles.detail}>Inicio: {formatDate(item.start_date)}</Text>
        {item.end_date ? <Text style={styles.detail}>Término: {formatDate(item.end_date)}</Text> : null}
        {item.doctor_name ? <Text style={styles.detail}>Doctor: {item.doctor_name}</Text> : null}

        <TouchableOpacity
          style={styles.logButton}
          onPress={() => navigation.navigate('MedicationLog', { medication: item })}
        >
          <Text style={styles.buttonText}>Registrar toma y ver historial</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color="#38B2AC" /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={medications}
        renderItem={renderMedication}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Aún no hay medicamentos registrados.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  center: { justifyContent: 'center', alignItems: 'center' },
  list: { padding: 20, paddingBottom: 40, flexGrow: 1 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  name: { flex: 1, fontSize: 20, fontWeight: '700', color: '#2D3748' },
  status: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, fontWeight: '700' },
  active: { color: '#276749', backgroundColor: '#C6F6D5' },
  finished: { color: '#718096', backgroundColor: '#EDF2F7' },
  detail: { color: '#4A5568', fontSize: 15, marginBottom: 6 },
  logButton: { backgroundColor: '#2C5282', paddingVertical: 13, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  empty: { textAlign: 'center', color: '#A0AEC0', fontSize: 16, marginTop: 40 },
  error: { color: '#E53E3E', textAlign: 'center', margin: 20 },
});
