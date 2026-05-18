import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  manager: string;
  area: string;
  team: string;
  role: string;
  avatarUrl?: string;
}

const DEFAULT_USER: UserProfile = {
  name: "Ana Silva",
  email: "ana.silva@orkestrai.ai",
  phone: "+55 11 98765-4321",
  manager: "Carlos Mendes",
  area: "Knowledge Platform",
  team: "AI Orchestration",
  role: "Senior AI Engineer",
};

interface AuthCtx {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);
const STORAGE_KEY = "inspire.auth.user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  const login = async (email: string, _password: string) => {
    const u: UserProfile = { ...DEFAULT_USER, email: email || DEFAULT_USER.email };
    setUser(u);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } catch {
      // ignore
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {hydrated ? children : null}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    if (!isAuthenticated && typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, [isAuthenticated]);
  return isAuthenticated;
}
