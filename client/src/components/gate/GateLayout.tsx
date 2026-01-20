import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Shield, Inbox, Bug } from "lucide-react";
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
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { RoleSelector } from "./RoleSelector";
import { ApiNotConfiguredBanner } from "./ApiNotConfiguredBanner";
import { isApiConfigured } from "@/config/api";
import { getGateRole, setGateRole, getGateUserId, type GateRole } from "@/lib/gateStore";

interface GateLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: "/gate/inbox", label: "Inbox", icon: Inbox },
  { path: "/gate/debug", label: "Debug", icon: Bug },
];

export function GateLayout({ children }: GateLayoutProps) {
  const [role, setRoleState] = useState<GateRole>(getGateRole);
  const [userId] = useState(() => getGateUserId());
  const [location] = useLocation();
  const apiConfigured = isApiConfigured();

  useEffect(() => {
    setGateRole(role);
  }, [role]);

  const sidebarStyle = {
    "--sidebar-width": "14rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <Link href="/gate/inbox">
              <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold text-foreground">Artemis Gate</span>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.path || location.startsWith(item.path.replace('/gate', '/gate/'))}
                      >
                        <Link href={item.path}>
                          <div className="flex items-center gap-2" data-testid={`nav-link-${item.label.toLowerCase()}`}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-auto">
              <SidebarGroupLabel>Session</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-2 space-y-3">
                  <RoleSelector role={role} onRoleChange={setRoleState} />
                  <div className="text-xs text-muted-foreground font-mono" data-testid="text-user-id-sidebar">
                    ID: {userId.slice(0, 8)}...
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          {!apiConfigured && <ApiNotConfiguredBanner />}
          
          <header className="flex items-center gap-4 p-4 border-b bg-card shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex-1" />
            <div className="sm:hidden">
              <RoleSelector role={role} onRoleChange={setRoleState} />
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
