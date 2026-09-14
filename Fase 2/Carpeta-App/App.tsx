import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import VistaIniciarSesion from './src/screens/VistaIniciarSesion';
import VistaRegistrarUsuario from './src/screens/VistaRegistrarUsuario';
import HomeScreen from './src/screens/HomeScreen';
import VistaCrearBebe from './src/screens/VistaCrearBebe';
//import UnirseCodigoScreen from './src/screens/UnirseCodigoScreen';
import VistaRegistrarComida from './src/screens/VistaRegistrarComida';
import VistaHistorialComidas from './src/screens/VistaHistorialComidas';

const Stack = createNativeStackNavigator();

function Navigation() {
  const { session, cargando } = useAuth();

  if (cargando) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {session ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
            <Stack.Screen name="CrearBebe" component={VistaCrearBebe} options={{ title: 'Crear bebé' }} />
            <Stack.Screen name="RegistrarComida" component={VistaRegistrarComida} options={{ title: 'Registrar comida' }} />
            <Stack.Screen name="HistorialComidas" component={VistaHistorialComidas} options={{ title: 'Historial de Comidas' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={VistaIniciarSesion} options={{ headerShown: false }} />
            <Stack.Screen name="RegistrarUsuario" component={VistaRegistrarUsuario} options={{ title: 'Crear cuenta' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
