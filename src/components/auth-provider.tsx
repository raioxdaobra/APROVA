'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { identify, reset } from '@/lib/analytics';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
}

const AuthContext = createContext<AuthContextValue>({ user: null, session: null });

export function AuthProvider({
  initialSession,
  children,
}: {
  initialSession: Session | null;
  children: ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(initialSession);

  useEffect(() => {
    if (initialSession?.user) {
      identify(initialSession.user.id, { email: initialSession.user.email });
    }
    const supabase = createClient();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next?.user) {
        identify(next.user.id, { email: next.user.email });
      } else {
        reset();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [initialSession]);

  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, session }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
