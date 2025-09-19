import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Home, User, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${result.user?.name}!`,
        });

        // Redirecionar para o dashboard apropriado
        if (result.user?.type === 'admin') {
          navigate('/admin/dashboard');
        } else if (result.user?.type === 'realtor') {
          navigate('/realtor/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(result.error || 'Erro ao fazer login');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Botão Voltar */}
        <Button 
          variant="ghost" 
          onClick={handleBackToHome}
          className="mb-6 flex items-center space-x-2 text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Início</span>
        </Button>

        {/* Card de Login */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Home className="h-8 w-8 text-primary" />
              <span className="text-2xl font-luxury font-bold text-foreground">MG Imóveis</span>
            </div>
            <CardTitle className="text-xl">Acesso ao Sistema</CardTitle>
            <p className="text-muted-foreground text-sm">
              Faça login para acessar sua área administrativa
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Digite seu email"
                  disabled={loading}
                  className="bg-background"
                />
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Digite sua senha"
                  disabled={loading}
                  className="bg-background"
                />
              </div>

              {/* Erro */}
              {error && (
                <div className="text-destructive text-sm text-center bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Botão de Login */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 mr-2" />
                    Entrar
                  </>
                )}
              </Button>
            </form>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
