import {
  Bot,
  Brain,
  Database,
  Webhook,
  Radio,
  Cloud,
  Send,
  Globe,
  Server,
  MemoryStick,
  Wrench,
  GitBranch,
  type LucideIcon,
} from "lucide-react";

export type IconName =
  | "Bot"
  | "Brain"
  | "Database"
  | "Webhook"
  | "Radio"
  | "Cloud"
  | "Send"
  | "Globe"
  | "Server"
  | "MemoryStick"
  | "Wrench"
  | "GitBranch";

const iconMap: Record<IconName, LucideIcon> = {
  Bot,
  Brain,
  Database,
  Webhook,
  Radio,
  Cloud,
  Send,
  Globe,
  Server,
  MemoryStick,
  Wrench,
  GitBranch,
};

export function resolveIcon(name: IconName): LucideIcon {
  return iconMap[name] ?? Bot;
}
