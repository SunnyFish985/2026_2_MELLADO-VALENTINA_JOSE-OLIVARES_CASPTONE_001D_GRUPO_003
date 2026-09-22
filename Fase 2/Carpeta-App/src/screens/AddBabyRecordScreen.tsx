import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddBabyRecordScreen({ navigation, route }: any) {
  const { idBebe } = route.params;
  const options = [
    ['Comida', 'FoodRecord'], ['Pañal', 'DiaperRecord'], ['Sueño', 'SleepRecord'], ['Medicamento', 'MedicationRecord'],
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Nuevo registro</Text>
      <View style={styles.list}>
        {options.map(([label, screen]) => (
          <TouchableOpacity key={screen} style={styles.button} onPress={() => navigation.navigate(screen, { idBebe })}>
            <Text style={styles.buttonText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8', padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#2D3748', marginBottom: 20 },
  list: { gap: 12 },
  button: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18, elevation: 2 },
  buttonText: { color: '#2D3748', fontSize: 17, fontWeight: '700' },
});