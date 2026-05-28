import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_KEY } from '../api/client';
import type { User } from '../api/types';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  setAuth: (user: User, token: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    AsyncStorage.getItem(TOKEN_KEY)
      .then(token => setState(s => ({ ...s, token, isLoading: false })))
      .catch(() => setState(s => ({ ...s, isLoading: false })));
  }, []);

  const setAuth = useCallback(async (user: User, token: string) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    setState({ token, user, isLoading: false });
  }, []);

  const clearAuth = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setState({ token: null, user: null, isLoading: false });
  }, []);

  const updateUser = useCallback((user: User) => {
    setState(s => ({ ...s, user }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, setAuth, clearAuth, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
