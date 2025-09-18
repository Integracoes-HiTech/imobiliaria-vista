import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRealtors } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Users, 
  Trophy,
  Phone,
  Mail,
  MoreHorizontal
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const RealtorsManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { realtors, loading: realtorsLoading, error: realtorsError } = useRealtors();
  const { toast } = useToast();

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
    // TODO: Implementar toggle de status no banco usando AuthService.updateUserStatus
    const realtor = realtors.find(r => r.id === realtorId);
    if (realtor) {
      toast({
        title: realtor.isActive ? "Corretor bloqueado" : "Corretor desbloqueado",
        description: `${realtor.name} foi ${realtor.isActive ? 'bloqueado' : 'desbloqueado'} do sistema.`,
        variant: realtor.isActive ? "destructive" : "default",
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
          <Button asChild>
            <Link to="/admin/realtors/new">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Corretor
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary" />
              Lista de Corretores
            </CardTitle>
            
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
                                <DropdownMenuItem>
                                  Ver Perfil
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Editar Dados
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Resetar Senha
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className={realtor.isActive ? "text-destructive" : "text-success"}
                                  onClick={() => handleToggleRealtorStatus(realtor.id)}
                                >
                                  {realtor.isActive ? "Bloquear Corretor" : "Desbloquear Corretor"}
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
    </div>
  );
};

export default RealtorsManager;