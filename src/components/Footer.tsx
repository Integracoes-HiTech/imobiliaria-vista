import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-primary" />
              <span className="text-2xl font-luxury font-bold">MG Imóveis</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              A maior plataforma de imóveis do Brasil. Conectamos você aos melhores corretores 
              e aos imóveis dos seus sonhos.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-slate-300 hover:text-primary transition-colors text-sm">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/properties" className="text-slate-300 hover:text-primary transition-colors text-sm">
                  Imóveis Disponíveis
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-slate-300 hover:text-primary transition-colors text-sm">
                  Busca Avançada
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-slate-300 hover:text-primary transition-colors text-sm">
                  Área Administrativa
                </Link>
              </li>
              <li>
                <Link to="/realtor/login" className="text-slate-300 hover:text-primary transition-colors text-sm">
                  Área do Corretor
                </Link>
              </li>
            </ul>
          </div>

          {/* Tipos de Imóveis */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tipos de Imóveis</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/properties?type=apartamento" className="text-slate-300 hover:text-primary transition-colors text-sm">
                  Apartamentos
                </Link>
              </li>
              <li>
                <Link to="/properties?type=casa" className="text-slate-300 hover:text-primary transition-colors text-sm">
                  Casas
                </Link>
              </li>
              <li>
                <Link to="/properties?type=cobertura" className="text-slate-300 hover:text-primary transition-colors text-sm">
                  Coberturas
                </Link>
              </li>
              <li>
                <Link to="/properties?type=comercial" className="text-slate-300 hover:text-primary transition-colors text-sm">
                  Comerciais
                </Link>
              </li>
              <li>
                <Link to="/properties?type=loteamento" className="text-slate-300 hover:text-primary transition-colors text-sm">
                  Loteamentos
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contato</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-slate-300 text-sm">(11) 99999-9999</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-slate-300 text-sm">contato@mgimoveis.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-primary mt-1" />
                <span className="text-slate-300 text-sm">
                  Av. Paulista, 1000<br />
                  São Paulo - SP, 01310-100
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Linha Divisória */}
        <div className="border-t border-slate-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-slate-400 text-sm">
              © 2024 MG Imóveis. Todos os direitos reservados.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-slate-400 hover:text-primary transition-colors">
                Política de Privacidade
              </Link>
              <Link to="/terms" className="text-slate-400 hover:text-primary transition-colors">
                Termos de Uso
              </Link>
              <Link to="/cookies" className="text-slate-400 hover:text-primary transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
