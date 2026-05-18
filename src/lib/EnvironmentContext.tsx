import { createContext, useContext, useState, ReactNode } from "react";

type Environment = "dev" | "staging" | "production";

interface EnvironmentContextType {
  activeEnv: Environment;
  setActiveEnv: (env: Environment) => void;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [activeEnv, setActiveEnv] = useState<Environment>("production");

  return (
    <EnvironmentContext.Provider value={{ activeEnv, setActiveEnv }}>
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironmentContext() {
  const context = useContext(EnvironmentContext);
  if (!context) {
    throw new Error("useEnvironmentContext must be used within EnvironmentProvider");
  }
  return context;
}

export function useEnvironment() {
  return useEnvironmentContext();
}
