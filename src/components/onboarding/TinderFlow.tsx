import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function TinderFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");

  // === STEP 1: Phone Verification ===
  const handleSendOTP = () => {
    if (!phone) return toast.error("Enter your phone number");
    toast.success("OTP sent to your phone!");
    setStep(2);
  };

  const handleVerifyOTP = () => {
    if (!otp) return toast.error("Enter the OTP code");
    toast.success("Phone verified successfully!");
    setStep(3);
  };

  // === STEP 2: Basic Info ===
  const handleNextProfile = () => {
    if (!name || !gender) return toast.error("Please fill all fields");
    toast.success("Profile info saved!");
    setStep(4);
  };

  // === STEP 3: Bio ===
  const handleFinish = () => {
    if (!bio) return toast.error("Write a short bio");
    toast.success("Welcome to Habesha ❤️");
    setTimeout(onComplete, 2000);
  };

  // === RENDER ===
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="w-full max-w-sm bg-card p-6 rounded-2xl shadow-md text-center">
        {step === 1 && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Verify Your Phone</h2>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0912xxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2"
            />
            <Button onClick={handleSendOTP} className="w-full mt-4 py-6 text-lg">
              Send OTP
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Enter OTP</h2>
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="number"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-2"
            />
            <Button onClick={handleVerifyOTP} className="w-full mt-4 py-6 text-lg">
              Verify
            </Button>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Tell Us About You</h2>
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full border rounded-md p-2 mt-1"
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            <Button onClick={handleNextProfile} className="w-full mt-4 py-6 text-lg">
              Continue
            </Button>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Write a Short Bio</h2>
            <Label htmlFor="bio">About You</Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Something short and sweet..."
              className="w-full border rounded-md p-2 mt-2 h-24"
            />
            <Button onClick={handleFinish} className="w-full mt-4 py-6 text-lg">
              Finish & Start
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
