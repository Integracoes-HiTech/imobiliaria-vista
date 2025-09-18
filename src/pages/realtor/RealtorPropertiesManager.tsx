import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useProperties, useRealtors } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Plus, 
  Search, 
  Eye,
  Building,
  MoreHorizontal
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const RealtorPropertiesManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Buscar propriedades do corretor logado
  const { properties: realtorProperties, loading: propertiesLoading, error: propertiesError } = useProperties(user?.id);

  const filteredProperties = realtorProperties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleViewProperty = (id: number) => {
    window.open(`/property/${id}`, '_blank');
  };

  const handleEditProperty = (id: number) => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A edição de imóveis estará disponível em breve.",
    });
  };

  const handleDeleteProperty = (propertyName: string) => {
    toast({
      title: "Imóvel removido",
      description: `${propertyName} foi removido da sua carteira.`,
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Meus Imóveis
            </h1>
            <p className="text-muted-foreground">
              {filteredProperties.length} imóveis encontrados
            </p>
          </div>
          <Button asChild>
            <Link to="/realtor/properties/new">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Imóvel
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="w-5 h-5 mr-2 text-primary" />
              Minha Carteira de Imóveis
            </CardTitle>
            
            {/* Search Bar */}
            <div className="flex items-center space-x-4 pt-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou localização..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
                    <TableHead>Data Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProperties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <img
                            src={property.images[0]}
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
                            <DropdownMenuItem onClick={() => handleEditProperty(property.id)}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteProperty(property.title)}
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
                  {searchTerm ? "Tente buscar com outros termos" : "Comece cadastrando seu primeiro imóvel"}
                </p>
                {!searchTerm && (
                  <Button asChild>
                    <Link to="/realtor/properties/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar Primeiro Imóvel
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealtorPropertiesManager;