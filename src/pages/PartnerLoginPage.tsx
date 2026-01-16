import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LogIn, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PartnerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Login-Funktion in Entwicklung",
      description: "Die Partner-Authentifizierung wird bald verfügbar sein."
    });
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Startseite
        </Button>

        <Card className="shadow-[var(--shadow-elegant)]">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary rounded mx-auto mb-4" />
            <CardTitle className="text-2xl">Partner-Login</CardTitle>
            <CardDescription>
              Melden Sie sich an, um Ihre individuellen Partnerpreise zu sehen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="partner@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" size="lg">
                <LogIn className="mr-2 h-4 w-4" />
                Anmelden
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>Noch kein Partner?</p>
              <a href="#" className="text-primary hover:underline font-medium">
                Jetzt Partner werden
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
