import { Bell, ChevronDown, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export function TopBar() {
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
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      {/* Left section - Org switcher */}
      <div className="flex items-center gap-4">
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 text-sm font-medium">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary text-xs font-semibold">
                A
              </div>
              Acme Corp
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Organizations</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Acme Corp</DropdownMenuItem>
            <DropdownMenuItem>Tech Startup Inc</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Create organization</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}

      </div>

      {/* Center - Search (Removed) */}
      <div className="flex-1 max-w-md mx-8"></div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar_url ?? ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.full_name ?? "User"}</span>
                <span className="text-xs text-muted-foreground">{user?.email ?? ""}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
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
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
