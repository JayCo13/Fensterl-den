import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded" />
          <span className="text-xl font-bold">FENSTERLÄDEN</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#konfigurator" className="text-sm font-medium hover:text-primary transition-colors">
            Konfigurator
          </a>
          <a href="#hilfe" className="text-sm font-medium hover:text-primary transition-colors">
            Hilfe & Anleitungen
          </a>
        </nav>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/partner-login')}
          className="gap-2"
        >
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline">Partner-Login</span>
        </Button>
      </div>
    </header>
  );
};
