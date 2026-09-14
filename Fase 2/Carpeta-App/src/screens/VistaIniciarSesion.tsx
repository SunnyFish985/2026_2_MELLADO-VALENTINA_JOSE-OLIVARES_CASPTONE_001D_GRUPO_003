import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Asegúrate de que esta importación coincida con el nombre real de tu función en authService
import { iniciarSesion } from '../services/authService';

export default function VistaIniciarSesion({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function handleLogin() {
    setError('');

    if (!email || !password) {
      setError('Por favor ingresa tu correo y contraseña');
      return;
    }

    setCargando(true);
    try {
      // Ajusta los parámetros si tu función los recibe como un objeto en lugar de argumentos separados
      await iniciarSesion(email, password);
      // El AuthContext detectará la sesión y navegará automáticamente al Home
    } catch (e: any) {
      setError(e.message || 'Credenciales incorrectas o error de conexión');
    } finally {
      setCargando(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll}>

          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>¡Hola de nuevo!</Text>
            <Text style={styles.headerSubtitle}>Ingresa a tu cuenta para continuar cuidando de tu bebé.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="ejemplo@correo.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Tu contraseña"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.btnIngresar}
            onPress={handleLogin}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.btnTextWhite}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('RegistrarUsuario')}>
              <Text style={styles.footerLink}>Regístrate aquí</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  scroll: { padding: 24, flexGrow: 1, justifyContent: 'center' },

  headerContainer: { marginBottom: 32, alignItems: 'center' },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#2D3748', marginBottom: 8, textAlign: 'center' },
  headerSubtitle: { fontSize: 15, color: '#718096', textAlign: 'center', paddingHorizontal: 20 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#4A5568', marginBottom: 8 },
  input: {
    backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 10, padding: 14, fontSize: 16, color: '#2D3748', marginBottom: 16
  },

  btnIngresar: {
    backgroundColor: '#38B2AC', paddingVertical: 16, borderRadius: 12,
    alignItems: 'center', marginBottom: 24, shadowColor: '#38B2AC',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4
  },
  btnTextWhite: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

  error: { color: '#E53E3E', textAlign: 'center', marginBottom: 16, fontSize: 14, fontWeight: '500' },

  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  footerText: { color: '#718096', fontSize: 15 },
  footerLink: { color: '#FF7A8A', fontSize: 15, fontWeight: 'bold' }
});
