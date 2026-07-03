import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

const GUEST_KEY = "neowow_guest_user";
const TEST_EMAIL = "demo@neowow.studio";
const TEST_PASSWORD = "demo123456";

interface AuthUser {
  id: string;
  email: string;
  nickname: string;
  avatar: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInAsTestUser: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function loadGuestUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveGuestUser(user: AuthUser) {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(user));
  } catch {}
}

function clearGuestUser() {
  try {
    localStorage.removeItem(GUEST_KEY);
  } catch {}
}

function mapSupabaseUser(session: Session | null): AuthUser | null {
  if (!session?.user) return null;
  return {
    id: session.user.id,
    email: session.user.email || "",
    nickname: session.user.user_metadata?.nickname || session.user.email?.split("@")[0] || "Creator",
    avatar: session.user.user_metadata?.avatar_url || "",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Check Supabase session first
      const { data: { session: supabaseSession } } = await supabase.auth.getSession();

      if (cancelled) return;

      if (supabaseSession?.user) {
        setSession(supabaseSession);
        setUser(mapSupabaseUser(supabaseSession));
      } else {
        // Fallback to guest user
        const guest = loadGuestUser();
        if (guest) {
          setUser(guest);
        }
      }
      setLoading(false);
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, supabaseSession) => {
      setSession(supabaseSession);
      if (supabaseSession?.user) {
        const mapped = mapSupabaseUser(supabaseSession);
        setUser(mapped);
        // Guest session superseded by real session
        clearGuestUser();
      } else {
        setUser(null);
        clearGuestUser();
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    clearGuestUser();
    return { success: true };
  };

  const signInAsTestUser = async () => {
    // Try Supabase sign in first
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (!signInError) {
      clearGuestUser();
      return { success: true };
    }

    // Sign in failed — try sign up
    const { error: signUpError } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      options: { data: { nickname: "Demo Creator" } },
    });

    if (!signUpError) {
      const { error: retryError } = await supabase.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });
      if (!retryError) {
        clearGuestUser();
        return { success: true };
      }
    }

    // Supabase not available or email confirmation required — use guest mode
    const guestUser: AuthUser = {
      id: "guest-" + Date.now(),
      email: TEST_EMAIL,
      nickname: "Demo Creator",
      avatar: "",
    };
    saveGuestUser(guestUser);
    setUser(guestUser);
    return { success: true };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    clearGuestUser();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithEmail, signInAsTestUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
