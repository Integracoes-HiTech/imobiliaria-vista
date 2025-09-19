import { useParams, Link } from "react-router-dom";
import PublicHeader from "@/components/PublicHeader";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/hooks/useSupabaseData";
import StatusHistory from "@/components/StatusHistory";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ArrowLeft, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Car, 
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import { useState } from "react";

// Import das imagens estáticas
import property1 from "@/assets/property1.jpg";
import property2 from "@/assets/property2.jpg";
import property3 from "@/assets/property3.jpg";
import property4 from "@/assets/property4.jpg";

const PropertyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { property, loading: propertyLoading, error: propertyError } = useProperty(id || "");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Debug logs
  console.log('PropertyDetails - ID recebido:', id);
  console.log('PropertyDetails - Loading:', propertyLoading);
  console.log('PropertyDetails - Error:', propertyError);
  console.log('PropertyDetails - Property:', property);

  // Mapeamento de imagens estáticas
  const imageMap: { [key: string]: string } = {
    'property1.jpg': property1,
    'property2.jpg': property2,
    'property3.jpg': property3,
    'property4.jpg': property4,
  };

  // Função para gerar o caminho correto da imagem
  const getImageSrc = (imageName: string) => {
    console.log('PropertyDetails - Processando imagem:', imageName);
    
    // Se já é uma URL completa (Supabase Storage ou externa), retorna como está
    if (imageName.startsWith('http') || imageName.startsWith('https') || imageName.startsWith('blob:')) {
      console.log('PropertyDetails - URL completa detectada:', imageName);
      return imageName;
    }
    
    // Se é um nome de arquivo conhecido, retorna a imagem importada
    if (imageMap[imageName]) {
      console.log('PropertyDetails - Imagem estática encontrada:', imageName);
      return imageMap[imageName];
    }
    
    // Se parece ser um caminho do Supabase Storage, retorna como está
    if (imageName.includes('/') && !imageName.includes('\\')) {
      console.log('PropertyDetails - Caminho do Supabase detectado:', imageName);
      return imageName;
    }
    
    // Fallback para property1 se não encontrar
    console.log('PropertyDetails - Usando imagem padrão para:', imageName);
    return property1;
  };

  if (propertyLoading) {
    return (
      <div className="min-h-screen bg-background">
        {user ? <Header /> : <PublicHeader />}
        <div className="container mx-auto px-4 py-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Carregando detalhes do imóvel...</p>
        </div>
      </div>
    );
  }

  if (propertyError || !property) {
    return (
      <div className="min-h-screen bg-background">
        {user ? <Header /> : <PublicHeader />}
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {propertyError ? `Erro: ${propertyError}` : 'Imóvel não encontrado'}
          </h1>
          <Button asChild>
            <Link to={user ? (user.type === 'admin' ? '/admin/properties' : '/realtor/properties') : '/'}>
              {user ? 'Voltar à Lista de Imóveis' : 'Voltar ao Início'}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatWhatsAppLink = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/55${cleanPhone}?text=Olá! Tenho interesse no imóvel ${property.title}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <span className="status-available">Disponível</span>;
      case "negotiating":
        return <span className="status-negotiating">Em Negociação</span>;
      case "sold":
        return <span className="status-sold">Vendido</span>;
      default:
        return <span className="status-available">Disponível</span>;
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <div className="min-h-screen bg-background">
      {user ? <Header /> : <PublicHeader />}
      
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to={user ? (user.type === 'admin' ? '/admin/properties' : '/realtor/properties') : '/'}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Gallery */}
          <div className="lg:col-span-2">
            <div className="relative mb-4">
              <img
                src={getImageSrc(property.images[currentImageIndex] || 'property1.jpg')}
                alt={property.title}
                className="w-full h-96 object-cover rounded-lg"
                onError={(e) => {
                  // Fallback para imagem padrão se não conseguir carregar
                  (e.target as HTMLImageElement).src = property1;
                }}
              />
              <div className="absolute top-4 right-4">
                {getStatusBadge(property.status)}
              </div>
              
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={previousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex space-x-2 overflow-x-auto">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    index === currentImageIndex ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img
                    src={getImageSrc(image || 'property1.jpg')}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback para imagem padrão se não conseguir carregar
                      (e.target as HTMLImageElement).src = property1;
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Property Info */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg shadow-[var(--shadow-card)] p-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {property.title}
              </h1>
              
              <div className="flex items-center text-muted-foreground mb-4">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{property.location}</span>
              </div>

              <div className="text-3xl font-bold text-primary mb-6">
                {property.price}
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Bed className="w-5 h-5 text-muted-foreground mr-2" />
                  <span>{property.features.bedrooms} quartos</span>
                </div>
                <div className="flex items-center">
                  <Bath className="w-5 h-5 text-muted-foreground mr-2" />
                  <span>{property.features.bathrooms} banheiros</span>
                </div>
                <div className="flex items-center">
                  <Square className="w-5 h-5 text-muted-foreground mr-2" />
                  <span>{property.features.area}m²</span>
                </div>
                <div className="flex items-center">
                  <Car className="w-5 h-5 text-muted-foreground mr-2" />
                  <span>{property.features.parking} vagas</span>
                </div>
              </div>

              {/* Realtor Info */}
              <div className="border-t border-border pt-6">
                <h3 className="font-semibold text-foreground mb-2">Corretor Responsável</h3>
                <p className="text-lg font-medium text-foreground">{property.realtor.name}</p>
                <p className="text-sm text-muted-foreground mb-4">{property.realtor.phone}</p>
                
                <Button
                  className="btn-whatsapp w-full"
                  onClick={() => window.open(formatWhatsAppLink(property.realtor.phone), '_blank')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Falar no WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Description and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="bg-card rounded-lg shadow-[var(--shadow-card)] p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Descrição</h2>
            <p className="text-foreground leading-relaxed">
              {property.description}
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-[var(--shadow-card)] p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Detalhes</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Endereço:</span>
                <span className="text-foreground">{property.address.street}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bairro:</span>
                <span className="text-foreground">{property.address.neighborhood}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cidade:</span>
                <span className="text-foreground">{property.address.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CEP:</span>
                <span className="text-foreground">{property.address.zip_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data de Cadastro:</span>
                <span className="text-foreground">
                  {new Date(property.registrationDate).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status History - Only visible for logged users */}
        {user && (
          <div className="mt-8">
            <StatusHistory property={property} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetails;