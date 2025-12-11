import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SidePanel } from "@/components/shared/SidePanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, UserPlus, MoreHorizontal, Clock, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const users = [
  { id: 1, name: "John Doe", email: "john@acmecorp.com", role: "Admin", status: "active" as const, lastSeen: "Now" },
  { id: 2, name: "Sarah Miller", email: "sarah@acmecorp.com", role: "Developer", status: "active" as const, lastSeen: "5m ago" },
  { id: 3, name: "Mike Chen", email: "mike@acmecorp.com", role: "Staff", status: "active" as const, lastSeen: "1h ago" },
  { id: 4, name: "Emily Wang", email: "emily@acmecorp.com", role: "Staff", status: "active" as const, lastSeen: "2h ago" },
  { id: 5, name: "Alex Johnson", email: "alex@acmecorp.com", role: "Developer", status: "pending" as const, lastSeen: "Invited" },
  { id: 6, name: "Chris Lee", email: "chris@acmecorp.com", role: "Staff", status: "pending" as const, lastSeen: "Invited" },
];

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
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Users & Roles"
        description="Manage team access and permissions"
        actions={
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your workspace
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" placeholder="colleague@company.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue="staff">
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">Personal note (optional)</Label>
                  <Input id="note" placeholder="Welcome to the team!" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setInviteOpen(false)}>Send Invite</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Search */}
          <Card className="p-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-9" />
            </div>
          </Card>

          {/* Users Table */}
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Last Seen</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                            {user.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <span className="font-medium text-foreground">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                      <td className="p-4">
                        <Badge variant="outline">{user.role}</Badge>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {user.lastSeen}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {roles.map((role) => (
              <Card
                key={role.name}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedRole?.name === role.name && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedRole(role)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary">{role.users} users</Badge>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{role.name}</h3>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
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
      >
        {selectedRole && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-foreground mb-4">Permissions</h4>
              <div className="space-y-3">
                {allPermissions.map((permission) => (
                  <div
                    key={permission.key}
                    className="flex items-start justify-between gap-4 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {permission.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {permission.description}
                      </p>
                    </div>
                    <Switch
                      defaultChecked={selectedRole.permissions.includes(permission.key)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-border">
              <Button className="flex-1">Save Changes</Button>
              <Button variant="outline" onClick={() => setSelectedRole(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </SidePanel>
    </div>
  );
}
