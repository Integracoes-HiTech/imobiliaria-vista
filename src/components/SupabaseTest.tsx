import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SUPABASE_CONFIG } from '@/config/supabase';

interface DebugInfo {
  connectionStatus: 'testing' | 'success' | 'error';
  errorMessage: string;
  propertiesCount: number;
  lastTest: string;
  environment: string;
  configValid: boolean;
  rlsEnabled: boolean;
}

export const SupabaseTest = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    connectionStatus: 'testing',
    errorMessage: '',
    propertiesCount: 0,
    lastTest: '',
    environment: import.meta.env.MODE,
    configValid: false,
    rlsEnabled: false
  });

  useEffect(() => {
    const testConnection = async () => {
      const startTime = new Date().toISOString();
      
      try {
        console.log('🧪 SupabaseTest - Iniciando teste completo...');
        
        // Verificar configuração
        const configValid = !!(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey);
        console.log('🧪 SupabaseTest - Config válida:', configValid);
        
        if (!configValid) {
          setDebugInfo(prev => ({
            ...prev,
            connectionStatus: 'error',
            errorMessage: 'Configuração inválida: URL ou chave anon não configuradas',
            configValid: false,
            lastTest: startTime
          }));
          return;
        }

        // Teste 1: Verificar se o cliente Supabase está funcionando
        console.log('🧪 SupabaseTest - Teste 1: Conexão básica...');
        const { data, error } = await supabase
          .from('properties')
          .select('id')
          .limit(1);

        console.log('🧪 SupabaseTest - Resultado teste 1:', { data, error });

        if (error) {
          console.error('❌ SupabaseTest - Erro na conexão:', error);
          setDebugInfo(prev => ({
            ...prev,
            connectionStatus: 'error',
            errorMessage: `Erro de conexão: ${error.message}`,
            configValid: true,
            lastTest: startTime
          }));
          return;
        }

        // Teste 2: Contar propriedades
        console.log('🧪 SupabaseTest - Teste 2: Contagem de propriedades...');
        const { count, error: countError } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true });

        console.log('🧪 SupabaseTest - Resultado teste 2:', { count, countError });

        if (countError) {
          console.error('❌ SupabaseTest - Erro na contagem:', countError);
          setDebugInfo(prev => ({
            ...prev,
            connectionStatus: 'error',
            errorMessage: `Erro na contagem: ${countError.message}`,
            configValid: true,
            lastTest: startTime
          }));
          return;
        }

        // Teste 3: Verificar RLS (Row Level Security)
        console.log('🧪 SupabaseTest - Teste 3: Verificando RLS...');
        const { data: rlsData, error: rlsError } = await supabase
          .from('properties')
          .select('id, title')
          .limit(1);

        const rlsEnabled = rlsError?.message?.includes('permission denied') || 
                          rlsError?.message?.includes('RLS') ||
                          (count === 0 && !rlsError);

        console.log('🧪 SupabaseTest - RLS:', { rlsEnabled, rlsError });

        setDebugInfo(prev => ({
          ...prev,
          connectionStatus: 'success',
          propertiesCount: count || 0,
          configValid: true,
          rlsEnabled,
          lastTest: startTime,
          errorMessage: ''
        }));
        
        console.log('✅ SupabaseTest - Todos os testes passaram!');

      } catch (err) {
        console.error('❌ SupabaseTest - Erro geral:', err);
        setDebugInfo(prev => ({
          ...prev,
          connectionStatus: 'error',
          errorMessage: err instanceof Error ? err.message : 'Erro desconhecido',
          lastTest: startTime
        }));
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-6 border rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-semibold">🧪 Debug Supabase</h3>
        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
          {debugInfo.environment}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Status Principal */}
        <div className="space-y-3">
          <div>
            <strong>Status da Conexão:</strong> 
            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
              debugInfo.connectionStatus === 'testing' ? 'bg-yellow-100 text-yellow-800' :
              debugInfo.connectionStatus === 'success' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {debugInfo.connectionStatus === 'testing' ? '🔄 Testando...' :
               debugInfo.connectionStatus === 'success' ? '✅ Conectado' :
               '❌ Erro'}
            </span>
          </div>

          <div>
            <strong>Configuração:</strong> 
            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
              debugInfo.configValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {debugInfo.configValid ? '✅ Válida' : '❌ Inválida'}
            </span>
          </div>

          <div>
            <strong>RLS (Row Level Security):</strong> 
            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
              debugInfo.rlsEnabled ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {debugInfo.rlsEnabled ? '🔒 Ativo' : '🔓 Inativo'}
            </span>
          </div>
        </div>

        {/* Informações Técnicas */}
        <div className="space-y-3">
          <div>
            <strong>Propriedades:</strong> 
            <span className="ml-2 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {debugInfo.propertiesCount} encontradas
            </span>
          </div>

          <div>
            <strong>Último Teste:</strong> 
            <span className="ml-2 text-sm text-gray-600">
              {debugInfo.lastTest ? new Date(debugInfo.lastTest).toLocaleTimeString() : 'Nunca'}
            </span>
          </div>

          <div>
            <strong>URL:</strong> 
            <code className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">
              {SUPABASE_CONFIG.url}
            </code>
          </div>
        </div>
      </div>

      {/* Mensagem de Erro */}
      {debugInfo.connectionStatus === 'error' && debugInfo.errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <strong className="text-red-800">❌ Erro:</strong>
          <p className="text-red-700 text-sm mt-1">{debugInfo.errorMessage}</p>
        </div>
      )}

      {/* Variáveis de Ambiente */}
      <div className="bg-white p-3 rounded-lg border">
        <h4 className="font-medium mb-2">🔧 Variáveis de Ambiente</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span>VITE_SUPABASE_URL:</span>
            <span className={import.meta.env.VITE_SUPABASE_URL ? 'text-green-600' : 'text-red-600'}>
              {import.meta.env.VITE_SUPABASE_URL ? '✅' : '❌'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>VITE_SUPABASE_ANON_KEY:</span>
            <span className={import.meta.env.VITE_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'}>
              {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅' : '❌'}
            </span>
          </div>
        </div>
      </div>

      {/* Botão de Reteste */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          🔄 Testar Novamente
        </button>
      </div>
    </div>
  );
};
