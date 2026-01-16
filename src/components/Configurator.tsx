import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import aluminumImage from "@/assets/aluminum-shutter.jpg";
import woodImage from "@/assets/wood-shutter.jpg";
import { useToast } from "@/hooks/use-toast";

type Material = "aluminum" | "wood";
type Design = string;
type WoodType = string;

const WOOD_TYPES = [
  { id: "spruce", name: "Fichte", description: "Heimisches Nadelholz, hell und leicht", price: 0 },
  { id: "pine", name: "Kiefer", description: "Robustes Nadelholz mit Maserung", price: 20 },
  { id: "oak", name: "Eiche", description: "Hochwertiges Hartholz, sehr beständig", price: 50 },
  { id: "tropical", name: "Tropenholz", description: "Witterungsbeständig, Premium-Qualität", price: 80 },
];

const POPULAR_RAL_COLORS = [
  { ral: "9016", name: "Verkehrsweiß", color: "#F1F0EA" },
  { ral: "7016", name: "Anthrazitgrau", color: "#383E42" },
  { ral: "9005", name: "Tiefschwarz", color: "#0E0E10" },
  { ral: "8017", name: "Schokoladenbraun", color: "#442F29" },
  { ral: "6005", name: "Moosgrün", color: "#0F4C3A" },
  { ral: "7035", name: "Lichtgrau", color: "#CBD0CC" },
  { ral: "3000", name: "Feuerrot", color: "#A72920" },
  { ral: "5010", name: "Enzianblau", color: "#09437D" },
];

const ALUMINUM_DESIGNS = [
  { id: "alu-donau", name: "Donau", description: "Innenliegende schräge Lamellen", price: 280 },
  { id: "alu-iller", name: "Iller", description: "Überstehende Lamellen", price: 290 },
  { id: "alu-elbe", name: "Elbe", description: "Kombination Lamellen & Platten", price: 320 },
  { id: "alu-rhein", name: "Rhein", description: "Vollflächige Ausführung", price: 250 },
  { id: "alu-main", name: "Main", description: "Dekorative Laserausschnitte", price: 340 },
  { id: "alu-isar", name: "Isar", description: "Moderne Lamellen schmal", price: 285 },
  { id: "alu-neckar", name: "Neckar", description: "Klassische breite Lamellen", price: 295 },
  { id: "alu-weser", name: "Weser", description: "Asymmetrische Lamellen", price: 310 },
  { id: "alu-mosel", name: "Mosel", description: "Horizontale Teilung", price: 300 },
  { id: "alu-lech", name: "Lech", description: "Vertikale Teilung", price: 305 },
  { id: "alu-inn", name: "Inn", description: "Lamellen mit Mittelsteg", price: 290 },
  { id: "alu-saar", name: "Saar", description: "Rahmen mit Querholz", price: 275 },
  { id: "alu-ruhr", name: "Ruhr", description: "Schlichte Eleganz", price: 270 },
  { id: "alu-salzach", name: "Salzach", description: "Alpine Ausführung", price: 315 },
  { id: "alu-traun", name: "Traun", description: "Premium Design", price: 350 },
];

const WOOD_DESIGNS = [
  { id: "wood-tirol", name: "Tirol", description: "Traditionelle Lamellen", price: 350 },
  { id: "wood-salzburg", name: "Salzburg", description: "Rustikales Design", price: 360 },
  { id: "wood-vorarlberg", name: "Vorarlberg", description: "Modernes Holzdesign", price: 390 },
  { id: "wood-kaernten", name: "Kärnten", description: "Klassische Vollflächig", price: 310 },
  { id: "wood-steiermark", name: "Steiermark", description: "Herzausschnitt", price: 420 },
  { id: "wood-oberoester", name: "Oberösterreich", description: "Breite Lamellen", price: 365 },
  { id: "wood-niederoester", name: "Niederösterreich", description: "Schmale Lamellen", price: 355 },
  { id: "wood-burgenland", name: "Burgenland", description: "Weinland Style", price: 370 },
  { id: "wood-alpenstil", name: "Alpenstil", description: "Berghaus Optik", price: 400 },
  { id: "wood-landhaus", name: "Landhaus", description: "Ländlicher Charme", price: 375 },
  { id: "wood-villa", name: "Villa", description: "Elegante Ausführung", price: 410 },
  { id: "wood-modern", name: "Modern", description: "Zeitgemäßes Design", price: 395 },
  { id: "wood-klassisch", name: "Klassisch", description: "Zeitlose Eleganz", price: 380 },
  { id: "wood-exklusiv", name: "Exklusiv", description: "Premium Holzdesign", price: 450 },
  { id: "wood-tradition", name: "Tradition", description: "Handwerkliche Qualität", price: 385 },
];

interface ConfiguratorProps {
  onMaterialChange?: (material: "aluminum" | "wood") => void;
  onDesignChange?: (designName: string) => void;
}

