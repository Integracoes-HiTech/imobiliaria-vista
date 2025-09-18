import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  CalendarIcon, 
  Upload, 
  X,
  MapPin,
  DollarSign,
  FileText,
  Camera
} from "lucide-react";
import { cn } from "@/lib/utils";

const RealtorPropertyForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationDate, setRegistrationDate] = useState<Date>();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    zipCode: "",
    state: "",
    city: "",
    street: "",
    status: "available",
    internalNotes: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Simulate auto-fill when zipCode is entered (8 digits)
    if (field === "zipCode" && value.replace(/\D/g, '').length === 8) {
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          state: "SP",
          city: "São Paulo",
          street: "Rua Exemplo, 123"
        }));
        toast({
          title: "CEP encontrado!",
          description: "Endereço preenchido automaticamente.",
        });
      }, 500);
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
    
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.price) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Imóvel cadastrado com sucesso!",
        description: "O imóvel foi adicionado à sua carteira.",
      });
      navigate("/realtor/properties");
    }, 1500);
  };

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
                Cadastrar Novo Imóvel
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
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                        placeholder="00000-000"
                        maxLength={9}
                      />
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

                {/* Status */}
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

                {/* Photo Upload */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Camera className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Fotos do Imóvel</h3>
                    <span className="text-sm text-muted-foreground">(máximo 5 fotos)</span>
                  </div>
                  
                  <div className="border-2 border-dashed border-border rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <div className="flex text-sm leading-6 text-muted-foreground">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md bg-background font-semibold text-primary focus-within:outline-none hover:text-primary/80"
                        >
                          <span>Clique para fazer upload</span>
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
                        <p className="pl-1">ou arraste e solte</p>
                      </div>
                      <p className="text-xs leading-5 text-muted-foreground">PNG, JPG, JPEG até 10MB</p>
                    </div>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="relative">
                          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                            <span className="text-xs text-muted-foreground text-center p-2">
                              {file.name}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
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
                    Esta informação será visível apenas para você e administradores
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" asChild>
                    <Link to="/realtor/properties">Cancelar</Link>
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Cadastrando..." : "Cadastrar Imóvel"}
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