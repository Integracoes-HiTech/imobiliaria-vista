import { Link } from "react-router-dom";
import { MapPin, MessageCircle, Bed, Bath, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PropertyImage from "@/components/PropertyImage";

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
          <PropertyImage
            imageName={image}
            alt={title}
            className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-110"
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