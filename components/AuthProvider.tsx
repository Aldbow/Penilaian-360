'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '@/types/supabase';
import { supabase } from '@/lib/supabase';

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active session on initial load
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Get user details from our users table
        const { data, error } = await supabase
          .from('users')
          .select('id, username, name, role, position')
          .eq('id', session.user.id)
          .single();

        if (data) {
          setUser(data);
        }
      }
      setIsLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (session) {
          // Get user details from our users table
          const { data, error } = await supabase
            .from('users')
            .select('id, username, name, role, position')
            .eq('id', session.user.id)
            .single();

          if (data) {
            setUser(data);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // First, try to sign in with Supabase Auth using email format
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${username}@penilaian360.com`, // Using email format for Supabase
        password: password,
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      // If successful, get user details from our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username, name, role, position')
        .eq('username', username) // Match by username
        .single();

      if (userError || !userData) {
        console.error('Error fetching user data:', userError);
        // Sign out user if user data not found
        await supabase.auth.signOut();
        return false;
      }

      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}