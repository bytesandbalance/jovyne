import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

interface PricingPlansProps {
  onSubscribe?: () => void;
  showOnlyPro?: boolean;
}

export function PricingPlans({ onSubscribe, showOnlyPro = false }: PricingPlansProps) {
  const { user } = useAuth();

  const clientFeatures = [
    "Submit unlimited event requests",
    "Browse verified planners",
    "Direct messaging with planners", 
    "Basic task management",
    "Event planning assistance",
    "24/7 customer support"
  ];

  const plannerFeatures = [
    "Receive unlimited client requests",
    "Complete task & project management", 
    "Business calendar & scheduling",
    "Invoice creation & management",
    "Inventory tracking",
    "Vendor directory access",
    "Event templates library",
    "Client communication system",
    "Portfolio showcase",
    "All organizational tools included"
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          {showOnlyPro ? "Jovial Pro Subscription" : "Choose Your Perfect Plan"}
        </h1>
        <p className="text-xl text-muted-foreground">
          {showOnlyPro 
            ? "Complete business management for event planners with first month free"
            : "Whether you're planning events or organizing them, we have the right plan for you"
          }
        </p>
      </div>

      <div className={`grid gap-8 ${showOnlyPro ? 'max-w-md' : 'md:grid-cols-2 max-w-4xl'} mx-auto`}>
        {/* Client Plan - Free */}
        {!showOnlyPro && (
          <Card className="relative border-2">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-6 h-6 text-pink-500" />
                <Badge variant="secondary">For Clients</Badge>
              </div>
              <CardTitle className="text-2xl">Jovial Free</CardTitle>
              <CardDescription>Perfect for party hosts and event clients</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">Free</span>
                <span className="text-muted-foreground ml-2">Forever</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {clientFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/">Get Started Free</Link>
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Planner Plan - Pro */}
        <Card className="relative border-2 border-primary shadow-lg">
          {!showOnlyPro && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1">
                Most Popular
              </Badge>
            </div>
          )}
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              <Badge variant="default">For Planners</Badge>
            </div>
            <CardTitle className="text-2xl">Jovial Pro</CardTitle>
            <CardDescription>Complete business management for event planners</CardDescription>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">€49</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  First month FREE
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {plannerFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={onSubscribe}
              disabled={!user}
            >
              {!user ? "Sign up to Subscribe" : "Subscribe"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="text-center mt-12 text-sm text-muted-foreground">
        <p>All plans include SSL security, data backup, and GDPR compliance.</p>
        <p className="mt-2">Cancel anytime. No hidden fees. European billing compliant.</p>
      </div>
    </div>
  );
}