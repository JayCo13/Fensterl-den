import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export const ConfiguratorInfo = () => {
  return (
    <div className="max-w-4xl mx-auto mb-12 px-4">
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-4 text-center">
            So einfach konfigurieren Sie Ihren perfekten Fensterladen
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Material wählen</h4>
                <p className="text-sm text-muted-foreground">
                  Entscheiden Sie sich zwischen wartungsfreiem Aluminium oder natürlichem Holz
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Design auswählen</h4>
                <p className="text-sm text-muted-foreground">
                  Wählen Sie aus vielen verschiedenen Designs das passende für Ihr Haus
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Maße eingeben</h4>
                <p className="text-sm text-muted-foreground">
                  Geben Sie die exakten Maße Ihres Fensters ein - wir berechnen alles automatisch
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-primary/20">
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Sofortige Preisberechnung</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Maßgefertigte Lösungen</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Österreichische Qualität</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
