import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SidePanel } from "@/components/shared/SidePanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Settings, RefreshCw, Bell, ExternalLink, Clock } from "lucide-react";

// Simple placeholder SVGs for integration logos
const GoogleDriveLogo = () => (
  <svg viewBox="0 0 87.3 78" className="h-8 w-8">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
  </svg>
);

const SlackLogo = () => (
  <svg viewBox="0 0 127 127" className="h-8 w-8">
    <path d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2S.8 87.3.8 80s5.9-13.2 13.2-13.2h13.2V80zm6.6 0c0-7.3 5.9-13.2 13.2-13.2s13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2s-13.2-5.9-13.2-13.2V80z" fill="#e01e5a"/>
    <path d="M47 27c-7.3 0-13.2-5.9-13.2-13.2S39.7.6 47 .6s13.2 5.9 13.2 13.2V27H47zm0 6.7c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2H14c-7.3 0-13.2-5.9-13.2-13.2S6.7 33.7 14 33.7h33z" fill="#36c5f0"/>
    <path d="M99.9 46.9c0-7.3 5.9-13.2 13.2-13.2s13.2 5.9 13.2 13.2-5.9 13.2-13.2 13.2H99.9V46.9zm-6.6 0c0 7.3-5.9 13.2-13.2 13.2s-13.2-5.9-13.2-13.2V14c0-7.3 5.9-13.2 13.2-13.2s13.2 5.9 13.2 13.2v32.9z" fill="#2eb67d"/>
    <path d="M80.1 99.8c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3 0-13.2-5.9-13.2-13.2s5.9-13.2 13.2-13.2h33c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2h-33z" fill="#ecb22e"/>
  </svg>
);

const NotionLogo = () => (
  <svg viewBox="0 0 100 100" className="h-8 w-8">
    <path d="M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z" fill="transparent"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M61.35 0.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723 0.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257 -3.89c5.433 -0.387 6.99 -2.917 6.99 -7.193V20.64c0 -2.21 -0.873 -2.847 -3.443 -4.733L74.167 3.143c-4.273 -3.107 -6.02 -3.5 -12.817 -2.917zM25.92 19.523c-5.247 0.353 -6.437 0.433 -9.417 -1.99L8.927 11.507c-0.77 -0.78 -0.383 -1.753 1.557 -1.947l53.193 -3.887c4.467 -0.39 6.793 1.167 8.54 2.527l9.123 6.61c0.39 0.197 1.36 1.36 0.193 1.36l-54.933 3.307 -0.68 0.047zM19.803 88.3V30.367c0 -2.53 0.777 -3.697 3.103 -3.893L86 22.78c2.14 -0.193 3.107 1.167 3.107 3.693v57.547c0 2.53 -0.39 4.67 -3.883 4.863l-60.377 3.5c-3.493 0.193 -5.043 -0.97 -5.043 -4.083zm59.6 -54.827c0.387 1.75 0 3.5 -1.75 3.7l-2.91 0.577v42.773c-2.527 1.36 -4.853 2.137 -6.797 2.137 -3.107 0 -3.883 -0.973 -6.21 -3.887l-19.03 -29.94v28.967l6.02 1.363s0 3.5 -4.857 3.5l-13.39 0.777c-0.39 -0.78 0 -2.723 1.357 -3.11l3.497 -0.97v-38.3L30.48 40.667c-0.39 -1.75 0.58 -4.277 3.3 -4.473l14.367 -0.967 19.8 30.327v-26.83l-5.047 -0.58c-0.39 -2.143 1.163 -3.7 3.103 -3.89l13.4 -0.78z" fill="currentColor"/>
  </svg>
);

const JiraLogo = () => (
  <svg viewBox="0 0 32 32" className="h-8 w-8">
    <defs>
      <linearGradient id="jira-a" x1="99.68%" x2="39.67%" y1="31.21%" y2="68.79%">
        <stop offset="0%" stopColor="#0052CC"/>
        <stop offset="100%" stopColor="#2684FF"/>
      </linearGradient>
      <linearGradient id="jira-b" x1="0.48%" x2="60.17%" y1="68.73%" y2="31.27%">
        <stop offset="0%" stopColor="#0052CC"/>
        <stop offset="100%" stopColor="#2684FF"/>
      </linearGradient>
    </defs>
    <path fill="url(#jira-a)" d="M15.967 0 1.444 14.356a1.456 1.456 0 0 0 0 2.078l14.523 14.356 5.2-5.139-9.322-9.217 9.322-9.217z"/>
    <path fill="url(#jira-b)" d="m16.033 0 14.523 14.356a1.456 1.456 0 0 1 0 2.078L16.033 30.79l-5.2-5.139 9.322-9.217-9.322-9.217z"/>
  </svg>
);

