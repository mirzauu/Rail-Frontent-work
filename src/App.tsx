import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Agents from "./pages/Agents";
import Memory from "./pages/Memory";
import Knowledge from "./pages/Knowledge";
import Chats from "./pages/Chats";
import Users from "./pages/Users";
import Integrations from "./pages/Integrations";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes - No Layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* App Routes - With Layout */}
            <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/agents" element={<AppLayout><Agents /></AppLayout>} />
            <Route path="/agents/:agentId" element={<AppLayout><Agents /></AppLayout>} />
            <Route path="/memory" element={<AppLayout><Memory /></AppLayout>} />
            <Route path="/knowledge" element={<AppLayout><Knowledge /></AppLayout>} />
            <Route path="/chats" element={<AppLayout><Chats /></AppLayout>} />
            <Route path="/users" element={<AppLayout><Users /></AppLayout>} />
            <Route path="/integrations" element={<AppLayout><Integrations /></AppLayout>} />
            <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;

