import { useState, useEffect } from "react";
import { Heart, Envelope, Lock, Eye, EyeSlash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import TinderFlow from "@/components/onboarding/TinderFlow";
import { useNavigate } from "react-router-dom";

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTinderFlow, setShowTinderFlow] = useState(false);

  // ✅ Persist login
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser && window.location.pathname !== "/discover") {
      navigate("/discover");
    }
  }, [navigate]);

  // ==== SIGN IN ====
  const handleSignIn = async () => {
    if (!email || !password) return toast.error("Please fill in all fields");
    setIsLoading(true);
    try {
      const success = await signIn(email, password);
      if (success) {
        // Get or create user record
        const existing = JSON.parse(localStorage.getItem("user") || "{}");
        const user = {
          email,
          phoneVerified: existing.phoneVerified === true ? true : false, // default false if missing
        };

        localStorage.setItem("user", JSON.stringify(user));

        // ✅ Force TinderFlow if not verified
        if (!user.phoneVerified) {
          toast("Please verify your phone number before continuing.");
          setShowTinderFlow(true);
          return;
        }

        toast.success("Welcome back!");
        navigate("/discover");
      } else {
        toast.error("Invalid credentials");
      }
    } catch {
      toast.error("Sign in failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==== SIGN UP ====
  const handleSignUp = async () => {
    if (!email || !password) return toast.error("Please fill in all fields");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (!email.includes("@")) return toast.error("Enter a valid email");

    setIsLoading(true);
    try {
      await signUp(email, password, email.split("@")[0]);
      localStorage.setItem("user", JSON.stringify({ email, phoneVerified: false }));
      toast.success("Account created! Let's verify your phone number.");
      setShowTinderFlow(true);
    } catch {
      toast.error("Sign up failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==== Show TinderFlow ====
  if (showTinderFlow) {
    return (
      <TinderFlow
        onComplete={() => {
          // ✅ Mark user as verified after completion
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          user.phoneVerified = true;
          localStorage.setItem("user", JSON.stringify(user));
          toast.success("Phone number verified successfully!");
          navigate("/discover");
        }}
      />
    );
  }

  // ==== MAIN AUTH SCREEN ====
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex flex-col items-center justify-center px-6">
      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg">
        <Heart className="w-8 h-8 text-primary-foreground" weight="fill" />
      </div>

      <h1 className="text-3xl font-bold mb-2 text-foreground">Welcome to Habesha</h1>
      <p className="text-muted-foreground mb-6 text-center">
        Connect your heart with Ethiopian &amp; Eritrean souls 💕
      </p>

      <div className="w-full max-w-sm bg-card p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold text-center mb-4">
          {mode === "signin" ? "Sign In" : "Create Account"}
        </h2>

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

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="pl-10 pr-10"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button
            onClick={mode === "signin" ? handleSignIn : handleSignUp}
            className="w-full mt-4 py-6 text-lg"
            disabled={isLoading}
          >
            {isLoading ? "Please wait..." : mode === "signin" ? "Sign In" : "Sign Up"}
          </Button>
        </div>

        {/* Links */}
        <div className="text-sm text-center text-muted-foreground mt-4 space-y-1">
          <button
            onClick={() => navigate("/forgot-password")}
            className="text-primary hover:underline block"
          >
            Forgot Password?
          </button>
          <button
            onClick={() => navigate("/forgot-email")}
            className="text-primary hover:underline block"
          >
            Forgot Email?
          </button>
          <p className="mt-2">
            {mode === "signin" ? (
              <>
                New here?{" "}
                <button onClick={() => setMode("signup")} className="text-primary hover:underline">
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already a member?{" "}
                <button onClick={() => setMode("signin")} className="text-primary hover:underline">
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground italic mt-6">
        "በቀላል ቃል እንዲህ ይላል - ለኢትዮጵያዊያን ፍቅር"
      </p>
      <p className="text-xs text-muted-foreground">"In simple words - Love for Ethiopians"</p>
    </div>
  );
}
