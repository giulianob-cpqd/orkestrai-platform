import { useEnvironment } from "@/lib/EnvironmentContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Server } from "lucide-react";
import { cn } from "@/lib/utils";

const envConfig = {
  dev: { label: "Development", color: "border-red-500/60 text-red-400" },
  staging: { label: "Staging", color: "border-yellow-500/60 text-yellow-400" },
  production: { label: "Production", color: "border-blue-500/60 text-blue-400" },
};

export function EnvironmentSelector() {
  const { activeEnv, setActiveEnv } = useEnvironment();
  const config = envConfig[activeEnv];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 border-2 font-mono text-xs font-semibold",
            config.color
          )}
        >
          <Server className="h-3.5 w-3.5" />
          {activeEnv}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Select environment
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={activeEnv} onValueChange={(v) => setActiveEnv(v as "dev" | "staging" | "production")}>
          {(["dev", "staging", "production"] as const).map((env) => (
            <DropdownMenuRadioItem key={env} value={env} className="cursor-pointer">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold capitalize">{envConfig[env].label}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{env}</span>
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
