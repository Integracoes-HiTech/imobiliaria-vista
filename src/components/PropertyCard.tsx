import { Link } from "react-router-dom";
import { MapPin, MessageCircle, Bed, Bath, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Import das imagens estáticas
import property1 from "@/assets/property1.jpg";
import property2 from "@/assets/property2.jpg";
import property3 from "@/assets/property3.jpg";
import property4 from "@/assets/property4.jpg";

interface PropertyCardProps {
  id: string;
  title: string;
  price: string;
  location: string;
  image: string;
  realtor: {
    name: string;
    phone: string;
  };
  status: "available" | "negotiating" | "sold";
  features?: {
    bedrooms: number;
    bathrooms: number;
    area: number;
  };
}

const PropertyCard = ({ id, title, price, location, image, realtor, status, features }: PropertyCardProps) => {
  // Mapeamento de imagens estáticas
  const imageMap: { [key: string]: string } = {
    'property1.jpg': property1,
    'property2.jpg': property2,
    'property3.jpg': property3,
    'property4.jpg': property4,
  };

  // Função para gerar o caminho correto da imagem
  const getImageSrc = (imageName: string) => {
    console.log('Processando imagem:', imageName);
    
    // Se já é uma URL completa (Supabase Storage ou externa), retorna como está
    if (imageName.startsWith('http') || imageName.startsWith('https') || imageName.startsWith('blob:')) {
      console.log('URL completa detectada:', imageName);
      return imageName;
    }
    
    // Se é um nome de arquivo conhecido, retorna a imagem importada
    if (imageMap[imageName]) {
      console.log('Imagem estática encontrada:', imageName);
      return imageMap[imageName];
    }
    
    // Se parece ser um caminho do Supabase Storage, retorna como está
    if (imageName.includes('/') && !imageName.includes('\\')) {
      console.log('Caminho do Supabase detectado:', imageName);
      return imageName;
    }
    
    // Fallback para property1 se não encontrar
    console.log('Usando imagem padrão para:', imageName);
    return property1;
  };

  const formatWhatsAppLink = (phone: string) => {
    console.log('Phone received:', phone);
    
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    console.log('Clean phone:', cleanPhone);
    
    // Se o telefone já tem código do país (55), usa como está
    // Se não tem, adiciona o código do Brasil (55)
    const phoneWithCountryCode = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    console.log('Phone with country code:', phoneWithCountryCode);
    
    // Mensagem personalizada para o WhatsApp
    const message = `Olá! Tenho interesse no imóvel "${title}". Poderia me passar mais informações?`;
    
    const whatsappLink = `https://wa.me/${phoneWithCountryCode}?text=${encodeURIComponent(message)}`;
    console.log('WhatsApp link:', whatsappLink);
    
    return whatsappLink;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Disponível</Badge>;
      case "negotiating":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Em Negociação</Badge>;
      case "sold":
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-200">Vendido</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Disponível</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 group overflow-hidden transform hover:-translate-y-2">
      <Link to={`/property/${id}`}>
        <div className="relative overflow-hidden">
          <img
            src={getImageSrc(image)}
            alt={title}
            className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              // Fallback para imagem padrão se não conseguir carregar
              (e.target as HTMLImageElement).src = property1;
            }}
          />
          <div className="absolute top-4 right-4">
            {getStatusBadge(status)}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>
      
      <div className="p-6">
        <Link to={`/property/${id}`}>
          <h3 className="text-xl font-luxury font-semibold text-slate-900 mb-3 hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>
        
        <div className="flex items-center text-slate-500 mb-4">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="text-sm">{location}</span>
        </div>

        {features && (
          <div className="flex items-center space-x-4 mb-4 text-slate-600">
            <div className="flex items-center">
              <Bed className="w-4 h-4 mr-1" />
              <span className="text-sm">{features.bedrooms}</span>
            </div>
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1" />
              <span className="text-sm">{features.bathrooms}</span>
            </div>
            <div className="flex items-center">
              <Square className="w-4 h-4 mr-1" />
              <span className="text-sm">{features.area}m²</span>
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <span className="text-2xl font-luxury font-bold text-primary">{price}</span>
        </div>
        
        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">{realtor.name}</p>
              <p className="text-xs text-slate-500">Corretor</p>
            </div>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white font-luxury"
              onClick={() => window.open(formatWhatsAppLink(realtor.phone), '_blank')}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;