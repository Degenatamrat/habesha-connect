import { useState } from "react";
import { Phone, User } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function ForgotEmail() {
  const [identifier, setIdentifier] = useState("");
  const [isFound, setIsFound] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const navigate = useNavigate();

  const handleFindAccount = () => {
    if (!identifier) return toast.error("Please enter your phone or name");

    // Mock result — replace later with backend API call
    setMaskedEmail("b****@gmail.com");
    setIsFound(true);
    toast.success("We found your account!");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 px-6">
      <div className="w-full max-w-sm bg-card p-6 rounded-2xl shadow-md text-center">
        <h1 className="text-2xl font-semibold mb-2">Forgot Email?</h1>
        <p className="text-muted-foreground mb-6">
          {isFound
            ? "We found your account! Here’s your email:"
            : "Enter your phone number or name to find your account."}
        </p>

        {!isFound ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="identifier">Phone or Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="0912xxxxxx or John Doe"
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={handleFindAccount} className="w-full mt-2 py-6 text-lg">
              Find My Account
            </Button>
          </div>
        ) : (
          <div className="bg-muted p-4 rounded-md">
            <p className="text-lg font-semibold text-foreground">{maskedEmail}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Use this email to sign in or reset your password.
            </p>
          </div>
        )}

        <Button
          variant="link"
          onClick={() => navigate("/")}
          className="text-primary mt-6 hover:underline"
        >
          Back to Sign In
        </Button>
      </div>
    </div>
  );
}
