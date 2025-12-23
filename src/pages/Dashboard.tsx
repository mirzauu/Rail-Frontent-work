import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faComments,
  faBook,
  faHeartbeat,
  faCalendarAlt,
  faSearch,
  faPlus,
  faEllipsisH,
  faBolt,
  faFileAlt,
  faArrowRight,
  faUsers
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

const agents = [
  { name: "CSO Agent", role: "Chief Strategy Officer", status: "active", lastMessage: "Completed market analysis for Q4", time: "2m ago", initials: "CS" },
  { name: "CFO Agent", role: "Chief Financial Officer", status: "active", lastMessage: "Updated cash flow projections", time: "5m ago", initials: "CF" },
  { name: "COO Agent", role: "Chief Operating Officer", status: "idle", lastMessage: "Process optimization review done", time: "1h ago", initials: "CO" },
  { name: "CMO Agent", role: "Chief Marketing Officer", status: "active", lastMessage: "Campaign metrics report ready", time: "15m ago", initials: "CM" },
];

const recentDocs = [
  { title: "Q4 Strategy Deck.pdf", type: "pdf", tags: ["Strategy", "Finance"], agent: "CSO", updated: "Today" },
  { title: "Budget Forecast 2024.xlsx", type: "sheet", tags: ["Finance"], agent: "CFO", updated: "Yesterday" },
  { title: "Ops Playbook v2.docx", type: "doc", tags: ["Operations"], agent: "COO", updated: "2 days ago" },
  { title: "Brand Guidelines.pdf", type: "pdf", tags: ["Marketing"], agent: "CMO", updated: "3 days ago" },
];

const memoryHighlights = [
  { agent: "CSO", content: "Key decision: Expand to APAC market in Q2", type: "decision", date: "Today, 9:00 AM" },
  { agent: "CFO", content: "Risk flag: Currency exposure increased 15%", type: "risk", date: "Yesterday, 2:30 PM" },
  { agent: "COO", content: "Task completed: Supply chain audit", type: "task", date: "Dec 1, 10:00 AM" },
];

export default function Dashboard() {
  const currentDate = new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="animate-fade-in p-2 space-y-6 relative min-h-[calc(100vh-4rem)]">
      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
        <div className="bg-background/95 border border-border px-8 py-4 rounded-full shadow-lg">
          <span className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Coming Soon
          </span>
        </div>
      </div>

      {/* Welcome Section with Gradient */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Good Morning, Team
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
            <FontAwesomeIcon icon={faCalendarAlt} className="h-3.5 w-3.5" />
            {currentDate}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <FontAwesomeIcon icon={faSearch} className="h-3.5 w-3.5" />
            Search
          </Button>
          <Button className="gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
            <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
            New Project
          </Button>
        </div>
      </div>

      {/* Modern KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Active Agents", value: "4", change: "+1", icon: faRobot, color: "text-primary", bg: "bg-primary/10" },
          { title: "Total Conversations", value: "1,248", change: "+12%", icon: faComments, color: "text-purple-500", bg: "bg-purple-500/10" },
          { title: "Knowledge Assets", value: "843", change: "+24", icon: faBook, color: "text-amber-500", bg: "bg-amber-500/10" },
          { title: "System Health", value: "98.9%", change: "Stable", icon: faHeartbeat, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-md transition-all duration-200 group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className={cn("p-2 rounded-xl h-10 w-10 flex items-center justify-center", stat.bg, stat.color)}>
                  <FontAwesomeIcon icon={stat.icon} className="h-5 w-5" />
                </div>
                <Badge variant="secondary" className={cn("font-medium", stat.change.includes("+") ? "text-emerald-600 bg-emerald-500/10" : "text-muted-foreground")}>
                  {stat.change}
                </Badge>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
                <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid - Bento Box Style */}
      <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-7">

        {/* Left Column - Agent Activity (Span 4) */}
        <div className="col-span-1 md:col-span-4 space-y-6">
          <Card className="border-border/60 shadow-sm overflow-hidden h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/20 border-b border-border/40">
              <div>
                <CardTitle className="text-lg font-semibold">Live Agent Activity</CardTitle>
                <CardDescription>Real-time updates from your C-Suite agents</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <FontAwesomeIcon icon={faEllipsisH} className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="divide-y divide-border/40">
                {agents.map((agent, i) => (
                  <div key={i} className="p-4 hover:bg-muted/30 transition-colors group cursor-pointer flex gap-4 items-start">
                    <div className="relative">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarFallback className={cn(
                          "font-bold text-xs",
                          agent.name.includes("CSO") ? "bg-red-100 text-red-600" :
                            agent.name.includes("CFO") ? "bg-orange-100 text-orange-600" :
                              agent.name.includes("COO") ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                        )}>
                          {agent.initials}
                        </AvatarFallback>
                      </Avatar>
                      {agent.status === "active" && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-sm text-foreground truncate">{agent.name}</h4>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{agent.time}</span>
                      </div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{agent.role}</p>
                      <p className="text-sm text-foreground/80 line-clamp-1">{agent.lastMessage}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border/40 bg-muted/10">
                <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-primary">
                  View full activity log <FontAwesomeIcon icon={faArrowRight} className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Actions & Docs (Span 3) */}
        <div className="col-span-1 md:col-span-3 space-y-6">

          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
            <CardContent className="p-4 flex flex-col gap-3">
              <h3 className="font-semibold text-sm text-primary mb-1 flex items-center gap-2">
                <FontAwesomeIcon icon={faBolt} className="h-4 w-4" /> Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto py-3 justify-start bg-background/50 hover:bg-background border-primary/10 hover:border-primary/30 text-left">
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-medium text-xs">New Chat</span>
                    <span className="text-[10px] text-muted-foreground">Start a conversation</span>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-3 justify-start bg-background/50 hover:bg-background border-primary/10 hover:border-primary/30 text-left">
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-medium text-xs">Upload Doc</span>
                    <span className="text-[10px] text-muted-foreground">Add to knowledge</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Docs */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FontAwesomeIcon icon={faBook} className="h-4 w-4 text-muted-foreground" />
                Recent Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {recentDocs.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 hover:bg-muted/30 cursor-pointer transition-colors group">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <FontAwesomeIcon icon={faFileAlt} className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-border/60 text-muted-foreground">{doc.tags[0]}</Badge>
                        <span className="text-[10px] text-muted-foreground">{doc.updated}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-border/40">
                <Button variant="ghost" size="sm" className="w-full text-xs h-8">
                  View Knowledge Base
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Memory Highlights (Compact) */}
          <div className="bg-secondary/20 rounded-xl p-4 border border-border/50">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faHeartbeat} className="h-4 w-4 text-muted-foreground" />
              Memory Stream
            </h3>
            <div className="space-y-4">
              {memoryHighlights.map((mem, i) => (
                <div key={i} className="relative pl-4 border-l-2 border-border/60 hover:border-primary transition-colors pb-1">
                  <div className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full bg-background border-2 border-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground mb-0.5">{mem.date}</p>
                  <p className="text-sm font-medium text-foreground/90">{mem.content}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 rounded">{mem.agent}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{mem.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div >
  );
}
