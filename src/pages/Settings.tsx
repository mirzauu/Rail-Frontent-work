import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Bell, Shield, Palette, Globe, CreditCard } from "lucide-react";

export default function Settings() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Settings"
        description="Manage your workspace preferences and configuration"
      />

      <Tabs defaultValue="organization" className="space-y-6">
        <TabsList>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                Organization Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input id="org-name" defaultValue="Acme Corp" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-slug">Organization URL</Label>
                  <div className="flex">
                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                      agentos.app/
                    </span>
                    <Input
                      id="org-slug"
                      defaultValue="acme-corp"
                      className="rounded-l-none"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-description">Description</Label>
                <Input
                  id="org-description"
                  placeholder="A brief description of your organization"
                />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-5 w-5 text-muted-foreground" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Theme</p>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred color scheme
                  </p>
                </div>
                <Select defaultValue="system">
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Language</p>
                  <p className="text-sm text-muted-foreground">
                    Set your display language
                  </p>
                </div>
                <Select defaultValue="en">
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-5 w-5 text-muted-foreground" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: "Agent Activity", description: "Get notified when agents complete tasks" },
                { title: "Memory Updates", description: "Alerts for new important memories" },
                { title: "Document Changes", description: "Notifications for knowledge base updates" },
                { title: "Team Invites", description: "When new members join or are invited" },
                { title: "Integration Status", description: "Sync failures and connection issues" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch defaultChecked={i < 3} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5 text-muted-foreground" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">Session Timeout</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically log out after inactivity
                  </p>
                </div>
                <Select defaultValue="24h">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 hour</SelectItem>
                    <SelectItem value="8h">8 hours</SelectItem>
                    <SelectItem value="24h">24 hours</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">API Access</p>
                  <p className="text-sm text-muted-foreground">
                    Manage API keys and access tokens
                  </p>
                </div>
                <Button variant="outline" size="sm">Manage Keys</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                Billing & Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">Pro Plan</p>
                    <p className="text-sm text-muted-foreground">$49/month • Billed monthly</p>
                  </div>
                  <Button variant="outline" size="sm">Upgrade</Button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Agent conversations</span>
                    <span className="text-foreground">2,847 / 10,000</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[28%] rounded-full bg-primary" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">Payment Method</p>
                  <p className="text-sm text-muted-foreground">Visa ending in 4242</p>
                </div>
                <Button variant="ghost" size="sm">Update</Button>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">Billing History</p>
                  <p className="text-sm text-muted-foreground">View past invoices</p>
                </div>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
