import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Key, 
  Eye, 
  EyeOff,
  Loader2,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RealtorService } from '@/services/realtorService';
import { cn } from '@/lib/utils';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  realtorId: string;
  realtorName: string;
  onSuccess?: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  realtorId,
  realtorName,
  onSuccess
}) => {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: ''
  });

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

  const handleGeneratePassword = () => {
    const generatedPassword = generatePassword();
    setNewPassword(generatedPassword);
    setConfirmPassword(generatedPassword);
    setErrors({ password: '', confirmPassword: '' });
  };

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'A senha deve ter pelo menos 6 caracteres';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'A senha deve conter pelo menos uma letra minúscula';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'A senha deve conter pelo menos uma letra maiúscula';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'A senha deve conter pelo menos um número';
    }
    return '';
  };

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    const error = validatePassword(value);
    setErrors(prev => ({ ...prev, password: error }));
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    const error = value !== newPassword ? 'As senhas não coincidem' : '';
    setErrors(prev => ({ ...prev, confirmPassword: error }));
  };

  const validateForm = () => {
    const passwordError = validatePassword(newPassword);
    const confirmError = newPassword !== confirmPassword ? 'As senhas não coincidem' : '';
    
    setErrors({
      password: passwordError,
      confirmPassword: confirmError
    });

    return !passwordError && !confirmError && newPassword && confirmPassword;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      toast({
        title: "Dados inválidos",
        description: "Por favor, corrija os erros antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Resetar senha no banco de dados
      const success = await RealtorService.resetPassword(realtorId, newPassword);
      
      if (success) {
        toast({
          title: "Senha resetada com sucesso!",
          description: `A nova senha do corretor ${realtorName} é: ${newPassword}`,
        });
        
        onClose();
        // Chamar callback de sucesso para atualizar dados
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error('Falha ao resetar senha');
      }
      
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      toast({
        title: "Erro ao resetar senha",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Limpar formulário ao fechar
    setNewPassword('');
    setConfirmPassword('');
    setErrors({ password: '', confirmPassword: '' });
    setShowPassword(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Key className="w-5 h-5 mr-2 text-primary" />
            Resetar Senha do Corretor
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Uma nova senha será gerada para o corretor <strong>{realtorName}</strong>. Ele poderá alterá-la no próximo login.
            </AlertDescription>
          </Alert>

          {/* Password Generation */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Gerar Nova Senha</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGeneratePassword}
                disabled={loading}
              >
                <Key className="w-4 h-4 mr-2" />
                Gerar Senha
              </Button>
            </div>

            <div>
              <Label htmlFor="newPassword">Nova Senha *</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Digite a nova senha"
                  className={cn(
                    "pr-10",
                    errors.password && "border-destructive focus:border-destructive"
                  )}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                placeholder="Confirme a nova senha"
                className={cn(
                  errors.confirmPassword && "border-destructive focus:border-destructive"
                )}
                disabled={loading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Password Requirements */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Requisitos da senha:</Label>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                {newPassword.length >= 6 ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                )}
                <span>Pelo menos 6 caracteres</span>
              </div>
              <div className="flex items-center space-x-2">
                {/(?=.*[a-z])/.test(newPassword) ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                )}
                <span>Pelo menos uma letra minúscula</span>
              </div>
              <div className="flex items-center space-x-2">
                {/(?=.*[A-Z])/.test(newPassword) ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                )}
                <span>Pelo menos uma letra maiúscula</span>
              </div>
              <div className="flex items-center space-x-2">
                {/(?=.*\d)/.test(newPassword) ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                )}
                <span>Pelo menos um número</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleResetPassword} disabled={loading || !newPassword || !confirmPassword}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetando...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Resetar Senha
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordModal;
