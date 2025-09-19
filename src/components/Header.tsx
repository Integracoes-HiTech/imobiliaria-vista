import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/LoginModal";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isVisitorRoute = ["/", "/property", "/properties"].some(route => 
    location.pathname === route || location.pathname.startsWith(route)
  );

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isRealtorRoute = location.pathname.startsWith("/realtor");

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-card shadow-[var(--shadow-card)] sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {user ? (
            // Dashboard - Logo não clicável
            <div className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-primary" />
              <span className="text-xl font-luxury font-bold text-foreground">MG Imóveis</span>
            </div>
          ) : (
            // Área pública - Logo clicável
            <Link to="/" className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-primary" />
              <span className="text-xl font-luxury font-bold text-foreground">MG Imóveis</span>
            </Link>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {user && (
              <>
                <Link to={user.type === 'admin' ? '/admin/properties' : '/realtor/properties'} className="text-foreground hover:text-primary transition-colors">
                  Imóveis
                </Link>
                {user.type === 'admin' && (
                  <Link to="/admin/realtors" className="text-foreground hover:text-primary transition-colors">
                    Corretores
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!user && (
              <Button variant="default" onClick={() => setShowLoginModal(true)} className="font-luxury">
                <User className="w-4 h-4 mr-2" />
                Entrar
              </Button>
            )}
            
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  Olá, {user.name}
                </span>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <nav className="flex flex-col space-y-4">
              {!user && (
                <Button variant="default" onClick={() => setShowLoginModal(true)} size="sm" className="font-luxury">
                  <User className="w-4 h-4 mr-2" />
                  Entrar
                </Button>
              )}
              
              {user && (
                <>
                  <Link to={user.type === 'admin' ? '/admin/properties' : '/realtor/properties'} className="text-foreground hover:text-primary transition-colors">
                    Imóveis
                  </Link>
                  {user.type === 'admin' && (
                    <Link to="/admin/realtors" className="text-foreground hover:text-primary transition-colors">
                      Corretores
                    </Link>
                  )}
                  <div className="pt-4 border-t border-border">
                    <span className="text-sm text-muted-foreground">Olá, {user.name}</span>
                    <Button variant="outline" onClick={handleLogout} size="sm" className="mt-2 w-full">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
        
        {/* Login Modal */}
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
        />
      </div>
    </header>
  );
};

export default Header;