import { supabase } from '@/lib/supabase';
import { User } from '@/contexts/AuthContext';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  phone: string;
  birthDate?: string;
  type: 'admin' | 'realtor';
  password: string;
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<User | null> {
    try {
      console.log('AuthService - Iniciando login para:', credentials.email);
      
      // Buscar usuário por email
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', credentials.email)
        .eq('is_active', true)
        .single();

      console.log('AuthService - Resultado da busca:', { userData, error });

      if (error) {
        console.log('AuthService - Erro na busca:', error.message);
        return null;
      }

      if (!userData) {
        console.log('AuthService - Usuário não encontrado ou inativo');
        return null;
      }

      console.log('AuthService - Usuário encontrado:', { 
        id: userData.id, 
        name: userData.name, 
        email: userData.email,
        type: userData.type,
        is_active: userData.is_active 
      });

      // Verificar senha
      const isValidPassword = await this.verifyPassword(credentials.password, userData.password_hash);
      console.log('AuthService - Senha válida:', isValidPassword);
      
      if (!isValidPassword) {
        console.log('AuthService - Senha incorreta');
        return null;
      }

      // Retornar dados do usuário sem a senha
      const { password_hash, ...userWithoutPassword } = userData;
      
      const userResult = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        birthDate: userData.birth_date,
        type: userData.type,
        isActive: userData.is_active,
      };

      console.log('AuthService - Login bem-sucedido, retornando usuário:', userResult);
      return userResult;
    } catch (error) {
      console.error('AuthService - Erro no login:', error);
      return null;
    }
  }

  static async createUser(userData: CreateUserData): Promise<User | null> {
    try {
      // Verificar se o email já existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        throw new Error('Email já cadastrado');
      }

      // Verificar se o telefone já existe
      const { data: existingPhone } = await supabase
        .from('users')
        .select('id')
        .eq('phone', userData.phone)
        .single();

      if (existingPhone) {
        throw new Error('Telefone já cadastrado');
      }

      // Hash da senha (em produção, use bcrypt ou similar)
      const passwordHash = await this.hashPassword(userData.password);

      // Criar usuário
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          birth_date: userData.birthDate,
          type: userData.type,
          password_hash: passwordHash,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Retornar dados do usuário sem a senha
      const { password_hash, ...userWithoutPassword } = newUser;
      
      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        birthDate: newUser.birth_date,
        type: newUser.type,
        isActive: newUser.is_active,
      };
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  static async updateUserStatus(userId: string, isActive: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
      return false;
    }
  }

  static async resetPassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      const passwordHash = await this.hashPassword(newPassword);
      
      const { error } = await supabase
        .from('users')
        .update({ 
          password_hash: passwordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      return false;
    }
  }

  // Métodos auxiliares para hash de senha
  private static async hashPassword(password: string): Promise<string> {
    // Em produção, use uma biblioteca como bcrypt
    // Por enquanto, vamos usar uma implementação simples
    return btoa(password + '_salt'); // Não use em produção!
  }

  private static async verifyPassword(password: string, hash: string): Promise<boolean> {
    // Em produção, use bcrypt.compare
    // Por enquanto, vamos usar uma verificação simples
    return btoa(password + '_salt') === hash;
  }
}
