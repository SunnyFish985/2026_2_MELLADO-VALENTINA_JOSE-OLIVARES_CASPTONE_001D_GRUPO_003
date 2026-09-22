import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function HomeScreen({ navigation }: any) {
  const [babies, setBabies] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<{ name: string; photoUrl?: string }>({ name: 'Mi cuenta' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBabies() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const metadata = user.user_metadata || {};
        let profile = {
          name: metadata.first_name
            ? `${metadata.first_name} ${metadata.paternal_last_name || ''}`.trim()
            : user.email || 'Mi cuenta',
          photoUrl: metadata.avatar_url || metadata.photo_url,
        };

        const { data: profileData } = await supabase
          .from('users')
          .select('first_name, paternal_last_name')
          .eq('id', user.id)
          .maybeSingle();

        if (profileData) {
          profile = {
            ...profile,
            name: `${profileData.first_name} ${profileData.paternal_last_name}`.trim(),
          };
        }
        setUserProfile(profile);

        // Actualizamos la consulta a las tablas y columnas en inglés
        const { data, error } = await supabase
          .from('user_babies')
          .select(`baby_id, babies (first_name, paternal_last_name)`)
          .eq('user_id', user.id);

        if (error) throw error;
        setBabies(data || []);
      } catch (e) {
        console.error("Error al cargar bebés:", e);
      } finally {
        setLoading(false);
      }
    }

    const unsubscribe = navigation.addListener('focus', () => {
      loadBabies();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      title: 'Inicio',
      headerTitle: () => (
        <TouchableOpacity style={styles.userHeader} onPress={() => navigation.navigate('UserMenu')}>
          {userProfile.photoUrl ? (
            <Image source={{ uri: userProfile.photoUrl }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarFallback}>
              <Text style={styles.headerAvatarText}>{userProfile.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <Text style={styles.headerUserName} numberOfLines={1}>{userProfile.name}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, userProfile]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centrado]}>
        <ActivityIndicator size="large" color="#FF7A8A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}>
      {/* <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Panel Principal</Text>
      </View> */}

      <TouchableOpacity
        style={styles.btnPrimary}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('CreateBaby')}
      >
        <Text style={styles.btnTextWhite}>+ Agregar bebé</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Tus bebés vinculados</Text>

      {babies.length === 0 ? (
        <Text style={styles.emptyText}>No tienes bebés vinculados aún.</Text>
      ) : (
        babies.map((bond) => {
          const babiesArray = bond.babies;
          const babyData = Array.isArray(babiesArray) ? babiesArray[0] : babiesArray;
          const fullName = babyData
            ? `${babyData.first_name} ${babyData.paternal_last_name}`
            : 'Bebé sin nombre';
          return (
            // Usamos baby_id como key
            <View
              key={bond.baby_id}
              style={styles.card}
            >
              <TouchableOpacity
                style={styles.cardHeader}
                activeOpacity={0.75}
                onPress={() => navigation.navigate('BabyDetails', { babyId: bond.baby_id, baby: babyData })}
              >
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{fullName.charAt(0)}</Text>
                </View>
                <Text style={styles.babyName}>{fullName}</Text>
              </TouchableOpacity>

            </View>
          );
        })
      )}
        </ScrollView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8', paddingHorizontal: 20, paddingTop: 20 },
  centrado: { justifyContent: 'center', alignItems: 'center' },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#2D3748' },
  userHeader: { flexDirection: 'row', alignItems: 'center'}, // , maxWidth: 190 
  headerAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  headerAvatarFallback: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFE4E6',
    justifyContent: 'center', alignItems: 'center', marginRight: 8,
  },
  headerAvatarText: { color: '#FF7A8A', fontSize: 15, fontWeight: '800' },
  headerUserName: { color: '#2D3748', fontSize: 20, fontWeight: '600', flexShrink: 1 },

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
  babyName: { fontSize: 20, fontWeight: '600', color: '#2D3748' },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },

  actionRowSpacing: { marginTop: 10 },
  btnPurple: { backgroundColor: '#9F7AEA' }, // Un morado suave que combina con los otros tonos pastel

  btnAction: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  btnPrimary: {
    backgroundColor: '#FF7A8A', paddingVertical: 16, borderRadius: 12,
    alignItems: 'center', shadowColor: '#FF7A8A', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4
  },
  btnGreen: { backgroundColor: '#38B2AC' },
  btnBlue: { backgroundColor: '#4299E1' },

  btnIndigo: { backgroundColor: '#667EEA' }, // Índigo complementario

  btnTextWhite: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },

  // 👇 NUEVO: Estilos para botones de Sueño
  btnNight: { backgroundColor: '#2C5282' },  // Azul noche
  btnNavy: { backgroundColor: '#4A5568' },   // Gris pizarra azulado
  btnMedicine: { backgroundColor: '#319795' },
  btnMedicineHistory: { backgroundColor: '#285E61' },

  scrollContent: {
    paddingBottom: 30,
  },
});
