import { supabase } from '@/lib/supabase';

export class ImageService {
  // Modo de desenvolvimento - usar URLs temporárias
  private static readonly DEV_MODE = false;
  // Upload de uma única imagem
  static async uploadImage(file: File, folder: string = 'properties'): Promise<string | null> {
    try {
      console.log('Iniciando upload da imagem:', file.name, 'Tamanho:', file.size);
      
      // Modo de desenvolvimento - usar URLs temporárias
      if (this.DEV_MODE) {
        console.log('Modo de desenvolvimento: usando URL temporária');
        const tempUrl = URL.createObjectURL(file);
        console.log('URL temporária criada:', tempUrl);
        return tempUrl;
      }
      
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;
      
      console.log('Caminho do arquivo:', filePath);

      // Upload do arquivo
      console.log('Fazendo upload para Supabase Storage...');
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        throw new Error(`Erro no upload: ${error.message}`);
      }

      console.log('Upload realizado com sucesso:', data);

      // Obter URL pública da imagem
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
      
      console.log('URL pública gerada:', urlData.publicUrl);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Erro no upload da imagem:', error);
      return null;
    }
  }

  // Upload de múltiplas imagens
  static async uploadMultipleImages(files: File[], folder: string = 'properties'): Promise<string[]> {
    try {
      console.log('Iniciando upload múltiplo de', files.length, 'imagens');
      
      const uploadPromises = files.map((file, index) => {
        console.log(`Upload ${index + 1}/${files.length}:`, file.name);
        return this.uploadImage(file, folder);
      });
      
      const results = await Promise.all(uploadPromises);
      
      // Filtrar apenas URLs válidas
      const validUrls = results.filter((url): url is string => url !== null);
      console.log('Uploads concluídos:', validUrls.length, 'de', files.length);
      
      return validUrls;
    } catch (error) {
      console.error('Erro no upload múltiplo de imagens:', error);
      return [];
    }
  }

  // Deletar imagem do storage
  static async deleteImage(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from('images')
        .remove([filePath]);

      if (error) {
        console.error('Erro ao deletar imagem:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      return false;
    }
  }

  // Obter URL pública de uma imagem
  static getPublicUrl(filePath: string): string {
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // Validar tipo de arquivo
  static validateImageFile(file: File): { valid: boolean; message?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        message: 'Tipo de arquivo não permitido. Use JPG, PNG ou WEBP.'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        message: 'Arquivo muito grande. Tamanho máximo: 10MB.'
      };
    }

    return { valid: true };
  }
}
