import property1 from "@/assets/property1.jpg";
import property2 from "@/assets/property2.jpg";
import property3 from "@/assets/property3.jpg";
import property4 from "@/assets/property4.jpg";

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
    name: string;
    phone: string;
  };
  status: "available" | "negotiating" | "sold";
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
  registrationDate: string;
  statusHistory: {
    status: "available" | "negotiating" | "sold";
    changedBy: string;
    changedAt: string;
    notes?: string;
  }[];
}

export interface Realtor {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  isActive: boolean;
  stats: {
    available: number;
    negotiating: number;
    sold: number;
    total: number;
  };
}

export const mockProperties: Property[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    title: "Apartamento Moderno no Centro",
    description: "Apartamento com acabamento premium, localizado no coração da cidade. Possui vista panorâmica, área de lazer completa e fácil acesso ao transporte público.",
    price: "R$ 850.000",
    priceValue: 850000,
    location: "São Paulo, SP",
    state: "SP",
    images: [property1, property2, property3, property4, property1],
    realtor: {
      name: "Ana Silva",
      phone: "11999887766"
    },
    status: "available",
    address: {
      street: "Rua das Flores, 123",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567"
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      parking: 2
    },
    registrationDate: "2024-01-15",
    statusHistory: [
      {
        status: "available",
        changedBy: "Admin MG Imóveis",
        changedAt: "2024-01-15T10:00:00Z",
        notes: "Imóvel cadastrado no sistema"
      }
    ]
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    title: "Casa com Piscina - Bairro Nobre",
    description: "Belíssima casa com piscina e área gourmet. Perfeita para famílias que buscam conforto e qualidade de vida em um dos melhores bairros da cidade.",
    price: "R$ 1.200.000",
    priceValue: 1200000,
    location: "Rio de Janeiro, RJ",
    state: "RJ",
    images: [property2, property3, property1, property4, property2],
    realtor: {
      name: "Carlos Mendes",
      phone: "21988776655"
    },
    status: "negotiating",
    address: {
      street: "Avenida Atlântica, 456",
      neighborhood: "Copacabana",
      city: "Rio de Janeiro",
      state: "RJ",
      zipCode: "22070-001"
    },
    features: {
      bedrooms: 4,
      bathrooms: 3,
      area: 180,
      parking: 3
    },
    registrationDate: "2024-02-01",
    statusHistory: [
      {
        status: "available",
        changedBy: "Carlos Mendes",
        changedAt: "2024-02-01T14:30:00Z",
        notes: "Imóvel cadastrado no sistema"
      },
      {
        status: "negotiating",
        changedBy: "Carlos Mendes",
        changedAt: "2024-02-15T09:15:00Z",
        notes: "Cliente interessado iniciou negociação"
      }
    ]
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    title: "Cobertura Duplex Premium",
    description: "Cobertura duplex com vista para o mar, terraço privativo e acabamento de luxo. Localizada em prédio com portaria 24h e área de lazer completa.",
    price: "R$ 2.500.000",
    priceValue: 2500000,
    location: "Santos, SP",
    state: "SP",
    images: [property3, property4, property1, property2, property3],
    realtor: {
      name: "Marina Costa",
      phone: "13977665544"
    },
    status: "available",
    address: {
      street: "Avenida Bartolomeu de Gusmão, 789",
      neighborhood: "Ponta da Praia",
      city: "Santos",
      state: "SP",
      zipCode: "11030-906"
    },
    features: {
      bedrooms: 5,
      bathrooms: 4,
      area: 250,
      parking: 4
    },
    registrationDate: "2024-02-10",
    statusHistory: [
      {
        status: "available",
        changedBy: "Marina Costa",
        changedAt: "2024-02-10T16:45:00Z",
        notes: "Imóvel cadastrado no sistema"
      }
    ]
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    title: "Casa Familiar Aconchegante",
    description: "Casa térrea com jardim amplo, perfect para famílias com crianças. Localizada em bairro residencial tranquilo, próxima a escolas e comércio.",
    price: "R$ 480.000",
    priceValue: 480000,
    location: "Curitiba, PR",
    state: "PR",
    images: [property4, property1, property2, property3, property4],
    realtor: {
      name: "João Santos",
      phone: "41966554433"
    },
    status: "sold",
    address: {
      street: "Rua das Palmeiras, 321",
      neighborhood: "Batel",
      city: "Curitiba",
      state: "PR",
      zipCode: "80420-090"
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      area: 150,
      parking: 2
    },
    registrationDate: "2024-01-20",
    statusHistory: [
      {
        status: "available",
        changedBy: "João Santos",
        changedAt: "2024-01-20T11:20:00Z",
        notes: "Imóvel cadastrado no sistema"
      },
      {
        status: "negotiating",
        changedBy: "João Santos",
        changedAt: "2024-02-05T15:30:00Z",
        notes: "Cliente interessado iniciou negociação"
      },
      {
        status: "sold",
        changedBy: "João Santos",
        changedAt: "2024-02-20T10:00:00Z",
        notes: "Venda concluída com sucesso"
      }
    ]
  }
];

export const mockRealtors: Realtor[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440101",
    name: "Ana Silva",
    email: "ana.silva@mgimoveis.com",
    phone: "11999887766",
    birthDate: "1985-03-15",
    isActive: true,
    stats: {
      available: 8,
      negotiating: 3,
      sold: 12,
      total: 23
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440102",
    name: "Carlos Mendes",
    email: "carlos.mendes@mgimoveis.com",
    phone: "21988776655",
    birthDate: "1978-07-22",
    isActive: true,
    stats: {
      available: 5,
      negotiating: 7,
      sold: 18,
      total: 30
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440103",
    name: "Marina Costa",
    email: "marina.costa@mgimoveis.com",
    phone: "13977665544",
    birthDate: "1990-11-08",
    isActive: true,
    stats: {
      available: 12,
      negotiating: 2,
      sold: 9,
      total: 23
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440104",
    name: "João Santos",
    email: "joao.santos@mgimoveis.com",
    phone: "41966554433",
    birthDate: "1982-05-30",
    isActive: true,
    stats: {
      available: 6,
      negotiating: 4,
      sold: 15,
      total: 25
    }
  }
];

export const mockKPIs = {
  totalRealtors: mockRealtors.length,
  availableProperties: mockProperties.filter(p => p.status === "available").length,
  negotiatingProperties: mockProperties.filter(p => p.status === "negotiating").length,
  soldProperties: mockProperties.filter(p => p.status === "sold").length
};