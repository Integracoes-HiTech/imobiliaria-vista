import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PropertyService } from '@/services/propertyService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Database, Users, Home } from 'lucide-react';

interface DebugResult {
  test: string;
  status: 'success' | 'error' | 'loading';
  message: string;
  data?: any;
  error?: any;
}

const DatabaseDebug: React.FC = () => {
  const [results, setResults] = useState<DebugResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: DebugResult) => {
    setResults(prev => [...prev, result]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    // Teste 1: Conexão básica com Supabase
    addResult({
      test: 'Conexão Supabase',
      status: 'loading',
      message: 'Testando conexão...'
    });

    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      if (error) throw error;
      
      addResult({
        test: 'Conexão Supabase',
        status: 'success',
        message: 'Conexão estabelecida com sucesso',
        data: { hasData: !!data }
      });
    } catch (error) {
      addResult({
        test: 'Conexão Supabase',
        status: 'error',
        message: 'Erro na conexão',
        error: error
      });
    }

    // Teste 2: Verificar tabela properties
    addResult({
      test: 'Tabela Properties',
      status: 'loading',
      message: 'Verificando tabela properties...'
    });

    try {
      const { data, error } = await supabase.from('properties').select('count').limit(1);
      if (error) throw error;
      
      addResult({
        test: 'Tabela Properties',
        status: 'success',
        message: 'Tabela properties acessível',
        data: { hasData: !!data }
      });
    } catch (error) {
      addResult({
        test: 'Tabela Properties',
        status: 'error',
        message: 'Erro ao acessar tabela properties',
        error: error
      });
    }

    // Teste 3: Contar propriedades
    addResult({
      test: 'Contagem Properties',
      status: 'loading',
      message: 'Contando propriedades...'
    });

    try {
      const { count, error } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      
      addResult({
        test: 'Contagem Properties',
        status: 'success',
        message: `Encontradas ${count} propriedades`,
        data: { count }
      });
    } catch (error) {
      addResult({
        test: 'Contagem Properties',
        status: 'error',
        message: 'Erro ao contar propriedades',
        error: error
      });
    }

    // Teste 4: Buscar propriedades com join
    addResult({
      test: 'Query com Join',
      status: 'loading',
      message: 'Testando query com join...'
    });

    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          users!properties_realtor_id_fkey (
            id,
            name,
            phone
          )
        `)
        .limit(3);

      if (error) throw error;
      
      addResult({
        test: 'Query com Join',
        status: 'success',
        message: `Query executada com sucesso - ${data?.length || 0} registros`,
        data: data
      });
    } catch (error) {
      addResult({
        test: 'Query com Join',
        status: 'error',
        message: 'Erro na query com join',
        error: error
      });
    }

    // Teste 5: PropertyService.getAllProperties()
    addResult({
      test: 'PropertyService',
      status: 'loading',
      message: 'Testando PropertyService.getAllProperties()...'
    });

    try {
      const properties = await PropertyService.getAllProperties();
      
      addResult({
        test: 'PropertyService',
        status: 'success',
        message: `PropertyService retornou ${properties.length} propriedades`,
        data: properties.slice(0, 2) // Mostrar apenas as 2 primeiras
      });
    } catch (error) {
      addResult({
        test: 'PropertyService',
        status: 'error',
        message: 'Erro no PropertyService',
        error: error
      });
    }

    // Teste 6: Verificar estrutura da tabela
    addResult({
      test: 'Estrutura Tabela',
      status: 'loading',
      message: 'Verificando estrutura da tabela...'
    });

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .limit(1);

      if (error) throw error;
      
      const sampleProperty = data?.[0];
      const hasCategory = sampleProperty && 'category' in sampleProperty;
      
      addResult({
        test: 'Estrutura Tabela',
        status: hasCategory ? 'success' : 'error',
        message: hasCategory ? 'Coluna category encontrada' : 'Coluna category NÃO encontrada',
        data: {
          hasCategory,
          columns: sampleProperty ? Object.keys(sampleProperty) : [],
          sampleData: sampleProperty
        }
      });
    } catch (error) {
      addResult({
        test: 'Estrutura Tabela',
        status: 'error',
        message: 'Erro ao verificar estrutura',
        error: error
      });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'loading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Sucesso</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'loading':
        return <Badge variant="secondary">Carregando</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Debug do Banco de Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executando Testes...
                </>
              ) : (
                'Executar Testes de Diagnóstico'
              )}
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resultados dos Testes:</h3>
              {results.map((result, index) => (
                <Alert key={index}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <AlertDescription className="font-medium">
                        {result.test}
                      </AlertDescription>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                  <AlertDescription className="mt-2">
                    {result.message}
                  </AlertDescription>
                  
                  {result.data && (
                    <div className="mt-3">
                      <details className="text-sm">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          Ver dados
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                  
                  {result.error && (
                    <div className="mt-3">
                      <details className="text-sm">
                        <summary className="cursor-pointer text-red-600 hover:text-red-800">
                          Ver erro
                        </summary>
                        <pre className="mt-2 p-2 bg-red-50 rounded text-xs overflow-auto">
                          {JSON.stringify(result.error, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </Alert>
              ))}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Informações do Sistema:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>URL Supabase:</strong> {import.meta.env.VITE_SUPABASE_URL || 'Não configurada'}</p>
              <p><strong>Chave Anon:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurada' : 'Não configurada'}</p>
              <p><strong>Ambiente:</strong> {import.meta.env.MODE}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseDebug;
