import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';

// Import das imagens estáticas para fallback
import property1 from "@/assets/property1.jpg";
import property2 from "@/assets/property2.jpg";
import property3 from "@/assets/property3.jpg";
import property4 from "@/assets/property4.jpg";

interface PropertyImageProps {
  imageName: string;
  alt: string;
  className?: string;
}

const PropertyImage: React.FC<PropertyImageProps> = ({ imageName, alt, className = "w-12 h-12 rounded-lg object-cover" }) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mapeamento de imagens estáticas
  const imageMap: { [key: string]: string } = {
    'property1.jpg': property1,
    'property2.jpg': property2,
    'property3.jpg': property3,
    'property4.jpg': property4,
  };

  // Função para determinar a URL correta da imagem
  const getImageSrc = (imageName: string): string => {
    console.log('PropertyImage - Processando imagem:', imageName);
    
    // Se é uma URL blob (temporária), usar imagem padrão
    if (imageName.startsWith('blob:')) {
      console.log('PropertyImage - URL blob detectada, usando property1');
      return property1;
    }
    
    // Se já é uma URL completa (Supabase Storage ou externa), retorna como está
    if (imageName.startsWith('http') || imageName.startsWith('https')) {
      console.log('PropertyImage - URL completa detectada:', imageName);
      return imageName;
    }
    
    // Se é um nome de arquivo conhecido, retorna a imagem importada
    if (imageMap[imageName]) {
      console.log('PropertyImage - Imagem estática encontrada:', imageName);
      return imageMap[imageName];
    }
    
    // Se parece ser um caminho do Supabase Storage, retorna como está
    if (imageName.includes('/') && !imageName.includes('\\')) {
      console.log('PropertyImage - Caminho do Supabase detectado:', imageName);
      return imageName;
    }
    
    // Fallback para property1 se não encontrar
    console.log('PropertyImage - Usando imagem padrão para:', imageName);
    return property1;
  };

  // Determinar a URL inicial
  React.useEffect(() => {
    const src = getImageSrc(imageName);
    setImageSrc(src);
    setIsLoading(false);
  }, [imageName]);

  const handleError = () => {
    console.log('PropertyImage - Erro ao carregar imagem:', imageSrc, 'Tentando fallback');
    if (!hasError) {
      setHasError(true);
      setImageSrc(property1); // Fallback para property1
    }
  };

  const handleLoad = () => {
    console.log('PropertyImage - Imagem carregada com sucesso:', imageSrc);
    setIsLoading(false);
  };

  // Se ainda está carregando, mostrar placeholder
  if (isLoading) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center`}>
        <ImageIcon className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
};

export default PropertyImage;
