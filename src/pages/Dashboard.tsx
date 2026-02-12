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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
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

  // Filter data for Pie Chart (e.g., resource usage distribution)
  // Since units differ, we'll visualize the "Percentage Used" distribution to show which resources are under heavy load
  const pieChartData = chartData.map(item => ({
    name: item.name,
    value: item.percentage,
    fill: item.fill
  })).filter(item => item.value > 0);

  const mainStats = [
    { label: 'Total Conversations', value: data.stats.total_conversations, icon: faComments, detail: 'Lifetime interactions' },
    { label: 'Total Messages', value: data.stats.total_messages, icon: faBrain, detail: 'AI & User exchanges' },
    { label: 'Avg. Response', value: data.stats.avg_response_time_ms ? `${(data.stats.avg_response_time_ms / 1000).toFixed(1)}s` : 'N/A', icon: faClock, detail: 'System latency' },
    { label: 'Total Cost', value: data.stats.total_cost_usd || '$0.00', icon: faCoins, detail: 'Current billing cycle' },
  ];

  const agents = [
    { name: "Michael", role: "CSO", icon: User, enabled: true, path: "/agents/cso", description: "Chief Security Officer" },
    { name: "Sarah", role: "CTO", icon: User, enabled: false, path: "", description: "Chief Technology Officer" },
    { name: "Caroline", role: "CFO", icon: User, enabled: false, path: "", description: "Chief Financial Officer" },
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


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quotas & Pie Chart Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Resource Consumption</h2>
          </div>

          <div className="w-full">
            <Card className="border-none bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 relative group overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <FontAwesomeIcon icon={faBrain} className="h-32 w-32 rotate-12 text-primary" />
              </div>
              <CardHeader className="relative z-10">
                 <CardTitle className="text-xl font-bold flex items-center gap-2">
                   <span className="p-2 rounded-lg bg-primary/10 text-primary">
                     <FontAwesomeIcon icon={faZap} className="h-4 w-4" />
                   </span>
                   Quota Metrics
                 </CardTitle>
                 <CardDescription className="font-medium">Real-time consumption analysis</CardDescription>
              </CardHeader>
              <CardContent className="p-6 relative z-10">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }} barGap={2}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis type="number" hide domain={[0, 100]} />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={100} 
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} 
                        axisLine={false} 
                        tickLine={false}
                        tickMargin={10}
                      />
                      <Tooltip
                        cursor={{ fill: 'hsl(var(--muted)/0.1)', radius: 4 }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-xl border border-border/50 bg-background/90 backdrop-blur-xl p-4 shadow-2xl ring-1 ring-black/5">
                                <div className="flex flex-col gap-2">
                                  <span className="text-sm font-bold">{data.name}</span>
                                  <div className="flex items-center gap-3">
                                    <div className="flex flex-col">
                                      <span className="text-xs text-muted-foreground uppercase font-bold">Usage</span>
                                      <span className="font-mono text-lg font-bold text-foreground">{data.percentage}%</span>
                                    </div>
                                    <div className="w-px h-8 bg-border/50" />
                                    <div className="flex flex-col">
                                      <span className="text-xs text-muted-foreground uppercase font-bold">Limit</span>
                                      <span className="text-xs font-medium">{data.used} / {data.max} {data.unit}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <defs>
                        {chartData.map((entry, index) => (
                          <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={entry.fill} stopOpacity={0.6} />
                            <stop offset="100%" stopColor={entry.fill} stopOpacity={1} />
                          </linearGradient>
                        ))}
                      </defs>
                      <Bar dataKey="percentage" radius={[0, 6, 6, 0]} barSize={16} background={{ fill: 'hsl(var(--muted)/0.2)', radius: [0, 6, 6, 0] }}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agents & Insights Section */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Active Agents & Insights</h2>
             </div>
             <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agents.map((agent) => (
                    <Card
                      key={agent.name}
                      className={cn(
                        "border-none transition-all duration-300 relative overflow-hidden group",
                        agent.enabled
                          ? "bg-card/60 hover:bg-primary/5 cursor-pointer hover:-translate-y-1 hover:shadow-lg ring-1 ring-primary/10"
                          : "bg-muted/20 opacity-60 grayscale cursor-not-allowed"
                      )}
                      onClick={() => agent.enabled && navigate(agent.path)}
                    >
                      <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                        <div className="relative">
                          <div className={cn(
                            "h-16 w-16 rounded-2xl flex items-center justify-center transition-transform duration-500 shadow-sm",
                            agent.enabled ? "bg-gradient-to-br from-primary/20 to-primary/5 text-primary group-hover:scale-110" : "bg-muted text-muted-foreground"
                          )}>
                            <agent.icon className="h-8 w-8" />
                          </div>
                          {agent.enabled && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-background"></span>
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{agent.name}</h3>
                          <Badge variant={agent.enabled ? "default" : "outline"} className="text-[10px] uppercase shadow-none">
                            {agent.role}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em]">
                          {agent.description}
                        </p>
                        {agent.enabled && (
                          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Insights Panel */}
                <div className="xl:col-span-1">
                   <Card className="border-none bg-card/40 backdrop-blur-md shadow-sm h-full">
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

          {/* Activity Section */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold tracking-tight">Recent Activity</h2>
              <Button variant="link" className="text-muted-foreground hover:text-primary">View History</Button>
            </div>
            <Card className="border-none bg-card/40 backdrop-blur-md overflow-hidden shadow-sm">
              <CardContent className="p-0">
                <div className="divide-y divide-border/30">
                  {data.recent_activity.slice(0, 6).map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-primary/5 transition-all flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center border-2 border-background shadow-sm transition-transform group-hover:scale-105",
                          activity.type === 'project' ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                        )}>
                          <FontAwesomeIcon icon={activity.type === 'project' ? faProjectDiagram : faComments} className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{activity.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="secondary" className="text-[10px] uppercase font-bold h-5 px-1.5 bg-muted/50">
                              {activity.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <FontAwesomeIcon icon={faClock} className="h-3 w-3 opacity-70" />
                              {formatDate(activity.updated_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          activity.status === 'active' ? "bg-emerald-500" : "bg-muted-foreground/30"
                        )} />
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-background shadow-sm">
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
          {/* Usage Breakdown */}
            <Card className="border-none bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <FontAwesomeIcon icon={faChartPie} className="h-24 w-24 text-primary" />
              </div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-primary/10 text-primary">
                    <FontAwesomeIcon icon={faChartPie} className="h-4 w-4" />
                  </span>
                  Usage Breakdown
                </CardTitle>
                <CardDescription className="font-medium">Distribution of system resources</CardDescription>
              </CardHeader>
              <CardContent className="p-4 flex flex-col items-center justify-center min-h-[300px] relative z-10">
                 <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={6}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.fill} 
                          className="hover:opacity-80 transition-opacity cursor-pointer filter drop-shadow-sm" 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-xl border border-border/50 bg-background/90 backdrop-blur-xl p-4 shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
                              <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: data.fill }}></span>
                                  {data.name}
                                </span>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-2xl font-black tracking-tight">{data.value.toFixed(1)}%</span>
                                  <span className="text-xs text-muted-foreground font-bold uppercase">Used</span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center text for donut chart */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-12">
                   <span className="text-3xl font-black tracking-tighter text-foreground">
                     {Math.round(pieChartData.reduce((acc, curr) => acc + curr.value, 0) / (pieChartData.length || 1))}%
                   </span>
                   <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Avg Load</span>
                </div>

                <div className="flex flex-wrap justify-center gap-4 mt-6">
                  {pieChartData.slice(0, 3).map((entry, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
                      <span className="text-xs font-medium text-muted-foreground">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