export const Configurator = ({ onMaterialChange, onDesignChange }: ConfiguratorProps) => {
  const [material, setMaterial] = useState<Material>("aluminum");
  const [woodType, setWoodType] = useState<WoodType>(WOOD_TYPES[0].id);
  const [design, setDesign] = useState<Design>(ALUMINUM_DESIGNS[0].id);
  const [ralColor, setRalColor] = useState<string>("9016");
  const [customRal, setCustomRal] = useState<string>("");
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [measurements, setMeasurements] = useState<any>(null);
  const { toast } = useToast();

  const currentDesigns = material === "aluminum" ? ALUMINUM_DESIGNS : WOOD_DESIGNS;
  const selectedDesignData = currentDesigns.find(d => d.id === design) || currentDesigns[0];
  const selectedWoodTypeData = WOOD_TYPES.find(w => w.id === woodType) || WOOD_TYPES[0];
  const selectedRalData = POPULAR_RAL_COLORS.find(r => r.ral === ralColor);
  
  const displayRal = customRal || ralColor;

  // When material changes, reset to first design of that material
  const handleMaterialChange = (newMaterial: Material) => {
    setMaterial(newMaterial);
    const newDesigns = newMaterial === "aluminum" ? ALUMINUM_DESIGNS : WOOD_DESIGNS;
    const firstDesign = newDesigns[0];
    setDesign(firstDesign.id);
    if (newMaterial === "wood") {
      setWoodType(WOOD_TYPES[0].id);
    }
    onMaterialChange?.(newMaterial);
    onDesignChange?.(firstDesign.name);
  };

  const handleDesignChange = (designId: string) => {
    setDesign(designId);
    const designData = currentDesigns.find(d => d.id === designId);
    if (designData) {
      onDesignChange?.(designData.name);
    }
  };

  const calculatePrice = () => {
    const w = parseFloat(width);
    const h = parseFloat(height);
    
    if (!w || !h || w <= 0 || h <= 0) {
      toast({
        title: "Ungültige Eingabe",
        description: "Bitte geben Sie gültige Maße ein.",
        variant: "destructive"
      });
      return;
    }

    const area = (w * h) / 10000; // convert to m²
    let basePrice = selectedDesignData.price;
    
    // Add wood type surcharge if applicable
    if (material === "wood") {
      basePrice += selectedWoodTypeData.price;
    }
    
    const price = Math.round(basePrice * area);
    
    // Calculate measurements
    const lamellaCount = Math.floor(h / 100); // 10cm per lamella
    const spacing = 5; // 5mm spacing
    const frameThickness = 70; // 70mm frame
    
    setCalculatedPrice(price);
    setMeasurements({
      lamellaCount,
      spacing,
      frameThickness,
      totalWidth: w + (frameThickness * 2),
      totalHeight: h + (frameThickness * 2)
    });

    toast({
      title: "Preis berechnet",
      description: `Ihr individueller Fensterladen wurde konfiguriert.`
    });
  };

  return (
    <section id="konfigurator" className="py-16 bg-muted/30">
      <div className="container px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Konfigurator
            </h2>
            <p className="text-lg text-muted-foreground">
              Stellen Sie Ihren perfekten Fensterladen zusammen
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-[var(--shadow-elegant)]">
              <CardHeader>
                <CardTitle>1. Material wählen</CardTitle>
                <CardDescription>Wählen Sie zwischen Aluminium und Holz</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={material} onValueChange={(v) => handleMaterialChange(v as Material)}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <RadioGroupItem value="aluminum" id="aluminum" className="peer sr-only" />
                      <Label
                        htmlFor="aluminum"
                        className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                      >
                        <img src={aluminumImage} alt="Aluminium" className="w-full h-32 object-cover rounded mb-3" />
                        <span className="font-semibold">Aluminium</span>
                        <span className="text-xs text-muted-foreground text-center">Wartungsfrei & langlebig</span>
                      </Label>
                    </div>
                    <div className="relative">
                      <RadioGroupItem value="wood" id="wood" className="peer sr-only" />
                      <Label
                        htmlFor="wood"
                        className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                      >
                        <img src={woodImage} alt="Holz" className="w-full h-32 object-cover rounded mb-3" />
                        <span className="font-semibold">Holz</span>
                        <span className="text-xs text-muted-foreground text-center">Natürlich & elegant</span>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {material === "wood" && (
              <Card className="md:col-span-2 shadow-[var(--shadow-elegant)]">
                <CardHeader>
                  <CardTitle>2. Holzart wählen</CardTitle>
                  <CardDescription>Wählen Sie die gewünschte Holzart für Ihre Fensterläden</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={woodType} onValueChange={setWoodType}>
                    <div className="grid md:grid-cols-4 gap-4">
                      {WOOD_TYPES.map((wood) => (
                        <div key={wood.id} className="relative">
                          <RadioGroupItem value={wood.id} id={wood.id} className="peer sr-only" />
                          <Label
                            htmlFor={wood.id}
                            className="flex flex-col items-start rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all h-full"
                          >
                            <span className="font-semibold mb-1">{wood.name}</span>
                            <span className="text-xs text-muted-foreground mb-2">{wood.description}</span>
                            {wood.price > 0 && (
                              <span className="text-xs text-primary mt-auto">+€ {wood.price}/m²</span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                  
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <div className="font-semibold mb-1">Gewählte Holzart: {selectedWoodTypeData.name}</div>
                    <div className="text-sm text-muted-foreground">{selectedWoodTypeData.description}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="md:col-span-2 shadow-[var(--shadow-elegant)]">
              <CardHeader>
                <CardTitle>{material === "wood" ? "3" : "2"}. Design auswählen</CardTitle>
                <CardDescription>
                  Wählen Sie aus {currentDesigns.length} verschiedenen {material === "aluminum" ? "Aluminium" : "Holz"}-Designs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="w-full whitespace-nowrap rounded-lg border">
                  <div className="flex gap-4 p-4">
                    {currentDesigns.map((designOption) => (
                      <div key={designOption.id} className="flex-shrink-0">
                        <input
                          type="radio"
                          id={designOption.id}
                          name="design"
                          value={designOption.id}
                          checked={design === designOption.id}
                          onChange={(e) => setDesign(e.target.value)}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={designOption.id}
                          className="flex flex-col w-48 rounded-lg border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-checked:border-primary cursor-pointer transition-all overflow-hidden"
                          onClick={() => handleDesignChange(designOption.id)}
                        >
                          <div className="relative h-40 bg-muted">
                            <img
                              src={material === "aluminum" ? aluminumImage : woodImage}
                              alt={designOption.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                              <div className="p-3 text-white w-full">
                                <div className="font-semibold">{designOption.name}</div>
                                <div className="text-xs opacity-90">{designOption.description}</div>
                              </div>
                            </div>
                          </div>
                          <div className="p-3 text-center">
                            <div className="text-sm font-medium text-muted-foreground">
                              ab € {designOption.price}/m²
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
                
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="font-semibold mb-1">Gewählt: {selectedDesignData.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedDesignData.description}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 shadow-[var(--shadow-elegant)]">
              <CardHeader>
                <CardTitle>{material === "wood" ? "4" : "3"}. RAL-Farbe wählen</CardTitle>
                <CardDescription>
                  Wählen Sie eine beliebige RAL-Farbe für die {material === "aluminum" ? "Pulverbeschichtung" : "Lackierung"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="mb-3 block">Beliebte RAL-Farben</Label>
                  <RadioGroup value={ralColor} onValueChange={(v) => { setRalColor(v); setCustomRal(""); }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {POPULAR_RAL_COLORS.map((color) => (
                        <div key={color.ral} className="relative">
                          <RadioGroupItem value={color.ral} id={color.ral} className="peer sr-only" />
                          <Label
                            htmlFor={color.ral}
                            className="flex flex-col items-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                          >
                            <div 
                              className="w-full h-12 rounded mb-2 border border-border"
                              style={{ backgroundColor: color.color }}
                            />
                            <span className="text-sm font-medium text-center">RAL {color.ral}</span>
                            <span className="text-xs text-muted-foreground text-center">{color.name}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-ral">Oder geben Sie eine andere RAL-Nummer ein</Label>
                  <Input
                    id="custom-ral"
                    placeholder="z.B. 5015"
                    value={customRal}
                    onChange={(e) => setCustomRal(e.target.value)}
                    maxLength={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Alle RAL Classic Farben sind verfügbar
                  </p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {selectedRalData && !customRal && (
                      <div 
                        className="w-12 h-12 rounded border-2 border-border flex-shrink-0"
                        style={{ backgroundColor: selectedRalData.color }}
                      />
                    )}
                    <div>
                      <div className="font-semibold">
                        Gewählte Farbe: RAL {displayRal}
                        {selectedRalData && !customRal && ` - ${selectedRalData.name}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {material === "aluminum" ? "Pulverbeschichtung" : "Deckende Lackierung"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 shadow-[var(--shadow-elegant)]">
              <CardHeader>
                <CardTitle>{material === "wood" ? "5" : "4"}. Fenstermaße eingeben</CardTitle>
                <CardDescription>Geben Sie die Breite und Höhe Ihres Fensters in mm ein</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="width">Breite (mm)</Label>
                    <Input
                      id="width"
                      type="number"
                      placeholder="z.B. 1200"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Höhe (mm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="z.B. 1500"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={calculatePrice} 
                  className="w-full mt-6 bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  <Calculator className="mr-2 h-5 w-5" />
                  Preis berechnen
                </Button>

                {calculatedPrice && measurements && (
                  <div className="mt-8 p-6 bg-muted rounded-lg border-2 border-primary/20">
                    <h3 className="text-2xl font-bold mb-4 text-primary">
                      Ihr Preis: € {calculatedPrice},-
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-semibold mb-2">Technische Details:</p>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• Anzahl Lamellen: {measurements.lamellaCount}</li>
                          <li>• Lamellenabstand: {measurements.spacing} mm</li>
                          <li>• Rahmenstärke: {measurements.frameThickness} mm</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold mb-2">Gesamtmaße:</p>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• Breite inkl. Rahmen: {measurements.totalWidth} mm</li>
                          <li>• Höhe inkl. Rahmen: {measurements.totalHeight} mm</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
