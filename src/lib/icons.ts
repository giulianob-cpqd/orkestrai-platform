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
  Wand2,
  Clock,
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
  | "GitBranch"
  | "Wand2"
  | "Clock";

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
  Wand2,
  Clock,
};

export function resolveIcon(name: IconName): LucideIcon {
  return iconMap[name] ?? Bot;
}
