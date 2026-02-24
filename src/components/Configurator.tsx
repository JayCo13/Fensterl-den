import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, Loader2, Send, X, Info, Eye } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import beschlaegeVerzinkt from "@/assets/standar-verzinkt-konfigurator-blank.jpg";
import { FadeIn } from "./FadeIn";
import { useToast } from "@/hooks/use-toast";
import { useWoodTypes, useDesigns, useRalColors, type WoodType, type Design, type RalColor } from "@/hooks/useConfigurator";
import { supabase } from "@/integrations/supabase/client";
import { getRalHexColor, getRalName, isValidRalCode } from "@/lib/ralColors";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "./ui/textarea";

const ScrollHintEffect = () => {
  useEffect(() => {
    // Target the viewport element inside the ScrollArea
    const scrollContainer = document.querySelector('[id="design-scroll-area"] [data-radix-scroll-area-viewport]') as HTMLElement;

    if (!scrollContainer) return;

    let animationFrameId: number;
    let timerId: NodeJS.Timeout;
    let isStopped = false;

    const stopAnimation = () => {
      isStopped = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (timerId) clearTimeout(timerId);
    };

    const startScroll = () => {
      if (isStopped) return;

      const start = scrollContainer.scrollLeft;
      const target = start + 100; // Scroll 100px to the right
      const duration = 7000;
      const startTime = performance.now();

      const animateScroll = (currentTime: number) => {
        if (isStopped) return;

        const elapsed = currentTime - startTime;

        if (elapsed < duration) {
          const progress = elapsed / duration;
          // Gentle ease-out
          const easeProgress = 1 - Math.pow(1 - progress, 3);

          scrollContainer.scrollLeft = start + (target - start) * easeProgress;
          animationFrameId = requestAnimationFrame(animateScroll);
        }
      };

      animationFrameId = requestAnimationFrame(animateScroll);
    };

    // Add interaction listeners to stop animation immediately
    scrollContainer.addEventListener('touchstart', stopAnimation);
    scrollContainer.addEventListener('mousedown', stopAnimation);
    scrollContainer.addEventListener('wheel', stopAnimation);

    // Start after entrance animation (approx 1.5s delay)
    timerId = setTimeout(startScroll, 1500);

    return () => {
      stopAnimation();
      scrollContainer.removeEventListener('touchstart', stopAnimation);
      scrollContainer.removeEventListener('mousedown', stopAnimation);
      scrollContainer.removeEventListener('wheel', stopAnimation);
    };
  }, []);

  return null;
};

type MaterialType = "aluminum" | "wood";

interface ConfiguratorProps {
  onMaterialChange?: (material: "aluminum" | "wood") => void;
  onDesignChange?: (designName: string) => void;
  onWoodTypeChange?: (woodTypeName: string) => void;
  onRalColorChange?: (ralColor: string) => void;
}

