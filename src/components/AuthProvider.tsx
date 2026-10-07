"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { migrateLocalPlans } from "@/lib/library";
import { migrateLocalProfiles } from "@/lib/profiles";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";

export type AuthUser = { id: string; email: string };
type Auth = { user: AuthUser | null; ready: boolean; configured: boolean; signOut: () => Promise<void> };

const AuthContext = createContext<Auth>({ user: null, ready: false, configured: false, signOut: async () => {} });
export const useAuth = () => useContext(AuthContext);

/** Theo dõi phiên đăng nhập của giáo viên. Không đăng nhập vẫn dùng bình thường (chế độ khách). */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(!supabaseConfigured);

  useEffect(() => {
    if (!supabaseConfigured) return;
    let unsubscribe = () => {};
    let cancelled = false;
    void getSupabase().then((supabase) => {
      if (cancelled) return;
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        const next = session?.user ? { id: session.user.id, email: session.user.email ?? "" } : null;
        // Không gọi Supabase trực tiếp trong callback này (dễ treo); đẩy sang tick sau.
        setTimeout(async () => {
          if (next) await Promise.all([migrateLocalPlans(), migrateLocalProfiles()]);
          setUser((prev) => (prev?.id === next?.id ? prev : next));
          setReady(true);
        }, 0);
      });
      unsubscribe = () => data.subscription.unsubscribe();
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const value = useMemo<Auth>(
    () => ({
      user,
      ready,
      configured: supabaseConfigured,
      signOut: async () => {
        await (await getSupabase()).auth.signOut();
      },
    }),
    [user, ready],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
