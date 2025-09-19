import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, Loader2, AlertTriangle, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BucketTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [bucketExists, setBucketExists] = useState<boolean | null>(null);
  const [bucketInfo, setBucketInfo] = useState<any>(null);
  const { toast } = useToast();

  const checkBucket = async () => {
    setLoading(true);
    setBucketExists(null);
    setBucketInfo(null);

    try {
      console.log('🔍 Verificando bucket "images"...');
      
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('❌ Erro ao listar buckets:', error);
        toast({
          title: "Erro ao verificar buckets",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log('📋 Buckets encontrados:', buckets);
      
      const imagesBucket = buckets?.find(bucket => bucket.id === 'images');
      
      if (imagesBucket) {
        setBucketExists(true);
        setBucketInfo(imagesBucket);
        console.log('✅ Bucket "images" encontrado:', imagesBucket);
        toast({
          title: "Bucket encontrado!",
          description: "O bucket 'images' existe e está configurado.",
        });
      } else {
        setBucketExists(false);
        console.log('❌ Bucket "images" não encontrado');
        toast({
          title: "Bucket não encontrado",
          description: "Execute o script SQL para criar o bucket 'images'.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Erro na verificação:', error);
      toast({
        title: "Erro na verificação",
        description: "Ocorreu um erro ao verificar o bucket.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (bucketExists === null) return <Database className="w-4 h-4 text-gray-600" />;
    if (bucketExists) return <CheckCircle className="w-4 h-4 text-green-600" />;
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getStatusColor = () => {
    if (bucketExists === null) return 'border-gray-200 bg-gray-50';
    if (bucketExists) return 'border-green-200 bg-green-50';
    return 'border-red-200 bg-red-50';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Verificação do Bucket de Imagens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Este teste verifica se o bucket "images" foi criado no Supabase Storage.
            Se não existir, você precisa executar o script SQL primeiro.
          </AlertDescription>
        </Alert>

        <Button 
          onClick={checkBucket} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verificando Bucket...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Verificar Bucket "images"
            </>
          )}
        </Button>

        {bucketExists !== null && (
          <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
            <div className="flex items-center space-x-2 mb-2">
              {getStatusIcon()}
              <span className="font-medium">
                {bucketExists ? 'Bucket Encontrado!' : 'Bucket Não Encontrado'}
              </span>
            </div>
            
            {bucketExists && bucketInfo ? (
              <div className="space-y-2 text-sm">
                <p><strong>ID:</strong> {bucketInfo.id}</p>
                <p><strong>Nome:</strong> {bucketInfo.name}</p>
                <p><strong>Público:</strong> {bucketInfo.public ? 'Sim' : 'Não'}</p>
                <p><strong>Criado em:</strong> {new Date(bucketInfo.created_at).toLocaleString()}</p>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <p>O bucket "images" não foi encontrado no Supabase Storage.</p>
                <p><strong>Para resolver:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Acesse o Supabase Dashboard</li>
                  <li>Vá para SQL Editor</li>
                  <li>Execute o script <code>CREATE_BUCKET_NOW.sql</code></li>
                  <li>Configure as políticas de storage</li>
                </ol>
              </div>
            )}
          </div>
        )}

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Se o bucket não existir:</strong>
            <br />
            1. Execute o script <code>database/CREATE_BUCKET_NOW.sql</code> no Supabase
            <br />
            2. Configure as políticas de storage no Dashboard
            <br />
            3. Teste novamente o upload de imagens
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default BucketTest;
