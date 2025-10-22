import { useState } from "react";
import { Envelope } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();

  const handleSendReset = () => {
    if (!email) return toast.error("Please enter your email");
    // Mock success
    toast.success("Password reset link sent to your inbox!");
    setIsSent(true);
    setTimeout(() => navigate("/"), 2500); // Redirect after short delay
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 px-6">
      <div className="w-full max-w-sm bg-card p-6 rounded-2xl shadow-md text-center">
        <h1 className="text-2xl font-semibold mb-2">Forgot Password?</h1>
        <p className="text-muted-foreground mb-6">
          {isSent
            ? "Check your inbox for the reset link."
            : "Enter your email address and we’ll send you a password reset link."}
        </p>

        {!isSent && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Envelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={handleSendReset} className="w-full mt-2 py-6 text-lg">
              Send Reset Link
            </Button>
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
