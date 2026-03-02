import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const QuoteForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !message) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await supabase.functions.invoke('send-quote-form-email', {
        body: {
          name,
          email,
          phone: phone || undefined,
          company: company || undefined,
          address: address || undefined,
          message,
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Anfrage gesendet",
        description: "Wir werden uns schnellstmöglich bei Ihnen melden!"
      });

      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setAddress("");
      setMessage("");
    } catch (error) {
      console.error("Error submitting quote:", error);
      toast({
        title: "Fehler",
        description: "Beim Senden ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quote-company">Firma (optional)</Label>
                  <Input
                    id="quote-company"
                    placeholder="Firmenname"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quote-address">Adresse (optional)</Label>
                  <Input
                    id="quote-address"
                    placeholder="Straße, PLZ, Ort"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Wird gesendet...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Angebot schicken lassen
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-2">
                  Unverbindlich & kostenlos • Antwort innerhalb von 24 Stunden an Werktagen
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
