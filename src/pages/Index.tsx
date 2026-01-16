import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Configurator } from "@/components/Configurator";
import { ShutterVisualizer } from "@/components/ShutterVisualizer";
import { QuoteForm } from "@/components/QuoteForm";
import { HelpSection } from "@/components/HelpSection";

const Index = () => {
  const [selectedMaterial, setSelectedMaterial] = useState<"aluminum" | "wood">("aluminum");
  const [selectedDesignName, setSelectedDesignName] = useState<string>("Klassisch");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Configurator 
        onMaterialChange={setSelectedMaterial}
        onDesignChange={setSelectedDesignName}
      />
      <ShutterVisualizer 
        material={selectedMaterial}
        designName={selectedDesignName}
      />
      <QuoteForm />
      <HelpSection />
      
      <footer className="py-8 border-t bg-muted/30">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Fensterläden. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
