import { LayoutDashboard, Settings, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useAdmin } from "@/context/AdminProvider";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { icon: LayoutDashboard, label: "Properties", path: "/dashboard" },
  { icon: Users, label: "Users", path: "/users" },
  { icon: Settings, label: "Settings", path: "/settings", disabled: true },
];

const getInitials = (name?: string) =>
  name
    ? name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "LG";

const AppSidebar = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { user, logout } = useAdmin();

  return (
    <div className="flex h-full w-full flex-col border-r border-sidebar-border/60 bg-sidebar px-4 py-6 text-sidebar-foreground">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-sidebar-primary/10 p-2 text-sidebar-primary">
            <span className="text-sm font-extrabold">LG</span>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Local Guide Admin</p>
            <Badge variant="secondary">Beta</Badge>
          </div>
        </div>
      </div>

      <nav className="mt-6 flex-1 space-y-1 text-sm font-medium">
        {navItems.map((item) => {
          const Icon = item.icon;
          const content = (
            <div className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 transition-colors">
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
              {item.disabled && (
                <div className="ml-auto">
                  <Badge variant="outline">Soon</Badge>
                </div>
              )}
            </div>
          );

          if (item.disabled) {
            return (
              <div
                key={item.label}
                className="cursor-not-allowed rounded-xl border border-dashed border-sidebar-border/60 px-3 py-2 text-muted-foreground"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  <div className="ml-auto">
                    <Badge variant="outline">Roadmap</Badge>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                [
                  "block rounded-xl",
                  isActive
                    ? "bg-sidebar-primary/10 text-sidebar-primary"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                ].join(" ")
              }
            >
              {content}
            </NavLink>
          );
        })}
      </nav>

      <Separator className="my-4" />

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-2xl border border-sidebar-border/70 px-3 py-2 text-left">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold leading-tight">{user?.name || "Guest admin"}</p>
                <p className="text-xs text-muted-foreground">{user?.email || "demo@localguide.app"}</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Session</DropdownMenuLabel>
            <DropdownMenuItem disabled>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Notifications</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default AppSidebar;
