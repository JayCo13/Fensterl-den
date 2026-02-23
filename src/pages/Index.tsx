import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Configurator } from "@/components/Configurator";
import { ShutterVisualizer } from "@/components/ShutterVisualizer";
import { QuoteForm } from "@/components/QuoteForm";
import { HelpSection } from "@/components/HelpSection";
import { ScrollToTop } from "@/components/ScrollToTop";

const Index = () => {
    const [selectedMaterial, setSelectedMaterial] = useState<"aluminum" | "wood">("aluminum");
    const [selectedDesignName, setSelectedDesignName] = useState<string>("Klassisch");
    const [selectedWoodType, setSelectedWoodType] = useState<string>("");
    const [selectedRalColor, setSelectedRalColor] = useState<string>("9016");

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <Hero />
            <Configurator
                onMaterialChange={setSelectedMaterial}
                onDesignChange={setSelectedDesignName}
                onWoodTypeChange={setSelectedWoodType}
                onRalColorChange={setSelectedRalColor}
            />
            <ShutterVisualizer
                material={selectedMaterial}
                designName={selectedDesignName}
                woodType={selectedWoodType}
                ralColor={selectedRalColor}
            />
            <QuoteForm />
            <HelpSection />

            <footer className="py-8 border-t bg-muted/30">
                <div className="container px-4 text-center text-sm text-muted-foreground">
                    <p>© 2025 Fensterläden. Alle Rechte vorbehalten.</p>
                </div>
            </footer>
            <ScrollToTop />
        </div>
    );
};

export default Index;
