import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG, getSupabaseKey } from '@/config/supabase';

export const supabase = createClient(SUPABASE_CONFIG.url, getSupabaseKey());

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          birth_date?: string;
          type: 'admin' | 'realtor';
          is_active: boolean;
          password_hash: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          birth_date?: string;
          type: 'admin' | 'realtor';
          is_active?: boolean;
          password_hash: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          birth_date?: string;
          type?: 'admin' | 'realtor';
          is_active?: boolean;
          password_hash?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          title: string;
          description: string;
          price: number;
          price_formatted: string;
          location: string;
          state: string;
          images: string[];
          realtor_id: string;
          status: 'available' | 'negotiating' | 'sold';
          address: {
            street: string;
            neighborhood: string;
            city: string;
            state: string;
            zip_code: string;
          };
          features: {
            bedrooms: number;
            bathrooms: number;
            area: number;
            parking: number;
          };
          registration_date: string;
          internal_notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          price: number;
          price_formatted: string;
          location: string;
          state: string;
          images: string[];
          realtor_id: string;
          status?: 'available' | 'negotiating' | 'sold';
          address: {
            street: string;
            neighborhood: string;
            city: string;
            state: string;
            zip_code: string;
          };
          features: {
            bedrooms: number;
            bathrooms: number;
            area: number;
            parking: number;
          };
          registration_date?: string;
          internal_notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          price?: number;
          price_formatted?: string;
          location?: string;
          state?: string;
          images?: string[];
          realtor_id?: string;
          status?: 'available' | 'negotiating' | 'sold';
          address?: {
            street: string;
            neighborhood: string;
            city: string;
            state: string;
            zip_code: string;
          };
          features?: {
            bedrooms: number;
            bathrooms: number;
            area: number;
            parking: number;
          };
          registration_date?: string;
          internal_notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      property_status_history: {
        Row: {
          id: string;
          property_id: string;
          status: 'available' | 'negotiating' | 'sold';
          changed_by: string;
          changed_at: string;
          notes?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          status: 'available' | 'negotiating' | 'sold';
          changed_by: string;
          changed_at?: string;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          status?: 'available' | 'negotiating' | 'sold';
          changed_by?: string;
          changed_at?: string;
          notes?: string;
          created_at?: string;
        };
      };
    };
  };
}
