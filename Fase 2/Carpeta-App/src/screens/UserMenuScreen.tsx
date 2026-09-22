import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logout } from '../services/authService';

export default function UserMenuScreen({ navigation }: any) {
  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mi cuenta</Text>
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Perfil', 'Esta sección estará disponible próximamente.')}>
          <Text style={styles.menuText}>Perfil</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Administrar círculos', 'Esta sección estará disponible próximamente.')}>
          <Text style={styles.menuText}>Administrar círculos</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8', padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#2D3748', marginBottom: 20 },
  menu: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden' },
  menuItem: {
    minHeight: 58, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#EDF2F7',
  },
  menuText: { color: '#2D3748', fontSize: 16, fontWeight: '600' },
  chevron: { color: '#A0AEC0', fontSize: 28, fontWeight: '300' },
  logoutItem: { borderBottomWidth: 0 },
  logoutText: { color: '#E53E3E', fontSize: 16, fontWeight: '700' },
});