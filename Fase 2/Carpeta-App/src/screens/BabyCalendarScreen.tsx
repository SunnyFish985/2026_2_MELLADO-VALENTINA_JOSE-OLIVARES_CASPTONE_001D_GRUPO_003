import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DailyRecord, getBabyDailyRecords } from '../services/babyDailyRecordService';

const keyOf = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const openRecord = (navigation: any, record: DailyRecord, babyId: string) => {
  if (record.type === 'Comida') navigation.navigate('FoodHistory', { idBebe: babyId, selectedDate: record.date });
  if (record.type === 'Pañal') navigation.navigate('DiaperHistory', { idBebe: babyId, selectedDate: record.date });
  if (record.type === 'Sueño') navigation.navigate('SleepHistory', { idBebe: babyId, selectedDate: record.date });
  if (record.type === 'Medicamento') navigation.navigate('MedicationLog', { medication: record.details.medication, scheduledAt: record.details.scheduled_at, selectedDate: record.date });
};

export default function BabyCalendarScreen({ navigation, route }: any) {
  const { babyId } = route.params || {};
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const blanks: (Date | null)[] = Array.from({ length: first.getDay() === 0 ? 6 : first.getDay() - 1 }, () => null);
    const calendarDays: (Date | null)[] = Array.from({ length: count }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1));
    return blanks.concat(calendarDays);
  }, [month]);

  const chooseDate = async (date: Date) => {
    setSelected(date); setLoading(true);
    try { setRecords(await getBabyDailyRecords(babyId, keyOf(date))); } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.monthHeader}><TouchableOpacity onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><Text style={styles.arrow}>‹</Text></TouchableOpacity><Text style={styles.month}>{month.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}</Text><TouchableOpacity onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><Text style={styles.arrow}>›</Text></TouchableOpacity></View>
      <View style={styles.weekdays}>{['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => <Text key={`${day}-${index}`} style={styles.weekday}>{day}</Text>)}</View>
      <View style={styles.grid}>{days.map((date, index) => date ? <TouchableOpacity key={keyOf(date)} style={styles.calendarDay} onPress={() => chooseDate(date)}><Text style={styles.dayText}>{date.getDate()}</Text></TouchableOpacity> : <View key={`empty-${index}`} style={styles.calendarDay} />)}</View>
      <Modal visible={Boolean(selected)} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalBackdrop}><View style={styles.modal}><TouchableOpacity onPress={() => setSelected(null)}><Text style={styles.close}>Cerrar</Text></TouchableOpacity><Text style={styles.modalTitle}>{selected?.toLocaleDateString('es-CL', { dateStyle: 'long' })}</Text>{loading ? <ActivityIndicator color="#FF7A8A" /> : records.length === 0 ? <Text style={styles.empty}>No existen registros de hoy</Text> : records.map((record) => <TouchableOpacity key={record.id} style={styles.record} onPress={() => openRecord(navigation, record, babyId)}><Text style={styles.recordType}>{record.type}</Text><Text style={styles.recordText}>{record.summary} · {record.time}</Text></TouchableOpacity>)}{records.length > 0 && <TouchableOpacity style={styles.detailsButton} onPress={() => navigation.navigate('DailyRecords', { babyId, date: keyOf(selected!), records })}><Text style={styles.detailsText}>Ver detalles del día</Text></TouchableOpacity>}</View></View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8', padding: 20 }, monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }, month: { color: '#2D3748', fontSize: 21, fontWeight: '800', textTransform: 'capitalize' }, arrow: { color: '#FF7A8A', fontSize: 36, paddingHorizontal: 12 }, weekdays: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 }, weekday: { width: 38, textAlign: 'center', color: '#A0AEC0', fontWeight: '700' }, grid: { flexDirection: 'row', flexWrap: 'wrap' }, calendarDay: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }, dayText: { color: '#2D3748', fontSize: 17 }, modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(45,55,72,0.35)' }, modal: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, minHeight: 260 }, close: { color: '#FF7A8A', textAlign: 'right', fontWeight: '700' }, modalTitle: { color: '#2D3748', fontSize: 21, fontWeight: '800', marginVertical: 16, textTransform: 'capitalize' }, empty: { color: '#718096', textAlign: 'center', marginVertical: 24 }, record: { backgroundColor: '#F7FAFC', borderRadius: 10, padding: 12, marginBottom: 8 }, recordType: { color: '#FF7A8A', fontSize: 12, fontWeight: '800' }, recordText: { color: '#2D3748', fontWeight: '700', marginTop: 3 }, detailsButton: { backgroundColor: '#FF7A8A', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 }, detailsText: { color: '#FFFFFF', fontWeight: '800' },
});