const WhatsAppLogo = () => (
  <svg viewBox="0 0 32 32" className="h-8 w-8">
    <path d="M16 2a13 13 0 0 0-11.2 20.3L3 29.5l7.6-2c3.4 1.9 7.3 1.9 10.7 0a13 13 0 0 0 5.4-17.5A13 13 0 0 0 16 2zm0 24a11 11 0 0 1-5.6-1.5l-.4-.2-4.1 1.1 1.1-4-.2-.4A11 11 0 1 1 16 26zm6-8.2c-.3-.2-1.9-1-2.2-1.1-.3-.1-.5-.1-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7 0a8.8 8.8 0 0 1-2.6-1.6 9.7 9.7 0 0 1-1.8-2.2c-.2-.3 0-.5.2-.6l.5-.7a3.5 3.5 0 0 0 .4-.6c.1-.2 0-.4 0-.6-.2-.1-1.8-4.3-2.5-5.9-.6-1.4-1.2-1.2-1.7-1.2H9c-.5 0-1.3.2-2 .9s-2.6 2.5-2.6 6.1c0 3.6 2.6 7.1 3 7.6s5.2 7.9 12.6 11.1c5.1 2.2 6.1 1.8 7.2 1.7 1.1-.1 3.5-1.4 4-2.8.5-1.3.5-2.5.3-2.8-.2-.2-.7-.4-1-.6z" fill="#25D366"/>
  </svg>
);

const integrations = [
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Sync documents and files from Google Drive to your knowledge base",
    logo: GoogleDriveLogo,
    status: "connected" as const,
    connected: true,
    settings: { folders: "All folders", frequency: "Every 6 hours" },
  },
  {
    id: "slack",
    name: "Slack",
    description: "Connect agents to Slack channels and enable slash commands",
    logo: SlackLogo,
    status: "connected" as const,
    connected: true,
    settings: { channels: "#general, #strategy", commands: "Enabled" },
  },
  {
    id: "notion",
    name: "Notion",
    description: "Import and sync Notion pages and databases",
    logo: NotionLogo,
    status: "idle" as const,
    connected: false,
    comingSoon: true,
  },
  {
    id: "jira",
    name: "Jira",
    description: "Connect to Jira for project and issue tracking integration",
    logo: JiraLogo,
    status: "idle" as const,
    connected: false,
    comingSoon: true,
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "Connect agents to WhatsApp Business API for customer support",
    logo: WhatsAppLogo,
    status: "idle" as const,
    connected: false,
    comingSoon: true,
  },
];

export default function Integrations() {
  const [selectedIntegration, setSelectedIntegration] = useState<typeof integrations[0] | null>(null);

  return (
    <div className="animate-fade-in relative min-h-[calc(100vh-4rem)]">
      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
        <div className="bg-background/95 border border-border px-8 py-4 rounded-full shadow-lg">
          <span className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Coming Soon
          </span>
        </div>
      </div>

      <PageHeader
        title="Integrations"
        description="Connect external services to enhance your agents"
      />

      {/* Integration Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Card
            key={integration.id}
            className={`relative transition-all hover:shadow-md ${
              integration.comingSoon ? "opacity-60" : "cursor-pointer"
            }`}
            onClick={() => !integration.comingSoon && setSelectedIntegration(integration)}
          >
            {integration.comingSoon && (
              <Badge className="absolute right-3 top-3 bg-muted text-muted-foreground">
                Coming Soon
              </Badge>
            )}
            <CardContent className="p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted p-2">
                  <integration.logo />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{integration.name}</h3>
                    {integration.connected && (
                      <StatusBadge status="connected" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {integration.description}
                  </p>
                </div>
              </div>

              {integration.connected ? (
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last sync: 2 hours ago
                  </span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    <Settings className="mr-1 h-3 w-3" />
                    Configure
                  </Button>
                </div>
              ) : !integration.comingSoon ? (
                <Button className="w-full mt-3" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Connect
                </Button>
              ) : (
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    Get notified when available
                  </span>
                  <div className="flex items-center gap-2">
                    <Bell className="h-3 w-3 text-muted-foreground" />
                    <Switch />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integration Detail Panel */}
      <SidePanel
        isOpen={!!selectedIntegration}
        onClose={() => setSelectedIntegration(null)}
        title={selectedIntegration?.name || ""}
        subtitle={selectedIntegration?.connected ? "Connected" : "Not connected"}
      >
        {selectedIntegration && selectedIntegration.connected && (
          <div className="space-y-6">
            {/* Connection Info */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Connection Details</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <StatusBadge status="connected" />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Last Sync</span>
                  <span className="text-sm text-foreground">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Items Synced</span>
                  <span className="text-sm text-foreground">127 files</span>
                </div>
              </div>
            </div>

            {/* Settings */}
            {selectedIntegration.id === "google-drive" && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Sync Settings</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Folders to sync</Label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All folders</SelectItem>
                        <SelectItem value="selected">Selected folders</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sync frequency</Label>
                    <Select defaultValue="6h">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">Every hour</SelectItem>
                        <SelectItem value="6h">Every 6 hours</SelectItem>
                        <SelectItem value="24h">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {selectedIntegration.id === "slack" && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Channel Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Slash Commands</p>
                      <p className="text-xs text-muted-foreground">
                        Enable /agent commands in Slack
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Auto-responses</p>
                      <p className="text-xs text-muted-foreground">
                        Agents respond to mentions
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            )}

            {/* Logs */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Recent Activity</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <RefreshCw className="h-4 w-4 mt-0.5 text-success" />
                  <div>
                    <p>Sync completed successfully</p>
                    <p className="text-xs">2 hours ago • 12 new files</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <RefreshCw className="h-4 w-4 mt-0.5 text-success" />
                  <div>
                    <p>Sync completed successfully</p>
                    <p className="text-xs">8 hours ago • 3 updated files</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-border">
              <Button className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Now
              </Button>
              <Button variant="outline" className="flex-1 text-destructive hover:text-destructive">
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </SidePanel>
    </div>
  );
}
