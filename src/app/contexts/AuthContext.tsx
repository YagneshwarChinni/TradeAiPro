import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

const ADMIN_EMAIL = 'yagneshwarchinni@gmail.com';
const MISSING_TABLE_ERROR = "could not find the table 'public.profiles' in the schema cache";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  isEmailVerified: boolean;
  isAdmin: boolean;
  role: 'admin' | 'user';
  isDisabled: boolean;
  provider: 'google' | 'github' | 'email';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ requiresEmailVerification: boolean }>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyProfileDataToUser = (
    profileData: { full_name?: string | null; avatar_url?: string | null; role?: 'admin' | 'user' | null; is_disabled?: boolean | null },
    supabaseUserId: string,
    fallbackEmail: string,
  ) => {
    const isAdminByEmail = fallbackEmail.toLowerCase() === ADMIN_EMAIL;
    const role = isAdminByEmail ? 'admin' : profileData.role || 'user';
    const isDisabled = isAdminByEmail ? false : Boolean(profileData.is_disabled);

    if (isDisabled) {
      void supabase.auth.signOut();
      setUser(null);
      return;
    }

    setUser((previousUser) => {
      if (!previousUser || previousUser.id !== supabaseUserId) {
        return previousUser;
      }

      return {
        ...previousUser,
        name: profileData.full_name || previousUser.name,
        avatar: profileData.avatar_url || previousUser.avatar,
        role,
        isAdmin: role === 'admin',
        isDisabled,
      };
    });
  };

  const refreshProfileFromDatabase = async (supabaseUserId: string, fallbackEmail: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, role, is_disabled')
      .eq('id', supabaseUserId)
      .single();

    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes(MISSING_TABLE_ERROR)) {
        return;
      }
      throw error;
    }

    if (!data) {
      return;
    }

    applyProfileDataToUser(data, supabaseUserId, fallbackEmail);
  };

  const buildUserFromAuth = (supabaseUser: SupabaseUser): User => {
    const metadata = supabaseUser.user_metadata ?? {};
    const provider = (supabaseUser.app_metadata?.provider as User['provider']) || 'email';
    const fallbackName = supabaseUser.email?.split('@')[0] || 'Trader';

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: metadata.full_name || metadata.name || fallbackName,
      avatar:
        metadata.avatar_url ||
        metadata.picture ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${supabaseUser.id}`,
      isEmailVerified: Boolean(supabaseUser.email_confirmed_at),
      isAdmin: (supabaseUser.email || '').toLowerCase() === ADMIN_EMAIL,
      role: (supabaseUser.email || '').toLowerCase() === ADMIN_EMAIL ? 'admin' : 'user',
      isDisabled: false,
      provider,
    };
  };

  const syncAndHydrateProfile = async (supabaseUser: SupabaseUser) => {
    const baseUser = buildUserFromAuth(supabaseUser);
    setUser(baseUser);

    try {
      const { data: upsertData, error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: supabaseUser.id,
            email: baseUser.email,
            full_name: baseUser.name,
            avatar_url: baseUser.avatar,
            provider: baseUser.provider,
            last_sign_in_at: new Date().toISOString(),
          },
          { onConflict: 'id' },
        )
        .select('full_name, avatar_url, role, is_disabled')
        .single();

      if (error) {
        const message = error.message.toLowerCase();
        if (message.includes(MISSING_TABLE_ERROR)) {
          return;
        }
        throw error;
      }

      if (upsertData) {
        applyProfileDataToUser(upsertData, supabaseUser.id, baseUser.email);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : '';
      if (message.includes(MISSING_TABLE_ERROR)) {
        return;
      }
      console.error('Failed to sync profile', error);
    }
  };

  const mapSupabaseUser = (supabaseUser: SupabaseUser | null): User | null => {
    if (!supabaseUser || !supabaseUser.email) {
      return null;
    }

    return buildUserFromAuth(supabaseUser);
  };

  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error) {
        setUser(null);
      } else {
        const authUser = data.session?.user ?? null;
        setUser(mapSupabaseUser(authUser));

        if (authUser) {
          void syncAndHydrateProfile(authUser);
        }
      }

      setIsLoading(false);
    };

    void initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user ?? null;
      setUser(mapSupabaseUser(authUser));

      if (authUser) {
        void syncAndHydrateProfile(authUser);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    void refreshProfileFromDatabase(user.id, user.email);

    const channel = supabase
      .channel(`profile-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        () => {
          void refreshProfileFromDatabase(user.id, user.email);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: fullName ? { full_name: fullName } : undefined,
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      throw error;
    }

    return {
      requiresEmailVerification: !data.session,
    };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw error;
    }
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      throw error;
    }
  };

  const resendVerificationEmail = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        updatePassword,
        resendVerificationEmail,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
