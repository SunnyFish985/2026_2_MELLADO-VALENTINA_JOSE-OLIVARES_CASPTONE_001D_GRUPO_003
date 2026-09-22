import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDiaperHistory } from '../services/diaperRecordService';

export default function DiaperHistoryScreen({ route }: any) {
  const { idBebe, selectedDate } = route.params;
  const [diapers, setDiapers] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHistory() {
      try {
        const datos = await getDiaperHistory(idBebe);
        setDiapers(datos || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [idBebe]);

  // Diccionarios para traducir la vista del usuario
  const wasteTypeTranslation = (tipo: string) => {
    const diccionario: Record<string, string> = {
      pee: 'SOLO ORINA',
      poop: 'SOLO FECAS',
      mixed: 'AMBOS',
      dry: 'SECO',
    };
    return diccionario[tipo] || tipo.toUpperCase();
  };

  const translateColorOrTexture = (value: string) => {
    const diccionario: Record<string, string> = {
      mustard: 'Mostaza', green: 'Verde', dark_green: 'Verde oscuro',
      brown: 'Café', black: 'Negro', red: 'Rojo', white: 'Blanco',
      sticky: 'Pegajosa', soft: 'Blanda', watery: 'Acuosa', creamy: 'Cremosa',
      pellets: 'Bolitas', lumpy: 'Grumosa', normal: 'Normal', mild: 'Suave',
      slightly_acidic: 'Ligeramente Ácido', rotten_egg: 'Huevo podrido',
      light_yellow: 'Amarillo claro', dark_yellow: 'Amarillo oscuro', orange: 'Naranjo/Rosado'
    };
    return diccionario[value] || value;
  };

  const visibleDiapers = showAll || !selectedDate ? diapers : diapers.filter((item) => item.change_date === selectedDate);

  const renderItem = ({ item }: { item: any }) => {
    // Usamos change_date y change_time que guardamos en la DB
    const fechaFormateada = item.change_date; // Formato YYYY-MM-DD
    const horaFormateada = item.change_time?.substring(0, 5); // Tomamos HH:MM

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.badgeTipo}>
            <Text style={styles.badgeText}>{wasteTypeTranslation(item.waste_type)}</Text>
          </View>
          <View style={styles.fechaContainer}>
            <Text style={styles.textoFecha}>{fechaFormateada}</Text>
            <Text style={styles.textoHora}>{horaFormateada}</Text>
          </View>
        </View>

        <View style={styles.detallesContainer}>
          {item.had_leak && (
            <Text style={styles.detalleTexto}>
              <Text style={styles.detalleLabel}>Fuga: </Text>Sí, hubo fuga de pañal
            </Text>
          )}
          {item.pee_color && (
            <Text style={styles.detalleTexto}>
              <Text style={styles.detalleLabel}>Color Orina: </Text>{translateColorOrTexture(item.pee_color)}
            </Text>
          )}
          {item.poop_color && (
            <Text style={styles.detalleTexto}>
              <Text style={styles.detalleLabel}>Color Fecas: </Text>{translateColorOrTexture(item.poop_color)}
            </Text>
          )}
          {item.poop_texture && (
            <Text style={styles.detalleTexto}>
              <Text style={styles.detalleLabel}>Textura Fecas: </Text>{translateColorOrTexture(item.poop_texture)}
            </Text>
          )}
          {item.poop_odor && (
            <Text style={styles.detalleTexto}>
              <Text style={styles.detalleLabel}>Olor Fecas: </Text>{translateColorOrTexture(item.poop_odor)}
            </Text>
          )}
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
        <ActivityIndicator size="large" color="#9F7AEA" />
      </View>
    );
  }

  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <FlatList
        contentContainerStyle={styles.listContainer}
        data={visibleDiapers}
        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
        renderItem={renderItem}
        ListHeaderComponent={selectedDate ? <View style={styles.filterRow}><TouchableOpacity style={[styles.filterButton, !showAll && styles.filterSelected]} onPress={() => setShowAll(false)}><Text style={styles.filterText}>Solo este día</Text></TouchableOpacity><TouchableOpacity style={[styles.filterButton, showAll && styles.filterSelected]} onPress={() => setShowAll(true)}><Text style={styles.filterText}>Todos</Text></TouchableOpacity></View> : null}
        ListEmptyComponent={<Text style={styles.vacio}>{selectedDate && !showAll ? 'No existen registros de hoy' : 'Aún no hay pañales registrados.'}</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  centrado: { justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 20, paddingBottom: 40 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    paddingBottom: 12,
  },
  badgeTipo: {
    backgroundColor: '#FAF5FF', // Morado muy claro
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: { color: '#805AD5', fontWeight: 'bold', fontSize: 12 }, // Morado
  fechaContainer: { alignItems: 'flex-end' },
  textoFecha: { fontSize: 14, color: '#4A5568', fontWeight: '600' },
  textoHora: { fontSize: 12, color: '#A0AEC0', marginTop: 2 },

  detallesContainer: { gap: 6 },
  detalleTexto: { fontSize: 15, color: '#2D3748' },
  detalleLabel: { fontWeight: '600', color: '#718096' },

  error: { color: '#E53E3E', textAlign: 'center', marginTop: 20, fontSize: 16 },
  vacio: { textAlign: 'center', marginTop: 40, color: '#A0AEC0', fontSize: 16 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterButton: { flex: 1, paddingVertical: 10, borderRadius: 9, backgroundColor: '#EDF2F7', alignItems: 'center' },
  filterSelected: { backgroundColor: '#9F7AEA' },
  filterText: { color: '#2D3748', fontWeight: '700' },
});