"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { setSyncUser } from "@/lib/sync";

interface Auth {
  /** False when the site was built without Supabase. */
  enabled: boolean;
  /** Undefined while the session is still loading. */
  user: User | null | undefined;
}

const AuthContext = createContext<Auth>({ enabled: false, user: null });

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(supabase ? undefined : null);

  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const next = session?.user ?? null;
      setUser((prev) => {
        if (prev?.id !== next?.id) setSyncUser(next?.id ?? null);
        return next;
      });
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ enabled: !!supabase, user }}>{children}</AuthContext.Provider>;
}
