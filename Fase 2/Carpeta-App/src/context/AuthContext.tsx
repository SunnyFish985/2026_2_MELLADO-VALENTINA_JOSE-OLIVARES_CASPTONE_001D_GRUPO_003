import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const AuthContext = createContext<{ session: Session | null; cargando: boolean }>({
  session: null,
  cargando: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // 1. Al abrir la app, revisamos si ya hay una sesión guardada
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCargando(false);
    });

    // 2. Nos "suscribimos" a cambios: login, logout, refresh de token.
    // Esto es lo que hace que la navegación reaccione sola cuando
    // el usuario inicia o cierra sesión, sin código extra manual.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, cargando }}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);