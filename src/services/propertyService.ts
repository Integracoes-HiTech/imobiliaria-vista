import { supabase } from '@/lib/supabase';
import { Property } from '@/types';

export interface CreatePropertyData {
  title: string;
  description: string;
  price: number;
  location: string;
  state: string;
  images: string[];
  realtorId: string;
  status?: 'available' | 'negotiating' | 'sold';
  category: 'prontos' | 'na_planta' | 'apartamento' | 'casa' | 'cobertura' | 'comercial' | 'condominio' | 'loteamento';
  address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  features: {
    bedrooms: number;
    bathrooms: number;
    area: number;
    parking: number;
  };
  registrationDate?: string;
  internalNotes?: string;
}

export interface UpdatePropertyData extends Partial<CreatePropertyData> {
  id: string;
}

export class PropertyService {
  static async getAllProperties(): Promise<Property[]> {
    const startTime = Date.now();
    try {
      console.log('🔍 PropertyService - Iniciando busca de propriedades...');
      console.log('🔍 PropertyService - Supabase client:', !!supabase);
      console.log('🔍 PropertyService - Timestamp:', new Date().toISOString());
      
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
        .is('deleted_at', null) // Apenas propriedades não deletadas
        .order('created_at', { ascending: false });
        
      console.log('🔍 PropertyService - Query executada:', {
        table: 'properties',
        filters: 'deleted_at IS NULL',
        orderBy: 'created_at DESC'
      });

      const duration = Date.now() - startTime;
      console.log('🔍 PropertyService - Resposta do Supabase:', { 
        dataLength: data?.length || 0, 
        error: error?.message || 'Nenhum erro',
        hasData: !!data,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });

      if (error) {
        console.error('❌ PropertyService - Erro do Supabase:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ PropertyService - Nenhuma propriedade encontrada no banco');
        return [];
      }

      console.log('🔍 PropertyService - Dados brutos do banco:', {
        firstRecord: data[0],
        hasUsers: !!data[0]?.users,
        usersData: data[0]?.users
      });

      const mappedData = data.map(this.mapDatabaseToProperty);
      console.log('✅ PropertyService - Propriedades mapeadas:', {
        count: mappedData.length,
        duration: `${Date.now() - startTime}ms`,
        sample: mappedData[0] ? {
          id: mappedData[0].id,
          title: mappedData[0].title,
          category: mappedData[0].category,
          status: mappedData[0].status,
          realtor: mappedData[0].realtor
        } : null,
        statusBreakdown: {
          available: mappedData.filter(p => p.status === 'available').length,
          negotiating: mappedData.filter(p => p.status === 'negotiating').length,
          sold: mappedData.filter(p => p.status === 'sold').length
        },
        allProperties: mappedData.map(p => ({ id: p.id, title: p.title, status: p.status }))
      });
      return mappedData;
    } catch (error) {
      console.error('❌ PropertyService - Erro ao buscar propriedades:', {
        error: error instanceof Error ? error.message : error,
        duration: `${Date.now() - startTime}ms`,
        timestamp: new Date().toISOString()
      });
      return [];
    }
  }

