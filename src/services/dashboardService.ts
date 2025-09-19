import { supabase } from '@/lib/supabase';

export interface DashboardStats {
  totalRealtors: number;
  availableProperties: number;
  negotiatingProperties: number;
  soldProperties: number;
  monthlyNegotiating: number;
  monthlySold: number;
}

export interface MonthlyStats {
  month: string;
  negotiating: number;
  sold: number;
}

export class DashboardService {
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Buscar total de corretores ativos (não bloqueados)
      const { count: totalRealtors } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'realtor')
        .eq('is_active', true)
        .is('blocked_at', null);

      // Buscar estatísticas de propriedades (apenas não deletadas)
      const { data: properties } = await supabase
        .from('properties')
        .select('status, created_at, updated_at')
        .is('deleted_at', null);

      if (!properties) {
        return {
          totalRealtors: 0,
          availableProperties: 0,
          negotiatingProperties: 0,
          soldProperties: 0,
          monthlyNegotiating: 0,
          monthlySold: 0,
        };
      }

      // Calcular estatísticas gerais
      const availableProperties = properties.filter(p => p.status === 'available').length;
      const negotiatingProperties = properties.filter(p => p.status === 'negotiating').length;
      const soldProperties = properties.filter(p => p.status === 'sold').length;

      // Calcular estatísticas mensais (este mês)
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const monthlyNegotiating = properties.filter(p => {
        const propertyDate = new Date(p.created_at);
        return p.status === 'negotiating' && 
               propertyDate.getMonth() === currentMonth && 
               propertyDate.getFullYear() === currentYear;
      }).length;

      const monthlySold = properties.filter(p => {
        const propertyDate = new Date(p.created_at);
        return p.status === 'sold' && 
               propertyDate.getMonth() === currentMonth && 
               propertyDate.getFullYear() === currentYear;
      }).length;

      return {
        totalRealtors: totalRealtors || 0,
        availableProperties,
        negotiatingProperties,
        soldProperties,
        monthlyNegotiating,
        monthlySold,
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      return {
        totalRealtors: 0,
        availableProperties: 0,
        negotiatingProperties: 0,
        soldProperties: 0,
        monthlyNegotiating: 0,
        monthlySold: 0,
      };
    }
  }

  static async getRealtorRanking(): Promise<any[]> {
    try {
      const { data: realtors } = await supabase
        .from('users')
        .select('id, name, phone, birth_date, is_active')
        .eq('type', 'realtor')
        .eq('is_active', true)
        .is('blocked_at', null);

      if (!realtors) {
        return [];
      }

      // Buscar estatísticas de vendas para cada corretor
      const realtorsWithStats = await Promise.all(
        realtors.map(async (realtor) => {
          const { data: properties } = await supabase
            .from('properties')
            .select('status')
            .eq('realtor_id', realtor.id)
            .is('deleted_at', null);

          const stats = {
            available: 0,
            negotiating: 0,
            sold: 0,
            total: properties?.length || 0,
          };

          properties?.forEach((property) => {
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

          return {
            ...realtor,
            stats,
          };
        })
      );

      // Ordenar por vendas (maior para menor)
      return realtorsWithStats.sort((a, b) => b.stats.sold - a.stats.sold);
    } catch (error) {
      console.error('Erro ao buscar ranking de corretores:', error);
      return [];
    }
  }

  static async getRecentProperties(limit: number = 5) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          users!properties_realtor_id_fkey (
            id,
            name,
            phone
          )
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar propriedades recentes:', error);
      return [];
    }
  }

  static async getMonthlyStats(months: number = 12): Promise<MonthlyStats[]> {
    try {
      const { data: properties } = await supabase
        .from('properties')
        .select('status, created_at')
        .is('deleted_at', null);

      if (!properties) {
        return [];
      }

      const monthlyStats: { [key: string]: { negotiating: number; sold: number } } = {};

      // Inicializar os últimos N meses
      for (let i = 0; i < months; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyStats[monthKey] = { negotiating: 0, sold: 0 };
      }

      // Contar propriedades por mês
      properties.forEach((property) => {
        const propertyDate = new Date(property.created_at);
        const monthKey = `${propertyDate.getFullYear()}-${String(propertyDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (monthlyStats[monthKey]) {
          if (property.status === 'negotiating') {
            monthlyStats[monthKey].negotiating++;
          } else if (property.status === 'sold') {
            monthlyStats[monthKey].sold++;
          }
        }
      });

      // Converter para array e ordenar
      return Object.entries(monthlyStats)
        .map(([month, stats]) => ({
          month,
          negotiating: stats.negotiating,
          sold: stats.sold,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));
    } catch (error) {
      console.error('Erro ao buscar estatísticas mensais:', error);
      return [];
    }
  }

  static async getPropertyStatusDistribution() {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('status')
        .is('deleted_at', null);

      if (error) {
        throw new Error(error.message);
      }

      const distribution = {
        available: 0,
        negotiating: 0,
        sold: 0,
      };

      data?.forEach((property) => {
        distribution[property.status as keyof typeof distribution]++;
      });

      return distribution;
    } catch (error) {
      console.error('Erro ao buscar distribuição de status:', error);
      return {
        available: 0,
        negotiating: 0,
        sold: 0,
      };
    }
  }
}
