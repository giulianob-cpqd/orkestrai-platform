import { Link, useLocation } from "@tanstack/react-router";
import {
  Workflow,
  Bot,
  Brain,
  Plug,
  Server,
  Database,
  Rocket,
  Activity,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const buildItems = [
  { title: "Flow Orchestration", url: "/", icon: Workflow },
  { title: "Agent Builder", url: "/agent-builder", icon: Sparkles },
  { title: "Agents", url: "/agents", icon: Bot },
];

const catalogItems = [
  { title: "LLMs", url: "/llms", icon: Brain },
  { title: "APIs", url: "/apis", icon: Plug },
  { title: "MCP Servers", url: "/mcp", icon: Server },
  { title: "RAGs", url: "/rags", icon: Database },
];

const opsItems = [
  { title: "Deploy", url: "/deploy", icon: Rocket },
  { title: "Observability", url: "/observability", icon: Activity },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  const renderItems = (items: typeof buildItems) =>
    items.map((item) => {
      const active = pathname === item.url;
      return (
        <SidebarMenuItem key={item.url}>
          <SidebarMenuButton asChild isActive={active}>
            <Link to={item.url} className="group">
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="font-medium">{item.title}</span>}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-2 py-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)]">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-sm font-bold tracking-tight">Synapse</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                AI Orchestration
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Build</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(buildItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Catalog</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(catalogItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Operate</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(opsItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
