import { create } from "zustand";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  user: User | null;
  profile: Profile | null;
  initialized: boolean;

  init: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  markOnboarded: () => Promise<void>;
  setStrictMode: (strict: boolean) => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("fetchProfile error", error);
    return null;
  }
  return data;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "loading",
  user: null,
  profile: null,
  initialized: false,

  init: async () => {
    if (get().initialized) return;
    set({ initialized: true });

    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user ?? null;

    if (user) {
      const profile = await fetchProfile(user.id);
      set({ user, profile, status: "authenticated" });
    } else {
      set({ status: "unauthenticated" });
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      if (nextUser) {
        const profile = await fetchProfile(nextUser.id);
        set({ user: nextUser, profile, status: "authenticated" });
      } else {
        set({ user: null, profile: null, status: "unauthenticated" });
      }
    });
  },

  signInWithPassword: async (email, password) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  signUpWithPassword: async (email, password, displayName) => {
    const supabase = createClient();
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) throw error;

    if (data.user && data.session) {
      const profile = await fetchProfile(data.user.id);
      set({ user: data.user, profile, status: "authenticated" });
    }
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, profile: null, status: "unauthenticated" });
  },

  markOnboarded: async () => {
    const user = get().user;
    if (!user) return;
    const supabase = createClient();
    await supabase.from("profiles").update({ onboarded: true }).eq("id", user.id);
    set((s) => (s.profile ? { profile: { ...s.profile, onboarded: true } } : {}));
  },

  setStrictMode: async (strict) => {
    const user = get().user;
    if (!user) return;
    const supabase = createClient();
    await supabase.from("profiles").update({ strict_mode: strict }).eq("id", user.id);
    set((s) => (s.profile ? { profile: { ...s.profile, strict_mode: strict } } : {}));
  },

  updateDisplayName: async (name) => {
    const user = get().user;
    if (!user) return;
    const supabase = createClient();
    await supabase.from("profiles").update({ display_name: name }).eq("id", user.id);
    set((s) => (s.profile ? { profile: { ...s.profile, display_name: name } } : {}));
  },
}));
