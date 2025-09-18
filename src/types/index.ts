// Interfaces do sistema MG Imóveis
export interface Property {
  id: string;
  title: string;
  description: string;
  price: string;
  priceValue: number;
  location: string;
  state: string;
  images: string[];
  realtor: {
    id: string;
    name: string;
    phone: string;
  };
  status: 'available' | 'negotiating' | 'sold';
  category: 'prontos' | 'na_planta' | 'apartamento' | 'casa' | 'cobertura' | 'comercial' | 'condominio' | 'loteamento';
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
  registrationDate?: string;
  internalNotes?: string;
  statusHistory?: PropertyStatusHistory[];
  created_at?: string;
  updated_at?: string;
}

export interface Realtor {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate?: string;
  type: 'admin' | 'realtor';
  isActive: boolean;
  stats: {
    available: number;
    negotiating: number;
    sold: number;
    total: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface PropertyStatusHistory {
  id: string;
  property_id: string;
  status: 'available' | 'negotiating' | 'sold';
  changed_by: string;
  changed_at: string;
  notes?: string;
  created_at: string;
}

export interface DashboardStats {
  totalRealtors: number;
  availableProperties: number;
  monthlyNegotiating: number;
  monthlySold: number;
}

export interface RealtorRanking {
  id: string;
  name: string;
  email: string;
  phone: string;
  stats: {
    available: number;
    negotiating: number;
    sold: number;
    total: number;
  };
  ranking: number;
}
