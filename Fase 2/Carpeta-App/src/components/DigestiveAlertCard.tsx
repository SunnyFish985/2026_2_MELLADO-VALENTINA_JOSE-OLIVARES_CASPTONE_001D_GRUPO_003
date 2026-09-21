import { StyleSheet, Text, View } from 'react-native';
import type { DigestiveAlert } from '../services/digestiveAlertService';

interface DigestiveAlertCardProps {
  alert: DigestiveAlert;
}

export default function DigestiveAlertCard({
  alert,
}: DigestiveAlertCardProps) {
  const isWarning = alert.priority === 'warning';
  const isObservation = alert.priority === 'observation';

  const getIcon = () => {
    if (isWarning) return '!';
    if (isObservation) return '?';
    return '✓';
  };

  return (
    <View
      style={[
        styles.card,
        isWarning && styles.warningCard,
        isObservation && styles.observationCard,
        alert.priority === 'info' && styles.infoCard,
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          isWarning && styles.warningIcon,
          isObservation && styles.observationIcon,
          alert.priority === 'info' && styles.infoIcon,
        ]}
      >
        <Text style={styles.iconText}>{getIcon()}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{alert.title}</Text>

        <Text style={styles.message}>{alert.message}</Text>

        {alert.observed_characteristics && (
          <View style={styles.characteristicsContainer}>
            <Text style={styles.characteristicsTitle}>
              Características observadas:
            </Text>

            <Text style={styles.characteristics}>
              {alert.observed_characteristics}
            </Text>
          </View>
        )}

        <View style={styles.statsContainer}>
          <Text style={styles.stats}>
            Registros observados: {alert.observations_count}
          </Text>

          <Text style={styles.stats}>
            Puntaje de observación: {alert.observation_score}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 8,
  },

  infoCard: {
    backgroundColor: '#F4F9F4',
    borderColor: '#B8D8B8',
  },

  observationCard: {
    backgroundColor: '#FFF9ED',
    borderColor: '#E6C878',
  },

  warningCard: {
    backgroundColor: '#FFF1F1',
    borderColor: '#E0A0A0',
  },

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  infoIcon: {
    backgroundColor: '#6FA66F',
  },

  observationIcon: {
    backgroundColor: '#D6A83D',
  },

  warningIcon: {
    backgroundColor: '#C95C5C',
  },

  iconText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },

  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },

  characteristicsContainer: {
    marginTop: 4,
    marginBottom: 12,
  },

  characteristicsTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },

  characteristics: {
    fontSize: 13,
    lineHeight: 19,
  },

  statsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#D9D9D9',
    paddingTop: 8,
  },

  stats: {
    fontSize: 12,
    marginTop: 2,
  },
});
