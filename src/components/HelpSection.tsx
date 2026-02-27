import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, FileText, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const HelpSection = () => {
  const { toast } = useToast();

  return (
    <section id="hilfe" className="py-16 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Hilfe & Anleitungen
          </h2>
          <p className="text-lg text-muted-foreground">
            Alles was Sie für die perfekte Montage wissen müssen
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="shadow-[var(--shadow-elegant)] hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 text-xs whitespace-nowrap px-3 py-1">Bald verfügbar</Badge>
              </div>
              <CardTitle>Montage-Video</CardTitle>
              <CardDescription>
                Schritt-für-Schritt Anleitung zur fachgerechten Montage Ihrer Fensterläden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <button
                type="button"
                onClick={() => toast({ title: "Bald verfügbar", description: "Diese Funktion steht in Kürze zur Verfügung." })}
                className="text-primary hover:underline font-medium bg-transparent border-0 p-0"
              >
                Video ansehen →
              </button>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-elegant)] hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 text-xs whitespace-nowrap px-3 py-1">Bald verfügbar</Badge>
              </div>
              <CardTitle>Richtig Ausmessen</CardTitle>
              <CardDescription>
                Detaillierte Anleitung zum korrekten Ausmessen Ihrer Fenster für perfekte Passgenauigkeit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <button
                type="button"
                onClick={() => toast({ title: "Bald verfügbar", description: "Diese Funktion steht in Kürze zur Verfügung." })}
                className="text-primary hover:underline font-medium bg-transparent border-0 p-0"
              >
                Anleitung lesen →
              </button>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-elegant)] hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Persönliche Beratung</CardTitle>
              <CardDescription>
                Haben Sie Fragen? Unser Expertenteam steht Ihnen gerne zur Verfügung
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-primary">
                +43 55 77 / 85 9 44-0
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                info@blank.at
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
