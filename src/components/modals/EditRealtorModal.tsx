import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  User, 
  Mail, 
  Phone, 
  CalendarIcon,
  Loader2,
  Save,
  X
} from 'lucide-react';
import { RealtorService, UpdateRealtorData } from '@/services/realtorService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EditRealtorModalProps {
  isOpen: boolean;
  onClose: () => void;
  realtorId: string;
  realtorName: string;
  onSuccess?: () => void;
}

const EditRealtorModal: React.FC<EditRealtorModalProps> = ({
  isOpen,
  onClose,
  realtorId,
  realtorName,
  onSuccess
}) => {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [birthDate, setBirthDate] = useState<Date>();
  const [birthDateInput, setBirthDateInput] = useState("");
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (isOpen && realtorId) {
      fetchRealtorData();
    }
  }, [isOpen, realtorId]);

  const fetchRealtorData = async () => {
    try {
      setLoading(true);
      const realtor = await RealtorService.getRealtorById(realtorId);
      
      if (!realtor) {
        throw new Error('Corretor não encontrado');
      }

      // Preencher formulário com dados existentes
      setFormData({
        name: realtor.name || '',
        email: realtor.email || '',
        phone: realtor.phone || ''
      });

      // Configurar data de nascimento
      if (realtor.birthDate) {
        const date = new Date(realtor.birthDate);
        setBirthDate(date);
        setBirthDateInput(format(date, "dd/MM/yyyy", { locale: ptBR }));
      }

    } catch (err) {
      console.error('Erro ao buscar dados do corretor:', err);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do corretor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
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
  };

  // Função para formatar data de entrada
  const formatDateInput = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
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

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    
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

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
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

    setSaving(true);
    
    try {
      // Preparar dados para atualização
      const updateData: UpdateRealtorData = {
        id: realtorId,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        birthDate: birthDate ? birthDate.toISOString().split('T')[0] : undefined
      };

      // Atualizar no banco de dados
      const updatedRealtor = await RealtorService.updateRealtor(updateData);

      if (updatedRealtor) {
        toast({
          title: "Sucesso!",
          description: "Dados do corretor atualizados com sucesso.",
        });

        onClose();
        // Chamar callback de sucesso para atualizar dados
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error('Falha ao atualizar dados');
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
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="w-5 h-5 mr-2 text-primary" />
            Editar Dados do Corretor
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
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Ex: João Silva Santos"
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <div className="space-y-2">
                  <Input
                    id="birthDate"
                    placeholder="DD/MM/AAAA"
                    value={birthDateInput}
                    onChange={(e) => handleBirthDateInputChange(e.target.value)}
                    maxLength={10}
                    disabled={saving}
                    className={cn(
                      "w-full",
                      birthDateInput.length === 10 && !validateDate(birthDateInput) && "border-red-500"
                    )}
                  />
                  
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDatePopoverOpen(!isDatePopoverOpen)}
                      className="text-xs"
                      disabled={saving}
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      Usar calendário
                    </Button>
                    
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
                    disabled={saving}
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
                    disabled={saving}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
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

export default EditRealtorModal;
