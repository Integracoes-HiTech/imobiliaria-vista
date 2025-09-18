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
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data.map(this.mapDatabaseToProperty);
    } catch (error) {
      console.error('Erro ao buscar propriedades:', error);
      return [];
    }
  }

  static async getPropertiesByRealtor(realtorId: string): Promise<Property[]> {
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
        .eq('realtor_id', realtorId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

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
        throw new Error(error.message);
      }

      // Criar entrada no histórico de status
      await this.addStatusHistory(data.id, data.status, 'Sistema', 'Propriedade criada');

      return this.mapDatabaseToProperty(data);
    } catch (error) {
      console.error('Erro ao criar propriedade:', error);
      throw error;
    }
  }

  static async updateProperty(propertyData: UpdatePropertyData): Promise<Property | null> {
    try {
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
      if (propertyData.category) updateData.category = propertyData.category;
      if (propertyData.address) updateData.address = propertyData.address;
      if (propertyData.features) updateData.features = propertyData.features;
      if (propertyData.registrationDate) updateData.registration_date = propertyData.registrationDate;
      if (propertyData.internalNotes !== undefined) updateData.internal_notes = propertyData.internalNotes;

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
        throw new Error(error.message);
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
      // Primeiro, deletar o histórico de status
      await supabase
        .from('property_status_history')
        .delete()
        .eq('property_id', propertyId);

      // Depois, deletar a propriedade
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar propriedade:', error);
      return false;
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
      await supabase
        .from('property_status_history')
        .insert({
          property_id: propertyId,
          status,
          changed_by: changedBy,
          changed_at: new Date().toISOString(),
          notes,
        });
    } catch (error) {
      console.error('Erro ao adicionar histórico de status:', error);
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
        id: data.users.id,
        name: data.users.name,
        phone: data.users.phone,
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
    };
  }
}
