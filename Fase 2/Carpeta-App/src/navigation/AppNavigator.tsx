import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Importación de pantallas
import LogInScreen from '../screens/LogInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import CreateBabyScreen from '../screens/CreateBabyScreen';
import FoodRecordScreen from '../screens/FoodRecordScreen';
import FoodHistoryScreen from '../screens/FoodHistoryScreen';
import DiaperRecordScreen from '../screens/DiaperRecordScreen';
import DiaperHistoryScreen from '../screens/DiaperHistoryScreen';
import SleepRecordScreen from '../screens/SleepRecordScreen';
import SleepHistoryScreen from '../screens/SleepHistoryScreen';
import MedicationRecordScreen from '../screens/MedicationRecordScreen';
import MedicationHistoryScreen from '../screens/MedicationHistoryScreen';
import MedicationLogScreen from '../screens/MedicationLogScreen';
import UserMenuScreen from '../screens/UserMenuScreen';
import BabyDetailsScreen from '../screens/BabyDetailsScreen';
import BabyMenuScreen from '../screens/BabyMenuScreen';
import BabyCalendarScreen from '../screens/BabyCalendarScreen';
import AddBabyRecordScreen from '../screens/AddBabyRecordScreen';
import DailyRecordsScreen from '../screens/DailyRecordsScreen';
import RecordDetailsScreen from '../screens/RecordDetailsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { session, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {session ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
            <Stack.Screen name="UserMenu" component={UserMenuScreen} options={{ title: 'Cuenta' }} />
            <Stack.Screen name="BabyDetails" component={BabyDetailsScreen} options={{ title: 'Detalle del bebé' }} />
            <Stack.Screen name="BabyMenu" component={BabyMenuScreen} options={{ title: 'Menú del bebé' }} />
            <Stack.Screen name="BabyCalendar" component={BabyCalendarScreen} options={{ title: 'Calendario' }} />
            <Stack.Screen name="AddBabyRecord" component={AddBabyRecordScreen} options={{ title: 'Nuevo registro' }} />
            <Stack.Screen name="DailyRecords" component={DailyRecordsScreen} options={{ title: 'Registros del día' }} />
            <Stack.Screen name="RecordDetails" component={RecordDetailsScreen} options={{ title: 'Detalle del registro' }} />
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
