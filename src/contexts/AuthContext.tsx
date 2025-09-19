import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/authService';

export interface User {
  id: string; // UUID do banco
  name: string;
  email: string;
  phone: string;
  birthDate?: string;
  type: 'admin' | 'realtor';
  isActive: boolean;
  stats?: {
    available: number;
    negotiating: number;
    sold: number;
    total: number;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dados mockados removidos - agora usando dados do banco Supabase

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('mg-imoveis-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    setIsLoading(true);
    
    try {
      console.log('AuthContext - Tentando login com:', { email });
      
      const user = await AuthService.login({ email, password });
      
      if (user) {
        console.log('AuthContext - Login bem-sucedido:', user);
        setUser(user);
        localStorage.setItem('mg-imoveis-user', JSON.stringify(user));
        setIsLoading(false);
        return { success: true, user };
      }
      
      console.log('AuthContext - Login falhou: usuário não encontrado ou senha incorreta');
      setIsLoading(false);
      return { success: false, error: 'Email ou senha incorretos' };
    } catch (error) {
      console.error('Erro no login:', error);
      setIsLoading(false);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mg-imoveis-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
