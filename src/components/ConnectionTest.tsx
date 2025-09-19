import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ConnectionTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('');

    try {
      console.log('🔍 Testando conexão com Supabase...');
      console.log('📡 URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('🔑 Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Presente' : 'Ausente');

      // Teste 1: Listar buckets
      console.log('📦 Testando listBuckets...');
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        setResult(`❌ Erro ao listar buckets: ${bucketError.message}`);
        console.error('❌ Erro buckets:', bucketError);
        return;
      }

      setResult(`✅ Conexão OK! Buckets encontrados: ${buckets?.length || 0}\n`);
      console.log('✅ Buckets:', buckets);

      // Teste 2: Testar autenticação
      console.log('🔐 Testando autenticação...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        setResult(prev => prev + `⚠️ Erro de auth: ${authError.message}\n`);
        console.warn('⚠️ Auth error:', authError);
      } else {
        setResult(prev => prev + `🔐 Usuário: ${user ? 'Logado' : 'Não logado'}\n`);
        console.log('🔐 User:', user);
      }

      // Teste 3: Testar database
      console.log('🗄️ Testando database...');
      const { data: properties, error: dbError } = await supabase
        .from('properties')
        .select('id')
        .limit(1);
      
      if (dbError) {
        setResult(prev => prev + `❌ Erro DB: ${dbError.message}\n`);
        console.error('❌ DB error:', dbError);
      } else {
        setResult(prev => prev + `✅ Database OK! Propriedades: ${properties?.length || 0}\n`);
        console.log('✅ Properties:', properties);
      }

      // Teste 4: Testar storage diretamente
      console.log('💾 Testando storage...');
      const { data: files, error: storageError } = await supabase.storage
        .from('imobiliaria-images')
        .list('', { limit: 1 });
      
      if (storageError) {
        setResult(prev => prev + `❌ Erro Storage: ${storageError.message}\n`);
        console.error('❌ Storage error:', storageError);
      } else {
        setResult(prev => prev + `✅ Storage OK! Arquivos: ${files?.length || 0}\n`);
        console.log('✅ Files:', files);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setResult(`❌ Erro geral: ${errorMessage}`);
      console.error('❌ Erro geral:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        🔍 Teste de Conexão Supabase
      </h2>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">📡 Informações de Conexão:</h3>
        <div className="text-sm space-y-1">
          <p><strong>URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'Não definida'}</p>
          <p><strong>Chave:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Presente' : '❌ Ausente'}</p>
        </div>
      </div>

      <button
        onClick={testConnection}
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 mb-4"
      >
        {loading ? '⏳ Testando...' : '🚀 Testar Conexão'}
      </button>

      {result && (
        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">📋 Resultado:</h3>
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h3 className="text-lg font-semibold mb-2 text-yellow-800">💡 Dicas:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Se der erro de buckets, verifique as credenciais</li>
          <li>• Se der erro de auth, faça login primeiro</li>
          <li>• Se der erro de storage, verifique se o bucket existe</li>
          <li>• Abra o console (F12) para ver logs detalhados</li>
        </ul>
      </div>
    </div>
  );
}
