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
  Route,
  FileCode2,
  UserCheck,
  Repeat,
  ShieldCheck,
  Merge,
  Hourglass,
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
  | "LayoutTemplate"
  | "Route"
  | "FileCode2"
  | "UserCheck"
  | "Repeat"
  | "ShieldCheck"
  | "Merge"
  | "Hourglass";

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
  Route,
  FileCode2,
  UserCheck,
  Repeat,
  ShieldCheck,
  Merge,
  Hourglass,
};

export function resolveIcon(name: IconName): LucideIcon {
  return iconMap[name] ?? Bot;
}
