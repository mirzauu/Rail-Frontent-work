import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  faUsers,
  faChartLine,
  faMicrochip,
  faShieldAlt,
  faZap,
  faBrain
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

const usageData = [
  { name: "Mon", requests: 400, tokens: 2400 },
  { name: "Tue", requests: 300, tokens: 1398 },
  { name: "Wed", requests: 900, tokens: 9800 },
  { name: "Thu", requests: 1480, tokens: 3908 },
  { name: "Fri", requests: 1890, tokens: 4800 },
  { name: "Sat", requests: 2390, tokens: 3800 },
  { name: "Sun", requests: 3490, tokens: 4300 },
];

const agentPerformance = [
  { name: "CSO", speed: 85, accuracy: 92, usage: 45 },
  { name: "CFO", speed: 92, accuracy: 98, usage: 30 },
  { name: "COO", speed: 78, accuracy: 88, usage: 60 },
  { name: "CMO", speed: 88, accuracy: 90, usage: 55 },
];

const sessions = [
  { id: 1, title: "Market Entry Strategy", agents: ["CSO", "CFO"], progress: 65, status: "Active" },
  { id: 2, title: "Budget Reallocation", agents: ["CFO", "COO"], progress: 40, status: "Pending Feedback" },
  { id: 3, title: "Q1 Campaign Launch", agents: ["CMO", "CSO"], progress: 90, status: "Reviewing" },
];

const agents = [
  { name: "CSO Agent", role: "Chief Strategy Officer", status: "active", lastMessage: "Completed market analysis for Q4", time: "2m ago", initials: "CS", color: "text-red-600", bg: "bg-red-100" },
  { name: "CFO Agent", role: "Chief Financial Officer", status: "active", lastMessage: "Updated cash flow projections", time: "5m ago", initials: "CF", color: "text-orange-600", bg: "bg-orange-100" },
  { name: "COO Agent", role: "Chief Operating Officer", status: "idle", lastMessage: "Process optimization review done", time: "1h ago", initials: "CO", color: "text-purple-600", bg: "bg-purple-100" },
  { name: "CMO Agent", role: "Chief Marketing Officer", status: "active", lastMessage: "Campaign metrics report ready", time: "15m ago", initials: "CM", color: "text-blue-600", bg: "bg-blue-100" },
];

export default function Dashboard() {
  const currentDate = new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="animate-fade-in p-6 space-y-8 relative min-h-[calc(100vh-4rem)] max-w-[1600px] mx-auto">
      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
        <div className="bg-background/95 border border-border px-8 py-4 rounded-full shadow-lg">
          <span className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Coming Soon
          </span>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Railway <span className="text-primary">Intelligence</span>
          </h1>
          <p className="text-muted-foreground text-lg flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="h-4 w-4" />
            {currentDate} • System is performing optimally
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 px-6 border-2 hover:bg-secondary/50">
            <FontAwesomeIcon icon={faSearch} className="mr-2 h-4 w-4" />
            Search Insights
          </Button>
          <Button className="h-11 px-6 bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all">
            <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
            Launch New Session
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Active Agents", value: "4", change: "+1", detail: "Ready to deploy", icon: faRobot, color: "text-primary", bg: "bg-primary/10" },
          { title: "Total Requests", value: "8,241", change: "+18%", detail: "Last 30 days", icon: faZap, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Brain-Power", value: "94%", change: "+2%", detail: "Resource utilization", icon: faBrain, color: "text-purple-500", bg: "bg-purple-500/10" },
          { title: "Security Level", value: "Enterprise", change: "Verified", detail: "End-to-end encrypted", icon: faShieldAlt, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="relative overflow-hidden border-none bg-card/40 backdrop-blur-md shadow-sm hover:shadow-md transition-all group">
            <div className={cn("absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity", stat.color)}>
              <FontAwesomeIcon icon={stat.icon} className="h-20 w-20" />
            </div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={cn("p-2.5 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
                  <FontAwesomeIcon icon={stat.icon} className="h-5 w-5" />
                </div>
                <Badge variant="secondary" className={cn("font-bold px-2 py-0.5", stat.change.includes("+") ? "text-emerald-500 bg-emerald-500/10" : "text-primary bg-primary/10")}>
                  {stat.change}
                </Badge>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
                <p className="text-sm font-semibold text-foreground/80">{stat.title}</p>
                <p className="text-xs text-muted-foreground">{stat.detail}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Grid */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Usage Analytics - Span 2 */}
        <Card className="lg:col-span-2 border-none bg-card/40 backdrop-blur-md shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Inference Usage</CardTitle>
              <CardDescription>Agent response frequency and token consumption</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-background/50">Daily</Badge>
              <Badge variant="secondary" className="bg-primary/20 text-primary border-none">Weekly</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usageData}>
                  <defs>
                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRequests)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Agent Metrics */}
        <Card className="border-none bg-card/40 backdrop-blur-md shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Agent Efficiency</CardTitle>
            <CardDescription>Metric comparison across active roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentPerformance}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted) / 0.5)' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px'
                    }}
                  />
                  <Bar dataKey="speed" radius={[6, 6, 0, 0]} barSize={32}>
                    {agentPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.4)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Avg. Response Time</span>
                <span className="font-bold">1.2s</span>
              </div>
              <Progress value={85} className="h-1.5" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Model Accuracy</span>
                <span className="font-bold">98.4%</span>
              </div>
              <Progress value={98} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Bottom Features Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {/* Active Brainstorming */}
        <Card className="lg:col-span-2 border-none bg-card/40 backdrop-blur-md shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Active Collaborations</CardTitle>
                <CardDescription>Multi-agent sessions currently in progress</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                View All <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {sessions.map((session) => (
                <div key={session.id} className="p-4 hover:bg-muted/20 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <FontAwesomeIcon icon={faBrain} className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{session.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex -space-x-2">
                          {session.agents.map((a, i) => (
                            <Avatar key={i} className="h-6 w-6 border-2 border-background">
                              <AvatarFallback className="text-[10px] font-bold bg-muted">{a}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">Collaboration: {session.agents.join(" & ")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-2 min-w-[120px]">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{session.status}</span>
                      <span className="font-bold">{session.progress}%</span>
                    </div>
                    <Progress value={session.progress} className="h-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health & Resources */}
        <Card className="border-none bg-card/40 backdrop-blur-md shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">System Integrity</CardTitle>
            <CardDescription>Real-time infrastructure health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1 font-medium">LATENCY</p>
                <p className="text-xl font-bold">42ms</p>
                <div className="flex items-center gap-1 mt-1 text-emerald-500">
                  <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold">STABLE</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1 font-medium">UPTIME</p>
                <p className="text-xl font-bold">99.98%</p>
                <div className="flex items-center gap-1 mt-1 text-emerald-500">
                  <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold">HEALTHY</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Resource Allocation</h5>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Knowledge Store</span>
                  <span>1.2GB / 5GB</span>
                </div>
                <Progress value={24} className="h-2 bg-muted-foreground/10" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Action Queue</span>
                  <span>14% Capacity</span>
                </div>
                <Progress value={14} className="h-2 bg-muted-foreground/10" />
              </div>
            </div>

            <Button variant="outline" className="w-full border-dashed border-2 hover:border-primary hover:text-primary transition-all">
              <FontAwesomeIcon icon={faMicrochip} className="mr-2 h-4 w-4" />
              View Node Cluster
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
