import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboardStats, useRealtorRanking, useProperties } from "@/hooks/useSupabaseData";
import { 
  Users, 
  Home, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  BarChart3,
  Eye,
  Download,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  // Buscar dados do banco
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats();
  const { ranking: topRealtors, loading: rankingLoading, error: rankingError } = useRealtorRanking();
  const { properties: recentProperties, loading: propertiesLoading, error: propertiesError } = useProperties();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard Administrativo - MG Imóveis
          </h1>
          <p className="text-muted-foreground">
            Visão geral do sistema de imóveis
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="kpi-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Corretores
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.totalRealtors}</div>
              <p className="text-xs text-muted-foreground">
                Corretores ativos no sistema
              </p>
            </CardContent>
          </Card>

          <Card className="kpi-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Imóveis Disponíveis
              </CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {statsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.availableProperties}
              </div>
              <p className="text-xs text-muted-foreground">
                Prontos para venda (sem filtro por data)
              </p>
            </CardContent>
          </Card>

          <Card className="kpi-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Em Negociação este Mês
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {statsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.monthlyNegotiating}
              </div>
              <p className="text-xs text-muted-foreground">
                Processos iniciados este mês
              </p>
            </CardContent>
          </Card>

          <Card className="kpi-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vendidos este Mês
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {statsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.monthlySold}
              </div>
              <p className="text-xs text-muted-foreground">
                Vendas concluídas este mês
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Lists Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Detailed Properties List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle>Lista Detalhada de Imóveis</CardTitle>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
              <CardDescription>
                Todos os imóveis cadastrados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
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
                ) : (
                  recentProperties.slice(0, 5).map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3 flex-1">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {property.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {property.location}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Corretor: {property.realtor.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${property.status === 'available' ? 'bg-success/10 text-success' : 
                          property.status === 'negotiating' ? 'bg-warning/10 text-warning' : 
                          'bg-muted text-muted-foreground'}
                      `}>
                        {property.status === 'available' ? 'Disponível' :
                         property.status === 'negotiating' ? 'Em Negociação' : 'Vendido'}
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        {property.price}
                      </span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/property/${property.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Realtors List */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle>Lista Detalhada de Corretores</CardTitle>
              </div>
              <CardDescription>
                Ranking por total de imóveis vendidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rankingLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
                    <span className="text-muted-foreground">Carregando ranking...</span>
                  </div>
                ) : rankingError ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 mb-4">Erro: {rankingError}</p>
                    <Button onClick={() => window.location.reload()} size="sm">
                      Tentar Novamente
                    </Button>
                  </div>
                ) : (
                  topRealtors.slice(0, 3).map((realtor, index) => (
                  <div key={realtor.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          'bg-orange-100 text-orange-800'}
                      `}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {realtor.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {realtor.phone}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-muted-foreground">
                            Total: {realtor.stats.total}
                          </span>
                          <span className="text-xs text-success">
                            Disp: {realtor.stats.available}
                          </span>
                          <span className="text-xs text-warning">
                            Neg: {realtor.stats.negotiating}
                          </span>
                          <span className="text-xs text-primary">
                            Vend: {realtor.stats.sold}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/admin/realtors/${realtor.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;