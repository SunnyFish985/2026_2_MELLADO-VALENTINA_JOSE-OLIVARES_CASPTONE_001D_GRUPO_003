import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSleepHistory } from '../services/sleepRecordService';
import { getSleepAlerts, SleepAlert } from '../services/sleepAlertService';
import SleepAlertCard from '../components/SleepAlertCard';

export default function SleepHistoryScreen({ route }: any) {
  const { idBebe } = route.params;
  const [sleeps, setSleeps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sleepAlert, setSleepAlert] = useState<SleepAlert | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const datos = await getSleepHistory(idBebe);
        setSleeps(datos || []);

        const alerts = await getSleepAlerts(idBebe);
        setSleepAlert(alerts[0] || null);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [idBebe]);

  // --- Diccionarios de Traducción ---
  const translateType = (type: string) => {
    const dicc: Record<string, string> = {
      nap: 'SIESTA',
      night: 'SUEÑO NOCTURNO',
    };
    return dicc[type] || type.toUpperCase();
  };

  const translateLocation = (location: string) => {
    const dicc: Record<string, string> = {
      crib: 'Cuna',
      parents_bed: 'Colecho',
      arms: 'En brazos',
      stroller: 'Coche',
      other: 'Otro',
    };
    return dicc[location] || location;
  };

  const translateQuality = (quality: string) => {
    const dicc: Record<string, string> = {
      quiet: 'Tranquilo',
      restless: 'Inquieto',
      bad: 'Malo',
    };
    return dicc[quality] || quality;
  };

  // --- Funciones de Formateo ---
  const formatDuration = (minutes: number) => {
    if (!minutes) return 'Desconocida';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} min`;
    return m === 0 ? `${h} hrs` : `${h}h ${m}m`;
  };

  const renderItem = ({ item }: { item: any }) => {
    // Convertimos los TIMESTAMPTZ de la DB a objetos Date de JS
    const startDate = new Date(item.start_time);
    const endDate = new Date(item.end_time);

    const fecha = startDate.toLocaleDateString();
    const horaInicio = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const horaFin = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.badgeTipo, item.sleep_type === 'night' ? styles.badgeNight : styles.badgeNap]}>
            <Text style={[styles.badgeText, item.sleep_type === 'night' ? styles.textNight : styles.textNap]}>
              {translateType(item.sleep_type)}
            </Text>
          </View>
          <View style={styles.fechaContainer}>
            <Text style={styles.textoFecha}>{fecha}</Text>
            <Text style={styles.textoHora}>{horaInicio} - {horaFin}</Text>
          </View>
        </View>

        <View style={styles.detallesContainer}>
          <Text style={styles.detalleTexto}>
            <Text style={styles.detalleLabel}>Duración: </Text>{formatDuration(item.duration_minutes)}
          </Text>

          {item.sleep_location && (
            <Text style={styles.detalleTexto}>
              <Text style={styles.detalleLabel}>Lugar: </Text>{translateLocation(item.sleep_location)}
            </Text>
          )}

          {item.sleep_quality && (
            <Text style={styles.detalleTexto}>
              <Text style={styles.detalleLabel}>Calidad: </Text>{translateQuality(item.sleep_quality)}
            </Text>
          )}

          <Text style={styles.detalleTexto}>
            <Text style={styles.detalleLabel}>Despertares: </Text>{item.interruptions_count || 0}
          </Text>

          {item.notes ? (
            <Text style={styles.detalleTexto}>
              <Text style={styles.detalleLabel}>Notas: </Text>{item.notes}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centrado]}>
        <ActivityIndicator size="large" color="#2B6CB0" />
      </View>
    );
  }

  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <FlatList
        contentContainerStyle={styles.listContainer}
        data={sleeps}
        keyExtractor={(item, index) =>
          item.id ? item.id.toString() : index.toString()
        }
        renderItem={renderItem}

        ListHeaderComponent={
          sleepAlert ? (
            <SleepAlertCard alert={sleepAlert} />
          ) : null
        }

        ListEmptyComponent={
          <Text style={styles.vacio}>
            Aún no hay registros de sueño.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  centrado: { justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 20, paddingBottom: 40 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#EDF2F7', paddingBottom: 12,
  },

  badgeTipo: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  badgeNap: { backgroundColor: '#EBF8FF' }, // Celeste para siestas
  textNap: { color: '#3182CE', fontWeight: 'bold', fontSize: 12 },

  badgeNight: { backgroundColor: '#2C5282' }, // Azul oscuro para noche
  textNight: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },

  fechaContainer: { alignItems: 'flex-end' },
  textoFecha: { fontSize: 14, color: '#4A5568', fontWeight: '600' },
  textoHora: { fontSize: 12, color: '#A0AEC0', marginTop: 2 },

  detallesContainer: { gap: 6 },
  detalleTexto: { fontSize: 15, color: '#2D3748' },
  detalleLabel: { fontWeight: '600', color: '#718096' },

  error: { color: '#E53E3E', textAlign: 'center', marginTop: 20, fontSize: 16 },
  vacio: { textAlign: 'center', marginTop: 40, color: '#A0AEC0', fontSize: 16 },
});
