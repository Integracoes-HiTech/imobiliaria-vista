import React, { useState } from 'react';
import { ImageService } from '@/services/imageService';
import { supabase } from '@/lib/supabase';

export default function NewBucketTest() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [bucketInfo, setBucketInfo] = useState<any>(null);

  // Verificar informações do bucket
  const checkBucket = async () => {
    try {
      console.log('🔍 Verificando bucket imobiliaria-images...');
      
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        setResult(`❌ Erro ao listar buckets: ${error.message}`);
        return;
      }
      
      const targetBucket = buckets?.find(bucket => bucket.id === 'imobiliaria-images');
      
      if (!targetBucket) {
        setResult('❌ Bucket "imobiliaria-images" não encontrado!');
        setBucketInfo(null);
      } else {
        setResult('✅ Bucket "imobiliaria-images" encontrado!');
        setBucketInfo(targetBucket);
      }
      
      console.log('📦 Buckets encontrados:', buckets);
      console.log('🎯 Bucket alvo:', targetBucket);
      
    } catch (error) {
      console.error('❌ Erro ao verificar bucket:', error);
      setResult(`❌ Erro: ${error}`);
    }
  };

  // Testar upload
  const testUpload = async () => {
    if (!file) {
      setResult('❌ Selecione um arquivo primeiro!');
      return;
    }

    setUploading(true);
    setResult('');

    try {
      console.log('⬆️ Iniciando teste de upload...');
      console.log('📁 Arquivo:', file.name, 'Tamanho:', file.size);
      
      const imageUrl = await ImageService.uploadImage(file, 'test');
      
      if (imageUrl) {
        setResult(`✅ Upload realizado com sucesso!\n🔗 URL: ${imageUrl}`);
        console.log('✅ Upload concluído:', imageUrl);
      } else {
        setResult('❌ Upload falhou - nenhuma URL retornada');
        console.error('❌ Upload falhou');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setResult(`❌ Erro no upload: ${errorMessage}`);
      console.error('❌ Erro no upload:', error);
    } finally {
      setUploading(false);
    }
  };

  // Limpar arquivos de teste
  const cleanupTestFiles = async () => {
    try {
      console.log('🧹 Limpando arquivos de teste...');
      
      const { data: files, error: listError } = await supabase.storage
        .from('imobiliaria-images')
        .list('test');
      
      if (listError) {
        console.log('ℹ️ Nenhum arquivo de teste encontrado ou erro ao listar');
        setResult('ℹ️ Nenhum arquivo de teste encontrado');
        return;
      }
      
      if (files && files.length > 0) {
        const filePaths = files.map(file => `test/${file.name}`);
        
        const { error: deleteError } = await supabase.storage
          .from('imobiliaria-images')
          .remove(filePaths);
        
        if (deleteError) {
          setResult(`❌ Erro ao limpar: ${deleteError.message}`);
        } else {
          setResult(`✅ ${files.length} arquivo(s) de teste removido(s)`);
        }
      } else {
        setResult('ℹ️ Nenhum arquivo de teste encontrado');
      }
      
    } catch (error) {
      console.error('❌ Erro na limpeza:', error);
      setResult(`❌ Erro na limpeza: ${error}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        🧪 Teste do Novo Bucket "imobiliaria-images"
      </h2>

      {/* Informações do Bucket */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">📦 Informações do Bucket</h3>
        <button
          onClick={checkBucket}
          className="mb-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Verificar Bucket
        </button>
        
        {bucketInfo && (
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <h4 className="font-medium text-green-800">✅ Bucket Encontrado:</h4>
            <pre className="text-sm text-green-700 mt-2">
              {JSON.stringify(bucketInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Teste de Upload */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">⬆️ Teste de Upload</h3>
        
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={testUpload}
            disabled={!file || uploading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            {uploading ? '⏳ Enviando...' : '📤 Testar Upload'}
          </button>
          
          <button
            onClick={cleanupTestFiles}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            🧹 Limpar Testes
          </button>
        </div>
      </div>

      {/* Resultado */}
      {result && (
        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">📋 Resultado:</h3>
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}

      {/* Instruções */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold mb-2 text-blue-800">📝 Instruções:</h3>
        <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
          <li>Execute o script <code>database/create_new_bucket_imobiliaria.sql</code> no Supabase</li>
          <li>Clique em "Verificar Bucket" para confirmar que foi criado</li>
          <li>Selecione uma imagem e clique em "Testar Upload"</li>
          <li>Se funcionar, as imagens dos imóveis usarão este novo bucket</li>
          <li>Use "Limpar Testes" para remover arquivos de teste</li>
        </ol>
      </div>
    </div>
  );
}
