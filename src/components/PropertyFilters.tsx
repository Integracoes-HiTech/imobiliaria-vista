import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";

interface FilterProps {
  onFiltersChange: (filters: {
    priceRange: string;
    location: string;
    status: string;
  }) => void;
}

const PropertyFilters = ({ onFiltersChange }: FilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: "all",
    location: "all",
    status: "all"
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { priceRange: "all", location: "all", status: "all" };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <div className="bg-card rounded-lg shadow-[var(--shadow-card)] p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Filtros</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden"
        >
          {isOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      <div className={`${isOpen ? 'block' : 'hidden'} md:block`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Faixa de Preço
            </label>
            <Select
              value={filters.priceRange}
              onValueChange={(value) => handleFilterChange("priceRange", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o preço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os preços</SelectItem>
                <SelectItem value="0-300000">Até R$ 300mil</SelectItem>
                <SelectItem value="300000-500000">R$ 300mil - R$ 500mil</SelectItem>
                <SelectItem value="500000-800000">R$ 500mil - R$ 800mil</SelectItem>
                <SelectItem value="800000-1200000">R$ 800mil - R$ 1,2mi</SelectItem>
                <SelectItem value="1200000+">Acima de R$ 1,2mi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Estado
            </label>
            <Select
              value={filters.location}
              onValueChange={(value) => handleFilterChange("location", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                <SelectItem value="SP">São Paulo</SelectItem>
                <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                <SelectItem value="MG">Minas Gerais</SelectItem>
                <SelectItem value="PR">Paraná</SelectItem>
                <SelectItem value="SC">Santa Catarina</SelectItem>
                <SelectItem value="RS">Rio Grande do Sul</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Status
            </label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status do imóvel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="available">Disponível</SelectItem>
                <SelectItem value="negotiating">Em Negociação</SelectItem>
                <SelectItem value="sold">Vendido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyFilters;