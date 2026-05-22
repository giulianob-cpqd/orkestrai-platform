import { Link, useLocation } from "@tanstack/react-router";
import { Workflow, Bot, Brain, Plug, Server, Database, LayoutTemplate, LayoutDashboard, Play, DollarSign, MessageSquare, BookOpen, AlertTriangle, Zap, Gamepad2, FlaskConical, Shield, Table2, Library, Activity, PieChart } from "lucide-react";
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

const overviewItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, match: (p: string) => p === "/dashboard" },
];

const buildItems = [
  { title: "Orchestrations", url: "/orchestrations", icon: Workflow, match: (p: string) => p === "/orchestrations" || p.startsWith("/orchestrations/") },
  { title: "Agents", url: "/agents", icon: Bot, match: (p: string) => p === "/agents" || p.startsWith("/agents/") },
  { title: "Templates", url: "/templates", icon: LayoutTemplate, match: (p: string) => p === "/templates" || p.startsWith("/templates/") },
  { title: "Documents", url: "/knowledge", icon: BookOpen, match: (p: string) => p === "/knowledge" },
  { title: "Training", url: "/training", icon: Activity, match: (p: string) => p === "/training" },
  { title: "Datasets", url: "/datasets", icon: Table2, match: (p: string) => p === "/datasets" },
];

const executionItems = [
  { title: "Executions", url: "/executions", icon: Play, match: (p: string) => p === "/executions" || p.startsWith("/executions/") },
  { title: "Conversations", url: "/conversations", icon: MessageSquare, match: (p: string) => p === "/conversations" },
];

const testsItems = [
  { title: "Suite Cases", url: "/test-suites", icon: FlaskConical, match: (p: string) => p === "/test-suites" },
  { title: "Playground", url: "/playground", icon: Gamepad2, match: (p: string) => p === "/playground" },
];

const catalogItems = [
  { title: "Models", url: "/llms", icon: Brain },
  { title: "APIs", url: "/apis", icon: Plug },
  { title: "MCP Servers", url: "/mcp", icon: Server },
  { title: "Databases", url: "/databases", icon: Database },
  { title: "Knowledge", url: "/rags", icon: Library },
];

const governanceItems = [
  { title: "FinOps", url: "/finops", icon: DollarSign, match: (p: string) => p === "/finops" },
  { title: "Quotas", url: "/quotas", icon: PieChart, match: (p: string) => p === "/quotas" },
  { title: "Alerts", url: "/alerts", icon: AlertTriangle, match: (p: string) => p === "/alerts" },
  { title: "Guardrails", url: "/guardrails", icon: Shield, match: (p: string) => p === "/guardrails" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-3">
          <img src="/logo.svg" alt="OrkestrAI" className="h-8 w-8" />
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-sm font-bold tracking-tight">OrkestrAI</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Agentic AI Platform
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {overviewItems.map((item) => {
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
          <SidebarGroupLabel>Tests</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {testsItems.map((item) => {
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
          <SidebarGroupLabel>Uses</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {executionItems.map((item) => {
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

        <SidebarGroup>
          <SidebarGroupLabel>Governance</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {governanceItems.map((item) => {
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
      </SidebarContent>
    </Sidebar>
  );
}
