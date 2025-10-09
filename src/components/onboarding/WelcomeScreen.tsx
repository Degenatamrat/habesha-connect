import { Heart, Users, Shield, ArrowRight } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface WelcomeScreenProps {
  onGetStarted: () => void
}

export default function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo and Title */}
        <div className="space-y-4">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto shadow-lg">
            <Heart className="w-12 h-12 text-primary-foreground" weight="fill" />
          </div>
          
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Welcome to Habesha
            </h1>
            <p className="text-lg text-muted-foreground">
              Connect with Ethiopian & Eritrean hearts across the Arab world
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <Card className="text-left">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Cultural Connections</h3>
                <p className="text-sm text-muted-foreground">
                  Find people who share your heritage and values
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="text-left">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">Diaspora Community</h3>
                <p className="text-sm text-muted-foreground">
                  Connect across UAE, Saudi Arabia, Kuwait, Qatar & more
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="text-left">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/30 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Safe & Verified</h3>
                <p className="text-sm text-muted-foreground">
                  Every profile is verified for authentic connections
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="space-y-4">
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="w-full text-lg py-6 shadow-lg hover:shadow-xl transition-all"
          >
            Start Your Journey
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <p className="text-sm text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Cultural Touch */}
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground italic">
            "በቀላል ቃል እንዲህ ይላል - ለኢትዮጵያዊያን ፍቅር"
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            "In simple words - Love for Ethiopians"
          </p>
        </div>
      </div>
    </div>
  )
}