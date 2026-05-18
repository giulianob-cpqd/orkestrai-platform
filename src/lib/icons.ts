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
  Zap,
  Cable,
  AlertCircle,
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
  | "Hourglass"
  | "Zap"
  | "Cable"
  | "AlertCircle";

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
  Zap,
  Cable,
  AlertCircle,
};

export function resolveIcon(name: IconName): LucideIcon {
  return iconMap[name] ?? Bot;
}
