import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const QuoteForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !email || !message) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Anfrage gesendet",
      description: "Wir werden uns schnellstmöglich bei Ihnen melden!"
    });

    // Reset form
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
  };

  return (
    <section className="py-16">
      <div className="container px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-[var(--shadow-elegant)]">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Jetzt Angebot schicken lassen</CardTitle>
              <CardDescription>
                Füllen Sie das Formular aus und wir erstellen Ihnen ein detailliertes, unverbindliches Angebot mit allen technischen Details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Ihr Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ihre@email.at"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+43 ..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Ihre Nachricht *</Label>
                  <Textarea
                    id="message"
                    placeholder="Beschreiben Sie Ihr Projekt..."
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90">
                  <Send className="mr-2 h-5 w-5" />
                  Angebot schicken lassen
                </Button>
                
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Unverbindlich & kostenlos • Antwort innerhalb von 24 Stunden
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
