import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useProperties } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { PropertyService } from "@/services/propertyService";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye,
  Building,
  MoreHorizontal,
  ArrowLeft
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import PropertyImage from "@/components/PropertyImage";
import EditPropertyModal from "@/components/modals/EditPropertyModal";

const PropertiesManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { properties, loading: propertiesLoading, error: propertiesError, refreshProperties } = useProperties();
  const { toast } = useToast();
  
  // Estados para o modal de edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [selectedPropertyTitle, setSelectedPropertyTitle] = useState("");


  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.realtor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-success/10 text-success hover:bg-success/20">Disponível</Badge>;
      case "negotiating":
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20">Em Negociação</Badge>;
      case "sold":
        return <Badge className="bg-muted text-muted-foreground hover:bg-muted/80">Vendido</Badge>;
      default:
        return <Badge variant="outline">Indefinido</Badge>;
    }
  };

  const handleExport = () => {
    try {
      if (!properties || properties.length === 0) {
        toast({
          title: "Nenhum dado para exportar",
          description: "Não há imóveis cadastrados para exportar.",
          variant: "destructive",
        });
        return;
      }

      // Preparar dados para CSV - apenas dados essenciais e formatados
      const csvData = properties.map(property => {
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
        `Total de imoveis: ${properties.length}`,
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
        description: `Arquivo CSV com ${properties.length} imóveis foi baixado.`,
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

  const handleViewProperty = (id: string) => {
    window.open(`/property/${id}`, '_blank');
  };

  const handleEditProperty = (id: string, title: string) => {
    setSelectedPropertyId(id);
    setSelectedPropertyTitle(title);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedPropertyId("");
    setSelectedPropertyTitle("");
  };

  const handleEditSuccess = () => {
    refreshProperties();
    handleEditModalClose();
  };

  const handleDeleteProperty = async (propertyId: string, propertyName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o imóvel "${propertyName}"?`)) {
      try {
        const success = await PropertyService.deleteProperty(propertyId);
        
        if (success) {
          toast({
            title: "Imóvel excluído",
            description: `${propertyName} foi removido da lista.`,
          });
          // Atualizar a lista sem recarregar a página
          refreshProperties();
        } else {
          throw new Error("Falha ao excluir imóvel");
        }
      } catch (error) {
        console.error("Erro ao excluir imóvel:", error);
        toast({
          title: "Erro ao excluir imóvel",
          description: "Ocorreu um erro ao tentar excluir o imóvel. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Gerenciar Imóveis
            </h1>
            <p className="text-muted-foreground">
              {filteredProperties.length} imóveis encontrados
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
              <Link to="/admin/properties/new">
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Imóvel
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="w-5 h-5 mr-2 text-primary" />
              Lista de Imóveis
            </CardTitle>
            
            {/* Search and Filter Bar */}
            <div className="flex items-center space-x-4 pt-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, localização ou corretor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Corretor</TableHead>
                    <TableHead>Data Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProperties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <PropertyImage
                            imageName={property.images[0] || 'property1.jpg'}
                            alt={property.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium">{property.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {property.features.bedrooms} quartos, {property.features.area}m²
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-primary">
                          {property.price}
                        </span>
                      </TableCell>
                      <TableCell>{property.location}</TableCell>
                      <TableCell>{getStatusBadge(property.status)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{property.realtor.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {property.realtor.phone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(property.registrationDate).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewProperty(property.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Imóvel
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditProperty(property.id, property.title)}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteProperty(property.id, property.title)}
                            >
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredProperties.length === 0 && (
              <div className="text-center py-8">
                <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum imóvel encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Tente buscar com outros termos" : "Comece cadastrando um novo imóvel"}
                </p>
                {!searchTerm && (
                  <Button asChild>
                    <Link to="/admin/properties/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar Primeiro Imóvel
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Edição */}
        <EditPropertyModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          propertyId={selectedPropertyId}
          propertyTitle={selectedPropertyTitle}
          onSuccess={handleEditSuccess}
        />
      </div>
    </div>
  );
};

export default PropertiesManager;