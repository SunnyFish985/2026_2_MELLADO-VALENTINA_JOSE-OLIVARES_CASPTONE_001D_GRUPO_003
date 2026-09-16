import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LogInScreen from './src/screens/LogInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import HomeScreen from './src/screens/HomeScreen';
import CreateBabyScreen from './src/screens/CreateBabyScreen';
//import UnirseCodigoScreen from './src/screens/UnirseCodigoScreen';
import FoodRecordScreen from './src/screens/FoodRecordScreen';
import FoodHistoryScreen from './src/screens/FoodHistoryScreen';

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
            <Stack.Screen name="CrearBebe" component={CreateBabyScreen} options={{ title: 'Crear bebé' }} />
            <Stack.Screen name="RegistrarComida" component={FoodRecordScreen} options={{ title: 'Registrar comida' }} />
            <Stack.Screen name="HistorialComidas" component={FoodHistoryScreen} options={{ title: 'Historial de Comidas' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LogInScreen} options={{ headerShown: false }} />
            <Stack.Screen name="RegistrarUsuario" component={SignUpScreen} options={{ title: 'Crear cuenta' }} />
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
