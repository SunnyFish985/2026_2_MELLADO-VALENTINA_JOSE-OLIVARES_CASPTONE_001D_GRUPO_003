import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SleepAlert } from '../services/sleepAlertService';

interface Props {
  alert: SleepAlert;
}

export default function SleepAlertCard({ alert }: Props) {
  const getPriorityLabel = () => {
    switch (alert.priority) {
      case 'warning':
        return 'Atención';
      case 'observation':
        return 'Observación';
      default:
        return 'Resumen';
    }
  };

  return (
    <View
      style={[
        styles.card,
        alert.priority === 'warning' && styles.cardWarning,
        alert.priority === 'observation' && styles.cardObservation,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{alert.title}</Text>

          <Text
            style={[
              styles.priority,
              alert.priority === 'warning' && styles.priorityWarning,
              alert.priority === 'observation' && styles.priorityObservation,
            ]}
          >
            {getPriorityLabel()}
          </Text>
        </View>
      </View>

      <Text style={styles.message}>
        {alert.message}
      </Text>

      <View style={styles.separator} />

      <Text style={styles.sectionTitle}>
        Resumen de los últimos 7 días
      </Text>

      <View style={styles.statsGrid}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {alert.records_count}
          </Text>
          <Text style={styles.statLabel}>
            Períodos
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {alert.average_duration_minutes ?? '—'}
          </Text>
          <Text style={styles.statLabel}>
            Min. promedio
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {alert.nap_count}
          </Text>
          <Text style={styles.statLabel}>
            Siestas
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {alert.night_count}
          </Text>
          <Text style={styles.statLabel}>
            Nocturnos
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.detail}>
          Tranquilos: {alert.quiet_count}
        </Text>

        <Text style={styles.detail}>
          Inquietos: {alert.restless_count}
        </Text>

        <Text style={styles.detail}>
          Calidad mala: {alert.bad_count}
        </Text>

        <Text style={styles.detail}>
          Interrupciones promedio:{' '}
          {alert.average_interruptions ?? 0}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#E6FFFA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#B2F5EA',
  },

  cardObservation: {
    backgroundColor: '#FFFAF0',
    borderColor: '#F6E05E',
  },

  cardWarning: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FEB2B2',
  },

  header: {
    marginBottom: 8,
  },

  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },

  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#234E52',
  },

  priority: {
    backgroundColor: '#B2F5EA',
    color: '#234E52',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '700',
  },

  priorityObservation: {
    backgroundColor: '#FEFCBF',
    color: '#744210',
  },

  priorityWarning: {
    backgroundColor: '#FED7D7',
    color: '#742A2A',
  },

  message: {
    fontSize: 15,
    color: '#2D3748',
    lineHeight: 21,
  },

  separator: {
    height: 1,
    backgroundColor: '#CBD5E0',
    marginVertical: 14,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A5568',
    marginBottom: 10,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  stat: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
  },

  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
  },

  statLabel: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },

  details: {
    marginTop: 12,
    gap: 4,
  },

  detail: {
    fontSize: 13,
    color: '#4A5568',
  },
});
