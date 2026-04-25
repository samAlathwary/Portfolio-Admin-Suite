import React from "react";
import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import { LayoutDashboard, Users, Layers, LogOut, ChevronRight } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive: boolean;
}

function SidebarItem({ icon: Icon, label, href, isActive }: SidebarItemProps) {
  return (
    <Link href={href} className="block w-full">
      <div
        className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group ${
          isActive
            ? "bg-primary text-primary-foreground font-medium shadow-sm"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
      >
        <Icon className={`h-5 w-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"}`} />
        <span className="flex-1 truncate">{label}</span>
      </div>
    </Link>
  );
}

export function DashboardLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Partners", href: "/partners", icon: Users },
    { label: "Services", href: "/services", icon: Layers },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r bg-sidebar flex flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-sm bg-accent flex items-center justify-center text-accent-foreground font-display font-bold text-lg">
              E
            </div>
            <span className="font-display font-bold text-lg tracking-tight">Easy Way</span>
          </div>
        </div>

        <ScrollArea className="flex-1 py-4 px-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={location === item.href}
              />
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback className="font-display font-medium">
                {user?.firstName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-medium truncate">{user?.fullName || "User"}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b bg-card flex items-center px-6 shrink-0">
          {title ? (
            <h1 className="text-xl font-display font-semibold tracking-tight">{title}</h1>
          ) : (
            <div className="flex items-center text-sm text-muted-foreground">
              <span>Admin</span>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="font-medium text-foreground capitalize">{location.slice(1) || "Dashboard"}</span>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto bg-background p-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}