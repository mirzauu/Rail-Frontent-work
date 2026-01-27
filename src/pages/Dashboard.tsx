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
            <FontAwesomeIcon icon={faRobot} className="h-8 w-8 text-primary animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight animate-pulse">Initializing Intelligence...</h2>
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
    { key: 'users', label: 'Users', icon: faUsers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { key: 'projects', label: 'Projects', icon: faProjectDiagram, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { key: 'agents', label: 'AI Agents', icon: faRobot, color: 'text-primary', bg: 'bg-primary/10' },
    { key: 'documents', label: 'Knowledge Base', icon: faBook, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { key: 'storage', label: 'Cloud Storage', icon: faDatabase, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { key: 'tokens', label: 'Tokens', icon: faCoins, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  const mainStats = [
    { label: 'Total Conversations', value: data.stats.total_conversations, icon: faComments, detail: 'Lifetime interactions' },
    { label: 'Total Messages', value: data.stats.total_messages, icon: faBrain, detail: 'AI & User exchanges' },
    { label: 'Estimated Cost', value: `$${data.stats.total_cost_usd}`, icon: faZap, detail: 'Resource consumption' },
    { label: 'Avg. Response', value: data.stats.avg_response_time_ms ? `${data.stats.avg_response_time_ms}ms` : '---', icon: faClock, detail: 'System latency' },
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
        {/* Quotas Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Resource Consumption</h2>
            <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5">
              Upgrade Limits <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="ml-2 h-3 w-3" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quotaItems.map((item) => {
              const quota = data.quotas[item.key];
              if (!quota) return null;
              const isOverLimit = quota.percentage > 100;

              return (
                <Card key={item.key} className="border-none bg-card/60 backdrop-blur-md hover:bg-card/80 transition-colors group">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", item.bg, item.color)}>
                          <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-sm tracking-tight">{item.label}</span>
                      </div>
                      <Badge variant={isOverLimit ? "destructive" : "outline"} className={cn("font-bold", !isOverLimit && "border-none bg-muted/50")}>
                        {quota.percentage}%
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold">{quota.used}</span>
                          <span className="text-xs font-medium text-muted-foreground">/ {quota.max} {quota.unit}</span>
                        </div>
                        {isOverLimit && (
                          <span className="text-[10px] font-black text-destructive uppercase animate-bounce flex items-center gap-1">
                            <FontAwesomeIcon icon={faExclamationTriangle} /> Limit Exceeded
                          </span>
                        )}
                      </div>
                      <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "absolute left-0 top-0 h-full transition-all duration-1000 ease-out rounded-full",
                            isOverLimit ? "bg-destructive" : "bg-primary"
                          )}
                          style={{ width: `${Math.min(quota.percentage, 100)}%` }}
                        />
                        {isOverLimit && (
                          <div
                            className="absolute left-0 top-0 h-full bg-destructive/30 animate-pulse"
                            style={{ width: '100%' }}
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

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
              <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 space-y-2">
                <div className="flex items-center gap-2 text-orange-600">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="h-3 w-3" />
                  <span className="text-xs font-bold uppercase">Critical Alert</span>
                </div>
                <p className="text-sm font-medium">Project capacity is over-limit. Some automated flows might be paused.</p>
                <div className="pt-1">
                  <Button variant="outline" size="sm" className="h-7 text-[10px] border-orange-200 hover:bg-orange-100 text-orange-700 font-bold">Manage Projects</Button>
                </div>
              </div>

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
