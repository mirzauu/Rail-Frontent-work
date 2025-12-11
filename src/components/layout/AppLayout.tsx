import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const isAgentsPage = location.pathname.startsWith("/agents");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className={isAgentsPage ? "flex-1 overflow-hidden" : "flex-1 overflow-auto p-6"}>
          {children}
        </main>
      </div>
    </div>
  );
}
