import { Link, useLocation } from "@tanstack/react-router";
import { Workflow, Bot, Brain, Plug, Server, Database, Sparkles, LayoutTemplate, LayoutDashboard } from "lucide-react";
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
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, match: (p: string) => p === "/dashboard" },
  { title: "Orchestrations", url: "/orchestrations", icon: Workflow, match: (p: string) => p === "/orchestrations" || p.startsWith("/orchestrations/") },
  { title: "Agents", url: "/agents", icon: Bot, match: (p: string) => p === "/agents" || p.startsWith("/agents/") },
  { title: "Templates", url: "/templates", icon: LayoutTemplate, match: (p: string) => p === "/templates" || p.startsWith("/templates/") },
];

const catalogItems = [
  { title: "LLMs", url: "/llms", icon: Brain },
  { title: "APIs", url: "/apis", icon: Plug },
  { title: "MCP Servers", url: "/mcp", icon: Server },
  { title: "RAGs", url: "/rags", icon: Database },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)]">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-sm font-bold tracking-tight">Inspire</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                AI Low Code Platform
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Build</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {buildItems.map((item) => {
                const active = item.match(pathname);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="font-medium">{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Catalog</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {catalogItems.map((item) => {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="font-medium">{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
