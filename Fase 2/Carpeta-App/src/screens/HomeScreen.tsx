import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { logout } from '../services/authService';

export default function HomeScreen({ navigation }: any) {
  const [bebes, setBebes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarBebes() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Actualizamos la consulta a las tablas y columnas en inglés
        const { data, error } = await supabase
          .from('user_babies')
          .select(`baby_id, babies (first_name, paternal_last_name)`)
          .eq('user_id', user.id);

        if (error) throw error;
        setBebes(data || []);
      } catch (e) {
        console.error("Error al cargar bebés:", e);
      } finally {
        setCargando(false);
      }
    }

    const unsubscribe = navigation.addListener('focus', () => {
      cargarBebes();
    });

    return unsubscribe;
  }, [navigation]);

  const handleCerrarSesion = async () => {
    try {
      await logout();
    } catch (error: any) {
      Alert.alert("Error", "No se pudo cerrar sesión.");
    }
  };

  if (cargando) {
    return (
      <View style={[styles.container, styles.centrado]}>
        <ActivityIndicator size="large" color="#FF7A8A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Panel Principal</Text>
        <TouchableOpacity style={styles.btnLogout} onPress={handleCerrarSesion}>
          <Text style={styles.btnLogoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.btnPrimary}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('CrearBebe')}
      >
        <Text style={styles.btnTextWhite}>+ Crear Nuevo Bebé</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Tus Bebés Vinculados</Text>

      {bebes.length === 0 ? (
        <Text style={styles.emptyText}>No tienes bebés vinculados aún.</Text>
      ) : (
        bebes.map((vinculo) => {
          const relacionBebe = vinculo.babies;
          const datosBebe = Array.isArray(relacionBebe) ? relacionBebe[0] : relacionBebe;
          const nombreCompleto = datosBebe
            ? `${datosBebe.first_name} ${datosBebe.paternal_last_name}`
            : 'Bebé sin nombre';
          return (
            // Usamos baby_id como key
            <View key={vinculo.baby_id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{nombreCompleto.charAt(0)}</Text>
                </View>
                <Text style={styles.bebeName}>{nombreCompleto}</Text>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.btnAction, styles.btnGreen]}
                  // Mantenemos idBebe en la navegación para no romper las otras vistas
                  onPress={() => navigation.navigate('RegistrarComida', { idBebe: vinculo.baby_id })}
                >
                  <Text style={styles.btnTextWhite}>Registrar Comida</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btnAction, styles.btnBlue]}
                  onPress={() => navigation.navigate('HistorialComidas', { idBebe: vinculo.baby_id })}
                >
                  <Text style={styles.btnTextWhite}>Historial</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8', paddingHorizontal: 20, paddingTop: 20 },
  centrado: { justifyContent: 'center', alignItems: 'center' },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#2D3748' },
  btnLogout: { backgroundColor: '#E2E8F0', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  btnLogoutText: { color: '#4A5568', fontSize: 14, fontWeight: '600' },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#4A5568', marginTop: 24, marginBottom: 12 },
  emptyText: { textAlign: 'center', color: '#A0AEC0', marginTop: 20, fontSize: 16 },

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
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarPlaceholder: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFE4E6',
    justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#FF7A8A' },
  bebeName: { fontSize: 20, fontWeight: '600', color: '#2D3748' },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  btnAction: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  btnPrimary: {
    backgroundColor: '#FF7A8A', paddingVertical: 16, borderRadius: 12,
    alignItems: 'center', shadowColor: '#FF7A8A', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4
  },
  btnGreen: { backgroundColor: '#38B2AC' },
  btnBlue: { backgroundColor: '#4299E1' },
  btnTextWhite: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' }
});
