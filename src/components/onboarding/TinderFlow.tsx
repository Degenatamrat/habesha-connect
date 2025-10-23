import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function TinderFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    photo: "",
    name: "",
    gender: "",
    lookingFor: "",
    interests: [] as string[],
    bio: "",
    personality: [] as string[],
    lifestyle: [] as string[],
    goal: "",
    culture: [] as string[],
    religion: "",
    faithImportance: "",
    dealBreakers: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const next = () => setStep((s) => Math.min(s + 1, 12));
  const prev = () => setStep((s) => Math.max(s - 1, 1));
  const skip = () => next();

  const toggleMulti = (key: keyof typeof form, value: string) => {
    setForm((prev) => {
      const arr = prev[key] as string[];
      return {
        ...prev,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  const handleLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm((f) => ({ ...f, latitude, longitude }));
        toast.success("📍 Location saved successfully!");
        next();
      },
      () => {
        toast.error("Could not access your location.");
      }
    );
  };

  const handleFinish = () => {
    toast.success("✨ Welcome to Habesha — let’s get you connected!");
    setTimeout(onComplete, 2000);
  };

  const variants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  const Progress = () => (
    <div className="flex justify-center mt-6 space-x-1">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${
            i + 1 === step ? "bg-primary" : "bg-muted"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="w-full max-w-sm bg-card p-6 rounded-2xl shadow-md text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4 }}
          >
            {/* STEP 1 – Add Photo */}
            {step === 1 && (
              <>
                <h2 className="text-2xl font-semibold mb-4">Add Your First Photo 📸</h2>
                <p className="text-sm text-muted-foreground mb-3">
                  Profiles with photos get 5× more matches. Optional — you can skip!
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setForm({ ...form, photo: e.target.files?.[0]?.name || "" })
                  }
                />
                <Button onClick={next} className="w-full mt-4 py-6 text-lg">
                  {form.photo ? "Continue" : "Skip"}
                </Button>
              </>
            )}

            {/* STEP 2 – Name, Gender, Looking For */}
            {step === 2 && (
              <>
                <h2 className="text-2xl font-semibold mb-4">Tell Us About You 💫</h2>
                <div className="space-y-3 text-left">
                  <div>
                    <Label htmlFor="name">What should we call you?</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">I am...</Label>
                    <select
                      id="gender"
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <Label>Looking for...</Label>
                    <select
                      value={form.lookingFor}
                      onChange={(e) =>
                        setForm({ ...form, lookingFor: e.target.value })
                      }
                      className="w-full border rounded-md p-2"
                    >
                      <option value="">Select...</option>
                      <option value="friendship">Friendship</option>
                      <option value="dating">Dating</option>
                      <option value="networking">Networking</option>
                    </select>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    if (!form.name || !form.gender) {
                      toast.error("Please fill name and gender.");
                      return;
                    }
                    next();
                  }}
                  className="w-full mt-4 py-6 text-lg"
                >
                  Continue
                </Button>
              </>
            )}

            {/* STEP 3 – Interests */}
            {step === 3 && (
              <>
                <h2 className="text-2xl font-semibold mb-4">What are you into? 🎯</h2>
                <p className="text-sm text-muted-foreground mb-3">
                  Choose up to 3 interests (optional)
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["🎶 Music", "🍲 Foodie", "💼 Business", "🧳 Travel", "🎭 Culture", "❤️ Volunteering"].map(
                    (item) => (
                      <button
                        key={item}
                        className={`px-3 py-2 border rounded-full ${
                          form.interests.includes(item)
                            ? "bg-primary text-white"
                            : "bg-background"
                        }`}
                        onClick={() => toggleMulti("interests", item)}
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={skip}>
                    Skip
                  </Button>
                  <Button onClick={next}>Continue</Button>
                </div>
              </>
            )}

            {/* STEP 4 – Short Bio */}
            {step === 4 && (
              <>
                <h2 className="text-2xl font-semibold mb-4">Add a Short Bio ✍️</h2>
                <p className="text-sm text-muted-foreground mb-3">Optional</p>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Food lover | Traveler | Community builder 🌍"
                  className="w-full border rounded-md p-2 h-24"
                />
                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={skip}>
                    Skip
                  </Button>
                  <Button onClick={next}>Continue</Button>
                </div>
              </>
            )}

            {/* STEP 5 – Personality */}
            {step === 5 && (
              <>
                <h2 className="text-2xl font-semibold mb-4">How would friends describe you? 💬</h2>
                <p className="text-sm text-muted-foreground mb-3">Optional</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["😎 Chill","😂 Funny","💪 Ambitious","🧠 Deep Thinker","🎉 Outgoing","🐾 Kind-hearted","🎨 Creative"].map(
                    (item) => (
                      <button
                        key={item}
                        className={`px-3 py-2 border rounded-full ${
                          form.personality.includes(item)
                            ? "bg-primary text-white"
                            : "bg-background"
                        }`}
                        onClick={() => toggleMulti("personality", item)}
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={skip}>
                    Skip
                  </Button>
                  <Button onClick={next}>Continue</Button>
                </div>
              </>
            )}

            {/* STEP 6 – Lifestyle */}
            {step === 6 && (
              <>
                <h2 className="text-2xl font-semibold mb-4">What’s your lifestyle like? 🌅</h2>
                <p className="text-sm text-muted-foreground mb-3">Optional</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "☕ Early Bird",
                    "🌙 Night Owl",
                    "🚭 Non-smoker",
                    "🚬 Smoker",
                    "🍷 Drinks socially",
                    "🚫 Doesn’t drink",
                    "💪 Active",
                    "🛋️ Laid-back",
                  ].map((item) => (
                    <button
                      key={item}
                      className={`px-3 py-2 border rounded-full ${
                        form.lifestyle.includes(item)
                          ? "bg-primary text-white"
                          : "bg-background"
                      }`}
                      onClick={() => toggleMulti("lifestyle", item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={skip}>
                    Skip
                  </Button>
                  <Button onClick={next}>Continue</Button>
                </div>
              </>
            )}

            {/* STEP 7 – Relationship Goals */}
            {step === 7 && (
              <>
                <h2 className="text-2xl font-semibold mb-4">What are you looking for? ❤️</h2>
                <div className="space-y-2">
                  {["Serious Relationship","Something Casual","Friendship First","Not Sure Yet"].map(
                    (goal) => (
                      <Button
                        key={goal}
                        onClick={() => {
                          setForm({ ...form, goal });
                          next();
                        }}
                        className={`w-full ${
                          form.goal === goal ? "bg-primary" : "bg-background"
                        }`}
                      >
                        {goal}
                      </Button>
                    )
                  )}
                </div>
                <Button variant="outline" className="mt-3" onClick={skip}>
                  Skip
                </Button>
              </>
            )}

            {/* STEP 8 – Culture & Language */}
            {step === 8 && (
              <>
                <h2 className="text-2xl font-semibold mb-4">Culture & Language 🌍</h2>
                <p className="text-sm text-muted-foreground mb-3">Optional</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["🇪🇹 Amharic","🇪🇷 Tigrinya","🇸🇴 Somali","🌍 English","💬 Arabic","🎶 Afrobeat & Culture"].map(
                    (item) => (
                      <button
                        key={item}
                        className={`px-3 py-2 border rounded-full ${
                          form.culture.includes(item)
                            ? "bg-primary text-white"
                            : "bg-background"
                        }`}
                        onClick={() => toggleMulti("culture", item)}
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={skip}>
                    Skip
                  </Button>
                  <Button onClick={next}>Continue</Button>
                </div>
              </>
            )}

            {/* STEP 9 – Faith */}
            {step === 9 && (
              <>
                <h2 className="text-2xl font-semibold mb-4">Faith & Daily Life 🙏</h2>
                <p className="text-sm text-muted-foreground mb-3">Optional</p>
                <div className="space-y-3 text-left">
                  <div>
                    <Label>Religion</Label>
                    <select
                      value={form.religion}
                      onChange={(e) => setForm({ ...form, religion: e.target.value })}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="">Select...</option>
                      <option value="Christian">Christian</option>
                      <option value="Muslim">Muslim</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <Label>How important is faith to you?</Label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={form.faithImportance || 3}
                      onChange={(e) =>
                        setForm({ ...form, faithImportance: e.target.value })
                      }
                      className="w-full mt-1"
                    />
                  </div>
                </div>
                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={skip}>
                    Skip
                  </Button>
                  <Button onClick={next}>Continue</Button>
                </div>
              </>
            )}

            {/* STEP 10 – Deal Breakers */}
            {step === 10 && (
              <>
                <h2 className="text-2xl font-semibold mb-4">Deal Breakers 🎯</h2>
                <p className="text-sm text-muted-foreground mb-3">Optional</p>
                <textarea
                  value={form.dealBreakers}
                  onChange={(e) => setForm({ ...form, dealBreakers: e.target.value })}
                  placeholder="Kindness matters more than looks 😊"
                  maxLength={120}
                  className="w-full border rounded-md p-2 h-24"
                />
                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={skip}>
                    Skip
                  </Button>
                  <Button onClick={next}>Continue</Button>
                </div>
              </>
            )}

            {/* STEP 11 – Enable Location */}
            {step === 11 && (
              <>
                <h2 className="text-2xl font-semibold mb-4">Allow Your Location 📍</h2>
                <p className="text-sm text-muted-foreground mb-3">
                  We only use your location to show nearby connections — never shared publicly.
                </p>
                <Button onClick={handleLocation} className="w-full mt-2 py-6 text-lg">
                  Allow Location Access
                </Button>
                <Button variant="outline" onClick={skip} className="w-full mt-2 py-6 text-lg">
                  Skip for now
                </Button>
              </>
            )}

            {/* STEP 12 – Finish */}
            {step === 12 && (
              <>
                <h2 className="text-2xl font-semibold mb-4">✨ You’re all set!</h2>
                <p className="text-sm text-muted-foreground mb-3">
                  We’ll help you meet people who share your vibe.
                </p>
                <Button onClick={handleFinish} className="w-full mt-4 py-6 text-lg">
                  Finish & Start Matching
                </Button>
              </>
            )}
          </motion.div>
        </AnimatePresence>
        <Progress />
        {step > 1 && step < 12 && (
          <button
            onClick={prev}
            className="text-sm text-muted-foreground mt-3 underline"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}
