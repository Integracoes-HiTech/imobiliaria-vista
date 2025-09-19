import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Building, 
  DollarSign, 
  MapPin, 
  CalendarIcon,
  Loader2,
  Save,
  X,
  Upload,
  Camera,
  Home as HomeIcon,
  Search
} from 'lucide-react';
import { PropertyService, UpdatePropertyData } from '@/services/propertyService';
import { ImageService } from '@/services/imageService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EditPropertyModalRealtorProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  onSuccess?: () => void;
}

const EditPropertyModalRealtor: React.FC<EditPropertyModalRealtorProps> = ({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
  onSuccess
}) => {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [registrationDate, setRegistrationDate] = useState<Date>();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Estados do formulário - campos limitados para corretor
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    status: 'available',
    category: 'apartamento',
    internalNotes: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    parking: '',
    // Campos de endereço editáveis
    zipCode: '',
    state: '',
    city: '',
    neighborhood: '',
    street: ''
  });

  // Armazenar dados originais para comparação
  const [originalData, setOriginalData] = useState<any>(null);

  // Função para buscar CEP na API ViaCEP
  const buscarCep = async (cep: string) => {
    // Remove traços e espaços
    cep = cep.replace(/\D/g, "");

    // Validação: CEP precisa ter 8 dígitos numéricos
    if (!/^[0-9]{8}$/.test(cep)) {
      throw new Error("Por favor, informe um CEP válido com 8 dígitos.");
    }

    const url = `https://viacep.com.br/ws/${cep}/json/`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Erro ao consultar o ViaCEP");
    }

    const data = await response.json();

    if (data.erro) {
      throw new Error("CEP não encontrado!");
    }

    return {
      cidade: data.localidade,
      bairro: data.bairro,
      estado: data.uf,
      rua: data.logradouro
    };
  };

  useEffect(() => {
    if (isOpen && propertyId) {
      fetchPropertyData();
    }
  }, [isOpen, propertyId]);

  const fetchPropertyData = async () => {
    try {
      setLoading(true);
      const property = await PropertyService.getPropertyById(propertyId);
      
      if (!property) {
        throw new Error('Imóvel não encontrado');
      }

      // Armazenar dados originais completos
      setOriginalData({
        name: property.title || '',
        description: property.description || '',
        price: property.priceValue?.toString() || '',
        status: property.status || 'available',
        category: property.category || 'apartamento',
        internalNotes: property.internalNotes || '',
        bedrooms: property.features?.bedrooms?.toString() || '',
        bathrooms: property.features?.bathrooms?.toString() || '',
        area: property.features?.area?.toString() || '',
        parking: property.features?.parking?.toString() || '0',
        location: property.location || '',
        state: property.state || '',
        address: property.address || {},
        realtorId: property.realtor?.id || '',
        registrationDate: property.registrationDate || '',
        images: property.images || []
      });

      // Preencher formulário com dados existentes (campos permitidos para corretor)
      setFormData({
        name: property.title || '',
        description: property.description || '',
        price: property.priceValue?.toString() || '',
        status: property.status || 'available',
        category: property.category || 'apartamento',
        internalNotes: property.internalNotes || '',
        bedrooms: property.features?.bedrooms?.toString() || '',
        bathrooms: property.features?.bathrooms?.toString() || '',
        area: property.features?.area?.toString() || '',
        parking: property.features?.parking?.toString() || '0',
        // Campos de endereço editáveis
        zipCode: property.address?.zip_code || '',
        state: property.state || '',
        city: property.address?.city || '',
        neighborhood: property.address?.neighborhood || '',
        street: property.address?.street || ''
      });

      // Configurar data de cadastro
      if (property.registrationDate) {
        const date = new Date(property.registrationDate);
        setRegistrationDate(date);
      }

      // Carregar imagens existentes
      setUploadedImageUrls(property.images || []);

    } catch (err) {
      console.error('Erro ao buscar dados do imóvel:', err);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do imóvel",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Formatação automática do CEP
    if (field === "zipCode") {
      const cepNumerico = value.replace(/\D/g, '');
      const cepFormatado = cepNumerico.replace(/(\d{5})(\d{3})/, '$1-$2');
      setFormData(prev => ({ ...prev, [field]: cepFormatado }));
      
      // Buscar CEP quando tiver 8 dígitos
      if (cepNumerico.length === 8) {
        setIsSearchingCep(true);
        
        buscarCep(cepNumerico)
          .then((endereco) => {
            setFormData(prev => ({
              ...prev,
              state: endereco.estado,
              city: endereco.cidade,
              neighborhood: endereco.bairro,
              street: endereco.rua
            }));
            
            toast({
              title: "CEP encontrado!",
              description: `Endereço preenchido: ${endereco.rua}, ${endereco.bairro}, ${endereco.cidade}/${endereco.estado}`,
            });
          })
          .catch((error) => {
            console.error("Erro ao buscar CEP:", error);
            toast({
              title: "Erro ao buscar CEP",
              description: error.message,
              variant: "destructive",
            });
          })
          .finally(() => {
            setIsSearchingCep(false);
          });
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const totalFiles = uploadedFiles.length + files.length;
    
    if (totalFiles > 5) {
      toast({
        title: "Limite excedido",
        description: "Você pode adicionar no máximo 5 fotos.",
        variant: "destructive",
      });
      return;
    }

    // Validar cada arquivo
    const validFiles: File[] = [];
    for (const file of files) {
      const validation = ImageService.validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        toast({
          title: "Arquivo inválido",
          description: `${file.name}: ${validation.message}`,
          variant: "destructive",
        });
      }
    }

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setUploadedImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const totalFiles = uploadedFiles.length + files.length;
    
    if (totalFiles > 5) {
      toast({
        title: "Limite excedido",
        description: "Você pode adicionar no máximo 5 fotos.",
        variant: "destructive",
      });
      return;
    }

    // Validar cada arquivo
    const validFiles: File[] = [];
    for (const file of files) {
      const validation = ImageService.validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        toast({
          title: "Arquivo inválido",
          description: `${file.name}: ${validation.message}`,
          variant: "destructive",
        });
      }
    }

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
  };

  // Verificar se houve mudanças nos dados
  const hasChanges = () => {
    if (!originalData) return false;
    
    // Comparar campos editáveis
    const formChanges = (
      formData.name !== originalData.name ||
      formData.description !== originalData.description ||
      formData.price !== originalData.price ||
      formData.status !== originalData.status ||
      formData.category !== originalData.category ||
      formData.internalNotes !== originalData.internalNotes ||
      formData.bedrooms !== originalData.bedrooms ||
      formData.bathrooms !== originalData.bathrooms ||
      formData.area !== originalData.area ||
      formData.parking !== originalData.parking
    );
    
    // Comparar imagens
    const imageChanges = (
      uploadedFiles.length > 0 ||
      uploadedImageUrls.length !== (originalData.images?.length || 0)
    );
    
    console.log('🔍 Verificando mudanças:', {
      formChanges,
      imageChanges,
      formData,
      originalData,
      uploadedFiles: uploadedFiles.length,
      uploadedImageUrls: uploadedImageUrls.length,
      originalImages: originalData.images?.length || 0
    });
    
    return formChanges || imageChanges;
  };

  const validateForm = () => {
    if (!formData.name || !formData.description || !formData.price) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios (Nome, Descrição e Preço).",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.bedrooms || !formData.bathrooms || !formData.area) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha quartos, banheiros e área do imóvel.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    // Verificar se houve mudanças
    if (!hasChanges()) {
      toast({
        title: "Nenhuma alteração",
        description: "Nenhum campo foi alterado. Não há nada para salvar.",
        variant: "default",
      });
      return;
    }

    setSaving(true);
    
    try {
      let imageUrls: string[] = [];

      // Fazer upload das novas imagens se houver arquivos
      if (uploadedFiles.length > 0) {
        setIsUploadingImages(true);
        toast({
          title: "Fazendo upload das imagens...",
          description: "Aguarde enquanto as imagens são enviadas.",
        });

        const uploadedUrls = await ImageService.uploadMultipleImages(uploadedFiles, 'properties');
        
        if (uploadedUrls.length === 0) {
          throw new Error("Falha ao fazer upload das imagens");
        }

        imageUrls = uploadedUrls;
        setIsUploadingImages(false);

        toast({
          title: "Upload concluído!",
          description: `${uploadedUrls.length} imagem(ns) enviada(s) com sucesso.`,
        });
      }

      // Preparar dados para atualização - campos permitidos para corretor incluindo endereço
      const updateData: UpdatePropertyData = {
        id: propertyId,
        title: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price.replace(/[^\d,]/g, '').replace(',', '.')),
        location: `${formData.city}, ${formData.state}`, // Atualizar com dados editáveis
        state: formData.state, // Permitir edição do estado
        images: imageUrls.length > 0 ? [...uploadedImageUrls, ...imageUrls] : uploadedImageUrls,
        realtorId: originalData?.realtorId || '', // Manter original - corretor não pode alterar
        status: formData.status as 'available' | 'negotiating' | 'sold',
        category: formData.category as 'prontos' | 'na_planta' | 'apartamento' | 'casa' | 'cobertura' | 'comercial' | 'condominio' | 'loteamento',
        address: {
          street: formData.street,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        }, // Permitir edição do endereço
        features: {
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          area: parseInt(formData.area),
          parking: parseInt(formData.parking || '0')
        },
        registrationDate: registrationDate?.toISOString() || originalData?.registrationDate || new Date().toISOString(),
        internalNotes: formData.internalNotes
      };

      console.log('💾 Dados para update:', {
        updateData,
        hasChanges: hasChanges(),
        formData,
        originalData
      });

      // Atualizar no banco de dados
      const updatedProperty = await PropertyService.updateProperty(updateData);

      if (updatedProperty) {
        toast({
          title: "Sucesso!",
          description: "Imóvel atualizado com sucesso.",
        });

        onClose();
        // Chamar callback de sucesso para atualizar dados
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error('Falha ao atualizar imóvel');
      }

    } catch (err) {
      console.error('Erro ao salvar:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar dados';
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      setIsUploadingImages(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Building className="w-5 h-5 mr-2 text-primary" />
            Editar Imóvel: {propertyTitle}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
            <span className="text-muted-foreground">Carregando dados...</span>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Nome do Imóvel *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Ex: Apartamento moderno no centro"
                  required
                  disabled={saving}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Descreva as características do imóvel..."
                  rows={3}
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="price">Preço *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="Ex: 850000"
                    className="pl-10"
                    required
                    disabled={saving}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="registrationDate">Data de Cadastro</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !registrationDate && "text-muted-foreground"
                      )}
                      disabled={saving}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {registrationDate ? (
                        format(registrationDate, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecionar data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={registrationDate}
                      onSelect={setRegistrationDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Address Section - Editável para Corretor */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Endereço</h3>
              </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zipCode">CEP</Label>
                  <div className="relative">
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      placeholder="00000-000"
                      maxLength={9}
                      disabled={saving}
                      className="pr-10"
                    />
                    {isSearchingCep && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                    )}
                    {!isSearchingCep && formData.zipCode.length === 9 && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Search className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="SP"
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="São Paulo"
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={formData.neighborhood}
                    onChange={(e) => handleInputChange("neighborhood", e.target.value)}
                    placeholder="Centro"
                    disabled={saving}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="street">Rua</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => handleInputChange("street", e.target.value)}
                    placeholder="Rua das Flores, 123"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {/* Características do Imóvel */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <HomeIcon className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Características</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="bedrooms">Quartos *</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="1"
                    value={formData.bedrooms}
                    onChange={(e) => handleInputChange("bedrooms", e.target.value)}
                    placeholder="3"
                    required
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label htmlFor="bathrooms">Banheiros *</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="1"
                    value={formData.bathrooms}
                    onChange={(e) => handleInputChange("bathrooms", e.target.value)}
                    placeholder="2"
                    required
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label htmlFor="area">Área (m²) *</Label>
                  <Input
                    id="area"
                    type="number"
                    min="1"
                    value={formData.area}
                    onChange={(e) => handleInputChange("area", e.target.value)}
                    placeholder="120"
                    required
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label htmlFor="parking">Vagas</Label>
                  <Input
                    id="parking"
                    type="number"
                    min="0"
                    value={formData.parking}
                    onChange={(e) => handleInputChange("parking", e.target.value)}
                    placeholder="2"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {/* Status e Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status do Imóvel *</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)} disabled={saving}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="negotiating">Em Negociação</SelectItem>
                    <SelectItem value="sold">Vendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Categoria do Imóvel</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)} disabled={saving}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prontos">Prontos</SelectItem>
                    <SelectItem value="na_planta">Na Planta</SelectItem>
                    <SelectItem value="apartamento">Apartamento</SelectItem>
                    <SelectItem value="casa">Casa</SelectItem>
                    <SelectItem value="cobertura">Cobertura</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="condominio">Condomínio</SelectItem>
                    <SelectItem value="loteamento">Loteamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Fotos do Imóvel</h3>
                <span className="text-sm text-muted-foreground">(máximo 5 fotos)</span>
              </div>

              {/* Imagens existentes */}
              {uploadedImageUrls.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Imagens atuais ({uploadedImageUrls.length}):
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {uploadedImageUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-muted rounded-lg overflow-hidden border-2 border-border">
                          <img
                            src={url}
                            alt={`Imagem atual ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeExistingImage(index)}
                          disabled={saving}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div 
                className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                  uploadedFiles.length >= 5 
                    ? 'border-muted-foreground bg-muted' 
                    : isDragOver
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <Upload className={`mx-auto h-12 w-12 mb-4 ${
                    uploadedFiles.length >= 5 ? 'text-muted-foreground' : 'text-muted-foreground'
                  }`} />
                  <div className="flex text-sm leading-6 text-muted-foreground">
                    <label
                      htmlFor="file-upload"
                      className={`relative cursor-pointer rounded-md bg-background font-semibold focus-within:outline-none ${
                        uploadedFiles.length >= 5 
                          ? 'text-muted-foreground cursor-not-allowed' 
                          : 'text-primary hover:text-primary/80'
                      }`}
                    >
                      <span>
                        {isDragOver
                          ? 'Solte as imagens aqui'
                          : uploadedFiles.length >= 5 
                            ? 'Limite de 5 fotos atingido' 
                            : uploadedFiles.length > 0 
                              ? 'Adicionar mais fotos' 
                              : 'Clique para fazer upload'
                        }
                      </span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploadedFiles.length >= 5 || saving}
                      />
                    </label>
                    {uploadedFiles.length < 5 && !isDragOver && <p className="pl-1">ou arraste e solte</p>}
                  </div>
                  <p className="text-xs leading-5 text-muted-foreground">
                    PNG, JPG, JPEG até 10MB • Máximo 5 fotos
                  </p>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Novas imagens ({uploadedFiles.length}/5):
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-muted rounded-lg overflow-hidden border-2 border-border">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFile(index)}
                          disabled={saving}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                          {file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Internal Notes */}
            <div>
              <Label htmlFor="internalNotes">Observação Interna</Label>
              <Textarea
                id="internalNotes"
                value={formData.internalNotes}
                onChange={(e) => handleInputChange("internalNotes", e.target.value)}
                placeholder="Observações internas (não visível para visitantes)..."
                rows={3}
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Esta informação será visível apenas para corretores e administradores
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving || isUploadingImages || !hasChanges()}>
                {isUploadingImages ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando imagens...
                  </>
                ) : saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {hasChanges() ? "Salvar Alterações" : "Nenhuma alteração"}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditPropertyModalRealtor;
