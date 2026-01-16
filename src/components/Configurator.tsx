import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, Loader2, Send, X } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import aluminumImage from "@/assets/aluminum-shutter.jpg";
import woodImage from "@/assets/wood-shutter.jpg";
import { useToast } from "@/hooks/use-toast";
import { useWoodTypes, useDesigns, useRalColors, type WoodType, type Design, type RalColor } from "@/hooks/useConfigurator";
import { supabase } from "@/integrations/supabase/client";

type MaterialType = "aluminum" | "wood";

interface ConfiguratorProps {
  onMaterialChange?: (material: "aluminum" | "wood") => void;
  onDesignChange?: (designName: string) => void;
}

export const Configurator = ({ onMaterialChange, onDesignChange }: ConfiguratorProps) => {
  const [material, setMaterial] = useState<MaterialType>("aluminum");
  const [selectedWoodTypeId, setSelectedWoodTypeId] = useState<string>("");
  const [selectedDesignId, setSelectedDesignId] = useState<string>("");
  const [ralColor, setRalColor] = useState<string>("9016");
  const [customRal, setCustomRal] = useState<string>("");
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [measurements, setMeasurements] = useState<any>(null);

  // Modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  // Fetch data from Supabase
  const { data: woodTypes, isLoading: woodTypesLoading } = useWoodTypes();
  const { data: designs, isLoading: designsLoading } = useDesigns(material);
  const { data: ralColors, isLoading: ralColorsLoading } = useRalColors(true);

  const isLoading = woodTypesLoading || designsLoading || ralColorsLoading;

  // Set initial selections when data loads
  useEffect(() => {
    if (woodTypes && woodTypes.length > 0 && !selectedWoodTypeId) {
      setSelectedWoodTypeId(woodTypes[0].id);
    }
  }, [woodTypes, selectedWoodTypeId]);

  useEffect(() => {
    if (designs && designs.length > 0) {
      const hasCurrentDesign = designs.some(d => d.id === selectedDesignId);
      if (!hasCurrentDesign) {
        setSelectedDesignId(designs[0].id);
        onDesignChange?.(designs[0].name);
      }
    }
  }, [designs, selectedDesignId, onDesignChange]);

  const selectedDesignData = designs?.find(d => d.id === selectedDesignId);
  const selectedWoodTypeData = woodTypes?.find(w => w.id === selectedWoodTypeId);
  const selectedRalData = ralColors?.find(r => r.ral_code === ralColor);

  const displayRal = customRal || ralColor;

  const handleMaterialChange = (newMaterial: MaterialType) => {
    setMaterial(newMaterial);
    setSelectedDesignId("");
    onMaterialChange?.(newMaterial);
  };

  const handleDesignChange = (designId: string) => {
    setSelectedDesignId(designId);
    const designData = designs?.find(d => d.id === designId);
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

    if (!selectedDesignData) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie ein Design aus.",
        variant: "destructive"
      });
      return;
    }

    const area = (w * h) / 10000;
    let basePrice = selectedDesignData.base_price;

    if (material === "wood" && selectedWoodTypeData) {
      basePrice += selectedWoodTypeData.price_addon;
    }

    const price = Math.round(basePrice * area);
    const lamellaCount = Math.floor(h / 100);
    const spacing = 5;
    const frameThickness = 70;

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

  const handleSubmitQuote = async () => {
    if (!customerName || !customerEmail) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie Ihren Namen und Ihre E-Mail-Adresse ein.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await supabase.functions.invoke('send-quote-email', {
        body: {
          customerName,
          customerEmail,
          customerPhone: customerPhone || undefined,
          material: material === "aluminum" ? "Aluminium" : "Holz",
          designName: selectedDesignData?.name || "",
          woodType: material === "wood" ? selectedWoodTypeData?.name : undefined,
          ralColor: displayRal,
          width: parseFloat(width),
          height: parseFloat(height),
          price: calculatedPrice,
          technicalDetails: measurements
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Anfrage gesendet!",
        description: "Wir werden uns schnellstmöglich bei Ihnen melden."
      });

      setShowSubmitModal(false);
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
    } catch (error) {
      console.error("Error sending quote:", error);
      toast({
        title: "Fehler",
        description: "Beim Senden ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section id="konfigurator" className="py-16 bg-muted/30">
        <div className="container px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Lade Konfiguration...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
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
                  <RadioGroup value={material} onValueChange={(v) => handleMaterialChange(v as MaterialType)}>
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

              {material === "wood" && woodTypes && woodTypes.length > 0 && (
                <Card className="md:col-span-2 shadow-[var(--shadow-elegant)]">
                  <CardHeader>
                    <CardTitle>2. Holzart wählen</CardTitle>
                    <CardDescription>Wählen Sie die gewünschte Holzart für Ihre Fensterläden</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={selectedWoodTypeId} onValueChange={setSelectedWoodTypeId}>
                      <div className="grid md:grid-cols-4 gap-4">
                        {woodTypes.map((wood) => (
                          <div key={wood.id} className="relative">
                            <RadioGroupItem value={wood.id} id={wood.id} className="peer sr-only" />
                            <Label
                              htmlFor={wood.id}
                              className="flex flex-col items-start rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all h-full"
                            >
                              <span className="font-semibold mb-1">{wood.name}</span>
                              <span className="text-xs text-muted-foreground mb-2">{wood.description}</span>
                              {wood.price_addon > 0 && (
                                <span className="text-xs text-primary mt-auto">+€ {wood.price_addon}/m²</span>
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>

                    {selectedWoodTypeData && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <div className="font-semibold mb-1">Gewählte Holzart: {selectedWoodTypeData.name}</div>
                        <div className="text-sm text-muted-foreground">{selectedWoodTypeData.description}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card className="md:col-span-2 shadow-[var(--shadow-elegant)]">
                <CardHeader>
                  <CardTitle>{material === "wood" ? "3" : "2"}. Design auswählen</CardTitle>
                  <CardDescription>
                    Wählen Sie aus {designs?.length || 0} verschiedenen {material === "aluminum" ? "Aluminium" : "Holz"}-Designs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="w-full whitespace-nowrap rounded-lg border">
                    <div className="flex gap-4 p-4">
                      {designs?.map((designOption) => (
                        <div key={designOption.id} className="flex-shrink-0">
                          <input
                            type="radio"
                            id={designOption.id}
                            name="design"
                            value={designOption.id}
                            checked={selectedDesignId === designOption.id}
                            onChange={(e) => handleDesignChange(e.target.value)}
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
                                ab € {designOption.base_price}/m²
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>

                  {selectedDesignData && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                      <div className="font-semibold mb-1">Gewählt: {selectedDesignData.name}</div>
                      <div className="text-sm text-muted-foreground">{selectedDesignData.description}</div>
                    </div>
                  )}
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
                        {ralColors?.map((color) => (
                          <div key={color.ral_code} className="relative">
                            <RadioGroupItem value={color.ral_code} id={color.ral_code} className="peer sr-only" />
                            <Label
                              htmlFor={color.ral_code}
                              className="flex flex-col items-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                            >
                              <div
                                className="w-full h-12 rounded mb-2 border border-border"
                                style={{ backgroundColor: color.hex_color }}
                              />
                              <span className="text-sm font-medium text-center">RAL {color.ral_code}</span>
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
                          style={{ backgroundColor: selectedRalData.hex_color }}
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
                        Ihr Preis: € {calculatedPrice.toLocaleString('de-DE')},-
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

                      <Button
                        onClick={() => setShowSubmitModal(true)}
                        className="w-full mt-6"
                        size="lg"
                        variant="default"
                      >
                        <Send className="mr-2 h-5 w-5" />
                        Unverbindlich anfragen
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Submit Quote Modal */}
      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Anfrage absenden</DialogTitle>
            <DialogDescription>
              Geben Sie Ihre Kontaktdaten ein und wir melden uns schnellstmöglich bei Ihnen.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted/50 rounded-lg mb-4">
              <div className="text-sm text-muted-foreground mb-1">Ihre Konfiguration:</div>
              <div className="font-semibold">{selectedDesignData?.name} ({material === "aluminum" ? "Aluminium" : "Holz"})</div>
              <div className="text-primary font-bold text-lg">€ {calculatedPrice?.toLocaleString('de-DE')},-</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-name">Name *</Label>
              <Input
                id="customer-name"
                placeholder="Ihr Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-email">E-Mail *</Label>
              <Input
                id="customer-email"
                type="email"
                placeholder="ihre@email.at"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-phone">Telefon (optional)</Label>
              <Input
                id="customer-phone"
                type="tel"
                placeholder="+43 ..."
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowSubmitModal(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleSubmitQuote}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Absenden
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
