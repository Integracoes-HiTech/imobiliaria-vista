import { supabase } from '@/lib/supabase';
import { Realtor } from '@/types';

export interface CreateRealtorData {
  name: string;
  email: string;
  phone: string;
  birthDate?: string;
  password: string;
}

export interface UpdateRealtorData {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  isActive?: boolean;
}

export class RealtorService {
  static async getAllRealtors(): Promise<Realtor[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('type', 'realtor')
        .is('blocked_at', null) // Apenas corretores não bloqueados
        .order('name');

      if (error) {
        throw new Error(error.message);
      }

      // Buscar estatísticas de cada corretor
      const realtorsWithStats = await Promise.all(
        data.map(async (realtor) => {
          const stats = await this.getRealtorStats(realtor.id);
          return {
            ...realtor,
            stats,
          };
        })
      );

      return realtorsWithStats.map(this.mapDatabaseToRealtor);
    } catch (error) {
      console.error('Erro ao buscar corretores:', error);
      return [];
    }
  }

  static async getRealtorById(id: string): Promise<Realtor | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .eq('type', 'realtor')
        .is('blocked_at', null) // Apenas corretores não bloqueados
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const stats = await this.getRealtorStats(id);

      return this.mapDatabaseToRealtor({ ...data, stats });
    } catch (error) {
      console.error('Erro ao buscar corretor:', error);
      return null;
    }
  }

  static async createRealtor(realtorData: CreateRealtorData): Promise<Realtor | null> {
    try {
      // Verificar se o email já existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', realtorData.email)
        .single();

      if (existingUser) {
        throw new Error('Email já cadastrado');
      }

      // Verificar se o telefone já existe
      const { data: existingPhone } = await supabase
        .from('users')
        .select('id')
        .eq('phone', realtorData.phone)
        .single();

      if (existingPhone) {
        throw new Error('Telefone já cadastrado');
      }

      // Hash da senha (em produção, use bcrypt ou similar)
      const passwordHash = await this.hashPassword(realtorData.password);

      // Criar corretor
      const { data: newRealtor, error } = await supabase
        .from('users')
        .insert({
          name: realtorData.name,
          email: realtorData.email,
          phone: realtorData.phone,
          birth_date: realtorData.birthDate,
          type: 'realtor',
          password_hash: passwordHash,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const stats = await this.getRealtorStats(newRealtor.id);

      return this.mapDatabaseToRealtor({ ...newRealtor, stats });
    } catch (error) {
      console.error('Erro ao criar corretor:', error);
      throw error;
    }
  }

  static async updateRealtor(realtorData: UpdateRealtorData): Promise<Realtor | null> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      // Adicionar apenas os campos que foram fornecidos
      if (realtorData.name) updateData.name = realtorData.name;
      if (realtorData.email) updateData.email = realtorData.email;
      if (realtorData.phone) updateData.phone = realtorData.phone;
      if (realtorData.birthDate) updateData.birth_date = realtorData.birthDate;
      if (realtorData.isActive !== undefined) updateData.is_active = realtorData.isActive;

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', realtorData.id)
        .eq('type', 'realtor')
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const stats = await this.getRealtorStats(data.id);

      return this.mapDatabaseToRealtor({ ...data, stats });
    } catch (error) {
      console.error('Erro ao atualizar corretor:', error);
      throw error;
    }
  }

  static async blockRealtor(realtorId: string): Promise<boolean> {
    try {
      console.log('RealtorService - Iniciando bloqueio do corretor:', realtorId);
      
      // Soft delete: marcar como bloqueado ao invés de deletar fisicamente
      const { error } = await supabase
        .from('users')
        .update({ 
          blocked_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', realtorId)
        .eq('type', 'realtor')
        .is('blocked_at', null); // Apenas se não estiver já bloqueado

      if (error) {
        console.error('RealtorService - Erro no bloqueio:', error);
        throw new Error(error.message);
      }

      console.log('RealtorService - Bloqueio realizado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao bloquear corretor:', error);
      throw error;
    }
  }

  static async unblockRealtor(realtorId: string): Promise<boolean> {
    try {
      console.log('RealtorService - Desbloqueando corretor:', realtorId);
      
      // Desbloquear corretor: remover marca de bloqueado
      const { error } = await supabase
        .from('users')
        .update({ 
          blocked_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', realtorId)
        .eq('type', 'realtor')
        .not('blocked_at', 'is', null); // Apenas se estiver bloqueado

      if (error) {
        console.error('RealtorService - Erro ao desbloquear:', error);
        throw new Error(error.message);
      }

      console.log('RealtorService - Corretor desbloqueado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao desbloquear corretor:', error);
      throw error;
    }
  }

  static async getBlockedRealtors(): Promise<Realtor[]> {
    try {
      console.log('RealtorService - Buscando corretores bloqueados');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('type', 'realtor')
        .not('blocked_at', 'is', null) // Apenas corretores bloqueados
        .order('blocked_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      // Buscar estatísticas de cada corretor bloqueado
      const realtorsWithStats = await Promise.all(
        data.map(async (realtor) => {
          const stats = await this.getRealtorStats(realtor.id);
          return {
            ...realtor,
            stats,
          };
        })
      );

      return realtorsWithStats.map(this.mapDatabaseToRealtor);
    } catch (error) {
      console.error('Erro ao buscar corretores bloqueados:', error);
      return [];
    }
  }

  static async resetPassword(realtorId: string, newPassword: string): Promise<boolean> {
    try {
      console.log('RealtorService - Resetando senha do corretor:', realtorId);
      
      // Hash da nova senha
      const passwordHash = await this.hashPassword(newPassword);
      
      // Atualizar senha no banco
      const { error } = await supabase
        .from('users')
        .update({ 
          password_hash: passwordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', realtorId)
        .eq('type', 'realtor');

      if (error) {
        console.error('RealtorService - Erro ao resetar senha:', error);
        throw new Error(error.message);
      }

      console.log('RealtorService - Senha resetada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      throw error;
    }
  }

  static async getRealtorStats(realtorId: string) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('status')
        .eq('realtor_id', realtorId);

      if (error) {
        throw new Error(error.message);
      }

      const stats = {
        available: 0,
        negotiating: 0,
        sold: 0,
        total: data.length,
      };

      data.forEach((property) => {
        switch (property.status) {
          case 'available':
            stats.available++;
            break;
          case 'negotiating':
            stats.negotiating++;
            break;
          case 'sold':
            stats.sold++;
            break;
        }
      });

      return stats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas do corretor:', error);
      return {
        available: 0,
        negotiating: 0,
        sold: 0,
        total: 0,
      };
    }
  }

  static async getRealtorProperties(realtorId: string) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('realtor_id', realtorId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar propriedades do corretor:', error);
      return [];
    }
  }

  // Métodos auxiliares
  private static async hashPassword(password: string): Promise<string> {
    // Em produção, use uma biblioteca como bcrypt
    return btoa(password + '_salt'); // Não use em produção!
  }

  private static mapDatabaseToRealtor(data: any): Realtor {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      birthDate: data.birth_date,
      type: data.type || 'realtor',
      isActive: data.is_active,
      stats: data.stats || {
        available: 0,
        negotiating: 0,
        sold: 0,
        total: 0,
      },
      blocked_at: data.blocked_at,
    };
  }
}
