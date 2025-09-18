import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
// Dados mockados removidos - usando dados do banco
import { useToast } from "@/hooks/use-toast";
import { RealtorService, CreateRealtorData } from "@/services/realtorService";
import { 
  ArrowLeft, 
  CalendarIcon, 
  User,
  Mail,
  Phone,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

const RealtorForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [birthDate, setBirthDate] = useState<Date>();
  const [birthDateInput, setBirthDateInput] = useState("");
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [errors, setErrors] = useState({
    email: "",
    phone: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }

    // Validate email format
    if (field === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setErrors(prev => ({ ...prev, email: "Formato de email inválido" }));
      }
    }

    // Validate phone duplicity (TODO: implementar verificação no banco)
    if (field === "phone" && value) {
      // TODO: Verificar duplicidade no banco usando AuthService
      // const phoneExists = await AuthService.checkPhoneExists(value);
    }
  };

  // Função para formatar data de entrada
  const formatDateInput = (value: string) => {
    // Remove caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica máscara DD/MM/AAAA
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  // Função para validar data
  const validateDate = (dateString: string) => {
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(dateRegex);
    
    if (!match) return false;
    
    const [, day, month, year] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    const minDate = new Date(1900, 0, 1);
    
    return date <= today && date >= minDate && 
           date.getDate() === parseInt(day) && 
           date.getMonth() === parseInt(month) - 1 && 
           date.getFullYear() === parseInt(year);
  };

  // Função para lidar com mudança na data
  const handleBirthDateInputChange = (value: string) => {
    const formattedValue = formatDateInput(value);
    setBirthDateInput(formattedValue);
    
    // Se a data estiver completa e válida, atualizar o estado
    if (formattedValue.length === 10) {
      if (validateDate(formattedValue)) {
        const [day, month, year] = formattedValue.split('/');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        setBirthDate(date);
      }
    } else if (formattedValue.length < 10) {
      setBirthDate(undefined);
    }
  };

  // Função para gerar senha automática
  const generatePassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    
    // Garantir pelo menos uma maiúscula, uma minúscula e um número
    password += chars.charAt(Math.floor(Math.random() * 26)); // Maiúscula
    password += chars.charAt(Math.floor(Math.random() * 26) + 26); // Minúscula
    password += chars.charAt(Math.floor(Math.random() * 10) + 52); // Número
    
    // Completar com caracteres aleatórios
    for (let i = 3; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Embaralhar a senha
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as (XX) XXXXX-XXXX
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    handleInputChange("phone", formatted);
  };

  const validateForm = () => {
    const newErrors = { email: "", phone: "" };
    let isValid = true;

    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Formato de email inválido";
      isValid = false;
    }

    // Phone duplicity check (TODO: implementar verificação no banco)
    // const phoneExists = await AuthService.checkPhoneExists(formData.phone);
    // if (phoneExists) {
    //   newErrors.phone = "Este WhatsApp já está cadastrado";
    //   isValid = false;
    // }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Validar se a data de nascimento foi preenchida corretamente
    if (birthDateInput.length === 10 && !validateDate(birthDateInput)) {
      toast({
        title: "Data inválida",
        description: "Por favor, insira uma data de nascimento válida.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Gerar senha automática
      const generatedPassword = generatePassword();
      
      // Preparar dados para criação
      const realtorData: CreateRealtorData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        birthDate: birthDate ? birthDate.toISOString().split('T')[0] : undefined,
        password: generatedPassword,
      };

      // Criar corretor no banco de dados
      const newRealtor = await RealtorService.createRealtor(realtorData);

      if (newRealtor) {
        toast({
          title: "Corretor cadastrado com sucesso!",
          description: `O corretor ${newRealtor.name} foi criado. Senha: ${generatedPassword}`,
        });
        navigate("/admin/realtors");
      } else {
        throw new Error("Falha ao criar corretor");
      }
    } catch (error) {
      console.error("Erro ao cadastrar corretor:", error);
      toast({
        title: "Erro ao cadastrar corretor",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/admin/realtors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Corretores
            </Link>
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <User className="w-6 h-6 mr-2 text-primary" />
                Cadastrar Novo Corretor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Password Info Alert */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Uma senha será gerada automaticamente e exibida após o cadastro. O corretor poderá alterá-la no primeiro login.
                  </AlertDescription>
                </Alert>

                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Ex: João Silva Santos"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="birthDate">Data de Nascimento</Label>
                    <div className="space-y-2">
                      {/* Input de texto com máscara */}
                      <Input
                        id="birthDate"
                        placeholder="DD/MM/AAAA"
                        value={birthDateInput}
                        onChange={(e) => handleBirthDateInputChange(e.target.value)}
                        maxLength={10}
                        className={cn(
                          "w-full",
                          birthDateInput.length === 10 && !validateDate(birthDateInput) && "border-red-500"
                        )}
                      />
                      
                      {/* Botão para abrir calendário */}
                      <div className="flex items-center justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsDatePopoverOpen(!isDatePopoverOpen)}
                          className="text-xs"
                        >
                          <CalendarIcon className="mr-2 h-3 w-3" />
                          Usar calendário
                        </Button>
                        
                        {/* Indicador de validação */}
                        {birthDateInput.length === 10 && (
                          <div className="text-xs">
                            {validateDate(birthDateInput) ? (
                              <span className="text-green-600">✓ Data válida</span>
                            ) : (
                              <span className="text-red-600">✗ Data inválida</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Calendário popover */}
                    <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={birthDate}
                          onSelect={(date) => {
                            setBirthDate(date);
                            if (date) {
                              setBirthDateInput(format(date, "dd/MM/yyyy", { locale: ptBR }));
                            }
                            setIsDatePopoverOpen(false);
                          }}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    
                    {/* Dica de uso */}
                    <p className="text-xs text-muted-foreground">
                      Digite a data ou use o calendário. Exemplo: 15/03/1985
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="corretor@exemplo.com"
                        className={cn(
                          "pl-10",
                          errors.email && "border-destructive focus:border-destructive"
                        )}
                        required
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">WhatsApp *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="(11) 99999-9999"
                        className={cn(
                          "pl-10",
                          errors.phone && "border-destructive focus:border-destructive"
                        )}
                        maxLength={15}
                        required
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" asChild>
                    <Link to="/admin/realtors">Cancelar</Link>
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Cadastrando..." : "Cadastrar Corretor"}
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

export default RealtorForm;