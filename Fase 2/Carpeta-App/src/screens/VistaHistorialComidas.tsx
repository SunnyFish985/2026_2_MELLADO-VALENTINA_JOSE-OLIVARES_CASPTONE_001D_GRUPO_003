import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { obtenerHistorialComidas } from '../services/comidaService';

export default function VistaHistorialComidas({ route }: any) {
  const { idBebe } = route.params;
  const [comidas, setComidas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarHistorial() {
      try {
        const datos = await obtenerHistorialComidas(idBebe);
        setComidas(datos || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    }
    cargarHistorial();
  }, [idBebe]);

  const renderItem = ({ item }: { item: any }) => {
    const fecha = new Date(item.fecha_hora_comida);
    const fechaFormateada = fecha.toLocaleDateString();
    const horaFormateada = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.badgeTipo}>
            <Text style={styles.badgeText}>{item.tipo_comida.toUpperCase()}</Text>
          </View>
          <View style={styles.fechaContainer}>
            <Text style={styles.textoFecha}>{fechaFormateada}</Text>
            <Text style={styles.textoHora}>{horaFormateada}</Text>
          </View>
        </View>

        <View style={styles.detallesContainer}>
          {item.cantidad_comida ? (
            <Text style={styles.detalleTexto}>
              <Text style={styles.detalleLabel}>Cantidad: </Text>{item.cantidad_comida} ml/g
            </Text>
          ) : null}
          {item.lado_pecho ? (
            <Text style={styles.detalleTexto}>
              <Text style={styles.detalleLabel}>Lado: </Text>{item.lado_pecho}
            </Text>
          ) : null}
          {item.ingredientes ? (
            <Text style={styles.detalleTexto}>
              <Text style={styles.detalleLabel}>Ingredientes: </Text>{item.ingredientes}
            </Text>
          ) : null}
          {item.marca ? (
            <Text style={styles.detalleTexto}>
              <Text style={styles.detalleLabel}>Marca: </Text>{item.marca} (Lote: {item.numero_lote})
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  if (cargando) {
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
        data={comidas}
        keyExtractor={(item) => item.id_comida}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.vacio}>Aún no hay comidas registradas.</Text>}
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
  vacio: { textAlign: 'center', marginTop: 40, color: '#A0AEC0', fontSize: 16 }
});
