import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-shutters.jpg";

export const Hero = () => {
  const scrollToConfigurator = () => {
    document.getElementById('konfigurator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-[hsl(var(--hero-overlay))]" />
      </div>
      
      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Fensterläden nach Maß
          </h1>
          <p className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed">
            Hochwertige Fenster- und Schiebeläden aus Aluminium und Holz. 
            Konfigurieren Sie Ihren perfekten Sonnenschutz in wenigen Schritten.
          </p>
          <Button 
            size="lg" 
            onClick={scrollToConfigurator}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg shadow-lg"
          >
            Jetzt konfigurieren
          </Button>
        </div>
      </div>
    </section>
  );
};
