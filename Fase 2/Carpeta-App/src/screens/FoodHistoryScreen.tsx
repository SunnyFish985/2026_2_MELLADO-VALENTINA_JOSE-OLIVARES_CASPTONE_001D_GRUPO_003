import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Importamos el nuevo nombre de la función
import { getFoodHistory } from '../services/foodRecordService';

export default function FoodHistoryScreen({ route }: any) {
  // Mantenemos idBebe porque así lo debe estar enviando tu navegación actual
  const { idBebe, selectedDate } = route.params;
  const [foods, setFoods] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHistory() {
      try {
        // Llamamos al nuevo servicio
        const datos = await getFoodHistory(idBebe);
        setFoods(datos || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [idBebe]);

  // Diccionarios para traducir la vista del usuario
  const foodTypeTranslation = (tipo: string) => {
    const diccionario: Record<string, string> = {
      breast: 'PECHO',
      formula: 'FÓRMULA',
      homemade: 'CASERA',
      commercial: 'INDUSTRIAL',
    };
    return diccionario[tipo] || tipo.toUpperCase();
  };

  const nippleSideTranslation = (lado: string) => {
    const diccionario: Record<string, string> = {
      left: 'Izquierdo',
      right: 'Derecho',
      both: 'Ambos',
    };
    return diccionario[lado] || lado;
  };

  const localDate = (value: string) => {
    const date = new Date(value);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const visibleFoods = showAll || !selectedDate ? foods : foods.filter((item) => localDate(item.recorded_at) === selectedDate);

  const renderItem = ({ item }: { item: any }) => {
    // Usamos recorded_at en lugar de fecha_hora_comida
    const fecha = new Date(item.recorded_at);
    const fechaFormateada = fecha.toLocaleDateString();
    const horaFormateada = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.badgeTipo}>
            {/* Traducimos el food_type para la UI */}
            <Text style={styles.badgeText}>{foodTypeTranslation(item.food_type)}</Text>
          </View>
          <View style={styles.fechaContainer}>
            <Text style={styles.textoFecha}>{fechaFormateada}</Text>
            <Text style={styles.textoHora}>{horaFormateada}</Text>
          </View>
        </View>

        <View style={styles.detallesContainer}>
          {/* Mapeamos a las nuevas columnas en inglés: amount, breast_side, ingredients, brand, batch_number */}
          {item.amount ? (
            <Text style={styles.detalleTexto}>
              <Text style={styles.detalleLabel}>Cantidad: </Text>{item.amount} ml/g
            </Text>
          ) : null}
          {item.breast_side ? (
            <Text style={styles.detalleTexto}>
              <Text style={styles.detalleLabel}>Lado: </Text>{nippleSideTranslation(item.breast_side)}
            </Text>
          ) : null}
          {item.ingredients ? (
            <Text style={styles.detalleTexto}>
              <Text style={styles.detalleLabel}>Ingredientes: </Text>{item.ingredients}
            </Text>
          ) : null}
          {item.brand ? (
            <Text style={styles.detalleTexto}>
              <Text style={styles.detalleLabel}>Marca: </Text>{item.brand} {item.batch_number ? `(Lote: ${item.batch_number})` : ''}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centrado]}>
        <ActivityIndicator size="large" color="#4299E1" />
      </View>
    );
  }

  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <FlatList
        contentContainerStyle={styles.listContainer}
        data={visibleFoods}
        // La llave primaria ahora es simplemente 'id'
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={selectedDate ? <View style={styles.filterRow}><TouchableOpacity style={[styles.filterButton, !showAll && styles.filterSelected]} onPress={() => setShowAll(false)}><Text style={styles.filterText}>Solo este día</Text></TouchableOpacity><TouchableOpacity style={[styles.filterButton, showAll && styles.filterSelected]} onPress={() => setShowAll(true)}><Text style={styles.filterText}>Todos</Text></TouchableOpacity></View> : null}
        ListEmptyComponent={<Text style={styles.vacio}>{selectedDate && !showAll ? 'No existen registros de hoy' : 'Aún no hay comidas registradas.'}</Text>}
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
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: { color: '#3182CE', fontWeight: 'bold', fontSize: 12 },
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
  filterSelected: { backgroundColor: '#4299E1' },
  filterText: { color: '#2D3748', fontWeight: '700' },
});
