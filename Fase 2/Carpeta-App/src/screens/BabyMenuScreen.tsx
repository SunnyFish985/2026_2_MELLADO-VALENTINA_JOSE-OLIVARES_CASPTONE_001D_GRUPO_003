import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BabyMenuScreen({ navigation, route }: any) {
  const { babyId, baby } = route.params || {};
  const babyName = baby ? `${baby.first_name} ${baby.paternal_last_name}` : 'Bebé';

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{babyName}</Text>
      <View style={styles.menu}>
        <TouchableOpacity style={styles.item} onPress={() => Alert.alert('Perfil del bebé', 'Esta sección estará disponible próximamente.')}>
          <Text style={styles.text}>Perfil del bebé</Text><Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => Alert.alert('Cuidadores', 'Esta sección estará disponible próximamente.')}>
          <Text style={styles.text}>Cuidadores</Text><Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => Alert.alert('Eliminar bebé', 'Esta acción estará disponible próximamente.')}>
          <Text style={styles.deleteText}>Eliminar bebé</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8', padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#2D3748', marginBottom: 20 },
  menu: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden' },
  item: { minHeight: 58, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  text: { color: '#2D3748', fontSize: 16, fontWeight: '600' },
  arrow: { color: '#A0AEC0', fontSize: 28 },
  deleteText: { color: '#E53E3E', fontSize: 16, fontWeight: '700' },
});