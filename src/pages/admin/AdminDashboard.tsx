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
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { toast } = useToast();
  
  // Buscar dados do banco
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats();
  const { ranking: topRealtors, loading: rankingLoading, error: rankingError } = useRealtorRanking();
  const { properties: recentProperties, loading: propertiesLoading, error: propertiesError } = useProperties();

  const handleExportProperties = () => {
    try {
      if (!recentProperties || recentProperties.length === 0) {
        toast({
          title: "Nenhum dado para exportar",
          description: "Não há imóveis cadastrados para exportar.",
          variant: "destructive",
        });
        return;
      }

      // Preparar dados para CSV - apenas dados essenciais e formatados
      const csvData = recentProperties.map(property => {
        // Debug para verificar dados
        console.log('Property data for CSV:', {
          title: property.title,
          price: property.price,
          registrationDate: property.registrationDate,
          created_at: property.created_at,
          updated_at: property.updated_at
        });

        // Tratar data de cadastro - tentar diferentes campos
        let cadastroDate = 'Data nao disponivel';
        if (property.registrationDate) {
          cadastroDate = new Date(property.registrationDate).toLocaleDateString('pt-BR');
        } else if (property.created_at) {
          cadastroDate = new Date(property.created_at).toLocaleDateString('pt-BR');
        } else if (property.updated_at) {
          cadastroDate = new Date(property.updated_at).toLocaleDateString('pt-BR');
        }

        // Tratar preço - garantir que sempre tenha valor
        let preco = property.price || 'Preco nao informado';
        if (preco && !preco.includes('R$')) {
          preco = `R$ ${preco}`;
        }

        return {
          'Imovel': property.title || 'Sem titulo',
          'Preco': preco,
          'Status': property.status === 'available' ? 'Disponivel' : 
                   property.status === 'negotiating' ? 'Em Negociacao' : 'Vendido',
          'Localizacao': property.location || 'Localizacao nao informada',
          'Endereco': typeof property.address === 'string' ? property.address : 
                     property.address ? `${property.address.street || ''}, ${property.address.neighborhood || ''}` : 'Endereco nao informado',
          'Caracteristicas': `${property.features?.bedrooms || 0} quartos, ${property.features?.bathrooms || 0} banheiros, ${property.features?.area || 0}m²`,
          'Vagas': property.features?.parking > 0 ? `${property.features.parking} vagas` : 'Sem vaga',
          'Corretor': property.realtor?.name || 'Corretor nao informado',
          'Telefone': property.realtor?.phone || 'Telefone nao informado',
          'Cadastrado em': cadastroDate
        };
      });

      // Converter para CSV com formatação melhorada
      const headers = Object.keys(csvData[0]);
      const csvContent = [
        // Cabeçalho com separador visual
        'RELATORIO DE IMOVEIS - MG IMOVEIS',
        `Gerado em: ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
        `Total de imoveis: ${recentProperties.length}`,
        '', // Linha em branco
        headers.join(';'), // Usar ponto e vírgula para melhor compatibilidade
        ...csvData.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escapar aspas e ponto e vírgula, remover acentos para compatibilidade
            const cleanValue = typeof value === 'string' 
              ? value.normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
              : value;
            return typeof cleanValue === 'string' && (cleanValue.includes(';') || cleanValue.includes('"')) 
              ? `"${cleanValue.replace(/"/g, '""')}"` 
              : cleanValue;
          }).join(';')
        )
      ].join('\n');

      // Criar e baixar arquivo com BOM para Excel
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Relatorio_Imoveis_MG_Imoveis_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Exportação concluída!",
        description: `Arquivo CSV com ${recentProperties.length} imóveis foi baixado.`,
      });
    } catch (error) {
      console.error('Erro na exportação:', error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os dados. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleExportRealtors = () => {
    try {
      if (!topRealtors || topRealtors.length === 0) {
        toast({
          title: "Nenhum dado para exportar",
          description: "Não há corretores cadastrados para exportar.",
          variant: "destructive",
        });
        return;
      }

      // Preparar dados para CSV - apenas dados essenciais e formatados
      const csvData = topRealtors.map(realtor => {
        // Tratar data de cadastro - tentar diferentes campos
        let cadastroDate = 'Data nao disponivel';
        if (realtor.created_at) {
          cadastroDate = new Date(realtor.created_at).toLocaleDateString('pt-BR');
        } else if (realtor.updated_at) {
          cadastroDate = new Date(realtor.updated_at).toLocaleDateString('pt-BR');
        }

        return {
          'Nome': realtor.name || 'Nome nao informado',
          'Email': realtor.email || 'Email nao informado',
          'Telefone': realtor.phone || 'Telefone nao informado',
          'Status': realtor.is_active ? 'Ativo' : 'Inativo',
          'Data Nascimento': realtor.birth_date ? new Date(realtor.birth_date).toLocaleDateString('pt-BR') : 'Nao informado',
          'Total Imoveis': realtor.stats?.total || 0,
          'Disponiveis': realtor.stats?.available || 0,
          'Em Negociacao': realtor.stats?.negotiating || 0,
          'Vendidos': realtor.stats?.sold || 0,
          'Cadastrado em': cadastroDate
        };
      });

      // Converter para CSV com formatação melhorada
      const headers = Object.keys(csvData[0]);
      const csvContent = [
        // Cabeçalho com separador visual
        'RELATORIO DE CORRETORES - MG IMOVEIS',
        `Gerado em: ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
        `Total de corretores: ${topRealtors.length}`,
        '', // Linha em branco
        headers.join(';'), // Usar ponto e vírgula para melhor compatibilidade
        ...csvData.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escapar aspas e ponto e vírgula, remover acentos para compatibilidade
            const cleanValue = typeof value === 'string' 
              ? value.normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
              : value;
            return typeof cleanValue === 'string' && (cleanValue.includes(';') || cleanValue.includes('"')) 
              ? `"${cleanValue.replace(/"/g, '""')}"` 
              : cleanValue;
          }).join(';')
        )
      ].join('\n');

      // Criar e baixar arquivo com BOM para Excel
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Relatorio_Corretores_MG_Imoveis_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Exportação concluída!",
        description: `Arquivo CSV com ${topRealtors.length} corretores foi baixado.`,
      });
    } catch (error) {
      console.error('Erro na exportação:', error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os dados. Tente novamente.",
        variant: "destructive",
      });
    }
  };

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
                <Button variant="outline" size="sm" onClick={handleExportProperties}>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <CardTitle>Lista Detalhada de Corretores</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportRealtors}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
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
                      <Link to={`/realtor/profile/${realtor.id}`}>
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