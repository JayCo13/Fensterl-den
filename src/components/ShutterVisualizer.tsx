import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ShutterVisualizerProps {
  material: "aluminum" | "wood";
  designName: string;
  woodType?: string;
  ralColor?: string;
}

export const ShutterVisualizer = ({ material, designName, woodType, ralColor }: ShutterVisualizerProps) => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [visualizedImage, setVisualizedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Ungültiger Dateityp",
        description: "Bitte laden Sie ein Bild hoch.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalImage(event.target?.result as string);
      setVisualizedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleVisualize = async () => {
    if (!originalImage) {
      toast({
        title: "Kein Bild",
        description: "Bitte laden Sie zuerst ein Bild Ihres Hauses hoch.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("visualize-shutters", {
        body: {
          image: originalImage,
          material,
          designName,
          woodType: material === "wood" ? woodType : undefined,
          ralColor
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setVisualizedImage(data.image);
      toast({
        title: "Erfolg!",
        description: "Die Fensterläden wurden auf Ihr Bild montiert."
      });
    } catch (error) {
      console.error("Error visualizing shutters:", error);
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Visualisierung fehlgeschlagen. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Build display text for the configuration
  const getConfigSummary = () => {
    const parts = [];
    parts.push(material === "aluminum" ? "Aluminium" : `Holz (${woodType || "Standard"})`);
    parts.push(designName);
    if (ralColor) {
      parts.push(`RAL ${ralColor}`);
    }
    return parts.join(" • ");
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto relative group">
          {/* Shutter effect Overlay for fair mode */}
          <div className="absolute inset-0 z-50 rounded-xl overflow-hidden cursor-not-allowed group/overlay flex flex-col justify-center items-center shadow-inner">
            {/* Soft dark glass overlay - gets slightly blurrier on hover */}
            <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] transition-all duration-500 group-hover/overlay:bg-slate-900/40 group-hover/overlay:backdrop-blur-[2px]" />

            {/* Thematic Shutter louver pattern effect */}
            <div
              className="absolute inset-0 opacity-0 group-hover/overlay:opacity-30 pointer-events-none transition-opacity duration-700 mix-blend-multiply"
              style={{ backgroundImage: 'repeating-linear-gradient(180deg, transparent, transparent 18px, rgba(0,0,0,0.4) 19px, rgba(0,0,0,0.6) 24px)' }}
            />

            {/* The Badge */}
            <div className="relative z-10 bg-white/95 text-slate-800 px-10 py-5 rounded-2xl font-black text-2xl shadow-2xl border-b-4 border-primary/40 transform -rotate-2 flex flex-col items-center gap-1 group-hover/overlay:scale-110 transition-transform duration-500 hover:rotate-0">
              <span className="text-primary tracking-[0.2em] uppercase text-[10px] font-bold">Innovation in Arbeit</span>
              <span className="tracking-tight text-3xl">Bald verfügbar</span>
            </div>
          </div>
          {/* Card remains very readable, just slightly muted and unclickable */}
          <Card className="shadow-[var(--shadow-elegant)] opacity-[0.85] grayscale-[0.2] pointer-events-none select-none transition-all duration-500 group-hover/overlay:opacity-40">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Visualisieren Sie Ihre Fensterläden</CardTitle>
              <CardDescription>
                Laden Sie ein Foto Ihres Hauses hoch und sehen Sie, wie die ausgewählten Fensterläden aussehen würden
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="house-image">Foto Ihres Hauses hochladen</Label>
                <div className="flex items-center gap-4">
                  <input
                    id="house-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("house-image")?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Bild auswählen
                  </Button>
                </div>
              </div>

              {originalImage && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">Original</Label>
                      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                        <img
                          src={originalImage}
                          alt="Original Haus"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {visualizedImage && (
                      <div>
                        <Label className="mb-2 block">Mit Fensterläden</Label>
                        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                          <img
                            src={visualizedImage}
                            alt="Haus mit Fensterläden"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleVisualize}
                    disabled={isLoading}
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <Wand2 className="mr-2 h-5 w-5" />
                    {isLoading ? "Wird visualisiert..." : "Fensterläden visualisieren"}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Konfiguration: {getConfigSummary()}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
