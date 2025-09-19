import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Building, 
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PropertyImage from '@/components/PropertyImage';
import { supabase } from '@/lib/supabase';

const RealtorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [realtor, setRealtor] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug logs
  console.log('RealtorProfile - ID recebido:', id);
  console.log('RealtorProfile - Usuário logado:', user);

  useEffect(() => {
    if (id) {
      fetchRealtorProfile();
    } else {
      setLoading(false);
      setError('ID do corretor não fornecido');
    }
  }, [id]);

  const fetchRealtorProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Buscando corretor com ID:', id);

      // Testar conexão com Supabase primeiro
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      console.log('Teste de conexão Supabase:', testData, testError);

      // Buscar dados do corretor
      const { data: realtorData, error: realtorError } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .eq('type', 'realtor')
        .single();

      console.log('Dados do corretor:', realtorData);
      console.log('Erro do corretor:', realtorError);
      console.log('Status isActive do corretor:', realtorData?.is_active);

      if (realtorError) {
        console.error('Erro detalhado:', realtorError);
        throw new Error(`Corretor não encontrado: ${realtorError.message}`);
      }

      if (!realtorData) {
        throw new Error('Nenhum dado retornado para o corretor');
      }

      // Buscar propriedades do corretor
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          description,
          price,
          address,
          location,
          images,
          status,
          category,
          features,
          created_at
        `)
        .eq('realtor_id', id)
        .order('created_at', { ascending: false });

      console.log('Propriedades:', propertiesData);
      console.log('Erro das propriedades:', propertiesError);

      // Calcular estatísticas
      const stats = {
        available: propertiesData?.filter(p => p.status === 'available').length || 0,
        negotiating: propertiesData?.filter(p => p.status === 'negotiating').length || 0,
        sold: propertiesData?.filter(p => p.status === 'sold').length || 0,
        total: propertiesData?.length || 0
      };

      setRealtor({
        ...realtorData,
        stats
      });
      setProperties(propertiesData || []);
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getPerformanceRating = () => {
    if (!realtor?.stats) return 0;
    const { sold, total } = realtor.stats;
    if (total === 0) return 0;
    return Math.round((sold / total) * 100);
  };

  const formatAddress = (address: any, location?: string) => {
    if (typeof address === 'string') {
      return address;
    }
    
    if (address && typeof address === 'object') {
      const parts = [];
      if (address.street) parts.push(address.street);
      if (address.neighborhood) parts.push(address.neighborhood);
      if (address.city) parts.push(address.city);
      
      if (parts.length > 0) {
        return parts.join(', ');
      }
    }
    
    return location || 'Endereço não disponível';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground text-lg">Carregando perfil...</p>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-48 mx-auto"></div>
                <div className="h-3 bg-muted rounded animate-pulse w-32 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !realtor) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Erro</h1>
            <p className="text-muted-foreground mb-6">{error || 'Corretor não encontrado'}</p>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                ID do corretor: {id || 'Não fornecido'}
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => {
                  // Verificar tipo de usuário para voltar ao dashboard correto
                  if (user?.type === 'admin') {
                    navigate('/admin/dashboard');
                  } else {
                    navigate('/realtor/dashboard');
                  }
                }}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Tentar Novamente
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={() => {
            // Verificar tipo de usuário para voltar à lista de corretores
            if (user?.type === 'admin') {
              navigate('/admin/realtors');
            } else {
              navigate('/realtor/dashboard');
            }
          }}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-luxury font-bold text-foreground">Perfil do Corretor</h1>
          <div></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações Pessoais */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <User className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="text-xl">{realtor.name}</CardTitle>
                <Badge 
                  variant={(realtor.is_active ?? realtor.isActive) ? "default" : "secondary"}
                  className={(realtor.is_active ?? realtor.isActive) 
                    ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200"
                  }
                >
                  {(realtor.is_active ?? realtor.isActive) ? 'Ativo' : 'Inativo'}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{realtor.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{realtor.phone}</span>
                </div>
                {realtor.birthDate && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatDate(realtor.birthDate)} ({calculateAge(realtor.birthDate)} anos)
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    Membro desde {realtor.created_at ? formatDate(realtor.created_at) : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Estatísticas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{realtor.stats.available}</div>
                    <div className="text-sm text-green-600">Disponíveis</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{realtor.stats.negotiating}</div>
                    <div className="text-sm text-yellow-600">Em Negociação</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{realtor.stats.sold}</div>
                    <div className="text-sm text-blue-600">Vendidos</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">{realtor.stats.total}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{getPerformanceRating()}%</div>
                  <div className="text-sm text-muted-foreground">Taxa de vendas</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Propriedades */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5" />
                  <span>Propriedades ({properties.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {properties.length === 0 ? (
                  <div className="text-center py-12">
                    <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma propriedade cadastrada</h3>
                    <p className="text-muted-foreground">Este corretor ainda não possui propriedades cadastradas.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {properties.map((property) => (
                      <div key={property.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
                        <div className="aspect-video relative">
                          <PropertyImage
                            imageName={property.images?.[0] || 'property1.jpg'}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                          <Badge 
                            className="absolute top-2 right-2 shadow-md"
                            variant={
                              property.status === 'available' ? 'default' :
                              property.status === 'negotiating' ? 'secondary' : 'destructive'
                            }
                          >
                            {property.status === 'available' ? 'Disponível' :
                             property.status === 'negotiating' ? 'Em Negociação' : 'Vendido'}
                          </Badge>
                        </div>
                        <div className="p-4 space-y-3">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{property.title}</h3>
                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {formatAddress(property.address, property.location)}
                          </p>
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-lg font-bold text-primary">
                              R$ {property.price?.toLocaleString('pt-BR') || 'N/A'}
                            </span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/property/${property.id}`)}
                              className="hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              Ver Detalhes
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtorProfile;