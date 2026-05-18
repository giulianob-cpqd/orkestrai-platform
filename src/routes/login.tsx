import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in · OrkestrAI" },
      { name: "description", content: "Sign in to the OrkestrAI Agentic AI Platform." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("ana.silva@orkestrai.ai");
  const [password, setPassword] = useState("demo");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/dashboard" });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-[image:var(--gradient-primary)] opacity-10 blur-3xl" />
      <Card className="relative z-10 w-full max-w-md border-border/60 bg-card/80 p-8 backdrop-blur-xl">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <img src="/logo.svg" alt="OrkestrAI" className="h-12 w-12" />
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Welcome to OrkestrAI</h1>
            <p className="text-sm text-muted-foreground">Sign in to your Agentic AI Platform.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[image:var(--gradient-primary)] text-primary-foreground"
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            Demo build · any email and password is accepted.
          </p>
        </form>
      </Card>
    </div>
  );
}
