import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl?: string;
}

interface AuthContextData {
  user: User | null;
  signIn(credentials: SignInCredentials): Promise<void>;
  signUp(credentials: SignUpCredentials): Promise<void>;
  signOut(): void;
  deleteAccount(): Promise<void>;
  isLoading: boolean;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface SignUpCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para carregar o usuário atual
  const loadUser = useCallback(async () => {
    try {
      const response = await api.get('/users');

      if (response.data.users && response.data.users.length > 0) {
        const userData = response.data.users[0];
        setUser({
          id: userData.id,
          firstName: userData.first_name,
          lastName: userData.last_name,
          email: userData.email,
          photoUrl: userData.photo_url,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar o usuário ao iniciar a aplicação
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const signIn = useCallback(async ({ email, password }: SignInCredentials) => {
    try {
      setIsLoading(true);
      const response = await api.post('/users/login', {
        email,
        password,
      });

      const userData = response.data.user;
      setUser({
        id: userData.id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email,
        photoUrl: userData.photo_url,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async ({ email, password, firstName, lastName, photoUrl }: SignUpCredentials) => {
    try {
      setIsLoading(true);
      const userData = {
        email,
        password,
        firstName,
        lastName,
        ...(photoUrl && { photoUrl }),
      };

      const response = await api.post('/users', userData);

      const userDataResponse = response.data.user;
      setUser({
        id: userDataResponse.id,
        firstName: userDataResponse.first_name,
        lastName: userDataResponse.last_name,
        email: userDataResponse.email,
        photoUrl: userDataResponse.photo_url,
      });

      // Aguardar um momento para garantir que os dados do usuário sejam carregados
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      setIsLoading(true);
      await api.delete('/users');
      setUser(null);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao deletar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, deleteAccount, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
