import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { acceptConsent, declineConsent, getConsent } from "@/lib/posthog";

export const ConsentBanner = () => {
  const [visible, setVisible] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [atBottom, setAtBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(getConsent() === "unknown");
  }, []);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 4);
  };

  useEffect(() => {
    if (termsOpen) {
      requestAnimationFrame(checkScroll);
    }
  }, [termsOpen]);

  if (!visible) return null;

  const handleAccept = () => {
    acceptConsent();
    setVisible(false);
  };

  const handleDecline = () => {
    declineConsent();
    setVisible(false);
  };

  return (
    <>
      <div
        role="dialog"
        aria-label="Datenschutz- und Nutzungsbedingungen"
        aria-hidden={termsOpen}
        className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-40 rounded-lg border bg-white shadow-lg p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${termsOpen ? "invisible pointer-events-none" : ""}`}
      >
        <p className="text-sm text-foreground leading-relaxed">
          Ich akzeptiere die{" "}
          <button
            type="button"
            onClick={() => setTermsOpen(true)}
            className="underline text-primary hover:text-primary/80"
          >
            Datenschutz- und Nutzungsbedingungen
          </button>{" "}
          des Online-Fensterladenkonfigurators von BLANK.
        </p>
        <div className="flex flex-col gap-1.5">
          <Button size="sm" onClick={handleAccept}>
            Akzeptieren
          </Button>
          <button
            type="button"
            onClick={handleDecline}
            className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline self-center"
          >
            Ohne Zustimmung fortfahren
          </button>
        </div>
      </div>

      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl rounded-lg p-4 sm:p-6 max-h-[90vh] flex flex-col gap-3 sm:gap-4 [&>button]:hidden">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setTermsOpen(false)}
              aria-label="Schließen"
              className="rounded-full border-2 border-primary p-1.5 text-primary hover:bg-primary hover:text-primary-foreground transition-colors focus:outline-none focus-visible:bg-primary/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg leading-snug">
              Datenschutz- &amp; Nutzungsbedingungen Blank Online Konfigurator
            </DialogTitle>
          </DialogHeader>
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex-1 min-h-0 overflow-y-auto pr-2 text-sm text-foreground leading-relaxed space-y-4"
          >
              <section>
                <h3 className="font-semibold mb-1">Allgemeines</h3>
                <p>
                  Dieser Konfigurator dient der digitalen Planung und Konfiguration von Fensterläden und ähnlichen Produkten der BLANK GmbH.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-1">Nutzungsumfang</h3>
                <p>
                  Die Nutzung des Konfigurators erfolgt ausschließlich zu Informations-, Planungs- und Angebotszwecken. Alle dargestellten Inhalte, Konfigurationen, Visualisierungen und Berechnungen dienen der unverbindlichen Orientierung und stellen kein verbindliches Angebot dar.
                </p>
                <p className="mt-2">
                  Technische Änderungen, Irrtümer sowie Abweichungen in Darstellung, Farbe oder Ausführung bleiben vorbehalten.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-1">Analyse und Optimierung</h3>
                <p>
                  Zur Verbesserung der Benutzerfreundlichkeit sowie der technischen Stabilität analysieren wir die Nutzung des Konfigurators.
                </p>
                <p className="mt-2">Dabei können anonymisierte Nutzungsdaten verarbeitet werden, insbesondere:</p>
                <ul className="list-disc pl-5 mt-1 space-y-0.5">
                  <li>aufgerufene Bereiche und Interaktionen innerhalb des Konfigurators</li>
                  <li>technische Informationen zum verwendeten Browser und Endgerät</li>
                  <li>Sitzungsverläufe, Klicks und Navigationsverhalten</li>
                  <li>technische Fehler und Ladezeiten</li>
                </ul>
                <p className="mt-2">
                  Zu diesem Zweck können Sitzungen anonymisiert aufgezeichnet werden („Session Replay"), um Bedienprobleme und technische Fehler besser nachvollziehen und den Konfigurator laufend verbessern zu können.
                </p>
                <p className="mt-2">
                  Personenbezogene oder sensible Eingaben werden dabei nicht gespeichert oder technisch maskiert.
                </p>
                <p className="mt-2">
                  Für diese Analyse- und Optimierungszwecke verwenden wir PostHog. Die Verarbeitung erfolgt ausschließlich nach Ihrer Zustimmung.
                </p>
                <p className="mt-2">
                  Weitere Informationen:{" "}
                  <a
                    href="https://posthog.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-primary hover:text-primary/80"
                  >
                    posthog.com/privacy
                  </a>
                  <br />
                  Informationen zur DSGVO-Compliance:{" "}
                  <a
                    href="https://posthog.com/docs/privacy/gdpr-compliance"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-primary hover:text-primary/80"
                  >
                    posthog.com/docs/privacy/gdpr-compliance
                  </a>
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-1">Datenschutz</h3>
                <p>
                  Ergänzend gelten die Datenschutzbestimmungen der BLANK GmbH:{" "}
                  <a
                    href="https://www.blank.at/datenschutz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-primary hover:text-primary/80"
                  >
                    blank.at/datenschutz
                  </a>
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-1">Kontakt</h3>
                <p>
                  BLANK GmbH<br />
                  <a
                    href="https://www.blank.at"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-primary hover:text-primary/80"
                  >
                    blank.at
                  </a>
                </p>
              </section>

            <div
              aria-hidden="true"
              className={`sticky bottom-0 -mx-1 h-12 pointer-events-none flex items-end justify-center pb-1 bg-gradient-to-t from-background via-background/85 to-transparent transition-opacity duration-300 ${atBottom ? "opacity-0" : "opacity-100"}`}
            >
              <ChevronDown className="h-5 w-5 text-foreground/60 animate-bounce" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
