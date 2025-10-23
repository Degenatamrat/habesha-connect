import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthContext"; // 👈 to get current user

export default function ProfilePage() {
  const { user } = useAuth(); // { id, name, email }
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🌍 Adjust this for deployment (Render backend URL)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

  // === Load profile from backend ===
  useEffect(() => {
    if (!user?.id) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/profile/${user.id}`);
        const data = await res.json();
        if (data.success) {
          setProfile(data.user);
        } else {
          toast.error("Profile not found.");
        }
      } catch (err) {
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  // === Save profile to backend ===
  const handleSave = async () => {
    try {
      const res = await fetch(`${API_BASE}/profile/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, ...profile }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } else {
        toast.error("Update failed.");
      }
    } catch (err) {
      toast.error("Server error during update.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        No profile found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/10 flex flex-col items-center py-10 px-4">
      <Card className="w-full max-w-md shadow-lg rounded-3xl">
        <CardHeader className="text-center">
          <div className="flex flex-col items-center gap-3">
            <img
              src={
                profile.photo ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-primary/30"
            />
            <CardTitle className="text-2xl font-bold mt-2">
              {profile.name}
            </CardTitle>
            <p className="text-muted-foreground">{profile.gender}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Looking For</h3>
                <p>{profile.looking_for || "—"}</p>
              </div>

              <div>
                <h3 className="font-semibold">Interests</h3>
                <p>{Array.isArray(profile.interests) ? profile.interests.join(", ") : "—"}</p>
              </div>

              <div>
                <h3 className="font-semibold">Bio</h3>
                <p>{profile.bio || "—"}</p>
              </div>

              <div>
                <h3 className="font-semibold">Vibe</h3>
                <p>{Array.isArray(profile.vibe) ? profile.vibe.join(", ") : "—"}</p>
              </div>

              <div>
                <h3 className="font-semibold">Lifestyle</h3>
                <ul className="list-disc ml-5 text-sm">
                  {profile.lifestyle
                    ? Object.values(profile.lifestyle).map((item: any, i) => (
                        <li key={i}>{item}</li>
                      ))
                    : "—"}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold">Goals</h3>
                <p>{profile.goals || "—"}</p>
              </div>

              <div>
                <h3 className="font-semibold">Culture & Language</h3>
                <p>{Array.isArray(profile.culture) ? profile.culture.join(", ") : "—"}</p>
              </div>

              <div>
                <h3 className="font-semibold">Faith</h3>
                <p>
                  {profile.faith?.religion
                    ? `${profile.faith.religion} • Importance ${profile.faith.importance}/5`
                    : "—"}
                </p>
              </div>

              <div>
                <h3 className="font-semibold">Deal Breakers</h3>
                <p>{profile.deal_breakers || "—"}</p>
              </div>

              <Button
                onClick={() => setIsEditing(true)}
                className="w-full mt-4 py-6 text-lg"
              >
                Edit Profile
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={profile.name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Bio</Label>
                <Input
                  value={profile.bio || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Interests</Label>
                <Input
                  value={
                    Array.isArray(profile.interests)
                      ? profile.interests.join(", ")
                      : ""
                  }
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      interests: e.target.value
                        .split(",")
                        .map((x) => x.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>

              <Button
                onClick={handleSave}
                className="w-full mt-4 py-6 text-lg"
              >
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
