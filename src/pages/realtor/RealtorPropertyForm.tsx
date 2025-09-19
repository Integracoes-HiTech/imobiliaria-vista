import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useProperty } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { PropertyService, CreatePropertyData } from "@/services/propertyService";
import { ImageService } from "@/services/imageService";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ArrowLeft, 
  CalendarIcon, 
  Upload, 
  X,
  MapPin,
  DollarSign,
  FileText,
  Camera,
  Home as HomeIcon,
  Loader2,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";

const RealtorPropertyForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { id } = useParams();
  
  // Determinar se é edição ou criação
  const isEditing = Boolean(id);
  const { property, loading: propertyLoading, error: propertyError } = useProperty(id || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [registrationDate, setRegistrationDate] = useState<Date>();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Carregar dados do imóvel quando estiver editando
  useEffect(() => {
    if (isEditing && property) {
      setFormData({
        name: property.title,
        description: property.description,
        price: property.priceValue.toString(),
        zipCode: property.address.zip_code,
        state: property.address.state,
        city: property.address.city,
        street: property.address.street,
        neighborhood: property.address.neighborhood,
        status: property.status,
        category: property.category,
        internalNotes: property.internalNotes || "",
        bedrooms: property.features.bedrooms.toString(),
        bathrooms: property.features.bathrooms.toString(),
        area: property.features.area.toString(),
        parking: property.features.parking.toString(),
      });
      
      // Carregar imagens existentes
      setUploadedImageUrls(property.images || []);
    }
  }, [isEditing, property]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    zipCode: "",
    state: "",
    city: "",
    street: "",
    neighborhood: "",
    status: "available",
    category: "apartamento",
    internalNotes: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    parking: ""
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação dos campos obrigatórios
    if (!formData.name || !formData.description || !formData.price) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios (Nome, Descrição e Preço).",
        variant: "destructive",
      });
      return;
    }

    // Validação dos campos numéricos
    if (!formData.bedrooms || !formData.bathrooms || !formData.area) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha quartos, banheiros e área do imóvel.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se o usuário está logado como corretor
    if (!user || user.type !== 'realtor') {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado como corretor para cadastrar imóveis.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      let imageUrls: string[] = [];

      // Fazer upload das imagens se houver arquivos
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
      } else {
        // Usar imagem padrão se não houver upload
        imageUrls = ['property1.jpg'];
      }

      // Preparar dados para criação/edição
      const propertyData: CreatePropertyData = {
        title: formData.name,
        description: formData.description,
        price: parseFloat(formData.price.replace(/[^\d,]/g, '').replace(',', '.')),
        location: `${formData.city}, ${formData.state}`,
        state: formData.state,
        images: imageUrls.length > 0 ? imageUrls : uploadedImageUrls, // Usar imagens existentes se não houver novas
        realtorId: user.id, // Usar o ID do corretor logado
        status: formData.status as 'available' | 'negotiating' | 'sold',
        category: formData.category as 'prontos' | 'na_planta' | 'apartamento' | 'casa' | 'cobertura' | 'comercial' | 'condominio' | 'loteamento',
        address: {
          street: formData.street,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        features: {
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          area: parseInt(formData.area),
          parking: parseInt(formData.parking || '0')
        },
        registrationDate: registrationDate?.toISOString() || new Date().toISOString(),
        internalNotes: formData.internalNotes
      };

      let result;
      if (isEditing && id) {
        // Editar imóvel existente
        result = await PropertyService.updateProperty({ id, ...propertyData });
        
        if (result) {
          toast({
            title: "Imóvel atualizado com sucesso!",
            description: `O imóvel "${result.title}" foi atualizado.`,
          });
        } else {
          throw new Error("Falha ao atualizar imóvel");
        }
      } else {
        // Criar novo imóvel
        result = await PropertyService.createProperty(propertyData);
        
        if (result) {
          toast({
            title: "Imóvel cadastrado com sucesso!",
            description: `O imóvel "${result.title}" foi adicionado à sua carteira.`,
          });
          
          // Aguardar um pouco para o toast aparecer antes de redirecionar
          setTimeout(() => {
            navigate("/realtor/properties");
          }, 1000);
        } else {
          throw new Error("Falha ao criar imóvel");
        }
      }
    } catch (error) {
      console.error("Erro ao cadastrar imóvel:", error);
      toast({
        title: "Erro ao cadastrar imóvel",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state para edição
  if (isEditing && propertyLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
            <span className="text-lg text-muted-foreground">Carregando dados do imóvel...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state para edição
  if (isEditing && propertyError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar imóvel</h3>
            <p className="text-muted-foreground mb-4">{propertyError}</p>
            <Button asChild>
              <Link to="/realtor/properties">Voltar para Imóveis</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/realtor/properties">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Meus Imóveis
            </Link>
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <FileText className="w-6 h-6 mr-2 text-primary" />
                {isEditing ? "Editar Imóvel" : "Cadastrar Novo Imóvel"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="name">Nome do Imóvel *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Ex: Apartamento moderno no centro"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description">Descrição *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Descreva as características do imóvel..."
                      rows={4}
                      required
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

                {/* Address Section */}
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
                          className="pr-10"
                        />
                        {isSearchingCep ? (
                          <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Digite o CEP para preenchimento automático do endereço
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        placeholder="SP"
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="São Paulo"
                      />
                    </div>

                    <div>
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        value={formData.neighborhood}
                        onChange={(e) => handleInputChange("neighborhood", e.target.value)}
                        placeholder="Centro"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="street">Rua</Label>
                      <Input
                        id="street"
                        value={formData.street}
                        onChange={(e) => handleInputChange("street", e.target.value)}
                        placeholder="Rua das Flores, 123"
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
                      />
                    </div>
                  </div>
                </div>

                {/* Status and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="status">Status do Imóvel</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
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
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
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
                            disabled={uploadedFiles.length >= 5}
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
                        Imagens selecionadas ({uploadedFiles.length}/5):
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square bg-muted rounded-lg overflow-hidden border-2 border-border">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                                onLoad={(e) => {
                                  // Limpar o URL do objeto após carregar para liberar memória
                                  setTimeout(() => {
                                    URL.revokeObjectURL((e.target as HTMLImageElement).src);
                                  }, 1000);
                                }}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeFile(index)}
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
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Esta informação será visível apenas para corretores e administradores
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" asChild>
                    <Link to="/realtor/properties">Cancelar</Link>
                  </Button>
                  <Button type="submit" disabled={isLoading || isUploadingImages}>
                    {isUploadingImages ? "Enviando imagens..." : isLoading ? (isEditing ? "Atualizando..." : "Cadastrando...") : (isEditing ? "Atualizar Imóvel" : "Cadastrar Imóvel")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RealtorPropertyForm;