import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, Loader2, AlertTriangle, Database, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BucketDebug: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { toast } = useToast();

  const runDebug = async () => {
    setLoading(true);
    setDebugInfo(null);

    try {
      console.log('🔍 Iniciando debug completo do bucket...');
      
      const debugData: any = {
        timestamp: new Date().toISOString(),
        steps: []
      };

      // Passo 1: Verificar conexão básica
      debugData.steps.push({ step: 1, action: 'Verificando conexão básica...' });
      setDebugInfo({ ...debugData });
      
      const { data: connectionTest, error: connectionError } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (connectionError) {
        debugData.steps.push({ step: 1, status: 'error', message: `Erro de conexão: ${connectionError.message}` });
        setDebugInfo({ ...debugData });
        return;
      }
      
      debugData.steps.push({ step: 1, status: 'success', message: 'Conexão básica OK' });
      setDebugInfo({ ...debugData });

      // Passo 2: Listar todos os buckets
      debugData.steps.push({ step: 2, action: 'Listando todos os buckets...' });
      setDebugInfo({ ...debugData });
      
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        debugData.steps.push({ step: 2, status: 'error', message: `Erro ao listar buckets: ${bucketsError.message}` });
        setDebugInfo({ ...debugData });
        return;
      }
      
      debugData.steps.push({ 
        step: 2, 
        status: 'success', 
        message: `Encontrados ${buckets?.length || 0} buckets`,
        data: buckets
      });
      setDebugInfo({ ...debugData });

      // Passo 3: Procurar bucket 'images'
      debugData.steps.push({ step: 3, action: 'Procurando bucket "images"...' });
      setDebugInfo({ ...debugInfo });
      
      const imagesBucket = buckets?.find(bucket => bucket.id === 'images');
      
      if (imagesBucket) {
        debugData.steps.push({ 
          step: 3, 
          status: 'success', 
          message: 'Bucket "images" encontrado!',
          data: imagesBucket
        });
        setDebugInfo({ ...debugData });

        // Passo 4: Verificar objetos no bucket
        debugData.steps.push({ step: 4, action: 'Verificando objetos no bucket...' });
        setDebugInfo({ ...debugData });
        
        const { data: objects, error: objectsError } = await supabase.storage
          .from('images')
          .list('', { limit: 10 });

        if (objectsError) {
          debugData.steps.push({ step: 4, status: 'error', message: `Erro ao listar objetos: ${objectsError.message}` });
        } else {
          debugData.steps.push({ 
            step: 4, 
            status: 'success', 
            message: `Encontrados ${objects?.length || 0} objetos`,
            data: objects
          });
        }
        setDebugInfo({ ...debugData });

        // Passo 5: Testar upload
        debugData.steps.push({ step: 5, action: 'Testando upload...' });
        setDebugInfo({ ...debugData });
        
        try {
          // Criar um arquivo de teste
          const testContent = new Blob(['test'], { type: 'text/plain' });
          const testFile = new File([testContent], 'test-debug.txt', { type: 'text/plain' });
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('images')
            .upload(`debug/test-${Date.now()}.txt`, testFile);

          if (uploadError) {
            debugData.steps.push({ step: 5, status: 'error', message: `Erro no upload: ${uploadError.message}` });
          } else {
            debugData.steps.push({ step: 5, status: 'success', message: 'Upload de teste funcionou!' });
            
            // Limpar arquivo de teste
            await supabase.storage.from('images').remove([uploadData.path]);
          }
        } catch (uploadTestError) {
          debugData.steps.push({ step: 5, status: 'error', message: `Erro no teste de upload: ${uploadTestError}` });
        }
        
        setDebugInfo({ ...debugData });

      } else {
        debugData.steps.push({ step: 3, status: 'error', message: 'Bucket "images" não encontrado na lista' });
        setDebugInfo({ ...debugData });
      }

      console.log('✅ Debug completo:', debugData);
      toast({
        title: "Debug concluído",
        description: "Verifique os resultados abaixo.",
      });

    } catch (error) {
      console.error('❌ Erro no debug:', error);
      toast({
        title: "Erro no debug",
        description: "Ocorreu um erro durante o debug.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <Eye className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'running':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Debug Completo do Bucket de Imagens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Este debug vai investigar por que o bucket "images" não está sendo encontrado pelo código,
            mesmo existindo no Supabase.
          </AlertDescription>
        </Alert>

        <Button 
          onClick={runDebug} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Executando Debug...
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Executar Debug Completo
            </>
          )}
        </Button>

        {debugInfo && (
          <div className="space-y-3">
            <h3 className="font-semibold">Resultados do Debug:</h3>
            <div className="text-sm text-gray-600 mb-4">
              Timestamp: {debugInfo.timestamp}
            </div>
            
            {debugInfo.steps.map((step: any, index: number) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${getStatusColor(step.status || 'pending')}`}
              >
                <div className="flex items-center space-x-2">
                  {getStatusIcon(step.status || 'pending')}
                  <span className="font-medium">
                    Passo {step.step}: {step.action || step.message}
                  </span>
                </div>
                
                {step.message && step.status && (
                  <p className="text-sm mt-1 text-gray-600">{step.message}</p>
                )}
                
                {step.data && (
                  <details className="mt-2">
                    <summary className="text-sm cursor-pointer text-blue-600">
                      Ver dados detalhados
                    </summary>
                    <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto">
                      {JSON.stringify(step.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BucketDebug;
