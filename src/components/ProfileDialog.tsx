import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { Mail, Phone, Users, Briefcase, UserCog } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  if (!user) return null;

  const fields = [
    { icon: Mail, label: "Email", value: user.email },
    { icon: Phone, label: "Phone", value: user.phone },
    { icon: UserCog, label: "Manager", value: user.manager },
    { icon: Briefcase, label: "Area", value: user.area },
    { icon: Users, label: "Team", value: user.team },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>Your personal and organization information.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 border-b border-border pb-4">
          <Avatar className="h-16 w-16 ring-2 ring-primary/30">
            <AvatarFallback className="bg-[image:var(--gradient-primary)] text-lg font-bold text-primary-foreground">
              {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold">{user.name}</p>
            <Badge variant="outline" className="mt-1 text-[10px]">
              {user.role}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.label} className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <f.icon className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  {f.label}
                </p>
                <p className="text-sm font-medium">{f.value}</p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
