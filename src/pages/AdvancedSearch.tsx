import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProperties } from "@/hooks/useSupabaseData";
import { 
  Search, 
  Map, 
  Heart, 
  Edit3, 
  Trash2, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  SlidersHorizontal
} from "lucide-react";

const AdvancedSearch = () => {
  const { properties: allProperties, loading: propertiesLoading, error: propertiesError } = useProperties();
  const [searchParams] = useSearchParams();
  
  // Estados dos filtros
  const [filters, setFilters] = useState({
    search: "",
    product: "",
    city: "",
    neighborhood: "",
    priceMin: "",
    priceMax: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    status: ""
  });

  // Estados da interface
  const [filteredProperties, setFilteredProperties] = useState<typeof allProperties>([]);
  const [sortBy, setSortBy] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [savedTab, setSavedTab] = useState(true);

  // Processar parâmetros da URL
  useEffect(() => {
    const search = searchParams.get('search') || "";
    const product = searchParams.get('product') || "";
    const priceRange = searchParams.get('priceRange') || "";
    
    if (search || product || priceRange) {
      setFilters(prev => ({
        ...prev,
        search,
        product,
        ...(priceRange && {
          priceMin: priceRange.split('-')[0] || "",
          priceMax: priceRange.split('-')[1] || ""
        })
      }));
    }
  }, [searchParams]);

  // Inicializar propriedades filtradas
  useEffect(() => {
    setFilteredProperties(allProperties);
  }, [allProperties]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...allProperties];

    // Filtro de busca por texto
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(property => 
        property.title.toLowerCase().includes(searchTerm) ||
        property.description.toLowerCase().includes(searchTerm) ||
        property.id.toLowerCase().includes(searchTerm) ||
        property.location.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro por tipo de produto usando categoria do banco
    if (filters.product) {
      filtered = filtered.filter(property => {
        // Mapear os valores do filtro para as categorias do banco
        const productMap: Record<string, string> = {
          "apartamento": "apartamento",
          "casa": "casa", 
          "cobertura": "cobertura",
          "comercial": "comercial",
          "terreno": "loteamento"
        };
        
        const dbCategory = productMap[filters.product];
        if (!dbCategory) return true;
        
        // Filtrar diretamente pela categoria do banco
        return property.category === dbCategory;
      });
    }

    // Filtro por cidade
    if (filters.city) {
      filtered = filtered.filter(property => 
        property.state.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    // Filtro por bairro
    if (filters.neighborhood) {
      filtered = filtered.filter(property => 
        property.location.toLowerCase().includes(filters.neighborhood.toLowerCase())
      );
    }

    // Filtro por preço
    if (filters.priceMin) {
      filtered = filtered.filter(property => 
        property.priceValue >= parseInt(filters.priceMin)
      );
    }
    if (filters.priceMax) {
      filtered = filtered.filter(property => 
        property.priceValue <= parseInt(filters.priceMax)
      );
    }

    // Filtro por quartos
    if (filters.bedrooms) {
      filtered = filtered.filter(property => 
        property.features.bedrooms >= parseInt(filters.bedrooms)
      );
    }

    // Filtro por banheiros
    if (filters.bathrooms) {
      filtered = filtered.filter(property => 
        property.features.bathrooms >= parseInt(filters.bathrooms)
      );
    }

    // Filtro por área
    if (filters.area) {
      filtered = filtered.filter(property => 
        property.features.area >= parseInt(filters.area)
      );
    }

    // Filtro por status
    if (filters.status) {
      filtered = filtered.filter(property => 
        property.status === filters.status
      );
    }

    // Ordenação
    if (sortBy) {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case "price-asc":
            return a.priceValue - b.priceValue;
          case "price-desc":
            return b.priceValue - a.priceValue;
          case "area-asc":
            return a.features.area - b.features.area;
          case "area-desc":
            return b.features.area - a.features.area;
          case "newest":
            return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
          case "oldest":
            return new Date(a.created_at || "").getTime() - new Date(b.created_at || "").getTime();
          default:
            return 0;
        }
      });
    }

    setFilteredProperties(filtered);
    setCurrentPage(1);
  }, [allProperties, filters, sortBy]);

  // Limpar filtros
  const clearFilters = () => {
    setFilters({
      search: "",
      product: "",
      city: "",
      neighborhood: "",
      priceMin: "",
      priceMax: "",
      bedrooms: "",
      bathrooms: "",
      area: "",
      status: ""
    });
  };

  // Paginação
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader />
      
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Busca de Imóveis</h1>
        
        {/* Header da busca */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="flex items-center gap-4 mb-4 lg:mb-0">
            <span className="text-sm text-slate-600">Ordenar:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-asc">Menor preço</SelectItem>
                <SelectItem value="price-desc">Maior preço</SelectItem>
                <SelectItem value="area-asc">Menor área</SelectItem>
                <SelectItem value="area-desc">Maior área</SelectItem>
                <SelectItem value="newest">Mais recentes</SelectItem>
                <SelectItem value="oldest">Mais antigos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Comparar</span>
              <input 
                type="checkbox" 
                checked={compareMode} 
                onChange={(e) => setCompareMode(e.target.checked)}
                className="w-4 h-4"
              />
            </div>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              Exibir Mapa
            </Button>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="flex items-center gap-2 mb-6">
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-sm text-slate-600">
            {filteredProperties.length} resultados
          </span>
        </div>

        <div className="flex gap-6">
          {/* Sidebar de Filtros */}
          <div className="w-80 bg-white rounded-lg shadow-sm p-6 h-fit">
            {/* Tabs */}
            <div className="flex mb-6">
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-l-lg text-sm font-medium ${
                  savedTab ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                }`}
                onClick={() => setSavedTab(true)}
              >
                <Heart className="w-4 h-4" />
                Salvos
              </button>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-r-lg text-sm font-medium ${
                  !savedTab ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                }`}
                onClick={() => setSavedTab(false)}
              >
                <Edit3 className="w-4 h-4" />
                Na Planta
              </button>
            </div>

            <h3 className="text-lg font-semibold text-slate-900 mb-4">Busca</h3>
            
            {/* Campo de busca */}
            <div className="mb-4">
              <Input
                placeholder="Código, Nome do Imóvel"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="mb-2"
              />
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="negotiating">Em negociação</SelectItem>
                  <SelectItem value="sold">Vendido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Produto */}
            <div className="mb-4">
              <h4 className="font-semibold text-slate-900 mb-2">Produto</h4>
              <Select value={filters.product} onValueChange={(value) => setFilters(prev => ({ ...prev, product: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  <SelectItem value="apartamento">Apartamento</SelectItem>
                  <SelectItem value="casa">Casa</SelectItem>
                  <SelectItem value="cobertura">Cobertura</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="terreno">Terreno</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Local */}
            <div className="mb-4">
              <h4 className="font-semibold text-slate-900 mb-2">Local</h4>
              <Select value={filters.city} onValueChange={(value) => setFilters(prev => ({ ...prev, city: value }))}>
                <SelectTrigger className="mb-2">
                  <SelectValue placeholder="Selecione uma cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as cidades</SelectItem>
                  <SelectItem value="goiânia">Goiânia</SelectItem>
                  <SelectItem value="brasília">Brasília</SelectItem>
                  <SelectItem value="são paulo">São Paulo</SelectItem>
                  <SelectItem value="rio de janeiro">Rio de Janeiro</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Bairro"
                value={filters.neighborhood}
                onChange={(e) => setFilters(prev => ({ ...prev, neighborhood: e.target.value }))}
              />
            </div>

            {/* Preço */}
            <div className="mb-4">
              <h4 className="font-semibold text-slate-900 mb-2">Preço</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Mínimo"
                  type="number"
                  value={filters.priceMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                />
                <Input
                  placeholder="Máximo"
                  type="number"
                  value={filters.priceMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
                />
              </div>
            </div>

            {/* Características */}
            <div className="mb-6">
              <h4 className="font-semibold text-slate-900 mb-2">Características</h4>
          <div className="space-y-2">
                <Select value={filters.bedrooms} onValueChange={(value) => setFilters(prev => ({ ...prev, bedrooms: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Quartos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Qualquer</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.bathrooms} onValueChange={(value) => setFilters(prev => ({ ...prev, bathrooms: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Banheiros" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Qualquer</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Área mínima (m²)"
                  type="number"
                  value={filters.area}
                  onChange={(e) => setFilters(prev => ({ ...prev, area: e.target.value }))}
                />
              </div>
            </div>

            {/* Botões de ação */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={clearFilters}
              >
                <Trash2 className="w-4 h-4" />
                Limpar filtros
              </Button>
              <Button className="w-full flex items-center gap-2">
                <Check className="w-4 h-4" />
                Aplicar filtros
              </Button>
            </div>
          </div>

          {/* Grid de Propriedades */}
          <div className="flex-1">
            {propertiesLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-slate-600">Carregando propriedades...</p>
                </div>
              </div>
            ) : propertiesError ? (
              <div className="text-center py-16">
                <p className="text-red-600 mb-4">Erro ao carregar propriedades: {propertiesError}</p>
                <Button onClick={() => window.location.reload()}>
                  Tentar Novamente
                </Button>
              </div>
            ) : currentProperties.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  Nenhuma propriedade encontrada
                </h3>
                <p className="text-slate-600 mb-6">
                  Tente ajustar os filtros de busca
                </p>
                <Button onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              </div>
            ) : (
              <>
                <div className={`grid gap-6 ${
                  viewMode === "grid" 
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                    : "grid-cols-1"
                }`}>
                  {currentProperties.map((property) => (
                    <PropertyCard 
                      key={property.id} 
                      {...property} 
                      image={property.images[0] || 'property1.jpg'}
                      features={property.features}
                    />
                  ))}
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    
                    {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-10 h-10"
                        >
                          {page}
                        </Button>
                      );
                    })}
                    
                    {totalPages > 10 && (
                      <>
                        <span className="px-2">...</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-10 h-10"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdvancedSearch;