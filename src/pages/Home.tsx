import React, { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import PropertyImage from "@/components/PropertyImage";
import PropertyFilters from "@/components/PropertyFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProperties } from "@/hooks/useSupabaseData";
import { Search, ArrowRight, Home as HomeIcon, Shield, Award, ChevronLeft, ChevronRight, Filter, Camera, Loader2, Play, Pause, Building, Building2, Store, CheckCircle, FileText, MapPin, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Buscar propriedades do banco de dados
  const { properties: allProperties, loading: propertiesLoading, error: propertiesError } = useProperties();
  
  // SEMPRE mostrar apenas propriedades disponíveis no carrossel da página principal
  const availableProperties = allProperties.filter(p => p.status === "available");
  
  // Debug: verificar quantos imóveis disponíveis temos
  console.log('🏠 Home - Debug imóveis:', {
    totalProperties: allProperties.length,
    availableProperties: availableProperties.length,
    allStatuses: allProperties.map(p => ({ id: p.id, title: p.title, status: p.status })),
    availableOnly: availableProperties.map(p => ({ id: p.id, title: p.title, status: p.status }))
  });
  const [filteredProperties, setFilteredProperties] = useState<typeof availableProperties>([]);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // Estados para busca na barra principal
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  
  // Estados para carrosséis de categorias
  const [categoryCarouselIndexes, setCategoryCarouselIndexes] = useState({
    prontos: 0,
    naPlanta: 0,
    apartamentos: 0,
    casas: 0,
    coberturas: 0,
    comerciais: 0,
    condominio: 0,
    loteamento: 0
  });

  // Estado para carrossel de categorias principais
  const [categoriesCarouselIndex, setCategoriesCarouselIndex] = useState(0);

  // Estados para carrossel de fundo
  const [backgroundCarouselIndex, setBackgroundCarouselIndex] = useState(0);
  const [isBackgroundAutoPlaying, setIsBackgroundAutoPlaying] = useState(true);

  // Função para realizar busca e redirecionar para Properties
  const handleSearch = () => {
    // Preparar parâmetros de busca
    const searchParams = new URLSearchParams();
    
    if (searchQuery.trim()) {
      searchParams.set('search', searchQuery.trim());
    }
    
    if (selectedType && selectedType !== 'all') {
      searchParams.set('category', selectedType);
    }
    
    if (selectedPriceRange && selectedPriceRange !== 'all') {
      searchParams.set('priceRange', selectedPriceRange);
    }
    
    // Redirecionar para a página de propriedades com os parâmetros
    navigate(`/properties?${searchParams.toString()}`);
  };

  // Função para lidar com clique nas categorias
  const handleCategoryClick = (category: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set('category', category);
    navigate(`/properties?${searchParams.toString()}`);
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

  // Função para filtrar propriedades por categoria do banco
  const getPropertiesByCategory = (categoryKey: string) => {
    return availableProperties.filter(property => {
      // Mapear as chaves dos carrosséis para as categorias do banco
      const categoryMap: Record<string, string> = {
        'prontos': 'prontos',
        'naPlanta': 'na_planta',
        'apartamentos': 'apartamento',
        'casas': 'casa',
        'coberturas': 'cobertura',
        'comerciais': 'comercial',
        'condominio': 'condominio',
        'loteamento': 'loteamento'
      };
      
      const dbCategory = categoryMap[categoryKey];
      if (!dbCategory) return false;
      
      // Filtrar diretamente pela categoria do banco
      return property.category === dbCategory;
    });
  };

  // Array com todas as categorias para o carrossel
  const categories = [
    {
      key: 'prontos',
      name: 'Prontos',
      icon: CheckCircle,
      color: 'amber',
      count: getPropertiesByCategory('prontos').length
    },
    {
      key: 'na_planta',
      name: 'Na planta',
      icon: FileText,
      color: 'blue',
      count: getPropertiesByCategory('naPlanta').length
    },
    {
      key: 'apartamento',
      name: 'Apartamentos',
      icon: Building,
      color: 'green',
      count: getPropertiesByCategory('apartamentos').length
    },
    {
      key: 'condominio',
      name: 'Condomínio',
      icon: Shield,
      color: 'purple',
      count: getPropertiesByCategory('condominio').length
    },
    {
      key: 'loteamento',
      name: 'Loteamento',
      icon: MapPin,
      color: 'orange',
      count: getPropertiesByCategory('loteamento').length
    },
    {
      key: 'casa',
      name: 'Casas',
      icon: HomeIcon,
      color: 'emerald',
      count: getPropertiesByCategory('casas').length
    },
    {
      key: 'cobertura',
      name: 'Coberturas',
      icon: Building2,
      color: 'teal',
      count: getPropertiesByCategory('coberturas').length
    },
    {
      key: 'comercial',
      name: 'Comerciais',
      icon: Store,
      color: 'red',
      count: getPropertiesByCategory('comerciais').length
    }
  ];

  // Configuração do carrossel (quantas categorias mostrar por vez)
  const categoriesPerView = 5;
  const maxIndex = Math.max(0, categories.length - categoriesPerView);

  // Função para obter classes CSS baseadas na cor
  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; border: string; text: string } } = {
      amber: { bg: 'from-amber-50 to-amber-100', border: 'border-amber-200', text: 'text-amber-700' },
      blue: { bg: 'from-blue-50 to-blue-100', border: 'border-blue-200', text: 'text-blue-700' },
      green: { bg: 'from-green-50 to-green-100', border: 'border-green-200', text: 'text-green-700' },
      purple: { bg: 'from-purple-50 to-purple-100', border: 'border-purple-200', text: 'text-purple-700' },
      orange: { bg: 'from-orange-50 to-orange-100', border: 'border-orange-200', text: 'text-orange-700' },
      emerald: { bg: 'from-emerald-50 to-emerald-100', border: 'border-emerald-200', text: 'text-emerald-700' },
      teal: { bg: 'from-teal-50 to-teal-100', border: 'border-teal-200', text: 'text-teal-700' },
      red: { bg: 'from-red-50 to-red-100', border: 'border-red-200', text: 'text-red-700' }
    };
    return colorMap[color] || colorMap.amber;
  };

  const nextCarousel = useCallback(() => {
    const maxIndex = Math.ceil(filteredProperties.length / 4) - 1;
    setCurrentCarouselIndex((prev) => 
      prev < maxIndex ? prev + 1 : 0
    );
    setIsAutoPlaying(false);
  }, [filteredProperties.length]);

  const prevCarousel = useCallback(() => {
    const maxIndex = Math.ceil(filteredProperties.length / 4) - 1;
    setCurrentCarouselIndex((prev) => 
      prev > 0 ? prev - 1 : maxIndex
    );
    setIsAutoPlaying(false);
  }, [filteredProperties.length]);

  // Auto-play functionality para carrossel principal
  useEffect(() => {
    if (!isAutoPlaying || filteredProperties.length === 0) return;

    const interval = setInterval(() => {
      setCurrentCarouselIndex((prev) => {
        const maxIndex = Math.ceil(filteredProperties.length / 4) - 1;
        return prev < maxIndex ? prev + 1 : 0;
      });
    }, 5000); // Change slide every 5 seconds for smoother experience

    return () => clearInterval(interval);
  }, [isAutoPlaying, filteredProperties.length]);

  // Auto-play functionality para carrossel de fundo
  useEffect(() => {
    if (!isBackgroundAutoPlaying || availableProperties.length === 0) return;

    const interval = setInterval(() => {
      setBackgroundCarouselIndex((prev) => {
        return prev < availableProperties.length - 1 ? prev + 1 : 0;
      });
    }, 4000); // Change background image every 4 seconds

    return () => clearInterval(interval);
  }, [isBackgroundAutoPlaying, availableProperties.length]);

  // Funções para navegar no carrossel de fundo
  const goToPreviousBackground = () => {
    setBackgroundCarouselIndex((prev) => 
      prev > 0 ? prev - 1 : availableProperties.length - 1
    );
    setIsBackgroundAutoPlaying(false);
  };

  const goToNextBackground = () => {
    setBackgroundCarouselIndex((prev) => 
      prev < availableProperties.length - 1 ? prev + 1 : 0
    );
    setIsBackgroundAutoPlaying(false);
  };

  const goToBackgroundImage = (index: number) => {
    setBackgroundCarouselIndex(index);
    setIsBackgroundAutoPlaying(false);
  };

  // Função para navegar para o imóvel específico
  const handleBackgroundImageClick = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  // Update filtered properties when data loads
  useEffect(() => {
    setFilteredProperties(availableProperties);
  }, [availableProperties]);

  // Reset carousel when properties change
  useEffect(() => {
    setCurrentCarouselIndex(0);
    // Reiniciar auto-play quando as propriedades mudarem
    if (filteredProperties.length > 0) {
      setIsAutoPlaying(true);
    }
  }, [filteredProperties]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prevCarousel();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        nextCarousel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextCarousel, prevCarousel]);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Hero Section com Carrossel de Fundo */}
      <section className="relative h-screen overflow-hidden">
        {/* Carrossel de Fundo */}
        <div className="absolute inset-0 z-0">
          {availableProperties.length > 0 ? (
            <div className="relative w-full h-full">
              {availableProperties.map((property, index) => (
                <div
                  key={`bg-${property.id}-${index}`}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out cursor-pointer ${
                    index === backgroundCarouselIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                  onClick={() => handleBackgroundImageClick(property.id)}
                >
                  <PropertyImage
                    imageName={property.images[0] || 'property1.jpg'}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay escuro para melhorar legibilidade */}
                  <div className="absolute inset-0 bg-black/40" />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
          )}
        </div>

        {/* Setas de Navegação do Carrossel de Fundo */}
        {availableProperties.length > 1 && (
          <>
            {/* Seta Esquerda */}
            <button
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-all duration-300"
              onClick={goToPreviousBackground}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            {/* Seta Direita */}
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-all duration-300"
              onClick={goToNextBackground}
            >
              <ArrowRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}

        {/* Conteúdo Principal */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="container mx-auto px-4 text-center">
            <div className="mb-12">
              <h1 className="text-5xl md:text-7xl font-luxury font-bold text-white mb-6 drop-shadow-lg">
                Encontre o Imóvel dos Seus Sonhos
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
                A maior plataforma de imóveis do Brasil
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-6xl mx-auto">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Código, Bairro ou Empreendimento"
                    className="pl-12 h-14 text-lg border-0 bg-slate-50 focus:bg-white transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                
                <div className="w-full md:w-64">
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="h-14 border-0 bg-slate-50 focus:bg-white transition-colors">
                      <Filter className="w-5 h-5 mr-2 text-slate-400" />
                      <SelectValue placeholder="Tipo de imóvel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="apartamento">Apartamento</SelectItem>
                      <SelectItem value="casa">Casa</SelectItem>
                      <SelectItem value="cobertura">Cobertura</SelectItem>
                      <SelectItem value="comercial">Comercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full md:w-64">
                  <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                    <SelectTrigger className="h-14 border-0 bg-slate-50 focus:bg-white transition-colors">
                      <Camera className="w-5 h-5 mr-2 text-slate-400" />
                      <SelectValue placeholder="Valor do imóvel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os valores</SelectItem>
                      <SelectItem value="0-500000">Até R$ 500.000</SelectItem>
                      <SelectItem value="500000-1000000">R$ 500.000 - R$ 1.000.000</SelectItem>
                      <SelectItem value="1000000-2000000">R$ 1.000.000 - R$ 2.000.000</SelectItem>
                      <SelectItem value="2000000-10000000">Acima de R$ 2.000.000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  size="lg" 
                  className="h-14 px-8 bg-primary hover:bg-primary/90 font-luxury"
                  onClick={handleSearch}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>

            {/* Indicadores do Carrossel de Fundo */}
            {availableProperties.length > 1 && (
              <div className="flex items-center justify-center mt-6 gap-2">
                {availableProperties.slice(0, 5).map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === backgroundCarouselIndex
                        ? 'bg-white'
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                    onClick={() => goToBackgroundImage(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Botão para pausar/reiniciar carrossel */}
        {availableProperties.length > 1 && (
          <button
            className="absolute bottom-8 right-8 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300"
            onClick={() => setIsBackgroundAutoPlaying(!isBackgroundAutoPlaying)}
          >
            {isBackgroundAutoPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white" />
            )}
          </button>
        )}
      </section>

      {/* Carrossel Principal - Imóveis Disponíveis */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div className="text-center flex-1">
              <h2 className="text-4xl font-luxury font-bold text-slate-900 mb-4">
                Imóveis em Destaque
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Descubra os melhores imóveis disponíveis para você
              </p>
            </div>
            <Link to="/properties">
              <Button 
                variant="outline" 
                size="sm"
                className="font-medium border border-slate-300 hover:border-primary/40 transition-all duration-300"
              >
                Ver todos
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>

          {propertiesLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
              <span className="text-lg text-slate-600">Carregando imóveis...</span>
            </div>
          ) : propertiesError ? (
            <div className="text-center py-16">
              <p className="text-lg text-red-600 mb-4">Erro ao carregar imóveis: {propertiesError}</p>
              <Button onClick={() => window.location.reload()} className="font-luxury">
                Tentar Novamente
              </Button>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                Nenhum imóvel disponível no momento
              </h3>
              <p className="text-slate-600 mb-6">
                Novos imóveis serão adicionados em breve
              </p>
              <Link to="/properties">
                <Button className="font-luxury">
                  Ver Todos os Imóveis
                </Button>
              </Link>
            </div>
          ) : (
            <div className="relative">
              {/* Carrossel com Setas Laterais */}
              <div className="flex items-center gap-4">
                {/* Seta Esquerda */}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-300 hover:border-primary/40 transition-all duration-300 bg-white shadow-sm"
                  onClick={prevCarousel}
                  disabled={currentCarouselIndex === 0}
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </Button>

                {/* Grid de Imóveis */}
                <div className="flex-1 overflow-hidden">
                  <div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 transition-all duration-700 ease-in-out transform"
                    style={{
                      transform: `translateX(0)`,
                      opacity: 1
                    }}
                    onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
                    onTouchEnd={(e) => {
                      setTouchEnd(e.changedTouches[0].clientX);
                      if (touchStart && touchEnd) {
                        const diff = touchStart - touchEnd;
                        if (Math.abs(diff) > 50) {
                          if (diff > 0) {
                            nextCarousel();
                          } else {
                            prevCarousel();
                          }
                        }
                      }
                    }}
                  >
                    {filteredProperties
                      .slice(currentCarouselIndex * 4, (currentCarouselIndex + 1) * 4)
                      .map((property, index) => (
                        <div
                          key={`${property.id}-${currentCarouselIndex}`}
                          className="transform transition-all duration-700 ease-out hover:scale-105 animate-in fade-in slide-in-from-bottom-4"
                          style={{
                            animationDelay: `${index * 150}ms`,
                            animationFillMode: 'both'
                          }}
                        >
                          <PropertyCard 
                            {...property} 
                            image={property.images[0] || 'property1.jpg'}
                            features={property.features}
                          />
                        </div>
                      ))}
                  </div>
                </div>

                {/* Seta Direita */}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-300 hover:border-primary/40 transition-all duration-300 bg-white shadow-sm"
                  onClick={nextCarousel}
                  disabled={currentCarouselIndex >= Math.ceil(filteredProperties.length / 4) - 1}
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </Button>
              </div>

              {/* Indicador de Página */}
              <div className="flex items-center justify-center mt-8 gap-3">
                {Array.from({ length: Math.ceil(filteredProperties.length / 4) }).map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-500 ease-out ${
                      index === currentCarouselIndex
                        ? 'bg-primary scale-150 shadow-lg'
                        : 'bg-slate-300 hover:bg-slate-400 hover:scale-110'
                    }`}
                    onClick={() => {
                      setCurrentCarouselIndex(index);
                      setIsAutoPlaying(false);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Seção de Categorias com Ícones */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-luxury font-bold text-slate-900 mb-4">
              Categorias de Imóveis
            </h2>
          </div>
          
          <div className="flex justify-center items-center gap-8 mb-8">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full w-10 h-10 p-0 border-2 border-slate-300 hover:border-primary/40"
              onClick={() => setCategoriesCarouselIndex(Math.max(0, categoriesCarouselIndex - 1))}
              disabled={categoriesCarouselIndex === 0}
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </Button>
            
            <div className="flex items-center gap-12 overflow-hidden">
              {categories
                .slice(categoriesCarouselIndex, categoriesCarouselIndex + categoriesPerView)
                .map((category) => {
                  const IconComponent = category.icon;
                  const colorClasses = getColorClasses(category.color);
                  
                  return (
                    <div 
                      key={category.key}
                      className="flex flex-col items-center cursor-pointer group flex-shrink-0"
                      onClick={() => handleCategoryClick(category.key)}
                    >
                      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${colorClasses.bg} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 border-2 ${colorClasses.border}`}>
                        <IconComponent className={`w-10 h-10 ${colorClasses.text}`} />
                      </div>
                      <div className="text-center mt-3">
                        <p className="text-lg font-semibold text-slate-900">{category.name}</p>
                        <p className="text-sm text-slate-600">{category.count} imóveis</p>
                      </div>
                    </div>
                  );
                })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="rounded-full w-10 h-10 p-0 border-2 border-slate-300 hover:border-primary/40"
              onClick={() => setCategoriesCarouselIndex(Math.min(maxIndex, categoriesCarouselIndex + 1))}
              disabled={categoriesCarouselIndex >= maxIndex}
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </Button>
          </div>

          {/* Indicadores do carrossel */}
          {categories.length > categoriesPerView && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: maxIndex + 1 }, (_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === categoriesCarouselIndex ? 'bg-primary' : 'bg-slate-300'
                  }`}
                  onClick={() => setCategoriesCarouselIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Carrosséis de Categorias */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          {/* Prontos */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-luxury font-bold text-slate-900">Prontos</h2>
              </div>
              <Link 
                to="/properties" 
                className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {getPropertiesByCategory('prontos').slice(0, 4).map((property) => (
                  <PropertyCard 
                    key={property.id} 
                    {...property} 
                    image={property.images[0] || 'property1.jpg'}
                    features={property.features}
                  />
                ))}
              </div>
              
              {getPropertiesByCategory('prontos').length > 4 && (
                <div className="flex items-center justify-center mt-8 gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setCategoryCarouselIndexes(prev => ({ ...prev, prontos: Math.max(0, prev.prontos - 1) }))}
                    disabled={categoryCarouselIndexes.prontos === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  
                  <span className="text-sm text-slate-600 px-4">
                    {categoryCarouselIndexes.prontos + 1} de {Math.ceil(getPropertiesByCategory('prontos').length / 4)}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setCategoryCarouselIndexes(prev => ({ ...prev, prontos: Math.min(Math.ceil(getPropertiesByCategory('prontos').length / 4) - 1, prev.prontos + 1) }))}
                    disabled={categoryCarouselIndexes.prontos >= Math.ceil(getPropertiesByCategory('prontos').length / 4) - 1}
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Na Planta */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <FileText className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-luxury font-bold text-slate-900">Na Planta</h2>
              </div>
              <Link 
                to="/properties" 
                className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {getPropertiesByCategory('naPlanta').slice(0, 4).map((property) => (
                  <PropertyCard 
                    key={property.id} 
                    {...property} 
                    image={property.images[0] || 'property1.jpg'}
                    features={property.features}
                  />
                ))}
              </div>
              
              {getPropertiesByCategory('naPlanta').length > 4 && (
                <div className="flex items-center justify-center mt-8 gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setCategoryCarouselIndexes(prev => ({ ...prev, naPlanta: Math.max(0, prev.naPlanta - 1) }))}
                    disabled={categoryCarouselIndexes.naPlanta === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  
                  <span className="text-sm text-slate-600 px-4">
                    {categoryCarouselIndexes.naPlanta + 1} de {Math.ceil(getPropertiesByCategory('naPlanta').length / 4)}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setCategoryCarouselIndexes(prev => ({ ...prev, naPlanta: Math.min(Math.ceil(getPropertiesByCategory('naPlanta').length / 4) - 1, prev.naPlanta + 1) }))}
                    disabled={categoryCarouselIndexes.naPlanta >= Math.ceil(getPropertiesByCategory('naPlanta').length / 4) - 1}
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Apartamentos */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Building className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-luxury font-bold text-slate-900">Apartamentos</h2>
              </div>
              <Link 
                to="/properties" 
                className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {getPropertiesByCategory('apartamentos').slice(0, 4).map((property) => (
                  <PropertyCard 
                    key={property.id} 
                    {...property} 
                    image={property.images[0] || 'property1.jpg'}
                    features={property.features}
                  />
                ))}
              </div>
              
              {getPropertiesByCategory('apartamentos').length > 4 && (
                <div className="flex items-center justify-center mt-8 gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setCategoryCarouselIndexes(prev => ({ ...prev, apartamentos: Math.max(0, prev.apartamentos - 1) }))}
                    disabled={categoryCarouselIndexes.apartamentos === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  
                  <span className="text-sm text-slate-600 px-4">
                    {categoryCarouselIndexes.apartamentos + 1} de {Math.ceil(getPropertiesByCategory('apartamentos').length / 4)}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setCategoryCarouselIndexes(prev => ({ ...prev, apartamentos: Math.min(Math.ceil(getPropertiesByCategory('apartamentos').length / 4) - 1, prev.apartamentos + 1) }))}
                    disabled={categoryCarouselIndexes.apartamentos >= Math.ceil(getPropertiesByCategory('apartamentos').length / 4) - 1}
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Casas */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <HomeIcon className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-luxury font-bold text-slate-900">Casas</h2>
              </div>
              <Link 
                to="/properties" 
                className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {getPropertiesByCategory('casas').slice(0, 4).map((property) => (
                  <PropertyCard 
                    key={property.id} 
                    {...property} 
                    image={property.images[0] || 'property1.jpg'}
                    features={property.features}
                  />
                ))}
              </div>
              
              {getPropertiesByCategory('casas').length > 4 && (
                <div className="flex items-center justify-center mt-8 gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setCategoryCarouselIndexes(prev => ({ ...prev, casas: Math.max(0, prev.casas - 1) }))}
                    disabled={categoryCarouselIndexes.casas === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  
                  <span className="text-sm text-slate-600 px-4">
                    {categoryCarouselIndexes.casas + 1} de {Math.ceil(getPropertiesByCategory('casas').length / 4)}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setCategoryCarouselIndexes(prev => ({ ...prev, casas: Math.min(Math.ceil(getPropertiesByCategory('casas').length / 4) - 1, prev.casas + 1) }))}
                    disabled={categoryCarouselIndexes.casas >= Math.ceil(getPropertiesByCategory('casas').length / 4) - 1}
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Coberturas */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Building2 className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-luxury font-bold text-slate-900">Coberturas</h2>
              </div>
              <Link 
                to="/properties" 
                className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {getPropertiesByCategory('coberturas').slice(0, 4).map((property) => (
                  <PropertyCard 
                    key={property.id} 
                    {...property} 
                    image={property.images[0] || 'property1.jpg'}
                    features={property.features}
                  />
                ))}
              </div>
              
              {getPropertiesByCategory('coberturas').length > 4 && (
                <div className="flex items-center justify-center mt-8 gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setCategoryCarouselIndexes(prev => ({ ...prev, coberturas: Math.max(0, prev.coberturas - 1) }))}
                    disabled={categoryCarouselIndexes.coberturas === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  
                  <span className="text-sm text-slate-600 px-4">
                    {categoryCarouselIndexes.coberturas + 1} de {Math.ceil(getPropertiesByCategory('coberturas').length / 4)}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setCategoryCarouselIndexes(prev => ({ ...prev, coberturas: Math.min(Math.ceil(getPropertiesByCategory('coberturas').length / 4) - 1, prev.coberturas + 1) }))}
                    disabled={categoryCarouselIndexes.coberturas >= Math.ceil(getPropertiesByCategory('coberturas').length / 4) - 1}
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Comerciais */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Store className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-luxury font-bold text-slate-900">Comerciais</h2>
              </div>
              <Link 
                to="/properties" 
                className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {getPropertiesByCategory('comerciais').slice(0, 4).map((property) => (
                  <PropertyCard 
                    key={property.id} 
                    {...property} 
                    image={property.images[0] || 'property1.jpg'}
                    features={property.features}
                  />
                ))}
              </div>
              
              {getPropertiesByCategory('comerciais').length > 4 && (
                <div className="flex items-center justify-center mt-8 gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setCategoryCarouselIndexes(prev => ({ ...prev, comerciais: Math.max(0, prev.comerciais - 1) }))}
                    disabled={categoryCarouselIndexes.comerciais === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  
                  <span className="text-sm text-slate-600 px-4">
                    {categoryCarouselIndexes.comerciais + 1} de {Math.ceil(getPropertiesByCategory('comerciais').length / 4)}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setCategoryCarouselIndexes(prev => ({ ...prev, comerciais: Math.min(Math.ceil(getPropertiesByCategory('comerciais').length / 4) - 1, prev.comerciais + 1) }))}
                    disabled={categoryCarouselIndexes.comerciais >= Math.ceil(getPropertiesByCategory('comerciais').length / 4) - 1}
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Condomínio */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Shield className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-luxury font-bold text-slate-900">Condomínio</h2>
              </div>
              <Link 
                to="/properties" 
                className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {getPropertiesByCategory('condominio').slice(0, 4).map((property) => (
                  <PropertyCard 
                    key={property.id} 
                    {...property} 
                    image={property.images[0] || 'property1.jpg'}
                    features={property.features}
                  />
                ))}
              </div>
              
              {getPropertiesByCategory('condominio').length > 4 && (
                <div className="flex items-center justify-center mt-8 gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setCategoryCarouselIndexes(prev => ({ ...prev, condominio: Math.max(0, prev.condominio - 1) }))}
                    disabled={categoryCarouselIndexes.condominio === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  
                  <span className="text-sm text-slate-600 px-4">
                    {categoryCarouselIndexes.condominio + 1} de {Math.ceil(getPropertiesByCategory('condominio').length / 4)}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setCategoryCarouselIndexes(prev => ({ ...prev, condominio: Math.min(Math.ceil(getPropertiesByCategory('condominio').length / 4) - 1, prev.condominio + 1) }))}
                    disabled={categoryCarouselIndexes.condominio >= Math.ceil(getPropertiesByCategory('condominio').length / 4) - 1}
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Loteamento */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Award className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-luxury font-bold text-slate-900">Loteamento</h2>
              </div>
              <Link 
                to="/properties" 
                className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {getPropertiesByCategory('loteamento').slice(0, 4).map((property) => (
                  <PropertyCard 
                    key={property.id} 
                    {...property} 
                    image={property.images[0] || 'property1.jpg'}
                    features={property.features}
                  />
                ))}
              </div>
              
              {getPropertiesByCategory('loteamento').length > 4 && (
                <div className="flex items-center justify-center mt-8 gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setCategoryCarouselIndexes(prev => ({ ...prev, loteamento: Math.max(0, prev.loteamento - 1) }))}
                    disabled={categoryCarouselIndexes.loteamento === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  
                  <span className="text-sm text-slate-600 px-4">
                    {categoryCarouselIndexes.loteamento + 1} de {Math.ceil(getPropertiesByCategory('loteamento').length / 4)}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setCategoryCarouselIndexes(prev => ({ ...prev, loteamento: Math.min(Math.ceil(getPropertiesByCategory('loteamento').length / 4) - 1, prev.loteamento + 1) }))}
                    disabled={categoryCarouselIndexes.loteamento >= Math.ceil(getPropertiesByCategory('loteamento').length / 4) - 1}
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      
      <Footer />
    </div>
  );
};

export default Home;