  static async getPropertiesByRealtor(realtorId: string): Promise<Property[]> {
    try {
      if (!realtorId || realtorId.trim() === '') {
        console.log('⚠️ PropertyService.getPropertiesByRealtor - RealtorId vazio ou inválido');
        return [];
      }
      
      console.log('🔄 PropertyService.getPropertiesByRealtor - Buscando propriedades para:', realtorId);
      
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
        .eq('realtor_id', realtorId)
        .is('deleted_at', null) // Apenas propriedades não deletadas
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ PropertyService.getPropertiesByRealtor - Erro:', error);
        throw new Error(error.message);
      }

      console.log('✅ PropertyService.getPropertiesByRealtor - Propriedades encontradas:', data.length);
      
      return data.map(this.mapDatabaseToProperty);
    } catch (error) {
      console.error('Erro ao buscar propriedades do corretor:', error);
      return [];
    }
  }

  static async getPropertyById(id: string): Promise<Property | null> {
    try {
      console.log('PropertyService - Buscando propriedade com ID:', id);
      
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
        .eq('id', id)
        .is('deleted_at', null) // Apenas propriedades não deletadas
        .single();

      console.log('PropertyService - Resposta do Supabase:', { data, error });

      if (error) {
        console.error('PropertyService - Erro do Supabase:', error);
        throw new Error(error.message);
      }

      if (!data) {
        console.log('PropertyService - Nenhuma propriedade encontrada');
        return null;
      }

      const mappedProperty = this.mapDatabaseToProperty(data);
      console.log('PropertyService - Propriedade mapeada:', mappedProperty);
      
      return mappedProperty;
    } catch (error) {
      console.error('PropertyService - Erro ao buscar propriedade:', error);
      return null;
    }
  }

  static async createProperty(propertyData: CreatePropertyData): Promise<Property | null> {
    try {
      console.log('🏠 PropertyService.createProperty - Dados recebidos:', propertyData);
      console.log('🏠 PropertyService.createProperty - RealtorId:', propertyData.realtorId);
      
      const { data, error } = await supabase
        .from('properties')
        .insert({
          title: propertyData.title,
          description: propertyData.description,
          price: propertyData.price,
          price_formatted: this.formatPrice(propertyData.price),
          location: propertyData.location,
          state: propertyData.state,
          images: propertyData.images,
          realtor_id: propertyData.realtorId,
          status: propertyData.status || 'available',
          category: propertyData.category,
          address: propertyData.address,
          features: propertyData.features,
          registration_date: propertyData.registrationDate || new Date().toISOString(),
          internal_notes: propertyData.internalNotes,
        })
        .select(`
          *,
          users!properties_realtor_id_fkey (
            id,
            name,
            phone
          )
        `)
        .single();

      if (error) {
        console.error('❌ PropertyService.createProperty - Erro no insert:', error);
        throw new Error(error.message);
      }

      console.log('✅ PropertyService.createProperty - Imóvel criado com sucesso:', data);

      // Criar entrada no histórico de status
      await this.addStatusHistory(data.id, data.status, 'Sistema', 'Propriedade criada');

      const mappedProperty = this.mapDatabaseToProperty(data);
      console.log('✅ PropertyService.createProperty - Propriedade mapeada:', mappedProperty);
      
      return mappedProperty;
    } catch (error) {
      console.error('Erro ao criar propriedade:', error);
      throw error;
    }
  }

  static async updateProperty(propertyData: UpdatePropertyData): Promise<Property | null> {
    try {
      console.log('🔄 PropertyService.updateProperty - Dados recebidos:', propertyData);
      
      // Buscar o status atual ANTES do update para comparar
      let oldStatus: string | null = null;
      if (propertyData.status) {
        const { data: currentData } = await supabase
          .from('properties')
          .select('status')
          .eq('id', propertyData.id)
          .single();
        
        oldStatus = currentData?.status || null;
        console.log('📊 PropertyService.updateProperty - Status atual:', oldStatus, 'Novo status:', propertyData.status);
      }
      
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      // Adicionar apenas os campos que foram fornecidos
      if (propertyData.title) updateData.title = propertyData.title;
      if (propertyData.description) updateData.description = propertyData.description;
      if (propertyData.price) {
        updateData.price = propertyData.price;
        updateData.price_formatted = this.formatPrice(propertyData.price);
      }
      if (propertyData.location) updateData.location = propertyData.location;
      if (propertyData.state) updateData.state = propertyData.state;
      if (propertyData.images) updateData.images = propertyData.images;
      if (propertyData.realtorId) updateData.realtor_id = propertyData.realtorId;
      if (propertyData.status) updateData.status = propertyData.status; // CORRIGIDO: Adicionar status
      if (propertyData.category) updateData.category = propertyData.category;
      if (propertyData.address) updateData.address = propertyData.address;
      if (propertyData.features) updateData.features = propertyData.features;
      if (propertyData.registrationDate) updateData.registration_date = propertyData.registrationDate;
      if (propertyData.internalNotes !== undefined) updateData.internal_notes = propertyData.internalNotes;

      console.log('💾 PropertyService.updateProperty - Dados para update:', updateData);

      const { data, error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', propertyData.id)
        .select(`
          *,
          users!properties_realtor_id_fkey (
            id,
            name,
            phone
          )
        `)
        .single();

      if (error) {
        console.error('❌ PropertyService.updateProperty - Erro no update:', error);
        throw new Error(error.message);
      }

      console.log('✅ PropertyService.updateProperty - Update realizado com sucesso:', data);

      // Criar entrada no histórico de status se o status mudou
      if (propertyData.status && oldStatus && oldStatus !== propertyData.status) {
        console.log('📝 PropertyService.updateProperty - Status mudou de', oldStatus, 'para', propertyData.status);
        try {
          await this.addStatusHistory(data.id, propertyData.status, 'Sistema', `Status alterado de ${oldStatus} para ${propertyData.status}`);
        } catch (historyError) {
          console.error('⚠️ PropertyService.updateProperty - Erro ao criar histórico:', historyError);
          // Não falha o update principal se o histórico der erro
        }
      }

      return this.mapDatabaseToProperty(data);
    } catch (error) {
      console.error('Erro ao atualizar propriedade:', error);
      throw error;
    }
  }

  static async updatePropertyStatus(
    propertyId: string, 
    status: 'available' | 'negotiating' | 'sold', 
    changedBy: string,
    notes?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', propertyId);

      if (error) {
        throw new Error(error.message);
      }

      // Adicionar entrada no histórico
      await this.addStatusHistory(propertyId, status, changedBy, notes);

      return true;
    } catch (error) {
      console.error('Erro ao atualizar status da propriedade:', error);
      return false;
    }
  }

  static async deleteProperty(propertyId: string): Promise<boolean> {
    try {
      console.log('PropertyService - Iniciando soft delete da propriedade:', propertyId);
      
      // Soft delete: marcar como deletada ao invés de deletar fisicamente
      const { error } = await supabase
        .from('properties')
        .update({ 
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', propertyId)
        .is('deleted_at', null); // Apenas se não estiver já deletada

      if (error) {
        console.error('PropertyService - Erro no soft delete:', error);
        throw new Error(error.message);
      }

      console.log('PropertyService - Soft delete realizado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao deletar propriedade:', error);
      return false;
    }
  }

  static async restoreProperty(propertyId: string): Promise<boolean> {
    try {
      console.log('PropertyService - Restaurando propriedade:', propertyId);
      
      // Restaurar propriedade: remover marca de deletada
      const { error } = await supabase
        .from('properties')
        .update({ 
          deleted_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', propertyId)
        .not('deleted_at', 'is', null); // Apenas se estiver deletada

      if (error) {
        console.error('PropertyService - Erro ao restaurar:', error);
        throw new Error(error.message);
      }

      console.log('PropertyService - Propriedade restaurada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao restaurar propriedade:', error);
      return false;
    }
  }

  static async getDeletedProperties(): Promise<Property[]> {
    try {
      console.log('PropertyService - Buscando propriedades deletadas');
      
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
        .not('deleted_at', 'is', null) // Apenas propriedades deletadas
        .order('deleted_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data.map(this.mapDatabaseToProperty);
    } catch (error) {
      console.error('Erro ao buscar propriedades deletadas:', error);
      return [];
    }
  }

  static async getStatusHistory(propertyId: string) {
    try {
      const { data, error } = await supabase
        .from('property_status_history')
        .select('*')
        .eq('property_id', propertyId)
        .order('changed_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar histórico de status:', error);
      return [];
    }
  }

  private static async addStatusHistory(
    propertyId: string,
    status: 'available' | 'negotiating' | 'sold',
    changedBy: string,
    notes?: string
  ) {
    try {
      console.log('📝 PropertyService.addStatusHistory - Criando histórico:', {
        propertyId,
        status,
        changedBy,
        notes
      });
      
      const { data, error } = await supabase
        .from('property_status_history')
        .insert({
          property_id: propertyId,
          status,
          changed_by: changedBy,
          changed_at: new Date().toISOString(),
          notes,
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ PropertyService.addStatusHistory - Erro:', error);
        throw error;
      }
      
      console.log('✅ PropertyService.addStatusHistory - Histórico criado:', data);
      return data;
    } catch (error) {
      console.error('❌ PropertyService.addStatusHistory - Erro ao adicionar histórico:', error);
      throw error;
    }
  }

  private static formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  }

  private static mapDatabaseToProperty(data: any): Property {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      price: data.price_formatted,
      priceValue: data.price,
      location: data.location,
      state: data.state,
      images: data.images,
      realtor: {
        id: data.users?.id || '',
        name: data.users?.name || 'Corretor não encontrado',
        phone: data.users?.phone || '',
      },
      status: data.status,
      category: data.category || 'apartamento',
      address: {
        street: data.address.street,
        neighborhood: data.address.neighborhood,
        city: data.address.city,
        state: data.address.state,
        zip_code: data.address.zip_code,
      },
      features: data.features,
      registrationDate: data.registration_date,
      internalNotes: data.internal_notes,
      created_at: data.created_at,
      updated_at: data.updated_at,
      deleted_at: data.deleted_at,
    };
  }
}
