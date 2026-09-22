import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DailyRecord } from '../services/babyDailyRecordService';

const openRecord = (navigation: any, record: DailyRecord, babyId: string) => {
  if (record.type === 'Comida') navigation.navigate('FoodHistory', { idBebe: babyId, selectedDate: record.date });
  if (record.type === 'Pañal') navigation.navigate('DiaperHistory', { idBebe: babyId, selectedDate: record.date });
  if (record.type === 'Sueño') navigation.navigate('SleepHistory', { idBebe: babyId, selectedDate: record.date });
  if (record.type === 'Medicamento') navigation.navigate('MedicationLog', { medication: record.details.medication, scheduledAt: record.details.scheduled_at, selectedDate: record.date });
};

export default function DailyRecordsScreen({ navigation, route }: any) {
  const records: DailyRecord[] = route.params?.records || [];
  const date = route.params?.date || '';
  const idBebe = route.params?.babyId;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Registros del día</Text>
        <Text style={styles.date}>{date}</Text>
        {records.length === 0 ? <Text style={styles.empty}>No existen registros de hoy</Text> : records.map((record) => (
          <TouchableOpacity key={record.id} style={styles.card} onPress={() => openRecord(navigation, record, idBebe)}>
            <View><Text style={styles.type}>{record.type}</Text><Text style={styles.summary}>{record.summary}</Text></View>
            <Text style={styles.time}>{record.time}</Text>
          </TouchableOpacity>
        ))}
        {records.length > 0 && <Text style={styles.hint}>Selecciona un registro para ver sus datos.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  content: { padding: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#2D3748' },
  date: { color: '#718096', marginTop: 4, marginBottom: 18 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  type: { color: '#FF7A8A', fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  summary: { color: '#2D3748', fontSize: 17, fontWeight: '700', marginTop: 4 },
  time: { color: '#718096', fontWeight: '600' },
  empty: { color: '#718096', textAlign: 'center', marginTop: 50, fontSize: 16 },
  hint: { color: '#A0AEC0', textAlign: 'center', marginTop: 8 },
});