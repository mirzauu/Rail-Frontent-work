import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { Train, User, Lock, Bot, Database, Server } from "lucide-react";
import {
  faRobot,
  faComments,
  faBook,
  faCalendarAlt,
  faPlus,
  faZap,
  faBrain,
  faUsers,
  faProjectDiagram,
  faDatabase,
  faCoins,
  faHistory,
  faCheckCircle,
  faExclamationTriangle,
  faArrowUpRightFromSquare,
  faChartPie,
  faClock,
  faStar,
  faSync
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
import { useState, useEffect } from "react";
import { api, DashboardResponse } from "@/lib/api";

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const result = await api.getDashboard();
        setData(result);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
        setError("Failed to synchronize dashboard data. Please verify your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const currentDate = new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] space-y-6">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-primary animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Train className="h-8 w-8 text-primary animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-muted-foreground animate-pulse delay-75">Synchronizing your organization metrics</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <Card className="max-w-md border-destructive/20 bg-destructive/5 backdrop-blur-md">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
              <FontAwesomeIcon icon={faExclamationTriangle} className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold">Inference Error</h2>
            <p className="text-muted-foreground">{error || "The dashboard could not be loaded."}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 border-destructive/20 hover:bg-destructive/10 hover:text-destructive">
              <FontAwesomeIcon icon={faSync} className="mr-2 h-4 w-4" />
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quotaItems = [
    { key: 'users', label: 'Users', color: '#3b82f6' },
    { key: 'agents', label: 'AI Agents', color: '#6366f1' },
    { key: 'documents', label: 'Knowledge Base', color: '#10b981' },
    { key: 'storage', label: 'Cloud Storage', color: '#f59e0b' },
    { key: 'tokens', label: 'Tokens', color: '#8b5cf6' },
  ];

  const chartData = quotaItems.map(item => {
    const quota = data.quotas[item.key];
    return {
      name: item.label,
      percentage: quota ? Math.min(quota.percentage, 100) : 0,
      used: quota ? quota.used : 0,
      max: quota ? quota.max : 0,
      unit: quota ? quota.unit : '',
      fill: item.color
    };
  });

  const mainStats = [
    { label: 'Total Conversations', value: data.stats.total_conversations, icon: faComments, detail: 'Lifetime interactions' },
    { label: 'Total Messages', value: data.stats.total_messages, icon: faBrain, detail: 'AI & User exchanges' },
    { label: 'Avg. Response', value: '5.2 sec', icon: faClock, detail: 'System latency' },
  ];

  const agents = [
    { name: "Michael", role: "CSO", icon: User, enabled: true, path: "/agents/cso", description: "Chief Security Officer" },
    { name: "Sarah", role: "CTO", icon: User, enabled: false, path: "", description: "Chief Technology Officer" },
    { name: "David", role: "CFO", icon: User, enabled: false, path: "", description: "Chief Financial Officer" },
    { name: "Emily", role: "CMO", icon: User, enabled: false, path: "", description: "Chief Marketing Officer" },
    { name: "James", role: "COO", icon: User, enabled: false, path: "", description: "Chief Operating Officer" },
  ];

  return (
    <div className="animate-fade-in p-6 space-y-8 relative min-h-[calc(100vh-4rem)] max-w-[1600px] mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground">
              {data.org_name} <span className="text-primary">Dashboard</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="h-4 w-4 opacity-70" />
            {currentDate} • System Status:
            <span className="flex items-center gap-1.5 text-emerald-500 font-medium ml-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              {data.subscription_status}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3"></div>
      </div>

      {/* Main Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, idx) => (
          <Card key={idx} className="border-none bg-card/50 backdrop-blur-xl shadow-sm hover:shadow-md transition-all group overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <FontAwesomeIcon icon={stat.icon} className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-black tracking-tight">{stat.value}</h3>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-xs text-muted-foreground/60">{stat.detail}</p>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <FontAwesomeIcon icon={stat.icon} className="h-24 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Agents Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Active Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {agents.map((agent) => (
            <Card
              key={agent.name}
              className={cn(
                "border-none transition-all duration-300 relative overflow-hidden",
                agent.enabled
                  ? "bg-card/60 hover:bg-primary/5 cursor-pointer hover:-translate-y-1 hover:shadow-lg ring-1 ring-primary/10"
                  : "bg-muted/20 opacity-60 grayscale cursor-not-allowed"
              )}
              onClick={() => agent.enabled && navigate(agent.path)}
            >
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className={cn(
                  "h-16 w-16 rounded-2xl flex items-center justify-center transition-transform duration-500",
                  agent.enabled ? "bg-primary/10 text-primary group-hover:scale-110" : "bg-muted text-muted-foreground"
                )}>
                  <agent.icon className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">{agent.name}</h3>
                  <Badge variant={agent.enabled ? "default" : "outline"} className="text-[10px] uppercase">
                    {agent.role}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em]">
                  {agent.description}
                </p>
                {agent.enabled && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/20">
                    <div className="h-full bg-primary w-1/3 animate-pulse" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quotas Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Resource Consumption</h2>
          </div>

          <Card className="border-none bg-card/60 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border bg-background p-3 shadow-lg">
                              <div className="flex flex-col gap-1">
                                <span className="text-sm font-bold">{data.name}</span>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span className="font-medium text-foreground">{data.percentage}%</span>
                                  <span>({data.used} / {data.max} {data.unit})</span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={24} background={{ fill: 'hsl(var(--muted)/0.1)', radius: [0, 4, 4, 0] }}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Activity Section */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold tracking-tight">Recent Activity</h2>
              <Button variant="link" className="text-muted-foreground hover:text-primary">View History</Button>
            </div>
            <Card className="border-none bg-card/40 backdrop-blur-md overflow-hidden">
              <CardContent className="p-0">
                <div className="divide-y divide-border/30">
                  {data.recent_activity.slice(0, 6).map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-primary/5 transition-all flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center border-2 border-background shadow-sm",
                          activity.type === 'project' ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"
                        )}>
                          <FontAwesomeIcon icon={activity.type === 'project' ? faProjectDiagram : faComments} className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{activity.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground/80">{activity.type}</span>
                            <span className="text-muted-foreground opacity-30">•</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <FontAwesomeIcon icon={faClock} className="h-3 w-3" />
                              {formatDate(activity.updated_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-background/50 border-none text-[10px] font-bold uppercase tracking-tighter">
                          {activity.status}
                        </Badge>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* System Health */}
          <Card className="border-none bg-card/40 backdrop-blur-md shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <FontAwesomeIcon icon={faHistory} className="h-4 w-4 text-primary" />
                Insights & Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">System Metrics</h4>
                {[
                  { label: "Token Efficiency", value: "98.2%", icon: faCheckCircle, color: "text-emerald-500" },
                  { label: "Agent Uptime", value: "99.98%", icon: faCheckCircle, color: "text-emerald-500" },
                  { label: "Memory Usage", value: "Locked", icon: faDatabase, color: "text-blue-500" },
                ].map((m, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={m.icon} className={cn("h-3 w-3", m.color)} />
                      <span className="text-sm font-semibold">{m.label}</span>
                    </div>
                    <span className="text-sm font-bold opacity-70">{m.value}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Card className="bg-primary/5 border-none">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-primary uppercase">Satisfaction</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <FontAwesomeIcon
                            key={s}
                            icon={faStar}
                            className={cn(
                              "h-3 w-3",
                              data.stats.avg_satisfaction && s <= Math.round(data.stats.avg_satisfaction)
                                ? "text-primary"
                                : "text-muted"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-primary">
                        {data.stats.avg_satisfaction ? data.stats.avg_satisfaction.toFixed(1) : "---"}
                      </p>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase">Average</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
