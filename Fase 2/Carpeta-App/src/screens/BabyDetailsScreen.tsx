import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getBabyDailyRecords, DailyRecord } from '../services/babyDailyRecordService';
import Icon from 'react-native-vector-icons/Ionicons'

const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const addDays = (date: Date, amount: number) => { const result = new Date(date); result.setDate(result.getDate() + amount); return result; };

const openRecord = (navigation: any, record: DailyRecord, babyId: string) => {
  if (record.type === 'Comida') navigation.navigate('FoodHistory', { idBebe: babyId, selectedDate: record.date });
  if (record.type === 'Pañal') navigation.navigate('DiaperHistory', { idBebe: babyId, selectedDate: record.date });
  if (record.type === 'Sueño') navigation.navigate('SleepHistory', { idBebe: babyId, selectedDate: record.date });
  if (record.type === 'Medicamento') navigation.navigate('MedicationLog', { medication: record.details.medication, scheduledAt: record.details.scheduled_at, selectedDate: record.date });
};

export default function BabyDetailsScreen({ navigation, route }: any) {
  const { babyId, baby } = route.params || {};
  const babyName = baby ? `${baby.first_name} ${baby.paternal_last_name}` : 'Bebé';
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(selectedDate, index - 3)), [selectedDate]);

  useEffect(() => {
    navigation.setOptions({
      title: 'Detalle del bebé',
      headerTitle: () => (
        <View style={styles.navigationHeader}>
          <TouchableOpacity style={styles.touchableName}
          onPress={() => navigation.navigate('BabyMenu', { babyId, baby })}>
            {baby?.photo_url ? 
                <Image source={{ uri: baby.photo_url }} style={styles.navigationAvatar} /> : 
                <View style={styles.navigationAvatarFallback}>
                    <Text style={styles.navigationAvatarText}>{babyName.charAt(0)}</Text>
                </View>}
                <Text style={styles.navigationName} numberOfLines={1}>{babyName}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navigationCalendarButton}
            onPress={() => navigation.navigate('BabyCalendar', { babyId, baby })}
          >
            <Text style={styles.navigationCalendar}>
                <Icon name="calendar" size={30} />
            </Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [baby, babyId, babyName, navigation]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getBabyDailyRecords(babyId, dateKey(selectedDate)).then((items) => { 
        if (active) setRecords(items); }).catch(() => { 
            if (active) setRecords([]); }).finally(() => { 
                if (active) setLoading(false); });
    return () => { active = false; };
  }, [babyId, selectedDate]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.weekHeader}>
          {days.map((day) => { const selected = dateKey(day) === dateKey(selectedDate); return <TouchableOpacity key={dateKey(day)} style={[styles.day, selected && styles.daySelected]} onPress={() => setSelectedDate(day)}><Text style={[styles.weekday, selected && styles.selectedText]}>{day.toLocaleDateString('es-CL', { weekday: 'short' }).replace('.', '')}</Text><Text style={[styles.dayNumber, selected && styles.selectedText]}>{day.getDate()}</Text></TouchableOpacity>; })}
        </View>
        <Text style={styles.dateTitle}>{selectedDate.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}</Text>
        {loading ? 
            <ActivityIndicator color="#FF7A8A" style={styles.loader} /> : 
            records.length === 0 ? 
                <Text style={styles.empty}>No existen registros de hoy</Text> : 
                records.map((record) => 
                <TouchableOpacity 
                    key={record.id} 
                    style={styles.recordButton} 
                    onPress={() => openRecord(navigation, record, babyId)}>
                    <View>
                        <Text style={styles.recordType}>{record.type}</Text>
                        <Text style={styles.recordSummary}>{record.summary}</Text>
                    </View>
                        <Text style={styles.recordTime}>{record.time}</Text>
                </TouchableOpacity>)}
      </ScrollView>
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddBabyRecord', { idBebe: babyId })}><Text style={styles.addText}>+</Text></TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  touchableName: {flexDirection: 'row'},
  container: { flex: 1, backgroundColor: '#F4F6F8' }, 
  content: { padding: 20, paddingBottom: 100 },
  navigationHeader: { flexDirection: 'row', alignItems: 'center', flex: 1, width: '90%', justifyContent:'center' }, 
  navigationAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 }, 
  navigationAvatarFallback: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFE4E6', justifyContent: 'center', alignItems: 'center', marginRight: 8}, 
  navigationAvatarText: { color: '#FF7A8A', fontSize: 15, fontWeight: '800', justifyContent: 'center', flexDirection: 'row' }, 
  navigationName: { flex: 1, color: '#2D3748', fontSize: 20, fontWeight: '600', marginRight: 8 }, 
  navigationCalendarButton: { marginLeft: 12, padding: 5 },
  navigationCalendar: { color: '#FF7A8A' }, 
  babyMenuButton: { alignSelf: 'flex-end', marginBottom: 18 }, 
  babyMenuText: { color: '#FF7A8A', fontWeight: '700' },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 26 }, 
  day: { width: 43, paddingVertical: 9, borderRadius: 14, alignItems: 'center' }, 
  daySelected: { backgroundColor: '#FF7A8A' }, 
  weekday: { color: '#A0AEC0', fontSize: 12, textTransform: 'capitalize' }, 
  dayNumber: { color: '#2D3748', fontSize: 18, fontWeight: '800', marginTop: 4 }, 
  selectedText: { color: '#FFFFFF' }, 
  dateTitle: { color: '#2D3748', fontSize: 19, fontWeight: '800', marginBottom: 14, textTransform: 'capitalize' }, 
  loader: { marginTop: 30 }, empty: { color: '#718096', textAlign: 'center', marginTop: 45, fontSize: 16 },
  recordButton: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2 }, 
  recordType: { color: '#FF7A8A', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' }, 
  recordSummary: { color: '#2D3748', fontSize: 16, fontWeight: '700', marginTop: 4 }, 
  recordTime: { color: '#718096', fontWeight: '600' }, 
  addButton: { position: 'absolute', right: 24, bottom: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: '#FF7A8A', alignItems: 'center', justifyContent: 'center', elevation: 5 }, addText: { color: '#FFFFFF', fontSize: 34, lineHeight: 38, fontWeight: '300' },
});
