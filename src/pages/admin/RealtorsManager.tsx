import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRealtors } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { RealtorService } from "@/services/realtorService";
import EditRealtorModal from "@/components/modals/EditRealtorModal";
import ResetPasswordModal from "@/components/modals/ResetPasswordModal";
import { 
  Plus, 
  Search, 
  Users, 
  Trophy,
  Phone,
  Mail,
  MoreHorizontal,
  ArrowLeft,
  Download
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const RealtorsManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedRealtor, setSelectedRealtor] = useState<{ id: string; name: string } | null>(null);
  const { realtors, loading: realtorsLoading, error: realtorsError, refreshRealtors } = useRealtors();
  const { toast } = useToast();
  const navigate = useNavigate();

  const filteredRealtors = realtors.filter(realtor =>
    realtor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    realtor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    realtor.phone.includes(searchTerm)
  );

  const getRankingBadge = (position: number) => {
    switch (position) {
      case 1:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">🥇 1º Lugar</Badge>;
      case 2:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">🥈 2º Lugar</Badge>;
      case 3:
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">🥉 3º Lugar</Badge>;
      default:
        return <Badge variant="outline">{position}º Lugar</Badge>;
    }
  };

  const handleToggleRealtorStatus = async (realtorId: string) => {
    const realtor = realtors.find(r => r.id === realtorId);
    if (!realtor) return;

    const isBlocked = realtor.blocked_at !== null;
    const action = isBlocked ? 'desbloquear' : 'bloquear';
    
    if (window.confirm(`Tem certeza que deseja ${action} o corretor "${realtor.name}"?`)) {
      try {
        let success: boolean;
        
        if (isBlocked) {
          success = await RealtorService.unblockRealtor(realtorId);
        } else {
          success = await RealtorService.blockRealtor(realtorId);
        }
        
        if (success) {
          toast({
            title: `Corretor ${action}do`,
            description: `${realtor.name} foi ${action}do do sistema. A relação com os imóveis foi preservada.`,
            variant: isBlocked ? "default" : "destructive",
          });
          // Recarregar a página para atualizar a lista
          window.location.reload();
        } else {
          throw new Error(`Falha ao ${action} corretor`);
        }
      } catch (error) {
        console.error(`Erro ao ${action} corretor:`, error);
        toast({
          title: `Erro ao ${action} corretor`,
          description: `Ocorreu um erro ao tentar ${action} o corretor. Tente novamente.`,
          variant: "destructive",
        });
      }
    }
  };

  const handleViewProfile = (realtorId: string) => {
    navigate(`/realtor/profile/${realtorId}`);
  };

  const handleEditRealtor = (realtorId: string, realtorName: string) => {
    console.log('RealtorsManager - Editando corretor com ID:', realtorId);
    setSelectedRealtor({ id: realtorId, name: realtorName });
    setEditModalOpen(true);
  };

  const handleResetPassword = (realtorId: string, realtorName: string) => {
    setSelectedRealtor({ id: realtorId, name: realtorName });
    setResetModalOpen(true);
  };

  const handleBlockRealtor = async (realtorId: string, realtorName: string) => {
    if (window.confirm(`Tem certeza que deseja bloquear o corretor "${realtorName}"? O corretor será removido da visualização mas mantido no sistema para preservar o histórico e as relações com os imóveis.`)) {
      try {
        const success = await RealtorService.blockRealtor(realtorId);
        
        if (success) {
          toast({
            title: "Corretor bloqueado",
            description: `${realtorName} foi bloqueado. A relação com os imóveis foi preservada.`,
          });
          // Recarregar a página para atualizar a lista
          window.location.reload();
        } else {
          throw new Error("Falha ao bloquear corretor");
        }
      } catch (error) {
        console.error("Erro ao bloquear corretor:", error);
        toast({
          title: "Erro ao bloquear corretor",
          description: "Ocorreu um erro ao tentar bloquear o corretor. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleExportRealtors = () => {
    try {
      if (!filteredRealtors || filteredRealtors.length === 0) {
        toast({
          title: "Nenhum dado para exportar",
          description: "Não há corretores cadastrados para exportar.",
          variant: "destructive",
        });
        return;
      }

      // Preparar dados para CSV - apenas dados essenciais e formatados
      const csvData = filteredRealtors.map(realtor => {
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
          'Status': realtor.isActive ? 'Ativo' : 'Inativo',
          'Data Nascimento': realtor.birthDate ? new Date(realtor.birthDate).toLocaleDateString('pt-BR') : 'Nao informado',
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
        `Total de corretores: ${filteredRealtors.length}`,
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
        description: `Arquivo CSV com ${filteredRealtors.length} corretores foi baixado.`,
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

  // Sort realtors by sales for ranking
  const rankedRealtors = [...filteredRealtors].sort((a, b) => b.stats.sold - a.stats.sold);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Gerenciar Corretores
            </h1>
            <p className="text-muted-foreground">
              {filteredRealtors.length} corretores encontrados
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/admin/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Link>
            </Button>
            <Button asChild>
              <Link to="/admin/realtors/new">
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Corretor
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                Lista de Corretores
              </CardTitle>
              <Button variant="outline" size="sm" onClick={handleExportRealtors}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
            
            {/* Search Bar */}
            <div className="flex items-center space-x-4 pt-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {realtorsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando corretores...</p>
                </div>
              </div>
            ) : realtorsError ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">Erro ao carregar corretores: {realtorsError}</p>
                <Button onClick={() => window.location.reload()}>
                  Tentar Novamente
                </Button>
              </div>
            ) : (
              <>
                {filteredRealtors.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Disponíveis</TableHead>
                        <TableHead>Em Negociação</TableHead>
                        <TableHead>Vendidos</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Ranking</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rankedRealtors.map((realtor, index) => (
                        <TableRow key={realtor.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                realtor.isActive ? 'bg-primary/10' : 'bg-muted'
                              }`}>
                                <Users className={`w-5 h-5 ${realtor.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <p className="font-medium">{realtor.name}</p>
                                  {!realtor.isActive && (
                                    <Badge variant="destructive" className="text-xs">
                                      Bloqueado
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(realtor.birthDate).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                                {realtor.email}
                              </div>
                              <div className="flex items-center text-sm">
                                <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                                {realtor.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-success/10 text-success">
                              {realtor.stats.available}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-warning/10 text-warning">
                              {realtor.stats.negotiating}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-primary/10 text-primary">
                              {realtor.stats.sold}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">
                              {realtor.stats.total}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {index < 3 && <Trophy className="w-4 h-4 text-yellow-500" />}
                              {getRankingBadge(index + 1)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewProfile(realtor.id)}>
                                  Ver Perfil
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditRealtor(realtor.id, realtor.name)}>
                                  Editar Dados
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleResetPassword(realtor.id, realtor.name)}>
                                  Resetar Senha
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className={realtor.blocked_at ? "text-success" : "text-destructive"}
                                  onClick={() => handleToggleRealtorStatus(realtor.id)}
                                >
                                  {realtor.blocked_at ? "Desbloquear Corretor" : "Bloquear Corretor"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum corretor encontrado</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm ? "Tente buscar com outros termos" : "Comece cadastrando um novo corretor"}
                    </p>
                    {!searchTerm && (
                      <Button asChild>
                        <Link to="/admin/realtors/new">
                          <Plus className="w-4 h-4 mr-2" />
                          Cadastrar Primeiro Corretor
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {selectedRealtor && (
        <>
          <EditRealtorModal
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedRealtor(null);
            }}
            realtorId={selectedRealtor.id}
            realtorName={selectedRealtor.name}
            onSuccess={() => {
              refreshRealtors();
            }}
          />
          
          <ResetPasswordModal
            isOpen={resetModalOpen}
            onClose={() => {
              setResetModalOpen(false);
              setSelectedRealtor(null);
            }}
            realtorId={selectedRealtor.id}
            realtorName={selectedRealtor.name}
            onSuccess={() => {
              refreshRealtors();
            }}
          />
        </>
      )}
    </div>
  );
};

export default RealtorsManager;