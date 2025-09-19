import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImageService } from '@/services/imageService';
import { supabase } from '@/lib/supabase';
import { Upload, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ImageUploadTest: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const { toast } = useToast();

  const runDiagnostics = async () => {
    setTestResults([]);
    setUploading(true);

    const results: any[] = [];

    try {
      // Teste 1: Verificar conexão com Supabase
      results.push({
        test: 'Conexão Supabase',
        status: 'running',
        message: 'Verificando conexão...'
      });
      setTestResults([...results]);

      const { data: connectionTest, error: connectionError } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (connectionError) {
        results[0] = {
          test: 'Conexão Supabase',
          status: 'error',
          message: `Erro de conexão: ${connectionError.message}`
        };
      } else {
        results[0] = {
          test: 'Conexão Supabase',
          status: 'success',
          message: 'Conexão estabelecida com sucesso'
        };
      }
      setTestResults([...results]);

      // Teste 2: Verificar bucket de imagens
      results.push({
        test: 'Bucket de Imagens',
        status: 'running',
        message: 'Verificando bucket...'
      });
      setTestResults([...results]);

      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

      if (bucketError) {
        results[1] = {
          test: 'Bucket de Imagens',
          status: 'error',
          message: `Erro ao listar buckets: ${bucketError.message}`
        };
      } else {
        const imagesBucket = buckets?.find(bucket => bucket.id === 'images');
        if (imagesBucket) {
          results[1] = {
            test: 'Bucket de Imagens',
            status: 'success',
            message: `Bucket 'images' encontrado (público: ${imagesBucket.public})`
          };
        } else {
          results[1] = {
            test: 'Bucket de Imagens',
            status: 'error',
            message: "Bucket 'images' não encontrado"
          };
        }
      }
      setTestResults([...results]);

      // Teste 3: Verificar políticas de storage
      results.push({
        test: 'Políticas de Storage',
        status: 'running',
        message: 'Verificando políticas...'
      });
      setTestResults([...results]);

      try {
        // Tentar fazer uma operação simples no storage
        const testFileName = `test-${Date.now()}.txt`;
        const testContent = new Blob(['test'], { type: 'text/plain' });
        
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(testFileName, testContent);

        if (uploadError) {
          results[2] = {
            test: 'Políticas de Storage',
            status: 'error',
            message: `Erro nas políticas: ${uploadError.message}`
          };
        } else {
          // Limpar arquivo de teste
          await supabase.storage.from('images').remove([testFileName]);
          results[2] = {
            test: 'Políticas de Storage',
            status: 'success',
            message: 'Políticas de upload funcionando'
          };
        }
      } catch (policyError) {
        results[2] = {
          test: 'Políticas de Storage',
          status: 'error',
          message: `Erro nas políticas: ${policyError}`
        };
      }
      setTestResults([...results]);

      // Teste 4: Upload de imagem real
      results.push({
        test: 'Upload de Imagem',
        status: 'running',
        message: 'Testando upload...'
      });
      setTestResults([...results]);

      // Criar uma imagem de teste
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#4F46E5';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText('TEST', 25, 55);
      }

      canvas.toBlob(async (blob) => {
        if (blob) {
          const testFile = new File([blob], 'test-image.png', { type: 'image/png' });
          
          try {
            const uploadedUrl = await ImageService.uploadImage(testFile, 'test');
            
            if (uploadedUrl) {
              results[3] = {
                test: 'Upload de Imagem',
                status: 'success',
                message: `Upload realizado: ${uploadedUrl.substring(0, 50)}...`
              };
            } else {
              results[3] = {
                test: 'Upload de Imagem',
                status: 'error',
                message: 'Upload falhou - URL não retornada'
              };
            }
          } catch (uploadError) {
            results[3] = {
              test: 'Upload de Imagem',
              status: 'error',
              message: `Erro no upload: ${uploadError}`
            };
          }
        } else {
          results[3] = {
            test: 'Upload de Imagem',
            status: 'error',
            message: 'Falha ao criar imagem de teste'
          };
        }
        
        setTestResults([...results]);
        setUploading(false);
      }, 'image/png');

    } catch (error) {
      console.error('Erro nos diagnósticos:', error);
      toast({
        title: "Erro nos diagnósticos",
        description: "Ocorreu um erro durante os testes.",
        variant: "destructive",
      });
      setUploading(false);
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
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
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
        return 'border-yellow-200 bg-yellow-50';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Diagnóstico de Upload de Imagens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Este componente testa a configuração do Supabase Storage para upload de imagens.
            Execute os diagnósticos para identificar problemas.
          </AlertDescription>
        </Alert>

        <Button 
          onClick={runDiagnostics} 
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Executando Diagnósticos...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Executar Diagnósticos
            </>
          )}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Resultados dos Testes:</h3>
            {testResults.map((result, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
              >
                <div className="flex items-center space-x-2">
                  {getStatusIcon(result.status)}
                  <span className="font-medium">{result.test}</span>
                </div>
                <p className="text-sm mt-1 text-gray-600">{result.message}</p>
              </div>
            ))}
          </div>
        )}

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Se houver erros:</strong>
            <br />
            1. Execute o script <code>check_storage_setup.sql</code> no Supabase
            <br />
            2. Verifique se o bucket 'images' existe e está público
            <br />
            3. Confirme se as políticas de storage estão configuradas
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ImageUploadTest;
