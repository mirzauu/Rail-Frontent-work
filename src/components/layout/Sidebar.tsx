import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Bot,
  Brain,
  BookOpen,
  MessageSquare,
  Users,
  Settings,
  ChevronLeft,
  Train,
  Cog,
  ChevronDown,
  Sun,
  Moon,
  LogOut,
  User,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { api } from "@/lib/api";

const agents = [
  { id: "cso", name: "Michael", role: "CSO", letter: "M" },
  { id: "cfo", name: "David", role: "CFO", letter: "D" },
  { id: "coo", name: "John", role: "COO", letter: "J" },
  { id: "cmo", name: "Sarah", role: "CMO", letter: "S" },
  { id: "cto", name: "Emily", role: "CTO", letter: "E" },
];

const memoryItems = [
  { icon: Brain, label: "Memory", path: "/memory" },
  { icon: BookOpen, label: "Knowledge Base", path: "/knowledge" },
];

const managementItems = [
  { icon: MessageSquare, label: "Users", path: "/users" },
  { icon: Users, label: "Integrations", path: "/integrations" },
];

export function Sidebar() {
  // Check if mobile on initial render
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const [collapsed, setCollapsed] = useState(isMobile);
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const user = api.getUser();
  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join("")
    : "US";

  const handleLogout = () => {
    api.clearToken();
    api.clearUser();
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-[#eef1f5] dark:bg-[#1e2023] border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo - Click to collapse/expand */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "flex items-center gap-3 py-5 transition-all hover:opacity-80",
          collapsed ? "px-3 justify-center" : "px-5"
        )}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary flex-shrink-0">
          <Train className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-xl font-semibold text-gray-800 dark:text-white">
            RailVision
          </span>
        )}
      </button>

      {/* Dashboard Link */}
      {!collapsed && (
        <div className="px-5 pb-4">
          <NavLink
            to="/"
            className={cn(
              "flex items-center justify-center py-2 text-lg font-semibold transition-colors",
              location.pathname === "/" ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            Dashboard
          </NavLink>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn("flex-1 overflow-y-auto scrollbar-thin", collapsed ? "px-2" : "px-4")}>
        {/* AGENT Section */}
        <div className="mb-4">
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Agent
              </span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>
          )}

          <div className="space-y-1">
            {agents.map((agent) => {
              const isAgentActive = location.pathname === `/agents/${agent.id}`;

              const agentContent = (
                <NavLink
                  key={agent.id}
                  to={`/agents/${agent.id}`}
                  className={cn(
                    "flex items-center gap-3 text-sm transition-all duration-200",
                    collapsed
                      ? "justify-center rounded-lg p-2"
                      : "rounded-full px-3 py-2.5",
                    isAgentActive
                      ? "bg-primary text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-700/50"
                  )}
                >
                  <Avatar className={cn(collapsed ? "h-8 w-8" : "h-7 w-7")}>
                    <AvatarFallback className={cn(
                      "text-xs font-medium",
                      isAgentActive ? "bg-primary-foreground/20 text-white" : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                    )}>
                      {agent.letter}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <span className="font-medium">
                      {agent.name} ({agent.role})
                      {isAgentActive && <span className="text-primary-foreground/70"> ({agent.role})</span>}
                    </span>
                  )}
                </NavLink>
              );

              if (collapsed) {
                return (
                  <Tooltip key={agent.id} delayDuration={0}>
                    <TooltipTrigger asChild>
                      {agentContent}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-gray-700 text-white border-gray-600">
                      {agent.name} ({agent.role})
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return agentContent;
            })}
          </div>
        </div>

        {/* MEMORY Section - Only show when expanded */}
        {!collapsed && (
          <div className="mb-4">
            <div className="flex items-center gap-2 px-2 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Memory
              </span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            <div className="space-y-1">
              {memoryItems.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                      isActive
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-700/50"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="flex-1 font-medium">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}

        {/* MANAGEMENT Section - Only show when expanded */}
        {!collapsed && (
          <div className="mb-4">
            <div className="flex items-center gap-2 px-2 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Management
              </span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            <div className="space-y-1">
              {managementItems.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                      isActive
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-700/50"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="flex-1 font-medium">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full flex items-center gap-3 transition-all duration-200 hover:bg-gray-200/70 dark:hover:bg-gray-700/50",
                collapsed ? "justify-center px-2" : "justify-start px-3 py-6"
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar_url ?? ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <>
                  <div className="flex flex-col items-start text-sm overflow-hidden">
                    <span className="font-medium truncate w-[140px] text-left">
                      {user?.full_name ?? "User"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate w-[140px] text-left">
                      {user?.email ?? ""}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right" className="w-56 mb-2">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="cursor-pointer"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-4 w-4 mr-2" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 mr-2" />
                  Dark Mode
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
