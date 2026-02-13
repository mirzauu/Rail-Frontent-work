import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SidePanel } from "@/components/shared/SidePanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FullscreenLoader } from "@/components/shared/Spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus, MoreHorizontal, Clock, Shield, Users as UsersIcon, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faUserShield, faUserTag, faEnvelope, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

type OrgUser = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  timezone: string | null;
  language: string | null;
  status: string;
  role: { id: string; name: string; display_name: string };
  created_at: string;
  last_login_at: string | null;
  last_active_at: string | null;
};

const allowedStatuses = ["active", "idle", "error", "connected", "pending"] as const;
type AllowedStatus = typeof allowedStatuses[number];
const normalizeStatus = (s: string | null | undefined): AllowedStatus => {
  return allowedStatuses.includes((s ?? "") as AllowedStatus) ? ((s as AllowedStatus) ?? "pending") : "pending";
};

const roles = [
  { name: "Admin", description: "Full access to all features and settings", users: 1, permissions: ["manage_agents", "manage_knowledge", "manage_users", "configure_integrations", "view_analytics"] },
  { name: "Developer", description: "Can manage agents and knowledge base", users: 2, permissions: ["manage_agents", "manage_knowledge", "view_analytics"] },
  { name: "Staff", description: "Can interact with agents and view knowledge", users: 3, permissions: ["use_agents", "view_knowledge"] },
];

const allPermissions = [
  { key: "manage_agents", label: "Manage Agents", description: "Create, edit, and delete agents" },
  { key: "manage_knowledge", label: "Manage Knowledge Base", description: "Upload, edit, and delete documents" },
  { key: "manage_users", label: "Manage Users", description: "Invite and manage team members" },
  { key: "configure_integrations", label: "Configure Integrations", description: "Connect and manage external services" },
  { key: "view_analytics", label: "View Analytics", description: "Access usage and performance data" },
  { key: "use_agents", label: "Use Agents", description: "Interact with agents via chat" },
  { key: "view_knowledge", label: "View Knowledge", description: "Read documents in knowledge base" },
];

