import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, User } from "lucide-react";

const PublicHeader = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <header className="bg-card shadow-[var(--shadow-card)] sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-primary" />
            <span className="text-xl font-luxury font-bold text-foreground">MG Imóveis</span>
          </Link>

          {/* Botão Entrar */}
          <Button variant="default" onClick={handleLogin} className="font-luxury">
            <User className="w-4 h-4 mr-2" />
            Entrar
          </Button>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
