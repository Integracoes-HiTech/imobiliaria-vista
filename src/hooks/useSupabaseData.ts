import { useState, useEffect } from 'react';
import { PropertyService } from '@/services/propertyService';
import { RealtorService } from '@/services/realtorService';
import { DashboardService } from '@/services/dashboardService';
import { Property, Realtor, DashboardStats, RealtorRanking } from '@/types';

export const useProperties = (realtorId?: string) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        console.log('🔄 useProperties - Iniciando busca de propriedades...', { realtorId });
        setLoading(true);
        setError(null);
        
        const data = realtorId && realtorId.trim() !== ''
          ? await PropertyService.getPropertiesByRealtor(realtorId)
          : await PropertyService.getAllProperties();
        
        console.log('✅ useProperties - Propriedades recebidas:', {
          count: data.length,
          realtorId,
          firstProperty: data[0] ? { id: data[0].id, title: data[0].title } : null
        });
        
        setProperties(data);
      } catch (err) {
        console.error('❌ useProperties - Erro ao buscar propriedades:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar propriedades');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [realtorId]);

  const refreshProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = realtorId && realtorId.trim() !== ''
        ? await PropertyService.getPropertiesByRealtor(realtorId)
        : await PropertyService.getAllProperties();
      
      setProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao recarregar propriedades');
      console.error('Erro ao recarregar propriedades:', err);
    } finally {
      setLoading(false);
    }
  };

  return { properties, loading, error, refreshProperties };
};

export const useRealtors = () => {
  const [realtors, setRealtors] = useState<Realtor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRealtors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await RealtorService.getAllRealtors();
        setRealtors(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar corretores');
        console.error('Erro ao buscar corretores:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRealtors();
  }, []);

  const refreshRealtors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await RealtorService.getAllRealtors();
      setRealtors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao recarregar corretores');
      console.error('Erro ao recarregar corretores:', err);
    } finally {
      setLoading(false);
    }
  };

  return { realtors, loading, error, refreshRealtors };
};

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalRealtors: 0,
    availableProperties: 0,
    negotiatingProperties: 0,
    soldProperties: 0,
    monthlyNegotiating: 0,
    monthlySold: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await DashboardService.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar estatísticas');
        console.error('Erro ao buscar estatísticas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const refreshStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await DashboardService.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao recarregar estatísticas');
      console.error('Erro ao recarregar estatísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refreshStats };
};

export const useRealtorRanking = () => {
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await DashboardService.getRealtorRanking();
        setRanking(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar ranking');
        console.error('Erro ao buscar ranking:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  const refreshRanking = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await DashboardService.getRealtorRanking();
      setRanking(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao recarregar ranking');
      console.error('Erro ao recarregar ranking:', err);
    } finally {
      setLoading(false);
    }
  };

  return { ranking, loading, error, refreshRanking };
};

export const useProperty = (id: string) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await PropertyService.getPropertyById(id);
        setProperty(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar propriedade');
        console.error('Erro ao buscar propriedade:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  const refreshProperty = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await PropertyService.getPropertyById(id);
      setProperty(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao recarregar propriedade');
      console.error('Erro ao recarregar propriedade:', err);
    } finally {
      setLoading(false);
    }
  };

  return { property, loading, error, refreshProperty };
};
