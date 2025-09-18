import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthService } from '@/services/authService';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const LoginTest = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; user?: any } | null>(null);

  const testLogin = async () => {
    setLoading(true);
    setResult(null);

    try {
      const user = await AuthService.login({ email, password });
      
      if (user) {
        setResult({
          success: true,
          message: 'Login realizado com sucesso!',
          user: user
        });
      } else {
        setResult({
          success: false,
          message: 'Credenciais inválidas'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Erro: ${error}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Teste de Login - Banco de Dados</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Email:</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@mgimoveis.com"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Senha:</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="admin123"
          />
        </div>

        <Button 
          onClick={testLogin} 
          disabled={loading || !email || !password}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testando...
            </>
          ) : (
            'Testar Login'
          )}
        </Button>

        {result && (
          <div className={`p-3 rounded-lg flex items-center space-x-2 ${
            result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {result.success ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span className="text-sm">{result.message}</span>
          </div>
        )}

        {result?.user && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Dados do Usuário:</h4>
            <pre className="text-xs text-blue-700 overflow-auto">
              {JSON.stringify(result.user, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Credenciais de teste:</strong></p>
          <p>Admin: admin@mgimoveis.com / admin123</p>
          <p>Corretor: ana.silva@mgimoveis.com / ana123</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginTest;
