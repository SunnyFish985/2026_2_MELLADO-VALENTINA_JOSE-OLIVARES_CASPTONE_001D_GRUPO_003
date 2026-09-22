import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RecordDetailsScreen({ route }: any) {
  const record = route.params?.record;
  const details = record?.details || {};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{record?.type || 'Registro'}</Text>
        <Text style={styles.subtitle}>{record?.date} {record?.time}</Text>
        {Object.entries(details).filter(([key]) => !['id', 'baby_id', 'user_id'].includes(key)).map(([key, value]) => (
          <Text key={key} style={styles.detail}><Text style={styles.label}>{key.replaceAll('_', ' ')}: </Text>{String(value ?? '')}</Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#2D3748' },
  subtitle: { color: '#718096', marginBottom: 22, marginTop: 4 },
  detail: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 10, marginBottom: 8, color: '#2D3748', fontSize: 15 },
  label: { fontWeight: '700', color: '#4A5568' },
});