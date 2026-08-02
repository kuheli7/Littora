import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore any existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Keep in sync with tab-level auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Register a new user with email + password.
   * Supabase sends a confirmation email; if email confirmation is enabled,
   * the returned user will be unconfirmed until they click the link.
   * Throws if the email is already registered or on any Supabase error.
   */
  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName?.trim() || "" },
      },
    });
    if (error) throw error;
    // Supabase returns an empty identities array when the email is already taken
    if (data.user && data.user.identities?.length === 0) {
      throw new Error("This email is already registered. Please sign in instead.");
    }
    return data;
  };

  /**
   * Sign in with email + password.
   * Throws on failure (caller should catch and show error).
   */
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  /**
   * Sign out and clear local session.
   */
  const logout = async () => {
    await supabase.auth.signOut();
  };

  /**
   * Returns the current access token (JWT) for attaching to API requests.
   * Returns null if not authenticated.
   */
  const getToken = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }, []);

  const isAdmin = user?.email === import.meta.env.VITE_ADMIN_EMAIL;

  return (
    <AuthContext.Provider value={{ user, loading, login, signUp, logout, isAdmin, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