export default function Users() {
  const [activeTab, setActiveTab] = useState("users");
  const [selectedRole, setSelectedRole] = useState<typeof roles[0] | null>(null);
  const { toast } = useToast();
  const { data: orgUsers, isLoading: isUsersLoading } = useQuery<OrgUser[]>({
    queryKey: ["org-users"],
    queryFn: async () => {
      const r = await api.fetch("api/v1/organizations/users");
      // Fallback/Mock data if needed, or just return JSON
      const data = await r.json();
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 font-sans p-6 md:p-8 lg:p-10 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <div className="h-10 w-10 bg-black rounded-xl flex items-center justify-center text-white">
              <UsersIcon className="h-5 w-5" />
            </div>
            Team Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium ml-1">
            Manage your team members, roles, and access permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
           <Button 
            className="rounded-full h-12 px-6 bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-100 dark:shadow-none"
            onClick={() => toast({
              title: "Invite User disabled",
              description: "Please contact the developer to invite a new user.",
            })}
          >
            <UserPlus className="mr-2 h-4 w-4" /> Invite Member
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="flex items-center gap-3 bg-white dark:bg-card p-1.5 rounded-full shadow-sm border border-slate-100 dark:border-slate-800 w-fit h-auto">
          <TabsTrigger 
            value="users" 
            className="px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-orange-100 h-auto"
          >
            Users
          </TabsTrigger>
          <TabsTrigger 
            value="roles"
            className="px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-orange-100 h-auto"
          >
            Roles & Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6 m-0">
          <Card className="border-none shadow-sm bg-white dark:bg-card rounded-[32px] overflow-hidden min-h-[600px]">
            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search team members..." 
                  className="pl-11 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none text-base font-medium" 
                />
              </div>
              <Button variant="ghost" size="sm" className="rounded-full text-slate-500">
                 <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {isUsersLoading ? (
                 <div className="p-8 space-y-4">
                   {Array.from({ length: 5 }).map((_, i) => (
                     <div key={i} className="flex items-center gap-4">
                       <Skeleton className="h-12 w-12 rounded-full" />
                       <div className="space-y-2 flex-1">
                         <Skeleton className="h-4 w-1/3" />
                         <Skeleton className="h-3 w-1/4" />
                       </div>
                     </div>
                   ))}
                 </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="grid grid-cols-12 px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                     <div className="col-span-4">Member</div>
                     <div className="col-span-3">Role</div>
                     <div className="col-span-2">Status</div>
                     <div className="col-span-3 text-right">Last Active</div>
                  </div>
                  {(orgUsers || []).map((user) => (
                    <div
                      key={user.id}
                      className="grid grid-cols-12 px-8 py-5 items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      <div className="col-span-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 font-bold text-lg">
                          {(user.full_name || user.email || "").split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                            {user.full_name || "Unknown User"}
                          </p>
                          <p className="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-1">
                            <FontAwesomeIcon icon={faEnvelope} className="h-3 w-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="col-span-3">
                         <Badge variant="outline" className="rounded-lg px-3 py-1 font-semibold text-xs border-slate-200 bg-white text-slate-600">
                           {user.role?.display_name || user.role?.name}
                         </Badge>
                      </div>

                      <div className="col-span-2">
                        <StatusBadge status={normalizeStatus(user.status)} />
                      </div>

                      <div className="col-span-3 text-right">
                         <div className="flex items-center justify-end gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                           <Clock className="h-3.5 w-3.5 text-slate-400" />
                           {user.last_active_at ? new Date(user.last_active_at).toLocaleDateString() : "Never"}
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6 m-0">
          <div className="grid gap-6 md:grid-cols-3">
            {roles.map((role) => (
              <Card
                key={role.name}
                className={cn(
                  "cursor-pointer border-none shadow-sm bg-white dark:bg-card rounded-[32px] overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 group",
                  selectedRole?.name === role.name && "ring-2 ring-orange-500"
                )}
                onClick={() => setSelectedRole(role)}
              >
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                      <Shield className="h-7 w-7" />
                    </div>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 rounded-lg px-3 py-1">
                      {role.users} users
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{role.name}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    {role.description}
                  </p>
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                     {role.permissions.length} Permissions Enabled
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Role Detail Panel */}
      <SidePanel
        isOpen={!!selectedRole}
        onClose={() => setSelectedRole(null)}
        title={selectedRole?.name || ""}
        subtitle={selectedRole?.description}
        width="lg"
      >
        {selectedRole && (
          <div className="space-y-8">
            <div className="p-6 bg-orange-50 dark:bg-orange-950/20 rounded-[24px] border border-orange-100 dark:border-orange-900/50">
               <div className="flex items-center gap-4 mb-4">
                 <div className="h-12 w-12 rounded-xl bg-orange-500 flex items-center justify-center text-white">
                   <Shield className="h-6 w-6" />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-orange-900 dark:text-orange-100">Role Configuration</h3>
                   <p className="text-sm text-orange-700 dark:text-orange-300">Manage what {selectedRole.name}s can do</p>
                 </div>
               </div>
               <p className="text-sm text-orange-800 dark:text-orange-200 leading-relaxed">
                 Changes made here will affect all <strong>{selectedRole.users} users</strong> currently assigned to this role.
               </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Permissions</h4>
                <Badge variant="outline" className="border-slate-200">
                  {selectedRole.permissions.length} Active
                </Badge>
              </div>
              
              <div className="space-y-3">
                {allPermissions.map((permission) => (
                  <div
                    key={permission.key}
                    className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-900 transition-colors bg-white dark:bg-card"
                  >
                    <div>
                      <p className="text-sm font-bold text-foreground mb-1">
                        {permission.label}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {permission.description}
                      </p>
                    </div>
                    <Switch
                      defaultChecked={selectedRole.permissions.includes(permission.key)}
                      className="data-[state=checked]:bg-orange-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button className="flex-1 rounded-xl h-12 font-bold bg-black hover:bg-slate-800 text-white shadow-lg">Save Changes</Button>
              <Button variant="ghost" onClick={() => setSelectedRole(null)} className="flex-1 rounded-xl h-12 font-bold text-slate-500">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </SidePanel>
    </div>
  );
}
