import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProperties, useRealtors } from "@/hooks/useSupabaseData";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  TrendingUp, 
  CheckCircle, 
  Plus,
  Calendar,
  BarChart3,
  Settings,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";

const RealtorDashboard = () => {
  const { user } = useAuth();
  
  if (!user || user.type !== 'realtor') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground">Você precisa estar logado como corretor para acessar esta página.</p>
        </div>
      </div>
    );
  }

  // Buscar dados do corretor do banco
  const { properties: allProperties, loading: propertiesLoading, error: propertiesError } = useProperties(user.id);
  const { realtors, loading: realtorsLoading } = useRealtors();
  
  // Find current realtor data
  const currentRealtor = realtors.find(r => r.id === user.id);
  const realtorProperties = allProperties;
  const recentProperties = realtorProperties.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Olá, {user.name}!
            </h1>
            <p className="text-muted-foreground">
              Aqui está o resumo da sua performance - MG Imóveis
            </p>
          </div>
          <Button asChild>
            <Link to="/realtor/properties/new">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Imóvel
            </Link>
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="kpi-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Imóveis Disponíveis
              </CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {propertiesLoading || realtorsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : currentRealtor?.stats.available || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Prontos para venda
              </p>
            </CardContent>
          </Card>

          <Card className="kpi-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Em Negociação
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {propertiesLoading || realtorsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : currentRealtor?.stats.negotiating || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Processos em andamento
              </p>
            </CardContent>
          </Card>

          <Card className="kpi-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vendidos
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {propertiesLoading || realtorsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : currentRealtor?.stats.sold || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de vendas
              </p>
            </CardContent>
          </Card>

          <Card className="kpi-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Imóveis
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {propertiesLoading || realtorsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : currentRealtor?.stats.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Todos os imóveis
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Properties */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle>Meus Imóveis Recentes</CardTitle>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/realtor/properties">Ver Todos</Link>
                </Button>
              </div>
              <CardDescription>
                Últimos imóveis que você cadastrou
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {propertiesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
                    <span className="text-muted-foreground">Carregando propriedades...</span>
                  </div>
                ) : propertiesError ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 mb-4">Erro: {propertiesError}</p>
                    <Button onClick={() => window.location.reload()} size="sm">
                      Tentar Novamente
                    </Button>
                  </div>
                ) : recentProperties.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Nenhum imóvel cadastrado ainda</p>
                    <Button asChild>
                      <Link to="/realtor/properties/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Cadastrar Primeiro Imóvel
                      </Link>
                    </Button>
                  </div>
                ) : (
                  recentProperties.map((property) => (
                  <div key={property.id} className="flex items-center space-x-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {property.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {property.location}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${property.status === 'available' ? 'bg-success/10 text-success' : 
                            property.status === 'negotiating' ? 'bg-warning/10 text-warning' : 
                            'bg-muted text-muted-foreground'}
                        `}>
                          {property.status === 'available' ? 'Disponível' :
                           property.status === 'negotiating' ? 'Negociação' : 'Vendido'}
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {property.price}
                        </span>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-primary" />
                <CardTitle>Ações Rápidas</CardTitle>
              </div>
              <CardDescription>
                Gerencie seu perfil e imóveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <Button asChild className="justify-start h-auto p-4">
                  <Link to="/realtor/properties/new">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Plus className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Cadastrar Novo Imóvel</div>
                        <div className="text-sm text-muted-foreground">
                          Adicione um novo imóvel à sua carteira
                        </div>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" asChild className="justify-start h-auto p-4">
                  <Link to="/realtor/properties">
                    <div className="flex items-center space-x-3">
                      <div className="bg-muted p-2 rounded-lg">
                        <Home className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Gerenciar Imóveis</div>
                        <div className="text-sm text-muted-foreground">
                          Veja e edite seus imóveis cadastrados
                        </div>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" asChild className="justify-start h-auto p-4">
                  <Link to={`/realtor/profile/${user.id}`}>
                    <div className="flex items-center space-x-3">
                      <div className="bg-muted p-2 rounded-lg">
                        <Home className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Ver Meu Perfil</div>
                        <div className="text-sm text-muted-foreground">
                          Visualize suas informações e estatísticas
                        </div>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" asChild className="justify-start h-auto p-4">
                  <Link to="/realtor/reset-password">
                    <div className="flex items-center space-x-3">
                      <div className="bg-muted p-2 rounded-lg">
                        <Settings className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Alterar Senha</div>
                        <div className="text-sm text-muted-foreground">
                          Atualize sua senha de acesso
                        </div>
                      </div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RealtorDashboard;