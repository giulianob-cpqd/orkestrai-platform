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
  Inbox,
  Megaphone,
  ListChecks,
  LayoutTemplate,
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
  | "Clock"
  | "Inbox"
  | "Megaphone"
  | "ListChecks"
  | "LayoutTemplate";

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
  Inbox,
  Megaphone,
  ListChecks,
  LayoutTemplate,
};

export function resolveIcon(name: IconName): LucideIcon {
  return iconMap[name] ?? Bot;
}
