import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, MessageSquare } from "lucide-react";

const chats = [
  { id: 1, agent: "CSO", name: "CSO Agent", preview: "I've completed the market analysis for Q4...", time: "2m ago", unread: true },
  { id: 2, agent: "CFO", name: "CFO Agent", preview: "Updated cash flow projections are ready.", time: "15m ago", unread: true },
  { id: 3, agent: "COO", name: "COO Agent", preview: "Process optimization review is complete.", time: "1h ago", unread: false },
  { id: 4, agent: "CMO", name: "CMO Agent", preview: "Campaign metrics report is now available.", time: "3h ago", unread: false },
  { id: 5, agent: "CTO", name: "CTO Agent", preview: "Technical roadmap has been updated.", time: "1d ago", unread: false },
];

export default function Chats() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Chats"
        description="View all conversations with your AI agents"
      />

      <div className="flex gap-6">
        {/* Chat List */}
        <Card className="w-full max-w-md">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-9" />
            </div>
          </div>
          <CardContent className="p-2">
            {chats.map((chat) => (
              <button
                key={chat.id}
                className="w-full flex items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted"
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {chat.agent}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">{chat.name}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {chat.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {chat.preview}
                  </p>
                </div>
                {chat.unread && (
                  <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                )}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Empty State */}
        <Card className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Select a conversation</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Choose a chat from the list to view the full conversation history with your AI agents.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
