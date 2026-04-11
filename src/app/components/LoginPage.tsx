import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Building2, TrendingUp, Users, Shield } from "lucide-react";

type Role = "startup" | "investor" | "advisor";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role") as Role | null;
  
  const [selectedRole, setSelectedRole] = useState<Role | null>(roleParam);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const roles = [
    {
      id: "startup" as Role,
      name: "Startup",
      icon: Building2,
      description: "Build credibility and find investors",
      color: "blue",
    },
    {
      id: "investor" as Role,
      name: "Investor",
      icon: TrendingUp,
      description: "Discover verified startups",
      color: "teal",
    },
    {
      id: "advisor" as Role,
      name: "Financial Advisor",
      icon: Users,
      description: "Share expertise and build reputation",
      color: "purple",
    },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole) {
      // Mock login - navigate to role-specific dashboard
      navigate(`/${selectedRole}/dashboard`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="font-semibold text-primary-foreground">MM</span>
            </div>
            <span className="text-2xl font-semibold">MoneyMinds</span>
          </div>
          <h1 className="text-3xl font-semibold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">
            {!selectedRole
              ? "Select your role to continue"
              : `Login as ${roles.find((r) => r.id === selectedRole)?.name}`}
          </p>
        </div>

        {!selectedRole ? (
          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Card
                  key={role.id}
                  className="p-8 cursor-pointer hover:shadow-lg hover:border-accent transition-all"
                  onClick={() => setSelectedRole(role.id)}
                >
                  <div
                    className={`h-14 w-14 rounded-lg bg-${role.color}-100 flex items-center justify-center mb-6 mx-auto`}
                  >
                    <Icon className={`h-7 w-7 text-${role.color}-600`} />
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-2">
                    {role.name}
                  </h3>
                  <p className="text-muted-foreground text-center text-sm mb-6">
                    {role.description}
                  </p>
                  <Button className="w-full">
                    Login as {role.name}
                  </Button>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="max-w-md mx-auto p-8">
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => setSelectedRole(null)}
                className="mb-4"
              >
                ← Choose different role
              </Button>

              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                {(() => {
                  const role = roles.find((r) => r.id === selectedRole);
                  const Icon = role?.icon || Shield;
                  return (
                    <>
                      <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <div className="font-medium">{role?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {role?.description}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Continue to Dashboard
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Button variant="link" className="p-0 h-auto">
                  Sign up
                </Button>
              </p>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
