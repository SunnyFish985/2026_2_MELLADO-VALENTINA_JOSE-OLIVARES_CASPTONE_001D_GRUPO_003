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
import DiaperRecordScreen from './src/screens/DiaperRecordScreen';
import DiaperHistoryScreen from './src/screens/DiaperHistoryScreen';
import SleepRecordScreen from './src/screens/SleepRecordScreen';
import SleepHistoryScreen from './src/screens/SleepHistoryScreen';
import MedicationRecordScreen from './src/screens/MedicationRecordScreen';
import MedicationHistoryScreen from './src/screens/MedicationHistoryScreen';
import MedicationLogScreen from './src/screens/MedicationLogScreen';

const Stack = createNativeStackNavigator();

function Navigation() {
  const { session, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {session ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
            <Stack.Screen name="CreateBaby" component={CreateBabyScreen} options={{ title: 'Crear Bebé' }} />
            <Stack.Screen name="FoodRecord" component={FoodRecordScreen} options={{ title: 'Registrar Comida' }} />
            <Stack.Screen name="FoodHistory" component={FoodHistoryScreen} options={{ title: 'Historial de Comidas' }} />
            <Stack.Screen name="DiaperRecord" component={DiaperRecordScreen} options={{ title: 'Registrar Pañal' }} />
            <Stack.Screen name="DiaperHistory" component={DiaperHistoryScreen} options={{ title: 'Historial de Pañales' }} />
            <Stack.Screen name="SleepRecord" component={SleepRecordScreen} options={{ title: 'Registrar Sueño' }} />
            <Stack.Screen name="SleepHistory" component={SleepHistoryScreen} options={{ title: 'Historial de Sueño' }} />
            <Stack.Screen name="MedicationRecord" component={MedicationRecordScreen} options={{ title: 'Registrar Medicamento' }} />
            <Stack.Screen name="MedicationHistory" component={MedicationHistoryScreen} options={{ title: 'Medicamentos Registrados' }} />
            <Stack.Screen name="MedicationLog" component={MedicationLogScreen} options={{ title: 'Tomas del Medicamento' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LogInScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Crear cuenta' }} />
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
