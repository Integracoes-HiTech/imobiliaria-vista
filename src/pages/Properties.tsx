import React, { useState, useEffect } from "react";
import PublicHeader from "@/components/PublicHeader";
import PropertyCard from "@/components/PropertyCard";
import PropertyFilters from "@/components/PropertyFilters";
import { useProperties } from "@/hooks/useSupabaseData";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "react-router-dom";

const Properties = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Buscar propriedades do banco de dados
  const { properties: allProperties, loading: propertiesLoading, error: propertiesError } = useProperties();
  
  // For non-logged users, show only available properties
  const availableProperties = user ? allProperties : allProperties.filter(p => p.status === "available");
  const [filteredProperties, setFilteredProperties] = useState(availableProperties);

  // Função para aplicar filtros baseados nos parâmetros da URL
  const applyUrlFilters = () => {
    let filtered = [...availableProperties];

    // Filtro por busca (código, bairro ou empreendimento)
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      filtered = filtered.filter(property => 
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por categoria/tipo
    const category = searchParams.get('category');
    if (category && category !== 'all') {
      filtered = filtered.filter(property => 
        property.category === category
      );
    }

    // Filtro por faixa de preço
    const priceRange = searchParams.get('priceRange');
    if (priceRange && priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(v => 
        v.includes('+') ? Infinity : parseInt(v)
      );
      filtered = filtered.filter(property => {
        if (max === Infinity) return property.priceValue >= min;
        return property.priceValue >= min && property.priceValue <= max;
      });
    }

    setFilteredProperties(filtered);
  };

  const handleFiltersChange = (filters: {
    priceRange: string;
    location: string;
    status: string;
  }) => {
    let filtered = [...availableProperties];

    if (filters.priceRange && filters.priceRange !== "all") {
      const [min, max] = filters.priceRange.split('-').map(v => 
        v.includes('+') ? Infinity : parseInt(v)
      );
      filtered = filtered.filter(property => {
        if (max === Infinity) return property.priceValue >= min;
        return property.priceValue >= min && property.priceValue <= max;
      });
    }

    if (filters.location && filters.location !== "all") {
      filtered = filtered.filter(property => 
        property.state === filters.location
      );
    }

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter(property => 
        property.status === filters.status
      );
    }

    setFilteredProperties(filtered);
  };

  // Atualizar propriedades filtradas quando os dados do banco mudarem
  useEffect(() => {
    setFilteredProperties(availableProperties);
  }, [availableProperties]);

  // Aplicar filtros da URL quando a página carregar ou os parâmetros mudarem
  useEffect(() => {
    if (availableProperties.length > 0) {
      applyUrlFilters();
    }
  }, [availableProperties, searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {user ? 'Todos os Imóveis' : 'Imóveis Disponíveis'}
          </h1>
          <p className="text-muted-foreground">
            {filteredProperties.length} imóveis encontrados
            {searchParams.toString() && (
              <span className="ml-2 text-primary">
                (filtros aplicados)
              </span>
            )}
          </p>
          
          {/* Mostrar filtros ativos */}
          {searchParams.toString() && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchParams.get('search') && (
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  Busca: "{searchParams.get('search')}"
                </span>
              )}
              {searchParams.get('category') && (
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  Tipo: {searchParams.get('category')}
                </span>
              )}
              {searchParams.get('priceRange') && (
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  Preço: {searchParams.get('priceRange')}
                </span>
              )}
            </div>
          )}
        </div>

        <PropertyFilters onFiltersChange={handleFiltersChange} />

        {propertiesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
            <span className="text-lg text-muted-foreground">Carregando propriedades...</span>
          </div>
        ) : propertiesError ? (
          <div className="text-center py-12">
            <p className="text-lg text-red-600 mb-4">Erro ao carregar propriedades: {propertiesError}</p>
            <Button onClick={() => window.location.reload()} className="font-luxury">
              Tentar Novamente
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard 
                key={property.id} 
                {...property} 
                image={property.images[0] || 'property1.jpg'}
                features={property.features}
              />
            ))}
          </div>
        )}

        {filteredProperties.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Nenhum imóvel encontrado
            </h3>
            <p className="text-muted-foreground mb-6">
              Tente ajustar os filtros para encontrar mais opções
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;