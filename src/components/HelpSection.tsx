import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, FileText, Phone } from "lucide-react";

export const HelpSection = () => {
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
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Montage-Video</CardTitle>
              <CardDescription>
                Schritt-für-Schritt Anleitung zur fachgerechten Montage Ihrer Fensterläden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a 
                href="https://www.youtube.com/watch?v=example" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Video ansehen →
              </a>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-elegant)] hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Richtig Ausmessen</CardTitle>
              <CardDescription>
                Detaillierte Anleitung zum korrekten Ausmessen Ihrer Fenster für perfekte Passgenauigkeit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a 
                href="#" 
                className="text-primary hover:underline font-medium"
              >
                Anleitung lesen →
              </a>
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
                +43 (0) 1234 567890
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Mo-Fr: 8:00 - 17:00 Uhr
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
