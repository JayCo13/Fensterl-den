import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogIn, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-black/60 backdrop-blur-sm text-white transition-all duration-300 border-b border-white/10">
      <div className="container flex h-20 items-center px-4 relative justify-between">

        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-sm">
            <img
              src="/nur Balken.jpg"
              alt="Fensterläden Logo"
              className="h-8 w-auto"
            />
          </div>
        </div>

        {/* Desktop Navigation - Centered */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <a href="https://www.blank.at" className="text-sm font-medium text-white/70 hover:text-white transition-colors uppercase tracking-wider">
            Home
          </a>
          <a href="#konfigurator" className="text-sm font-medium text-white hover:text-white transition-colors uppercase tracking-wider border-b-2 border-primary pb-1">
            Konfigurator
          </a>
          <a href="#hilfe" className="text-sm font-medium text-white/70 hover:text-white transition-colors uppercase tracking-wider">
            Hilfe
          </a>
          <a href="https://www.blank.at/kontakt" className="text-sm font-medium text-white/70 hover:text-white transition-colors uppercase tracking-wider">
            Kontakt
          </a>
        </nav>

        {/* Desktop Login Button - Right Aligned */}
        <div className="hidden md:flex items-center gap-4">
          <a href="#partner" className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors">
            <LogIn className="h-4 w-4" />
            <span className="uppercase tracking-wider">Partner Login</span>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden ml-auto text-white hover:bg-white/10"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 border-t border-white/10 bg-black shadow-lg z-50 animate-in slide-in-from-top-2">
          <nav className="container flex flex-col gap-4 py-6 px-4 h-[calc(100vh-5rem)]">
            <a
              href="https://www.blank.at"
              className="text-base font-medium text-white/80 hover:text-white transition-colors uppercase tracking-wider"
            >
              Home
            </a>
            <a
              href="#konfigurator"
              className="text-base font-medium text-white hover:text-white transition-colors uppercase tracking-wider"
              onClick={() => setMobileMenuOpen(false)}
            >
              Konfigurator
            </a>
            <a
              href="#hilfe"
              className="text-base font-medium text-white/80 hover:text-white transition-colors uppercase tracking-wider"
              onClick={() => setMobileMenuOpen(false)}
            >
              Hilfe & Anleitungen
            </a>
            <a
              href="https://www.blank.at/kontakt"
              className="text-base font-medium text-white/80 hover:text-white transition-colors uppercase tracking-wider"
            >
              Kontakt
            </a>
            <div className="h-px bg-white/10 my-2" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigate('/partner-login');
                setMobileMenuOpen(false);
              }}
              className="gap-3 justify-start text-white/80 hover:text-white hover:bg-white/10 pl-0"
            >
              <LogIn className="h-5 w-5" />
              <span className="uppercase tracking-wider">Partner Login</span>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};
