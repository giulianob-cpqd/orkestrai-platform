import { ReactNode } from "react";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { UserMenu } from "./UserMenu";
import { NotificationsMenu } from "./NotificationsMenu";
import { EnvironmentSelector } from "./EnvironmentSelector";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

function AppLayoutContent({ children, actions }: Omit<AppLayoutProps, 'title' | 'subtitle'>) {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/70 px-4 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleSidebar}
            className="inline-flex items-center justify-center rounded-md hover:bg-muted transition-colors p-2"
            aria-label="Toggle sidebar"
          >
            <img src="/hamburger.svg" alt="Menu" className="h-6 w-6" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <EnvironmentSelector />
          <NotificationsMenu />
          <UserMenu />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

export function AppLayout({ children, title, subtitle, actions }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <AppLayoutContent actions={actions}>{children}</AppLayoutContent>
      </div>
    </SidebarProvider>
  );
}
