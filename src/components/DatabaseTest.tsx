import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const DatabaseTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [testResults, setTestResults] = useState<any>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('idle');
    setErrorMessage('');

    try {
      // Teste 1: Conexão básica
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (error) {
        throw new Error(`Erro na conexão: ${error.message}`);
      }

      // Teste 2: Buscar usuários
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, type, is_active')
        .limit(5);

      if (usersError) {
        throw new Error(`Erro ao buscar usuários: ${usersError.message}`);
      }

      // Teste 3: Buscar propriedades
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, title, price, status')
        .limit(5);

      if (propertiesError) {
        throw new Error(`Erro ao buscar propriedades: ${propertiesError.message}`);
      }

      setTestResults({
        usersCount: users?.length || 0,
        propertiesCount: properties?.length || 0,
        users: users || [],
        properties: properties || [],
      });

      setConnectionStatus('success');
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Teste de Conexão com Banco de Dados</span>
          {connectionStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
          {connectionStatus === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={testConnection} 
            disabled={isLoading}
            className="font-luxury"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              'Testar Conexão'
            )}
          </Button>
          
          {connectionStatus === 'success' && (
            <span className="text-green-600 font-medium">✓ Conexão estabelecida com sucesso!</span>
          )}
          
          {connectionStatus === 'error' && (
            <span className="text-red-600 font-medium">✗ Erro na conexão</span>
          )}
        </div>

        {connectionStatus === 'error' && (
          <Alert variant="destructive">
            <AlertDescription>
              <strong>Erro:</strong> {errorMessage}
              <br />
              <br />
              <strong>Possíveis soluções:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Verifique se o schema SQL foi executado no Supabase</li>
                <li>Confirme se as credenciais estão corretas</li>
                <li>Verifique se o projeto Supabase está ativo</li>
                <li>Execute o arquivo <code>database/schema.sql</code> no SQL Editor do Supabase</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {testResults && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">Usuários Encontrados</h3>
                <p className="text-2xl font-bold text-green-600">{testResults.usersCount}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">Propriedades Encontradas</h3>
                <p className="text-2xl font-bold text-blue-600">{testResults.propertiesCount}</p>
              </div>
            </div>

            {testResults.users.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Usuários de Teste:</h3>
                <div className="space-y-2">
                  {testResults.users.map((user: any) => (
                    <div key={user.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{user.name}</span>
                          <span className="ml-2 text-sm text-gray-600">({user.email})</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.type === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.type === 'admin' ? 'Admin' : 'Corretor'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {testResults.properties.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Propriedades de Teste:</h3>
                <div className="space-y-2">
                  {testResults.properties.map((property: any) => (
                    <div key={property.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{property.title}</span>
                          <span className="ml-2 text-sm text-gray-600">{property.price}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          property.status === 'available' 
                            ? 'bg-green-100 text-green-800'
                            : property.status === 'negotiating'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {property.status === 'available' ? 'Disponível' : 
                           property.status === 'negotiating' ? 'Em Negociação' : 'Vendido'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Credenciais de Teste:</h3>
          <div className="space-y-1 text-sm text-blue-700">
            <p><strong>Admin:</strong> admin@mgimoveis.com / admin123</p>
            <p><strong>Corretor:</strong> ana.silva@mgimoveis.com / ana123</p>
            <p><strong>Corretor:</strong> carlos.mendes@mgimoveis.com / carlos123</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseTest;