export const Configurator = ({ onMaterialChange, onDesignChange, onWoodTypeChange, onRalColorChange }: ConfiguratorProps) => {
  const [shutterType, setShutterType] = useState<"klappladen" | "schiebeladen">("klappladen");
  const [material, setMaterial] = useState<MaterialType>("wood");
  const [selectedWoodTypeId, setSelectedWoodTypeId] = useState<string>("");
  const [selectedDesignId, setSelectedDesignId] = useState<string>("");
  const [ralColor, setRalColor] = useState<string>("9016");
  const [customRal, setCustomRal] = useState<string>("");
  const [rohUnbehandelt, setRohUnbehandelt] = useState<boolean>(false);
  const [showRalInfo, setShowRalInfo] = useState<boolean>(false);
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [measurements, setMeasurements] = useState<any>(null);

  // New design options state
  const [ausstellerEnabled, setAusstellerEnabled] = useState<boolean>(false);
  const [kombinationEnabled, setKombinationEnabled] = useState<boolean>(false);
  const [kombinationDesign1, setKombinationDesign1] = useState<string>("");
  const [kombinationDesign2, setKombinationDesign2] = useState<string>("");
  const [kombinationAufteilung, setKombinationAufteilung] = useState<string>("");
  const [ausnehmungEnabled, setAusnehmungEnabled] = useState<boolean>(false);
  const [ausnehmungText, setAusnehmungText] = useState<string>("");
  const [ausnehmungFiles, setAusnehmungFiles] = useState<File[]>([]);
  const [designDialogOpen, setDesignDialogOpen] = useState<Design | null>(null);
  const [showDesignInfo, setShowDesignInfo] = useState<boolean>(true);


  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showDesignInfo) {
      timer = setTimeout(() => {
        setShowDesignInfo(false);
      }, 10000); // 10 seconds
    }
    return () => clearTimeout(timer);
  }, [showDesignInfo]);

  // Color system state
  const [colorSystem, setColorSystem] = useState<"ral" | "ncs" | "lasur" | "roh">("ral");
  const [customNcs, setCustomNcs] = useState<string>("");
  const [ncsPreviewColor, setNcsPreviewColor] = useState<string>("#6B8E9B");

  // NCS to approximate hex color converter
  useEffect(() => {
    const ncsToApproxHex = (ncs: string): string | null => {
      // Parse NCS code like "S 1050-Y90R" or "1050-Y90R"
      const match = ncs.trim().toUpperCase().match(/S?\s*(\d{2})(\d{2})-(N|[YRGB](?:\d{2}[YRGB])?)/);
      if (!match) return null;

      const blackness = parseInt(match[1]) / 100; // 0-1
      const chromaticness = parseInt(match[2]) / 100; // 0-1
      const hueStr = match[3];

      // Map hue string to angle (0-360)
      let hue = 0;
      if (hueStr === "N") {
        // Neutral (gray)
        const lightness = Math.round(255 * (1 - blackness));
        const hex = lightness.toString(16).padStart(2, '0');
        return `#${hex}${hex}${hex}`;
      }

      // Parse hue like Y, Y90R, R, R80B, B, B20G, G, G40Y
      const hueMap: Record<string, number> = { Y: 60, R: 0, B: 240, G: 120 };
      const hueMatch = hueStr.match(/^([YRGB])(\d{2})([YRGB])$/);
      if (hueMatch) {
        const from = hueMap[hueMatch[1]];
        const pct = parseInt(hueMatch[2]) / 100;
        const to = hueMap[hueMatch[3]];
        // Handle wrap-around (e.g. Y to R goes 60 -> 0, but via 360)
        let diff = to - from;
        if (hueMatch[1] === 'Y' && hueMatch[3] === 'R') diff = -60;
        if (hueMatch[1] === 'R' && hueMatch[3] === 'B') diff = 240;
        if (hueMatch[1] === 'B' && hueMatch[3] === 'G') diff = -120;
        if (hueMatch[1] === 'G' && hueMatch[3] === 'Y') diff = -60;
        hue = (from + diff * pct + 360) % 360;
      } else if (hueMap[hueStr]) {
        hue = hueMap[hueStr];
      }

      // Convert NCS to HSL then to hex
      const saturation = Math.min(chromaticness * 1.5, 1);
      const lightness = Math.max(0.1, (1 - blackness) * (1 - chromaticness * 0.3));

      // HSL to RGB
      const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
      const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
      const m = lightness - c / 2;
      let r = 0, g = 0, b = 0;
      if (hue < 60) { r = c; g = x; }
      else if (hue < 120) { r = x; g = c; }
      else if (hue < 180) { g = c; b = x; }
      else if (hue < 240) { g = x; b = c; }
      else if (hue < 300) { r = x; b = c; }
      else { r = c; b = x; }

      const toHex = (v: number) => Math.round(Math.min(255, Math.max(0, (v + m) * 255))).toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    if (customNcs) {
      const hex = ncsToApproxHex(customNcs);
      if (hex) setNcsPreviewColor(hex);
    }
  }, [customNcs]);

  // Beschläge (Hardware) state
  const [beschlaegeMode, setBeschlaegeMode] = useState<"none" | "anschlagsart" | "einzelteile" | null>(null); // null = not selected
  const [beschlaegeColor, setBeschlaegeColor] = useState<string>("9016");
  const [beschlaegeCustomRal, setBeschlaegeCustomRal] = useState<string>("");
  const [beschlaegeRohUnbehandelt, setBeschlaegeRohUnbehandelt] = useState<boolean>(false);
  const [showBeschlaegeRalInfo, setShowBeschlaegeRalInfo] = useState<boolean>(false);

  // Anschlagsart state
  const [anschlagsart, setAnschlagsart] = useState<string>("");
  const [montagerahmenMaterial, setMontagerahmenMaterial] = useState<"" | "aluminium" | "holz">("");

  // Einzelteile state
  const [einzelteileQuantities, setEinzelteileQuantities] = useState<Record<string, number>>({});

  // Flügel (Wings) and additional options
  const [fluegelOption, setFluegelOption] = useState<string>("");
  const [anzahlFenster, setAnzahlFenster] = useState<string>("1");
  const [sonderwuensche, setSonderwuensche] = useState<string>("");

  // Modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Photo upload state
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const { toast } = useToast();

  // Fetch data from Supabase
  const { data: woodTypes, isLoading: woodTypesLoading } = useWoodTypes();
  const { data: designs, isLoading: designsLoading } = useDesigns(material);
  const { data: ralColors, isLoading: ralColorsLoading } = useRalColors(true);

  const isLoading = woodTypesLoading || designsLoading || ralColorsLoading;

  // Helper: check if selected design is Figur 7 or 7G
  const selectedDesignNameLower = designs?.find(d => d.id === selectedDesignId)?.name?.toLowerCase() || "";
  const isFigur7Selected = selectedDesignNameLower.includes("figur 7") && !selectedDesignNameLower.includes("7g");
  const isFigur7GSelected = selectedDesignNameLower.includes("7g");
  const isFigur7Or7GSelected = isFigur7Selected || isFigur7GSelected;

  // Image helpers
  const getWoodImage = (woodName: string) => {
    const name = woodName.toLowerCase();
    if (name.includes("fichte")) return "/configurator-assets/Fichte.jpg";
    if (name.includes("kiefer")) return "/configurator-assets/Kiefer.jpg";
    if (name.includes("lärche")) return "/configurator-assets/Lärche.jpg";
    if (name.includes("meranti")) return "/configurator-assets/Meranti.jpg";
    return "/configurator-assets/Holz Fensterladen.png";
  };

  const getDesignImage = (designName: string, material: MaterialType) => {
    return `/configurator-assets/${designName} - preview.png`;
  };

  const getDesignDetailsImage = (designName: string, material: MaterialType) => {
    return `/configurator-assets/${designName} - details.png`;
  };
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

  // Notify parent of wood type changes
  useEffect(() => {
    if (selectedWoodTypeId && woodTypes) {
      const woodType = woodTypes.find(w => w.id === selectedWoodTypeId);
      if (woodType) {
        onWoodTypeChange?.(woodType.name);
      }
    }
  }, [selectedWoodTypeId, woodTypes, onWoodTypeChange]);

  // Notify parent of RAL color changes
  useEffect(() => {
    const finalRal = customRal || ralColor;
    onRalColorChange?.(finalRal);
  }, [ralColor, customRal, onRalColorChange]);

  const selectedDesignData = designs?.find(d => d.id === selectedDesignId);
  const selectedWoodTypeData = woodTypes?.find(w => w.id === selectedWoodTypeId);
  const selectedRalData = ralColors?.find(r => r.ral_code === ralColor);

  const displayRal = customRal || ralColor;

  // Check if Aussteller and Figurkombination are available for the selected design
  // They are NOT available for Figur 7 and Figur 7G
  const isAusstellerAndKombinationDisabled = () => {
    const designName = selectedDesignData?.name?.toLowerCase() || "";
    return designName.includes("figur 7") || designName.includes("figur 7g") ||
      designName === "7" || designName === "7g";
  };

  const handleMaterialChange = (newMaterial: MaterialType) => {
    setMaterial(newMaterial);
    setSelectedDesignId("");
    setAusstellerEnabled(false);
    setKombinationDesign1("");
    setKombinationDesign2("");
    onMaterialChange?.(newMaterial);
  };

  const handleDesignChange = (designId: string) => {
    const designData = designs?.find(d => d.id === designId);
    const designName = designData?.name?.toLowerCase() || "";
    const isFigur7 = designName.includes("figur 7") && !designName.includes("7g");
    const isFigur7G = designName.includes("figur 7g") || designName === "7g";
    const isFigur7Or7G = isFigur7 || isFigur7G;

    // Helper to check if a design ID is Figur 7 or 7G
    const checkIsFigur7Or7G = (id: string) => {
      const design = designs?.find(d => d.id === id);
      const name = design?.name?.toLowerCase() || "";
      return (name.includes("figur 7") && !name.includes("7g")) || name.includes("7g") || name === "7g";
    };

    const checkIsFigur7 = (id: string) => {
      const design = designs?.find(d => d.id === id);
      const name = design?.name?.toLowerCase() || "";
      return name.includes("figur 7") && !name.includes("7g");
    };

    const checkIsFigur7G = (id: string) => {
      const design = designs?.find(d => d.id === id);
      const name = design?.name?.toLowerCase() || "";
      return name.includes("7g") || name === "7g";
    };

    // If Aussteller is enabled, handle combination logic
    if (ausstellerEnabled) {
      // Check if clicking an already selected design (Deselection Logic)
      if (kombinationDesign1 === designId) {
        // Deselecting #1: Move #2 to #1 if it exists
        setKombinationDesign1(kombinationDesign2);
        setKombinationDesign2("");
        return;
      }
      if (kombinationDesign2 === designId) {
        // Deselecting #2: Just clear #2
        setKombinationDesign2("");
        return;
      }

      // Check if trying to combine 7 with 7G (not allowed)
      const wouldCombine7And7G = (isFigur7 && checkIsFigur7G(kombinationDesign1)) ||
        (isFigur7G && checkIsFigur7(kombinationDesign1)) ||
        (isFigur7 && checkIsFigur7G(kombinationDesign2)) ||
        (isFigur7G && checkIsFigur7(kombinationDesign2));

      if (wouldCombine7And7G) {
        // Don't allow combining 7 with 7G
        return;
      }

      // Fill first empty slot, or replace second if both filled
      if (!kombinationDesign1) {
        setKombinationDesign1(designId);
      } else if (!kombinationDesign2) {
        // Double check the combination wouldn't be 7+7G
        if ((isFigur7 && checkIsFigur7G(kombinationDesign1)) ||
          (isFigur7G && checkIsFigur7(kombinationDesign1))) {
          return; // Not allowed
        }
        setKombinationDesign2(designId);
      } else {
        // Both filled, replace the second one (still check for 7+7G)
        if ((isFigur7 && checkIsFigur7G(kombinationDesign1)) ||
          (isFigur7G && checkIsFigur7(kombinationDesign1))) {
          return; // Not allowed
        }
        setKombinationDesign2(designId);
      }
      return; // Don't change main selection when adding to combination
    }

    // Normal behavior when Aussteller is not enabled
    setSelectedDesignId(designId);

    // Auto-reset incompatible options when switching designs
    if (isFigur7Or7G) {
      // Switching to 7/7G: disable Kombination & Aussteller
      setKombinationEnabled(false);
      setKombinationDesign1("");
      setKombinationDesign2("");
      setAusstellerEnabled(false);
    } else {
      // Switching away from 7/7G: disable Ausnehmung
      setAusnehmungEnabled(false);
      setAusnehmungText("");
      setAusnehmungFiles([]);
    }

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
      title: "Konfiguration beendet",
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
          // System Typ
          shutterType: shutterType === "klappladen" ? "Klappladen" : shutterType === "schiebeladen" ? "Schiebeladen" : "Falt-Schiebeladen",
          // Material & Design
          material: material === "aluminum" ? "Aluminium" : "Holz",
          designName: selectedDesignData?.name || "",
          woodType: material === "wood" ? selectedWoodTypeData?.name : undefined,
          // Aussteller / Kombinationen
          ausstellerEnabled,
          kombinationDesign1: ausstellerEnabled ? designs?.find(d => d.id === kombinationDesign1)?.name : undefined,
          kombinationDesign2: ausstellerEnabled ? designs?.find(d => d.id === kombinationDesign2)?.name : undefined,
          kombinationAufteilung: kombinationEnabled && kombinationAufteilung ? kombinationAufteilung : undefined,
          // Farbe
          ralColor: rohUnbehandelt ? "Roh / Unbehandelt" : `RAL ${displayRal}`,
          rohUnbehandelt,
          // Beschläge
          beschlaegeMode,
          beschlaegeColor: beschlaegeMode && beschlaegeMode !== "none"
            ? (beschlaegeRohUnbehandelt ? "Standard verzinkt" : `RAL ${beschlaegeCustomRal || beschlaegeColor}`)
            : undefined,
          anschlagsart: beschlaegeMode === "anschlagsart" ? anschlagsart : undefined,
          montagerahmenMaterial: beschlaegeMode === "anschlagsart" && montagerahmenMaterial ? montagerahmenMaterial : undefined,
          einzelteile: beschlaegeMode === "einzelteile" ? einzelteileQuantities : undefined,
          // Fenster
          width: parseFloat(width),
          height: parseFloat(height),
          fluegelOption,
          anzahlFenster: parseInt(anzahlFenster) || 1,
          // Sonderwünsche
          sonderwuensche: sonderwuensche || undefined,
          // Preis & Details
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
      <section id="konfigurator" className="py-8 md:py-16 bg-muted/30 overflow-hidden w-full">
        <div className="container px-4 mx-auto max-w-full md:max-w-5xl overflow-hidden">
          <div className="w-full">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 px-2">
                Konfigurator
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground mt-4 max-w-2xl mx-auto">
                Stellen Sie jetzt in nur wenigen Schritten Ihren individuellen Fensterladen zusammen und fordern Sie Ihr Angebot dazu an.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full max-w-full">

              <FadeIn className="md:col-span-2" delay={0}>
                <Card className="shadow-[var(--shadow-elegant)] w-full overflow-hidden">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-lg md:text-2xl">1. Typ wählen</CardTitle>
                    <CardDescription className="text-sm md:text-base">Wählen Sie den gewünschten Fensterladentyp</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                    <RadioGroup value={shutterType} onValueChange={(v) => setShutterType(v as any)} className="w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full">
                        {/* Klappladen */}
                        <div className="relative w-full">
                          <RadioGroupItem value="klappladen" id="klappladen" className="peer sr-only" />
                          <Label
                            htmlFor="klappladen"
                            className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-3 md:p-4 peer-data-[state=checked]:border-primary cursor-pointer transition-all duration-300 w-full h-full hover:border-primary/50"
                          >
                            <div className="w-full h-24 md:h-32 bg-muted rounded mb-3 flex items-center justify-center p-2">
                              <img src="/configurator-assets/Klappladen-Skizze.png" alt="Klappladen Skizze" className="w-full h-full object-contain mix-blend-multiply" />
                            </div>
                            <span className="font-semibold text-base md:text-lg">Klappladen</span>
                          </Label>
                        </div>
                        {/* Schiebeladen - Greyed out / Coming soon */}
                        <div className="relative w-full">
                          <div
                            className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-3 md:p-4 w-full h-full opacity-50 cursor-not-allowed relative"
                          >
                            <div className="absolute top-2 right-2 bg-muted-foreground/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full z-10">Bald verfügbar</div>
                            <div className="w-full h-24 md:h-32 bg-muted rounded mb-3 flex items-center justify-center p-2">
                              <img src="/configurator-assets/Schiebeladen-Skizze.png" alt="Schiebeladen Skizze" className="w-full h-full object-contain mix-blend-multiply" />
                            </div>
                            <span className="font-semibold text-base md:text-lg">Schiebeladen</span>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </FadeIn>

              <FadeIn className="md:col-span-2" delay={100}>
                <Card className="shadow-[var(--shadow-elegant)] w-full overflow-hidden">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-lg md:text-2xl">2. Material wählen</CardTitle>
                    <CardDescription className="text-sm md:text-base">Wählen Sie zwischen Aluminium und Holz</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                    <RadioGroup value={material} onValueChange={(v) => handleMaterialChange(v as MaterialType)} className="w-full">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full">
                        <div className="relative w-full group">
                          <RadioGroupItem value="aluminum" id="aluminum" className="peer sr-only" />
                          <Label
                            htmlFor="aluminum"
                            className="flex flex-col items-center justify-between rounded-xl border-2 border-transparent bg-muted/40 p-4 md:p-6 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all duration-300 w-full hover:shadow-md hover:border-primary/40 h-full"
                          >
                            <img
                              src="/configurator-assets/Aluminium Fensterladen.png"
                              alt="Aluminium"
                              className="w-full h-auto max-h-48 md:max-h-64 object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-105 mb-4"
                            />
                            <span className="font-semibold text-lg md:text-xl">Aluminium</span>
                          </Label>
                        </div>
                        <div className="relative w-full group">
                          <RadioGroupItem value="wood" id="wood" className="peer sr-only" />
                          <Label
                            htmlFor="wood"
                            className="flex flex-col items-center justify-between rounded-xl border-2 border-transparent bg-muted/40 p-4 md:p-6 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all duration-300 w-full hover:shadow-md hover:border-primary/40 h-full"
                          >
                            <img
                              src="/configurator-assets/Holz Fensterladen.png"
                              alt="Holz"
                              className="w-full h-auto max-h-48 md:max-h-64 object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-105 mb-4"
                            />
                            <span className="font-semibold text-lg md:text-xl">Holz</span>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Auto-scroll effect for design section on mobile */}
              <ScrollHintEffect />

              {material === "wood" && woodTypes && woodTypes.length > 0 && (
                <FadeIn className="md:col-span-2" delay={150}>
                  <Card className="shadow-[var(--shadow-elegant)] w-full overflow-hidden">
                    <CardHeader className="p-4 md:p-6">
                      <CardTitle className="text-lg md:text-2xl">2.1 Holzart wählen</CardTitle>
                      <CardDescription className="text-sm md:text-base">Wählen Sie die gewünschte Holzart für Ihre Fensterläden</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                      <RadioGroup value={selectedWoodTypeId} onValueChange={setSelectedWoodTypeId} className="w-full">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 w-full">
                          {woodTypes.map((wood) => (
                            <div key={wood.id} className="relative w-full">
                              <RadioGroupItem value={wood.id} id={wood.id} className="peer sr-only" />
                              <Label
                                htmlFor={wood.id}
                                className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-3 md:p-4 peer-data-[state=checked]:border-primary cursor-pointer transition-all duration-300 h-full w-full"
                              >
                                <img
                                  src={getWoodImage(wood.name)}
                                  alt={wood.name}
                                  className="w-full h-32 md:h-48 object-contain rounded mb-3"
                                />
                                <span className="font-semibold mb-2 text-base text-center">{wood.name}</span>
                                {wood.price_addon > 0 && (
                                  <span className="text-xs text-primary mt-auto"></span>
                                )}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>

                      {selectedWoodTypeData && (
                        <div className="mt-4 p-4 md:p-5 bg-muted/30 border border-primary/10 rounded-xl shadow-sm">
                          <div className="font-semibold text-base md:text-lg mb-2 text-primary">Gewählte Holzart: {selectedWoodTypeData.name}</div>
                          <div className="text-sm md:text-base text-muted-foreground leading-relaxed">{selectedWoodTypeData.description}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </FadeIn>
              )}

              <FadeIn className="md:col-span-2" delay={200}>
                <Card className="shadow-[var(--shadow-elegant)] w-full overflow-hidden">
                  <CardHeader className="p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div>
                      <CardTitle className="text-lg md:text-2xl">3. Design auswählen</CardTitle>
                      <CardDescription className="text-sm md:text-base">
                        Wählen Sie ihr gewünschtes Design
                      </CardDescription>
                    </div>

                    <div
                      className="flex items-center self-start sm:self-auto shrink-0 gap-2 bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted p-2 px-3 md:px-4 rounded-lg cursor-pointer transition-colors border border-border/50"
                      onClick={() => setShowDesignInfo(!showDesignInfo)}
                    >
                      <Eye className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      <span className="text-[13px] md:text-sm font-medium">Details ansehen</span>
                    </div>
                  </CardHeader>

                  {/* Expandable Info Text */}
                  {showDesignInfo && (
                    <div className="px-4 md:px-6 pb-2">
                      <div className="text-red-600 font-bold text-sm md:text-base flex gap-2 items-center">
                        <Eye className="h-5 w-5 shrink-0" />
                        <p>Für mehr Informationen und technische Zeichnungen, klicken Sie einfach auf das jeweilige Design.</p>
                      </div>
                    </div>
                  )}

                  <CardContent className="p-4 md:p-6 pt-0 md:pt-0 overflow-hidden space-y-4">

                    {/* Design Selection */}
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">
                        {ausstellerEnabled ? "Referenzdesign auswählen" : "Design auswählen"}
                      </Label>
                      <ScrollArea id="design-scroll-area" type="always" className="w-full whitespace-nowrap rounded-lg border max-w-full pb-3">
                        <div className="flex gap-3 md:gap-4 p-3 md:p-4 w-max">
                          {designs?.map((designOption) => {
                            // Check if this design is selected in combination
                            const isKombination1 = kombinationDesign1 === designOption.id;
                            const isKombination2 = kombinationDesign2 === designOption.id;
                            const isInKombination = kombinationEnabled && (isKombination1 || isKombination2);
                            const isSelected = selectedDesignId === designOption.id && !kombinationEnabled;

                            return (
                              <div key={designOption.id} className="flex-shrink-0">
                                <div
                                  role="radio"
                                  aria-checked={isSelected}
                                  tabIndex={0}
                                  className={`flex flex-col w-36 md:w-48 rounded-lg border-2 transition-all duration-300 overflow-hidden cursor-pointer outline-none h-full ${isInKombination
                                    ? 'border-primary bg-primary/5 ring-0 shadow-md scale-[1.02]'
                                    : isSelected
                                      ? 'border-primary bg-popover shadow-md ring-0'
                                      : 'border-muted bg-popover hover:border-primary/50 hover:shadow-sm'
                                    }`}
                                  onClick={() => {
                                    if (kombinationEnabled) {
                                      // Don't allow Figur 7 or 7G in combination
                                      const clickedName = designOption.name.toLowerCase();
                                      const is7or7G = (clickedName.includes("figur 7") && !clickedName.includes("7g")) || clickedName.includes("7g");
                                      if (is7or7G) {
                                        toast({
                                          title: "Nicht kombinierbar",
                                          description: "Figur 7 und 7G können nicht in einer Designkombination verwendet werden.",
                                        });
                                        return;
                                      }

                                      // When Kombination is enabled, clicking fills the slots
                                      if (kombinationDesign1 === designOption.id) {
                                        // Deselect slot 1: move slot 2 to slot 1
                                        setKombinationDesign1(kombinationDesign2);
                                        setKombinationDesign2("");
                                      } else if (kombinationDesign2 === designOption.id) {
                                        // Deselect slot 2
                                        setKombinationDesign2("");
                                      } else if (!kombinationDesign1) {
                                        setKombinationDesign1(designOption.id);
                                      } else if (!kombinationDesign2) {
                                        setKombinationDesign2(designOption.id);
                                      } else {
                                        // Both filled, replace slot 2
                                        setKombinationDesign2(designOption.id);
                                      }
                                    } else {
                                      handleDesignChange(designOption.id);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      if (kombinationEnabled) {
                                        if (!kombinationDesign2) {
                                          setKombinationDesign2(designOption.id);
                                        } else {
                                          setKombinationDesign2(designOption.id);
                                        }
                                      } else {
                                        handleDesignChange(designOption.id);
                                      }
                                    }
                                  }}
                                >
                                  <div className="relative h-28 md:h-40 bg-muted">
                                    <img
                                      src={getDesignImage(designOption.name, material)}
                                      alt={designOption.name}
                                      className="w-full h-full object-contain p-1"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                                      <div className="p-2 md:p-3 text-white w-full">
                                        <div className="font-semibold text-sm md:text-base text-center">{designOption.name}</div>
                                      </div>
                                    </div>
                                    {/* Details Button */}
                                    <button
                                      type="button"
                                      className="absolute top-2 right-2 z-10 flex items-center justify-center w-7 h-7 bg-white/90 hover:bg-white text-primary rounded-full shadow-md transition-all hover:scale-110"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDesignDialogOpen(designOption);
                                      }}
                                      title="Details anzeigen"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>
                                    {/* Combination Badge */}
                                    {isKombination1 && (
                                      <div className="absolute top-2 left-2 z-10 flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in duration-300">
                                        1
                                      </div>
                                    )}
                                    {isKombination2 && (
                                      <div className="absolute top-2 left-2 z-10 flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in duration-300">
                                        2
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <ScrollBar
                          orientation="horizontal"
                          className="h-2.5 md:h-3 mt-3 bg-muted/40 rounded-full border border-primary/20 p-[2px] transition-all shadow-inner [&>div]:bg-primary/80 [&>div]:hover:bg-primary [&>div]:shadow-[0_0_10px_hsl(var(--primary)/0.6)] [&>div]:animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
                        />
                      </ScrollArea>
                      {/* Desktop Scroll Hint */}
                      <div className="hidden md:flex items-center justify-center gap-2 text-xs text-muted-foreground mt-2 opacity-70">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="7" /><path d="M12 6v4" /></svg>
                        Gedrückt halten, um nach rechts zu wischen
                      </div>
                    </div>

                    {/* Design Options: Conditional based on Figur 7/7G selection */}
                    <div className="space-y-3 mt-4">

                      {/* A: Designkombination – active for all EXCEPT Figur 7 and 7G */}
                      <div className={`p-4 rounded-lg border transition-all ${isFigur7Or7GSelected ? 'opacity-50 bg-muted/20 border-muted' : kombinationEnabled ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-muted'}`}>
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="kombination"
                            checked={kombinationEnabled}
                            disabled={isFigur7Or7GSelected}
                            onCheckedChange={(checked) => {
                              setKombinationEnabled(checked === true);
                              if (checked) {
                                // Auto-fill the currently selected design as Design 1 (Oben)
                                if (selectedDesignId) {
                                  setKombinationDesign1(selectedDesignId);
                                }
                                setKombinationDesign2("");
                              } else {
                                setKombinationDesign1("");
                                setKombinationDesign2("");
                              }
                            }}
                          />
                          <div>
                            <Label htmlFor="kombination" className="text-sm font-semibold cursor-pointer">
                              Designkombination
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              Kombinieren Sie verschiedene Designs.
                            </p>
                            {isFigur7Or7GSelected && (
                              <p className="text-xs text-destructive/70 mt-1 italic">Nicht verfügbar für Figur 7 / 7G</p>
                            )}
                          </div>
                        </div>
                        {kombinationEnabled && (
                          <div className="mt-3 pl-7 space-y-3">
                            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                              <div className="w-full md:flex-1 relative group">
                                <Label className="text-xs font-semibold mb-1.5 block text-foreground uppercase tracking-wider">Oben</Label>
                                <div className="relative">
                                  <select
                                    value={kombinationDesign1}
                                    onChange={(e) => setKombinationDesign1(e.target.value)}
                                    className="appearance-none w-full h-11 rounded-lg border border-input bg-background hover:bg-muted/50 px-4 py-2 pr-10 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 cursor-pointer shadow-sm"
                                  >
                                    <option value="">Figur wählen...</option>
                                    {designs?.filter(d => {
                                      const n = d.name.toLowerCase();
                                      return !(n.includes("figur 7") && !n.includes("7g")) && !n.includes("7g");
                                    }).map((d) => (
                                      <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                  </select>
                                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground group-hover:text-foreground transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                  </div>
                                </div>
                              </div>
                              <div className="hidden md:flex pt-6 items-center justify-center px-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
                                  +
                                </div>
                              </div>
                              <div className="w-full md:flex-1 relative group">
                                <Label className="text-xs font-semibold mb-1.5 block text-foreground uppercase tracking-wider">Unten</Label>
                                <div className="relative">
                                  <select
                                    value={kombinationDesign2}
                                    onChange={(e) => setKombinationDesign2(e.target.value)}
                                    className="appearance-none w-full h-11 rounded-lg border border-input bg-background hover:bg-muted/50 px-4 py-2 pr-10 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 cursor-pointer shadow-sm"
                                  >
                                    <option value="">Figur wählen...</option>
                                    {designs?.filter(d => {
                                      const n = d.name.toLowerCase();
                                      return !(n.includes("figur 7") && !n.includes("7g")) && !n.includes("7g");
                                    }).map((d) => (
                                      <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                  </select>
                                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground group-hover:text-foreground transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs mb-1.5 block font-medium text-foreground">Aufteilung <span className="text-muted-foreground font-normal">(optional)</span></Label>
                              <textarea
                                placeholder="z.B. 50% oben Lamellen, 50% unten Glatt..."
                                value={kombinationAufteilung}
                                onChange={(e) => setKombinationAufteilung(e.target.value)}
                                className="w-full min-h-[60px] p-3 rounded-lg border border-input text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all shadow-sm placeholder:text-muted-foreground/60"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* B: Aussteller – active for all EXCEPT Figur 7 and 7G */}
                      <div className={`p-4 rounded-lg border transition-all ${isFigur7Or7GSelected ? 'opacity-50 bg-muted/20 border-muted' : ausstellerEnabled ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-muted'}`}>
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="aussteller"
                            checked={ausstellerEnabled}
                            disabled={isFigur7Or7GSelected}
                            onCheckedChange={(checked) => setAusstellerEnabled(checked === true)}
                          />
                          <div>
                            <Label htmlFor="aussteller" className="text-sm font-semibold cursor-pointer">
                              Aussteller
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              Fensterläden mit Ausstellfunktion
                            </p>
                            {isFigur7Or7GSelected && (
                              <p className="text-xs text-destructive/70 mt-1 italic">Nicht verfügbar für Figur 7 / 7G</p>
                            )}
                          </div>
                        </div>
                        {ausstellerEnabled && (
                          <div className="mt-3 pl-7">
                            <div className="rounded-lg border border-input bg-white overflow-hidden max-w-[200px]">
                              <img
                                src="/configurator-assets/Aussteller.png"
                                alt="Aussteller Skizze"
                                className="w-full h-auto object-contain"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* C: Ausnehmung – ONLY for Figur 7 and 7G */}
                      <div className={`p-4 rounded-lg border transition-all ${!isFigur7Or7GSelected ? 'opacity-50 bg-muted/20 border-muted' : ausnehmungEnabled ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-muted'}`}>
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="ausnehmung"
                            checked={ausnehmungEnabled}
                            disabled={!isFigur7Or7GSelected}
                            onCheckedChange={(checked) => {
                              setAusnehmungEnabled(checked === true);
                              if (!checked) {
                                setAusnehmungText("");
                                setAusnehmungFiles([]);
                              }
                            }}
                          />
                          <div>
                            <Label htmlFor="ausnehmung" className="text-sm font-semibold cursor-pointer">
                              Ausnehmung
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              Individuelle Formen und Ausschnitte im Fensterladen
                            </p>
                            {!isFigur7Or7GSelected && (
                              <p className="text-xs text-destructive/70 mt-1 italic">Nur für Figur 7 / 7G verfügbar</p>
                            )}
                          </div>
                        </div>
                        {ausnehmungEnabled && (
                          <div className="mt-4 pl-0 md:pl-7">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                              {/* Left Column: Info & Image */}
                              <div className="space-y-4">
                                <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg border border-muted">
                                  Fügen Sie hier Ihre Skizze der Ausnehmung ein. Sollte diese keine Größenangaben o.ä. enthalten, schreiben Sie uns bitte so genau wie möglich, wie Sie sich Ihre Ausnehmung vorstellen und wie groß diese sein soll.
                                </p>
                                <div className="w-full rounded-lg border border-input bg-white overflow-hidden shadow-sm">
                                  <img
                                    src="/configurator-assets/Skizze - Ausnehmung.png"
                                    alt="Beispiel Skizze Ausnehmung"
                                    className="w-full h-auto object-contain"
                                  />
                                </div>
                              </div>

                              {/* Right Column: Upload & Textarea */}
                              <div className="flex flex-col gap-4">
                                {/* File Upload */}
                                <div>
                                  <Label className="text-md mb-1.5 block font-medium text-foreground">Skizze hochladen <span className="text-muted-foreground font-normal">(optional)</span></Label>
                                  <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-input rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors group">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground group-hover:text-primary transition-colors"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">Datei auswählen</p>
                                        <p className="text-[13px] text-muted-foreground">Bild oder PDF</p>
                                      </div>
                                    </div>
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*,.pdf"
                                      multiple
                                      onChange={(e) => {
                                        if (e.target.files) {
                                          setAusnehmungFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                                        }
                                      }}
                                    />
                                  </label>
                                  {ausnehmungFiles.length > 0 && (
                                    <div className="mt-2 space-y-1.5 max-h-[80px] overflow-y-auto pr-1 custom-scrollbar">
                                      {ausnehmungFiles.map((file, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 border border-border/50 px-2.5 py-1.5 rounded-md group hover:bg-muted/80 transition-colors">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                                          <span className="truncate flex-1 font-medium">{file.name}</span>
                                          <button
                                            type="button"
                                            onClick={() => setAusnehmungFiles(prev => prev.filter((_, i) => i !== idx))}
                                            className="text-muted-foreground hover:text-destructive shrink-0 opacity-70 hover:opacity-100 transition-opacity p-0.5"
                                          >
                                            <X className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Text Description */}
                                <div className="flex-1 flex flex-col">
                                  <Label className="text-md mb-1.5 block font-medium text-foreground">Beschreibung <span className="text-muted-foreground font-normal">(erforderlich bei keiner Skizze)</span></Label>
                                  <textarea
                                    placeholder="Gewünschte Form, Maße und Position der Ausnehmung..."
                                    value={ausnehmungText}
                                    onChange={(e) => setAusnehmungText(e.target.value)}
                                    className="w-full flex-1 min-h-[120px] p-3 rounded-lg border border-input text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all shadow-sm placeholder:text-muted-foreground/60"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selected Design Info */}
                    {selectedDesignData && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        {kombinationEnabled && (kombinationDesign1 || kombinationDesign2) ? (
                          <>
                            <div className="font-semibold mb-1">Gewählt:</div>
                            <div className="mt-2 text-sm text-primary font-medium">
                              + Kombination: {designs?.find(d => d.id === kombinationDesign1)?.name || "—"} + {designs?.find(d => d.id === kombinationDesign2)?.name || "—"}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="font-semibold mb-1">Gewählt: {selectedDesignData.name}</div>
                            <div className="text-sm text-muted-foreground">{selectedDesignData.description}</div>
                          </>
                        )}
                        {ausstellerEnabled && (
                          <div className="mt-1 text-sm text-primary font-medium">+ Aussteller</div>
                        )}
                        {ausnehmungEnabled && (
                          <div className="mt-1 text-sm text-primary font-medium">+ Ausnehmung</div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </FadeIn>

              <FadeIn className="md:col-span-2" delay={300}>
                <Card className="shadow-[var(--shadow-elegant)] w-full overflow-hidden">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-lg md:text-2xl">4. Farbe wählen</CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      Wählen Sie die gewünschte Oberflächenbehandlung
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 p-4 md:p-6 pt-0 md:pt-0">

                    {/* Color System Tabs */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => { setColorSystem("ral"); setRohUnbehandelt(false); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${colorSystem === "ral" ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}
                      >
                        RAL Farben
                      </button>
                      <button
                        type="button"
                        onClick={() => { setColorSystem("ncs"); setRohUnbehandelt(false); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${colorSystem === "ncs" ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}
                      >
                        NCS Farben
                      </button>
                      {material === "wood" && (
                        <>
                          <button
                            type="button"
                            onClick={() => { setColorSystem("lasur"); setRohUnbehandelt(false); setRalColor(""); setCustomRal(""); setCustomNcs(""); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${colorSystem === "lasur" ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}
                          >
                            Lasur
                          </button>
                          <button
                            type="button"
                            onClick={() => { setColorSystem("roh"); setRohUnbehandelt(true); setRalColor(""); setCustomRal(""); setCustomNcs(""); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${colorSystem === "roh" ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}
                          >
                            Roh / Unbehandelt
                          </button>
                        </>
                      )}
                    </div>

                    {/* RAL Tab Content */}
                    {colorSystem === "ral" && (
                      <div className="space-y-6 animate-in fade-in duration-200">
                        {/* RAL Classic Info Banner */}
                        <div className="flex items-start gap-2.5 p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-sm text-amber-800">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                          <span>Es können ausschließlich <strong>RAL Classic</strong> Farben verwendet werden.</span>
                        </div>
                        {/* Popular Colors */}
                        <div className="w-full">
                          <Label className="mb-3 block text-base font-semibold">Beliebte RAL-Farben</Label>
                          <RadioGroup value={ralColor} onValueChange={(v) => { setRalColor(v); setCustomRal(""); }} className="w-full">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full">
                              {ralColors?.map((color) => (
                                <div key={color.ral_code} className="relative w-full">
                                  <RadioGroupItem value={color.ral_code} id={color.ral_code} className="peer sr-only" />
                                  <Label
                                    htmlFor={color.ral_code}
                                    className="flex flex-col items-center rounded-lg border-2 border-muted bg-popover p-2 md:p-3 peer-data-[state=checked]:border-primary peer-data-[state=checked]:shadow-md cursor-pointer transition-all duration-300 w-full hover:border-primary/50"
                                  >
                                    <div
                                      className="w-full h-8 md:h-12 rounded mb-2 border border-border shadow-inner"
                                      style={{ backgroundColor: color.hex_color }}
                                    />
                                    <span className="text-xs md:text-sm font-medium text-center">RAL {color.ral_code}</span>
                                    <span className="text-[10px] md:text-xs text-muted-foreground text-center truncate w-full">{color.name}</span>
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Custom RAL Input with Info Popup */}
                        <div className="space-y-3 w-full">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="custom-ral" className="text-base font-semibold">RAL-Farbcode eingeben</Label>
                            <button
                              type="button"
                              onClick={() => setShowRalInfo(!showRalInfo)}
                              className="p-1 rounded-full hover:bg-muted transition-colors"
                              aria-label="Info zu RAL-Farben"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground hover:text-primary"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                            </button>
                          </div>

                          {showRalInfo && (
                            <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-lg text-sm text-blue-800 animate-in fade-in slide-in-from-top-2 duration-200">
                              <div className="flex items-start gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                <div>
                                  <p className="font-medium mb-1">RAL Farbkarte ansehen</p>
                                  <p className="text-xs opacity-90 mb-2">
                                    RAL-Farben sind standardisierte Farbtöne. Sie finden die Farbcodes auf offiziellen RAL-Farbkarten oder online unter:
                                  </p>
                                  <a
                                    href="https://www.ral-farben.de/alle-ral-farben"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline"
                                  >
                                    www.ral-farben.de
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15,3 21,3 21,9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                  </a>
                                </div>
                                <button
                                  onClick={() => setShowRalInfo(false)}
                                  className="ml-auto text-blue-600 hover:text-blue-800 p-1"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                </button>
                              </div>
                            </div>
                          )}

                          <Input
                            id="custom-ral"
                            placeholder="z.B. 5015"
                            value={customRal}
                            onChange={(e) => {
                              setCustomRal(e.target.value);
                              if (e.target.value) {
                                setRalColor("");
                              }
                            }}
                            maxLength={4}
                            className="w-full text-lg h-12"
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            Alle RAL Classic Farben sind verfügbar (z.B. 1000-9023)
                          </p>
                        </div>
                      </div>
                    )}

                    {/* NCS Tab Content */}
                    {colorSystem === "ncs" && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="space-y-3 w-full">
                          <Label htmlFor="custom-ncs" className="text-base font-semibold">NCS-Farbcode eingeben</Label>
                          <p className="text-xs text-muted-foreground">
                            Geben Sie Ihren gewünschten NCS-Farbcode ein (z.B. S 1050-Y90R)
                          </p>
                          <Input
                            id="custom-ncs"
                            placeholder="z.B. S 1050-Y90R"
                            value={customNcs}
                            onChange={(e) => setCustomNcs(e.target.value)}
                            className="w-full text-lg h-12"
                          />
                          <p className="text-xs text-muted-foreground">
                            NCS (Natural Color System) Farben werden nach Ihren Angaben gemischt.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Lasur Tab Content */}
                    {colorSystem === "lasur" && material === "wood" && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                          <div className="font-semibold mb-2">Lasur gewählt</div>
                          <p className="text-sm text-muted-foreground">
                            Die Holzoberfläche wird mit einer transparenten Lasur behandelt, die die natürliche Maserung sichtbar lässt und gleichzeitig Schutz bietet.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Roh Tab Content */}
                    {colorSystem === "roh" && material === "wood" && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                          <div className="font-semibold mb-2">Roh / Unbehandelt gewählt</div>
                          <p className="text-sm text-muted-foreground">
                            Das Holz bleibt unbehandelt und in seinem natürlichen Zustand. Bitte beachten Sie, dass eine Oberflächenbehandlung vor der Montage empfohlen wird.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Selected Color Info */}
                    <div className="p-4 bg-muted/50 rounded-lg w-full">
                      <div className="flex items-center gap-3">
                        {colorSystem === "ral" && selectedRalData && !customRal && (
                          <div
                            className="w-10 h-10 md:w-12 md:h-12 rounded border-2 border-border flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: selectedRalData.hex_color }}
                          />
                        )}
                        {colorSystem === "ral" && customRal && (
                          <div
                            className="w-10 h-10 md:w-12 md:h-12 rounded border-2 border-border flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: getRalHexColor(customRal) || '#ccc' }}
                          />
                        )}
                        {(colorSystem === "roh" || colorSystem === "lasur") && (
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded border-2 border-border flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-300" />
                        )}
                        {colorSystem === "ncs" && (
                          <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
                            <div
                              className="w-full h-full rounded border-2 border-border shadow-sm cursor-pointer"
                              style={{ backgroundColor: ncsPreviewColor }}
                            />
                            <input
                              type="color"
                              value={ncsPreviewColor}
                              onChange={(e) => setNcsPreviewColor(e.target.value)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              title="Vorschaufarbe wählen"
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold truncate">
                            {colorSystem === "roh"
                              ? "Gewählt: Roh / Unbehandelt"
                              : colorSystem === "lasur"
                                ? "Gewählt: Lasur"
                                : colorSystem === "ncs"
                                  ? `Gewählt: ${customNcs || "—"}`
                                  : `Gewählte Farbe: RAL ${displayRal}${selectedRalData && !customRal ? ` - ${selectedRalData.name}` : customRal && isValidRalCode(customRal) ? ` - ${getRalName(customRal)}` : ""}`
                            }
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {colorSystem === "roh"
                              ? "Naturbelassenes Holz"
                              : colorSystem === "lasur"
                                ? "Transparente Lasur"
                                : colorSystem === "ncs"
                                  ? "NCS Farbsystem"
                                  : (material === "aluminum" ? "Pulverbeschichtung" : "Deckende Lackierung")
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Beschläge Section */}
              <FadeIn className="md:col-span-2" delay={350}>
                <Card className="shadow-[var(--shadow-elegant)] w-full overflow-hidden">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-lg md:text-2xl">5. Beschläge</CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      Möchten Sie Beschläge (Kloben, Ladenhalter, etc.) hinzufügen?
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 p-4 md:p-6 pt-0 md:pt-0">

                    {/* 3-Option Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Nein */}
                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${beschlaegeMode === "none"
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-muted bg-popover hover:border-primary/50'
                          }`}
                        onClick={() => setBeschlaegeMode("none")}
                      >
                        <div className="font-semibold text-lg">Nein</div>
                        <p className="text-xs text-muted-foreground mt-1">Ohne Beschläge</p>
                      </div>
                      {/* Ja — Anschlagsart */}
                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${beschlaegeMode === "anschlagsart"
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-muted bg-popover hover:border-primary/50'
                          }`}
                        onClick={() => setBeschlaegeMode("anschlagsart")}
                      >
                        <div className="font-semibold text-lg">Ja</div>
                        <p className="text-xs text-muted-foreground mt-1">Beschläge nach Anschlagsart</p>
                      </div>
                      {/* Ja — Einzelteile */}
                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${beschlaegeMode === "einzelteile"
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-muted bg-popover hover:border-primary/50'
                          }`}
                        onClick={() => setBeschlaegeMode("einzelteile")}
                      >
                        <div className="font-semibold text-lg">Ja</div>
                        <p className="text-xs text-muted-foreground mt-1">Beschläge Einzelteile</p>
                      </div>
                    </div>

                    {/* Selection Status */}
                    <div className="p-4 bg-muted/50 rounded-lg w-full">
                      <div className="font-semibold">
                        {beschlaegeMode === null
                          ? "Bitte wählen Sie eine Option"
                          : beschlaegeMode === "none"
                            ? "Ohne Beschläge"
                            : beschlaegeMode === "anschlagsart"
                              ? "Beschläge nach Anschlagsart"
                              : "Beschläge Einzelteile"
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              {/* 5.1 Anschlagsart — shown when mode = "anschlagsart" */}
              {beschlaegeMode === "anschlagsart" && (
                <FadeIn className="md:col-span-2" delay={400}>
                  <Card className="shadow-[var(--shadow-elegant)] w-full overflow-hidden">
                    <CardHeader className="p-4 md:p-6">
                      <CardTitle className="text-lg md:text-2xl">5.1 Anschlagsart</CardTitle>
                      <CardDescription className="text-sm md:text-base">
                        Wählen Sie die Anschlagsart für Ihre Beschläge
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4 md:p-6 pt-0 md:pt-0">
                      <div className="grid grid-cols-1 gap-3">
                        {[
                          "Anschlagart 1 – Montage auf Ladenrahmen",
                          "Anschlagart 2 – Montage in Verkleidung",
                          "Anschlagart 3 – Montage direkt auf Stock"
                        ].map((art) => (
                          <div
                            key={art}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3 ${anschlagsart === art
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-muted bg-popover hover:border-primary/50'
                              }`}
                            onClick={() => {
                              setAnschlagsart(art);
                              if (!art.includes("Anschlagart 1")) setMontagerahmenMaterial("");
                            }}
                          >
                            <div className={`w-4 h-4 rounded-full border border-primary flex items-center justify-center flex-shrink-0 ${anschlagsart === art ? 'bg-primary' : 'bg-transparent'}`}>
                              {anschlagsart === art && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                            </div>
                            <span className="text-sm md:text-base font-medium">{art}</span>
                          </div>
                        ))}
                      </div>

                      {/* Sketch + Explanation when an option is selected */}
                      {anschlagsart && (
                        <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border/50 space-y-4 animate-in fade-in slide-in-from-top-1">
                          {/* Sketch Image */}
                          <div className="flex flex-col md:flex-row gap-4 items-start">
                            <div className="w-full md:w-1/3 rounded-lg border border-input bg-white overflow-hidden">
                              <img
                                src={`/configurator-assets/Anschlagart 1 – Montage auf Ladenrahmen - Skizze.png`}
                                alt={`${anschlagsart} Skizze`}
                                className="w-full h-auto object-contain"
                              />
                            </div>
                            <div className="flex-1 space-y-2">
                              <p className="text-sm font-semibold text-primary/80">{anschlagsart}</p>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                Ein Rahmen ist erforderlich, wenn zwischen Laden und Stock, bzw. Glas, zu wenig Luft für den Verschluss oder für die Zugleiste bei Designfigur Nr. 5 (bewegliche Brettchen) ist.
                              </p>
                            </div>
                          </div>

                          {/* Montagerahmen sub-option — only for Anschlagart 1 */}
                          {anschlagsart.includes("Anschlagart 1") && (
                            <div className="p-3 rounded-lg border border-border/50 bg-background/50 space-y-3">
                              <p className="text-sm font-semibold">Montagerahmen gewünscht? <span className="text-muted-foreground font-normal text-xs">(optional)</span></p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div
                                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3 ${montagerahmenMaterial === "aluminium"
                                    ? 'border-primary bg-primary/5'
                                    : 'border-muted bg-popover hover:border-primary/50'
                                    }`}
                                  onClick={() => setMontagerahmenMaterial(montagerahmenMaterial === "aluminium" ? "" : "aluminium")}
                                >
                                  <div className={`w-4 h-4 rounded-full border border-primary flex items-center justify-center flex-shrink-0 ${montagerahmenMaterial === "aluminium" ? 'bg-primary' : 'bg-transparent'}`}>
                                    {montagerahmenMaterial === "aluminium" && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium">Aluminium</span>
                                    <span className="text-xs text-muted-foreground ml-1">(40x40mm)</span>
                                  </div>
                                </div>
                                <div
                                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3 ${montagerahmenMaterial === "holz"
                                    ? 'border-primary bg-primary/5'
                                    : 'border-muted bg-popover hover:border-primary/50'
                                    }`}
                                  onClick={() => setMontagerahmenMaterial(montagerahmenMaterial === "holz" ? "" : "holz")}
                                >
                                  <div className={`w-4 h-4 rounded-full border border-primary flex items-center justify-center flex-shrink-0 ${montagerahmenMaterial === "holz" ? 'bg-primary' : 'bg-transparent'}`}>
                                    {montagerahmenMaterial === "holz" && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium">Holz</span>
                                    <span className="text-xs text-muted-foreground ml-1">(55x30mm)</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Selection Status */}
                      <div className="p-4 bg-muted/50 rounded-lg w-full">
                        <div className="font-semibold">
                          {anschlagsart ? `Gewählt: ${anschlagsart}` : "Bitte wählen Sie eine Anschlagsart"}
                          {montagerahmenMaterial && (
                            <span className="text-sm font-normal text-muted-foreground ml-2">
                              + Montagerahmen {montagerahmenMaterial === "aluminium" ? "Aluminium (40x40mm)" : "Holz (55x30mm)"}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              )}

              {/* 5.1 Beschläge Einzelteile — shown when mode = "einzelteile" */}
              {beschlaegeMode === "einzelteile" && (
                <FadeIn className="md:col-span-2" delay={400}>
                  <Card className="shadow-[var(--shadow-elegant)] w-full overflow-hidden">
                    <CardHeader className="p-4 md:p-6">
                      <CardTitle className="text-lg md:text-2xl">5.1 Beschläge Einzelteile</CardTitle>
                      <CardDescription className="text-sm md:text-base">
                        Wählen Sie die gewünschten Einzelteile und die jeweilige Anzahl
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4 md:p-6 pt-0 md:pt-0">
                      {/* Product Cards */}
                      {[
                        {
                          id: "plattenkloben-verstellbar",
                          name: "Plattenkloben verstellbar mit Radiusecken",
                          image: "/configurator-assets/Plattenkloben verstellbar mit Radiusecken.png",
                          specs: [
                            { label: "Rundung", value: "5 mm" },
                            { label: "Verwendung", value: "Siehe z.B. Anschlagart 1" },
                            { label: "Austragung", value: "90 bis 280 mm" },
                            { label: "Typ", value: "Für gekröpftes Band, fix oder verstellbar" }
                          ]
                        }
                      ].map((product) => (
                        <div
                          key={product.id}
                          className={`p-4 rounded-lg border-2 transition-all ${(einzelteileQuantities[product.name] || 0) > 0
                            ? 'border-primary bg-primary/5'
                            : 'border-muted bg-popover'
                            }`}
                        >
                          <div className="flex flex-col sm:flex-row gap-4">
                            {/* Product Image */}
                            <div className="w-full sm:w-32 h-32 rounded-lg border border-input bg-white overflow-hidden flex-shrink-0">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain p-2"
                              />
                            </div>
                            {/* Product Info */}
                            <div className="flex-1 space-y-2">
                              <p className="text-sm md:text-base font-semibold">{product.name}</p>
                              <div className="space-y-1">
                                {product.specs.map((spec) => (
                                  <p key={spec.label} className="text-xs text-muted-foreground">
                                    <span className="font-medium text-foreground/70">{spec.label}:</span> {spec.value}
                                  </p>
                                ))}
                              </div>
                            </div>
                            {/* Quantity Input */}
                            <div className="flex items-center gap-2 sm:flex-col sm:justify-center sm:items-end">
                              <Label className="text-xs text-muted-foreground whitespace-nowrap">Anzahl:</Label>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => setEinzelteileQuantities(prev => ({
                                    ...prev,
                                    [product.name]: Math.max(0, (prev[product.name] || 0) - 1)
                                  }))}
                                >
                                  −
                                </Button>
                                <Input
                                  type="number"
                                  min="0"
                                  value={einzelteileQuantities[product.name] || 0}
                                  onChange={(e) => setEinzelteileQuantities(prev => ({
                                    ...prev,
                                    [product.name]: Math.max(0, parseInt(e.target.value) || 0)
                                  }))}
                                  className="w-16 h-8 text-center text-sm"
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => setEinzelteileQuantities(prev => ({
                                    ...prev,
                                    [product.name]: (prev[product.name] || 0) + 1
                                  }))}
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Summary */}
                      <div className="p-4 bg-muted/50 rounded-lg w-full">
                        <div className="font-semibold">
                          {Object.entries(einzelteileQuantities).filter(([, q]) => q > 0).length > 0
                            ? `${Object.entries(einzelteileQuantities).filter(([, q]) => q > 0).map(([name, qty]) => `${qty}× ${name}`).join(", ")}`
                            : "Bitte wählen Sie mindestens ein Einzelteil"
                          }
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              )}

              {/* 5.2 Farbe Beschläge — shown when anschlagsart OR einzelteile */}
              {(beschlaegeMode === "anschlagsart" || beschlaegeMode === "einzelteile") && (
                <FadeIn className="md:col-span-2" delay={450}>
                  <Card className="shadow-[var(--shadow-elegant)] w-full overflow-hidden">
                    <CardHeader className="p-4 md:p-6">
                      <CardTitle className="text-lg md:text-2xl">5.2 Farbe Beschläge</CardTitle>
                      <CardDescription className="text-sm md:text-base">
                        Wählen Sie die Farbe für Ihre Beschläge
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 p-4 md:p-6 pt-0 md:pt-0">

                      {/* Standard Verzinkt Option */}
                      <div className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${beschlaegeRohUnbehandelt ? 'border-primary bg-primary/5' : 'border-muted bg-popover hover:border-primary/50'}`}
                        onClick={() => {
                          setBeschlaegeRohUnbehandelt(true);
                          setBeschlaegeColor("");
                          setBeschlaegeCustomRal("");
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border border-primary flex items-center justify-center ${beschlaegeRohUnbehandelt ? 'bg-primary' : 'bg-transparent'}`}>
                            {beschlaegeRohUnbehandelt && <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />}
                          </div>
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className="w-12 h-12 rounded border border-gray-400 bg-cover bg-center"
                              style={{ backgroundImage: `url(${beschlaegeVerzinkt})` }}
                              title="Verzinkt-Optik"
                            />
                            <div>
                              <Label className="text-base font-semibold cursor-pointer">Standard verzinkt</Label>
                              <p className="text-xs text-muted-foreground">Klassische verzinkte Oberfläche</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* RAL Color Option Wrapper */}
                      <div className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${!beschlaegeRohUnbehandelt ? 'border-primary bg-primary/5' : 'border-muted bg-popover hover:border-primary/50'}`}
                        onClick={() => {
                          setBeschlaegeRohUnbehandelt(false);
                          if (!beschlaegeColor && !beschlaegeCustomRal) setBeschlaegeColor("9016");
                        }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-5 h-5 rounded-full border border-primary flex items-center justify-center ${!beschlaegeRohUnbehandelt ? 'bg-primary' : 'bg-transparent'}`}>
                            {!beschlaegeRohUnbehandelt && <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />}
                          </div>
                          <Label className="text-base font-semibold cursor-pointer">RAL-Farbe wählen</Label>
                        </div>

                        {/* Actual Color Controls - Only visible if RAL selected */}
                        {!beschlaegeRohUnbehandelt && (
                          <div className="pl-8 space-y-4 animate-in fade-in slide-in-from-top-1">
                            {/* Popular Colors */}
                            <div className="w-full">
                              <Label className="mb-2 block text-sm font-medium">Beliebte Farben</Label>
                              <RadioGroup value={beschlaegeColor} onValueChange={(v) => { setBeschlaegeColor(v); setBeschlaegeCustomRal(""); }} className="w-full">
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-2 w-full">
                                  {ralColors?.slice(0, 4).map((color) => (
                                    <div key={`beschlaege-${color.ral_code}`} className="relative w-full">
                                      <RadioGroupItem value={color.ral_code} id={`beschlaege-${color.ral_code}`} className="peer sr-only" />
                                      <Label
                                        htmlFor={`beschlaege-${color.ral_code}`}
                                        className="flex flex-col items-center rounded-md border-2 border-muted bg-popover p-2 peer-data-[state=checked]:border-primary cursor-pointer transition-all w-full text-center"
                                      >
                                        <div
                                          className="w-full h-6 rounded mb-1 border border-border"
                                          style={{ backgroundColor: color.hex_color }}
                                        />
                                        <span className="text-[10px] font-medium">RAL {color.ral_code}</span>
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </RadioGroup>
                            </div>

                            {/* Custom RAL Input */}
                            <div className="space-y-2 w-full">
                              <Label htmlFor="beschlaege-custom-ral" className="text-sm font-medium">Oder Farbcode eingeben</Label>
                              <div className="flex gap-2">
                                <Input
                                  id="beschlaege-custom-ral"
                                  placeholder="z.B. 7016"
                                  value={beschlaegeCustomRal}
                                  onChange={(e) => {
                                    setBeschlaegeCustomRal(e.target.value);
                                    if (e.target.value) setBeschlaegeColor("");
                                  }}
                                  maxLength={4}
                                  className="w-full h-10"
                                />
                                {beschlaegeCustomRal && isValidRalCode(beschlaegeCustomRal) && (
                                  <div
                                    className="w-10 h-10 rounded border border-border flex-shrink-0"
                                    style={{ backgroundColor: getRalHexColor(beschlaegeCustomRal) || '#ccc' }}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Selected Info */}
                      <div className="p-4 bg-muted/50 rounded-lg w-full">
                        <div className="font-semibold">
                          Gewählte Oberfläche: <span className="text-primary">
                            {beschlaegeRohUnbehandelt ? "Standard verzinkt" : `RAL ${beschlaegeCustomRal || beschlaegeColor || "—"}`}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              )}



              {/* Anzahl Fenster - NEW STEP 6 (previously 8) */}
              <FadeIn className="md:col-span-2" delay={500}>
                <Card className="shadow-[var(--shadow-elegant)] w-full overflow-hidden">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-lg md:text-2xl">6. Anzahl Fenster</CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      Wie viele Fenster möchten Sie mit diesen Klappläden ausstatten?
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4 md:p-6 pt-0 md:pt-0">
                    <div className="flex items-center gap-4">
                      <Input
                        id="anzahl-fenster"
                        type="number"
                        min="1"
                        max="100"
                        value={anzahlFenster}
                        onChange={(e) => setAnzahlFenster(e.target.value)}
                        className="w-32 text-lg h-12 text-center"
                      />
                      <span className="text-muted-foreground">Fenster mit gleichen Maßen</span>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg w-full">
                      <div className="font-semibold">
                        {parseInt(anzahlFenster) > 0
                          ? `${anzahlFenster} Fenster ausgewählt`
                          : "Bitte geben Sie die Anzahl der Fenster ein"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Fenstermaße - NEW STEP 7 (previously 6) */}
              <FadeIn className="md:col-span-2" delay={550}>
                <Card className="shadow-[var(--shadow-elegant)] w-full overflow-hidden">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-lg md:text-2xl">7. Fenstermaße eingeben</CardTitle>
                    <CardDescription className="text-sm md:text-base">Geben Sie die Breite und Höhe Ihres Fensters in mm ein</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
                      <div className="space-y-2 w-full">
                        <Label htmlFor="width" className="text-base">Breite (mm)</Label>
                        <Input
                          id="width"
                          type="number"
                          placeholder="z.B. 1200"
                          value={width}
                          onChange={(e) => setWidth(e.target.value)}
                          min="0"
                          className="w-full text-lg p-3 h-12"
                        />
                      </div>
                      <div className="space-y-2 w-full">
                        <Label htmlFor="height" className="text-base">Höhe (mm)</Label>
                        <Input
                          id="height"
                          type="number"
                          placeholder="z.B. 1500"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          min="0"
                          className="w-full text-lg p-3 h-12"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Anzahl der Flügel pro Fenster - NEW STEP 8 (previously 7) */}
              <FadeIn className="md:col-span-2" delay={600}>
                <Card className="shadow-[var(--shadow-elegant)] w-full overflow-hidden">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-lg md:text-2xl">8. Anzahl der Flügel pro Fenster</CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      Wählen Sie die Flügelanordnung für Ihre Klappläden
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4 md:p-6 pt-0 md:pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        { value: "beide-seiten", label: "Beide Seiten", desc: "Klappläden auf beiden Seiten des Fensters", img: "/configurator-assets/Fensterladen - beide Seiten.png" },
                        { value: "nur-links-ganz", label: "Nur links - ganze Breite", desc: "Ein Klappladen links, volle Fensterbreite", img: "/configurator-assets/Fensterladen nur links - ganze Breite.png" },
                        { value: "nur-rechts-ganz", label: "Nur rechts - ganze Breite", desc: "Ein Klappladen rechts, volle Fensterbreite", img: "/configurator-assets/Fensterladen nur rechts - ganze Breite.png" },
                        { value: "nur-links-halb", label: "Nur links - halbe Breite", desc: "Ein Klappladen links, halbe Fensterbreite", img: "/configurator-assets/Fensterladen nur links - halbe Breite.png" },
                        { value: "nur-rechts-halb", label: "Nur rechts - halbe Breite", desc: "Ein Klappladen rechts, halbe Fensterbreite", img: "/configurator-assets/Fensterladen nur rechts - halbe Breite.png" },
                      ].map((option) => (
                        <div
                          key={option.value}
                          className={`p-4 rounded-lg border-2 flex flex-col items-center text-center cursor-pointer transition-all ${fluegelOption === option.value
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-muted bg-popover hover:border-primary/50'
                            }`}
                          onClick={() => setFluegelOption(option.value)}
                        >
                          <div className="w-full h-32 mb-3 bg-white rounded-md border border-muted/50 p-2 flex items-center justify-center">
                            <img src={option.img} alt={option.label} className="max-w-full max-h-full object-contain" />
                          </div>
                          <div className="font-semibold text-sm">{option.label}</div>
                          <p className="text-xs text-muted-foreground mt-1">{option.desc}</p>
                        </div>
                      ))}
                    </div>

                    {/* Selection Status */}
                    <div className="p-4 bg-muted/50 rounded-lg w-full">
                      <div className="font-semibold">
                        {fluegelOption
                          ? `Gewählt: ${[
                            { value: "beide-seiten", label: "Beide Seiten" },
                            { value: "nur-links-ganz", label: "Nur links - ganze Breite" },
                            { value: "nur-rechts-ganz", label: "Nur rechts - ganze Breite" },
                            { value: "nur-links-halb", label: "Nur links - halbe Breite" },
                            { value: "nur-rechts-halb", label: "Nur rechts - halbe Breite" },
                          ].find(o => o.value === fluegelOption)?.label}`
                          : "Bitte wählen Sie eine Flügelanordnung"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Sonderwünsche - Step 9 */}
              <FadeIn className="md:col-span-2" delay={650}>
                <Card className="shadow-[var(--shadow-elegant)] w-full overflow-hidden">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-lg md:text-2xl">9. Sonderwünsche</CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      Haben Sie besondere Anforderungen, wie zum Beispiel Rahmenmaßänderungen bei Holzfensterläden, andere Holzarten, spezielle Oberflächenbehandlungen, Fensterläden in Sonderformen oder sonstige individuelle Wünsche?
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4 md:p-6 pt-0 md:pt-0">
                    <textarea
                      id="sonderwuensche"
                      placeholder="Bitte beschreiben Sie hier Ihre Sonderwünsche oder besonderen Anforderungen und teilen Sie uns alles mit, was wir bei der Planung und Angebotserstellung beachten sollten."
                      value={sonderwuensche}
                      onChange={(e) => setSonderwuensche(e.target.value)}
                      className="w-full min-h-[120px] p-4 rounded-lg border border-input bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                    />

                    {/* Photo Upload */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Fotos oder Skizzen hochladen</Label>
                      <p className="text-xs text-muted-foreground">
                        Sie möchten einen bestehenden Fensterladen ersetzen oder haben bereits Skizzen? Dann laden Sie gerne Fotos oder Grafiken hoch.
                      </p>
                      <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                        <input
                          type="file"
                          id="photo-upload"
                          multiple
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files) {
                              setUploadedFiles(Array.from(e.target.files));
                            }
                          }}
                        />
                        <label htmlFor="photo-upload" className="cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                          <span className="text-sm text-muted-foreground">
                            Klicken Sie hier oder ziehen Sie Dateien hierhin
                          </span>
                          <span className="block text-xs text-muted-foreground mt-1">
                            JPG, PNG, PDF (max. 10 MB)
                          </span>
                        </label>
                      </div>
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                              <span className="truncate flex-1">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => setUploadedFiles(files => files.filter((_, i) => i !== index))}
                                className="text-muted-foreground hover:text-destructive p-1"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Price Calculation */}
              <FadeIn className="md:col-span-2" delay={650}>
                <Card className="shadow-[var(--shadow-elegant)] w-full overflow-hidden border-2 border-primary/20">
                  <CardHeader className="p-4 md:p-6 bg-primary/5">
                    <CardTitle className="text-lg md:text-2xl">10. Konfiguration anzeigen</CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      Wenn Sie alle gewünschten Einstellungen getroffen haben, können Sie hier Ihre Konfiguration anzeigen und ein Angebot dafür anfordern.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                    <Button
                      onClick={calculatePrice}
                      className="w-full mt-4 bg-primary hover:bg-primary/90 text-lg h-12 md:h-14"
                      size="lg"
                    >
                      <Calculator className="mr-2 h-5 w-5 md:h-6 md:w-6" />
                      Meine Konfiguration anzeigen
                    </Button>

                    {calculatedPrice && measurements && (
                      <div className="mt-8 p-4 md:p-6 bg-muted rounded-lg border-2 border-primary/20 w-full animate-in fade-in zoom-in duration-300">
                        <h3 className="text-xl md:text-2xl font-bold mb-5 text-primary text-center md:text-left">
                          Ihre Konfiguration
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">

                          {/* System & Material */}
                          <div className="bg-background/50 p-3 rounded space-y-1.5">
                            <p className="font-semibold mb-2 text-primary/80">System & Material</p>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>• Systemtyp: <span className="text-foreground font-medium">{shutterType === "klappladen" ? "Klappladen" : shutterType === "schiebeladen" ? "Schiebeladen" : "Falt-Schiebeladen"}</span></li>
                              <li>• Material: <span className="text-foreground font-medium">{material === "aluminum" ? "Aluminium" : "Holz"}</span></li>
                              {material === "wood" && selectedWoodTypeData && (
                                <li>• Holzart: <span className="text-foreground font-medium">{selectedWoodTypeData.name}</span></li>
                              )}
                            </ul>
                          </div>

                          {/* Design */}
                          <div className="bg-background/50 p-3 rounded space-y-1.5">
                            <p className="font-semibold mb-2 text-primary/80">Design</p>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>• Design: <span className="text-foreground font-medium">{selectedDesignData?.name || "—"}</span></li>
                              {kombinationEnabled && (
                                <li>• Designkombination: <span className="text-foreground font-medium">
                                  {designs?.find(d => d.id === kombinationDesign1)?.name || "—"} + {designs?.find(d => d.id === kombinationDesign2)?.name || "—"}
                                </span></li>
                              )}
                              {kombinationEnabled && kombinationAufteilung && (
                                <li>• Aufteilung: <span className="text-foreground font-medium">{kombinationAufteilung}</span></li>
                              )}
                              <li>• Aussteller: <span className="text-foreground font-medium">{ausstellerEnabled ? "Ja" : "Nein"}</span></li>
                              <li>• Ausnehmung: <span className="text-foreground font-medium">{ausnehmungEnabled ? "Ja" : "Nein"}</span></li>
                              {ausnehmungEnabled && ausnehmungText && (
                                <li>• Ausnehmung Details: <span className="text-foreground font-medium">{ausnehmungText}</span></li>
                              )}
                            </ul>
                          </div>

                          {/* Farbe */}
                          <div className="bg-background/50 p-3 rounded space-y-1.5">
                            <p className="font-semibold mb-2 text-primary/80">Farbe</p>
                            <ul className="space-y-1 text-muted-foreground">
                              <li className="flex items-center gap-2">
                                • Farbsystem: <span className="text-foreground font-medium">
                                  {colorSystem === "ral" ? "RAL" : colorSystem === "ncs" ? "NCS" : colorSystem === "lasur" ? "Lasur" : "Roh / Unbehandelt"}
                                </span>
                              </li>
                              {colorSystem === "ral" && (
                                <li className="flex items-center gap-2">
                                  • Farbcode: <span className="text-foreground font-medium">RAL {displayRal}</span>
                                  {(selectedRalData || getRalHexColor(customRal)) && (
                                    <span
                                      className="inline-block w-4 h-4 rounded border border-border"
                                      style={{ backgroundColor: selectedRalData?.hex_color || getRalHexColor(customRal) || '#ccc' }}
                                    />
                                  )}
                                </li>
                              )}
                              {colorSystem === "ncs" && customNcs && (
                                <li className="flex items-center gap-2">
                                  • Farbcode: <span className="text-foreground font-medium">{customNcs}</span>
                                  <span
                                    className="inline-block w-4 h-4 rounded border border-border"
                                    style={{ backgroundColor: ncsPreviewColor }}
                                  />
                                </li>
                              )}
                            </ul>
                          </div>

                          {/* Beschläge */}
                          <div className="bg-background/50 p-3 rounded space-y-1.5">
                            <p className="font-semibold mb-2 text-primary/80">Beschläge</p>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>• Beschläge: <span className="text-foreground font-medium">{beschlaegeMode === "anschlagsart" ? "Ja – nach Anschlagsart" : beschlaegeMode === "einzelteile" ? "Ja – Einzelteile" : beschlaegeMode === "none" ? "Nein" : "Nicht gewählt"}</span></li>
                              {beschlaegeMode === "anschlagsart" && (
                                <>
                                  <li>• Anschlagsart: <span className="text-foreground font-medium">{anschlagsart || "—"}</span></li>
                                  {montagerahmenMaterial && (
                                    <li>• Montagerahmen: <span className="text-foreground font-medium">{montagerahmenMaterial === "aluminium" ? "Aluminium (40x40mm)" : "Holz (55x30mm)"}</span></li>
                                  )}
                                  <li>• Farbe: <span className="text-foreground font-medium">
                                    {beschlaegeRohUnbehandelt ? "Standard verzinkt" : `RAL ${beschlaegeCustomRal || beschlaegeColor}`}
                                  </span></li>
                                </>
                              )}
                              {beschlaegeMode === "einzelteile" && Object.entries(einzelteileQuantities).filter(([, q]) => q > 0).length > 0 && (
                                <>
                                  {Object.entries(einzelteileQuantities).filter(([, q]) => q > 0).map(([name, qty]) => (
                                    <li key={name}>• {name}: <span className="text-foreground font-medium">{qty} Stk.</span></li>
                                  ))}
                                </>
                              )}
                            </ul>
                          </div>

                          {/* Maße & Fenster */}
                          <div className="bg-background/50 p-3 rounded space-y-1.5">
                            <p className="font-semibold mb-2 text-primary/80">Maße & Fenster</p>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>• Breite: <span className="text-foreground font-medium">{width} mm</span></li>
                              <li>• Höhe: <span className="text-foreground font-medium">{height} mm</span></li>
                              <li>• Breite inkl. Rahmen: <span className="text-foreground font-medium">{measurements.totalWidth} mm</span></li>
                              <li>• Höhe inkl. Rahmen: <span className="text-foreground font-medium">{measurements.totalHeight} mm</span></li>
                              <li>• Flügel: <span className="text-foreground font-medium">{fluegelOption || "—"}</span></li>
                              <li>• Anzahl Fenster: <span className="text-foreground font-medium">{anzahlFenster || 1}</span></li>
                            </ul>
                          </div>

                          {/* Technische Details */}
                          <div className="bg-background/50 p-3 rounded space-y-1.5">
                            <p className="font-semibold mb-2 text-primary/80">Technische Details</p>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>• Anzahl Lamellen: <span className="text-foreground font-medium">{measurements.lamellaCount}</span></li>
                              <li>• Lamellenabstand: <span className="text-foreground font-medium">{measurements.spacing} mm</span></li>
                              <li>• Rahmenstärke: <span className="text-foreground font-medium">{measurements.frameThickness} mm</span></li>
                            </ul>
                          </div>
                        </div>

                        {/* Sonderwünsche */}
                        {sonderwuensche && (
                          <div className="mt-4 bg-background/50 p-3 rounded">
                            <p className="font-semibold mb-2 text-primary/80">Sonderwünsche</p>
                            <p className="text-sm text-muted-foreground">{sonderwuensche}</p>
                          </div>
                        )}

                        <Button
                          onClick={() => setShowSubmitModal(true)}
                          className="w-full mt-6 text-lg h-12 md:h-14"
                          size="lg"
                          variant="default"
                        >
                          <Send className="mr-2 h-5 w-5 md:h-6 md:w-6" />
                          Unverbindlich anfragen
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
          </div >
        </div >
      </section >

      {/* Submit Quote Modal */}
      < Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal} >
        <DialogContent className="w-[95vw] sm:max-w-[640px] max-h-[90vh] overflow-y-auto p-0 border-0 shadow-2xl rounded-2xl">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary/10 via-background to-muted/50 px-5 sm:px-6 pt-5 pb-4 border-b border-border/50">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2.5">
                <span className="bg-primary/10 text-primary p-1.5 rounded-lg">
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </span>
                Anfrage absenden
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm mt-1 text-muted-foreground">
                Kontaktdaten eingeben — wir melden uns schnellstmöglich.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Form Fields — 2-column grid on sm+ */}
          <div className="px-5 sm:px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
              {/* Name */}
              <div className="space-y-1">
                <Label htmlFor="customer-name" className="text-xs sm:text-sm font-medium">Name *</Label>
                <Input
                  id="customer-name"
                  placeholder="Ihr Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  disabled={isSubmitting}
                  className="text-sm sm:text-base h-10"
                />
              </div>

              {/* E-Mail */}
              <div className="space-y-1">
                <Label htmlFor="customer-email" className="text-xs sm:text-sm font-medium">E-Mail *</Label>
                <Input
                  id="customer-email"
                  type="email"
                  placeholder="ihre@email.at"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="text-sm sm:text-base h-10"
                />
              </div>

              {/* Telefon */}
              <div className="space-y-1">
                <Label htmlFor="customer-phone" className="text-xs sm:text-sm font-medium">Telefon <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  id="customer-phone"
                  type="tel"
                  placeholder="+43 ..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  disabled={isSubmitting}
                  className="text-sm sm:text-base h-10"
                />
              </div>

              {/* Firma */}
              <div className="space-y-1">
                <Label htmlFor="customer-company" className="text-xs sm:text-sm font-medium">Firma <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  id="customer-company"
                  placeholder="Firmenname"
                  value={customerCompany}
                  onChange={(e) => setCustomerCompany(e.target.value)}
                  disabled={isSubmitting}
                  className="text-sm sm:text-base h-10"
                />
              </div>

              {/* Adresse — full width */}
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="customer-address" className="text-xs sm:text-sm font-medium">Adresse <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Textarea
                  id="customer-address"
                  placeholder="Straße, PLZ, Ort"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  disabled={isSubmitting}
                  className="text-sm sm:text-base h-10"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-border/30 bg-muted/20 space-y-3">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
                className="flex-1 h-11"
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleSubmitQuote}
                disabled={isSubmitting}
                className="flex-1 h-11"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Senden...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Absenden
                  </>
                )}
              </Button>
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground text-center">
              Unverbindlich & kostenlos • Antwort innerhalb von 24h an Werktagen
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Design Details Dialog */}
      <Dialog open={!!designDialogOpen} onOpenChange={(open) => !open && setDesignDialogOpen(null)}>
        <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-0 shadow-2xl rounded-2xl flex flex-col">
          {/* Header with gradient accent */}
          <div className="bg-gradient-to-br from-primary/10 via-background to-muted/50 px-5 pt-5 pb-4 border-b border-border/50 shrink-0">
            <DialogHeader>
              <DialogTitle className="text-xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                {designDialogOpen?.name}
              </DialogTitle>
              <DialogDescription className="text-sm md:text-base mt-1.5 text-muted-foreground leading-relaxed max-w-2xl line-clamp-2">
                {designDialogOpen?.description}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Image Grid */}
          <div className="p-4 bg-muted/20 flex-1 flex flex-col min-h-0">
            <div className="flex-1 w-full bg-white rounded-xl border border-border/60 overflow-hidden shadow-sm relative flex flex-col">
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/80"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full shadow-sm border border-border/50">Technische Zeichnung</span>
              </div>
              <div className="flex-1 flex items-center justify-center p-4 pt-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] min-h-[300px] md:min-h-[400px]">
                <img
                  src={getDesignDetailsImage(designDialogOpen?.name || "", material)}
                  alt={`${designDialogOpen?.name || ""} Details`}
                  className="w-auto h-auto max-w-full max-h-[50vh] object-contain opacity-90 mix-blend-multiply drop-shadow-sm"
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
