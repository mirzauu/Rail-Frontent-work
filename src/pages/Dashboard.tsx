import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MoreHorizontal, Calendar, Plus, TrendingUp, TrendingDown, Activity } from "lucide-react";
import {
  faComments,
  faZap,
  faBrain,
  faClock,
  faStar,
  faUserTie,
  faHandshake,
  faChartLine,
  faBuilding,
  faServer,
  faArrowUp,
  faArrowDown,
  faExclamationTriangle,
  faCheckCircle
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
  AreaChart,
  Area,
} from "recharts";
import { useState, useEffect } from "react";
import { api, DashboardResponse } from "@/lib/api";

// --- Components ---

const StatCard = ({
  label,
  value,
  icon,
  trend,
  trendValue,
  color,
  bgColor
}: {
  label: string;
  value: string | number;
  icon: any;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color: string;
  bgColor: string;
}) => (
  <Card className="border-none shadow-sm bg-white dark:bg-card rounded-[32px] overflow-hidden transition-all hover:shadow-md">
    <CardContent className="p-6 flex flex-col justify-between h-full relative">
      <div className="flex justify-between items-start">
        <span className="text-muted-foreground font-medium text-sm">{label}</span>
        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", bgColor, color)}>
          <FontAwesomeIcon icon={icon} className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-6 space-y-2">
        <h3 className="text-4xl font-bold tracking-tight text-foreground">{value}</h3>
        {trend && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-bold border-0",
              trend === 'up' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                trend === 'down' ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400" :
                  "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
            )}>
              <FontAwesomeIcon icon={trend === 'up' ? faArrowUp : faArrowDown} className="mr-1 h-2.5 w-2.5" />
              {trendValue}
            </Badge>
            <span className="text-xs text-muted-foreground/70">from last month</span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

// --- Main Dashboard ---

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'railvision' | 'platform'>('railvision');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const result = await api.getDashboard();
        setData(result);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
        setError("Failed to synchronize dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] p-6 md:p-8 lg:p-10 space-y-8 pointer-events-none">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-xl relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
            </div>
            <div className="space-y-2">
              <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
              </div>
              <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 hidden md:flex">
            <div className="h-12 w-[180px] bg-slate-200 dark:bg-slate-800 rounded-full relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
            </div>
            <div className="h-12 w-[140px] bg-slate-200 dark:bg-slate-800 rounded-full relative overflow-hidden hidden lg:block">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
            </div>
          </div>
        </div>

        {/* 4 Stat Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[140px] bg-slate-200 dark:bg-slate-800 rounded-[32px] relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
            </div>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-full">
          <div className="xl:col-span-2 space-y-8">
            <div className="h-[380px] bg-slate-200 dark:bg-slate-800 rounded-[32px] relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
            </div>
            <div className="flex gap-6 w-full">
              <div className="h-[250px] flex-1 bg-slate-200 dark:bg-slate-800 rounded-[32px] relative overflow-hidden hidden md:block">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
              </div>
              <div className="h-[250px] flex-1 bg-slate-200 dark:bg-slate-800 rounded-[32px] relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <div className="h-[300px] bg-slate-200 dark:bg-slate-800 rounded-[32px] relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
            </div>
            <div className="h-[350px] bg-slate-200 dark:bg-slate-800 rounded-[32px] relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50 dark:bg-background">
        <Card className="max-w-md border-none shadow-lg rounded-3xl">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500 mb-2">
              <FontAwesomeIcon icon={faExclamationTriangle} className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold">Error Loading Dashboard</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()} className="rounded-full bg-emerald-600 hover:bg-emerald-700">
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Data Preparation ---

  const partners = data.commercial?.partners || [];
  const accounts = data.commercial?.accounts || [];
  const performanceStudies = data.commercial?.performance_studies || [];

  const totalFunding = partners.reduce((acc, p) => acc + Number(p.funding_amount_usd), 0);
  const totalPipeline = accounts.reduce((acc, a) => {
    const pipeline = a.pipelines[0];
    return acc + (pipeline && pipeline.arr_potential_cad ? Number(pipeline.arr_potential_cad) : 0);
  }, 0);

  const avgImprovement = performanceStudies.reduce((acc, s) => acc + parseFloat(s.improvement_percent), 0);
  const avgImprovementCount = performanceStudies.length || 1;
  const avgImprovementValue = (avgImprovement / avgImprovementCount).toFixed(1);

  // Stats for RailVision
  const railvisionStats = [
    { label: 'Total Funding', value: `$${(totalFunding / 1000000).toFixed(1)}M`, icon: faHandshake, color: "text-indigo-600", bgColor: "bg-indigo-50" },
    { label: 'Pipeline Value', value: `$${(totalPipeline / 1000000).toFixed(1)}M`, icon: faChartLine, color: "text-emerald-600", bgColor: "bg-emerald-50" },
    { label: 'Avg. Improvement', value: `${avgImprovementValue}%`, icon: faZap, color: "text-amber-600", bgColor: "bg-amber-50" },
    { label: 'Active Partners', value: partners.length, icon: faBuilding, color: "text-blue-600", bgColor: "bg-blue-50" },
  ];

  // Stats for Platform
  const formatResponseTime = (ms: number | null | undefined) => ms ? (ms < 1000 ? `${ms.toFixed(0)}ms` : `${(ms / 1000).toFixed(1)}s`) : 'N/A';
  const platformStats = [
    { label: 'Conversations', value: data.stats.total_conversations, icon: faComments, color: "text-blue-600", bgColor: "bg-blue-50" },
    { label: 'Messages Processed', value: (data.stats.total_messages / 1000).toFixed(1) + 'k', icon: faBrain, color: "text-purple-600", bgColor: "bg-purple-50" },
    { label: 'Avg. Response', value: formatResponseTime(data.stats.avg_response_time_ms), icon: faClock, color: "text-emerald-600", bgColor: "bg-emerald-50" },
    { label: 'Satisfaction', value: data.stats.avg_satisfaction?.toFixed(1) || 'N/A', icon: faStar, color: "text-amber-600", bgColor: "bg-amber-50" },
  ];

  const currentStats = activeView === 'railvision' ? railvisionStats : platformStats;

  // Chart Data
  const quotaItems = [
    { key: 'users', label: 'Users', color: '#3b82f6' },
    { key: 'agents', label: 'Agents', color: '#6366f1' },
    { key: 'documents', label: 'Knowledge', color: '#10b981' },
    { key: 'storage', label: 'Storage', color: '#f59e0b' },
    { key: 'tokens', label: 'Tokens', color: '#8b5cf6' },
  ];

  const resourceData = quotaItems.map(item => {
    const quota = data.quotas[item.key];
    return {
      name: item.label,
      value: quota ? Math.min(quota.percentage, 100) : 0,
      displayValue: quota ? `${quota.used}/${quota.max}` : '0/0',
      fill: item.color
    };
  });

  const pieData = resourceData.filter(d => d.value > 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 font-sans p-6 md:p-8 lg:p-10 space-y-8">

      {/* Top Navigation / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <div className="h-10 w-10 bg-black rounded-xl flex items-center justify-center text-white">
              <FontAwesomeIcon icon={activeView === 'railvision' ? faBuilding : faServer} />
            </div>
            {activeView === 'railvision' ? 'RailVision Status' : 'Platform Status'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium ml-1">
            Welcome back, here's what's happening today.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-card p-1.5 rounded-full shadow-sm border border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveView('railvision')}
            className={cn(
              "px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300",
              activeView === 'railvision'
                ? "bg-orange-500 text-white shadow-md shadow-orange-100 transform scale-105"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            Business
          </button>
          <button
            onClick={() => setActiveView('platform')}
            className={cn(
              "px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300",
              activeView === 'platform'
                ? "bg-orange-500 text-white shadow-md shadow-orange-100 transform scale-105"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            Platform
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Button variant="outline" className="rounded-full h-12 px-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-card text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50">
            <Calendar className="mr-2 h-4 w-4" /> {new Date().toLocaleDateString()}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {currentStats.map((stat, idx) => (
          <StatCard key={idx} {...stat} trend={stat.trend as any} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-full">

        {/* Left Column (2/3 width) */}
        <div className="xl:col-span-2 space-y-8">

          {/* Main Chart Section */}
          <Card className="border-none shadow-sm bg-white dark:bg-card rounded-[32px] overflow-hidden">
            <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {activeView === 'railvision' ? 'Pipeline & Revenue' : 'Resource Usage'}
                </CardTitle>
                <p className="text-slate-500 font-medium mt-1">
                  {activeView === 'railvision' ? 'Projected growth over time' : 'Current quota consumption'}
                </p>
              </div>
              <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                <MoreHorizontal className="h-5 w-5 text-slate-400" />
              </Button>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {activeView === 'railvision' ? (
                    <AreaChart data={accounts.map(a => ({
                      name: a.account_name,
                      value: Number(a.pipelines[0]?.arr_potential_cad || 0) / 1000
                    }))}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="hsl(var(--muted))" strokeOpacity={0.2} strokeDasharray="4 4" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        itemStyle={{ color: '#10b981', fontWeight: 600 }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  ) : (
                    <BarChart data={resourceData} barSize={40}>
                      <CartesianGrid vertical={false} stroke="hsl(var(--muted))" strokeOpacity={0.2} strokeDasharray="4 4" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-slate-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl">
                                <span className="font-bold">{payload[0].payload.name}:</span> {payload[0].payload.displayValue}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="value" radius={[12, 12, 12, 12]}>
                        {resourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Secondary Grid */}
          <div className={cn("grid gap-8", activeView === 'railvision' ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>

            {activeView === 'railvision' ? (
              /* RailVision: Strategic Partners Detailed Grid */
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Strategic Partners & Funding</h3>
                  <Badge variant="outline" className="border-slate-200 bg-white text-slate-600">
                    {partners.length} Active
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {partners.map((partner, idx) => (
                    <Card key={partner.id} className="border-none shadow-sm bg-white dark:bg-card rounded-[32px] overflow-hidden hover:shadow-md transition-shadow">
                      <CardHeader className="p-6 pb-2 flex flex-row items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-lg",
                            idx % 2 === 0 ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                          )}>
                            {partner.partner_name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold">{partner.partner_name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{partner.partnership_type}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 font-bold whitespace-nowrap">
                          ${(Number(partner.funding_amount_usd) / 1000000).toFixed(1)}M
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Funding Details</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                            {partner.funding_notes}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Region</p>
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <FontAwesomeIcon icon={faBuilding} className="text-slate-400 h-3 w-3" />
                              {partner.geography.regions || "Global"}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Coverage</p>
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                              {partner.geography.num_countries} Countries
                            </div>
                          </div>
                        </div>

                        {partner.geography.notes && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-xs text-slate-400 italic mt-2">
                              "{partner.geography.notes}"
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              /* Platform: Active Agents (Full List) */
              <Card className="border-none shadow-sm bg-white dark:bg-card rounded-[32px] overflow-hidden">
                <CardHeader className="p-6 pb-2">
                  <CardTitle className="text-lg font-bold">Active Agents</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {[
                    { name: "Michael", role: "CSO", status: "Active" },
                    { name: "Raphael", role: "CFO", status: "Idle" },
                    { name: "Mary", role: "CCO", status: "Idle" },
                    { name: "Gabriel", role: "CRO", status: "Idle" },
                    { name: "Emily", role: "CTO", status: "Idle" }
                  ].map((agent, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          <FontAwesomeIcon icon={faUserTie} className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">{agent.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", agent.status === 'Active' ? "bg-green-500" : "bg-amber-500")} />
                        <span className="text-xs font-medium text-muted-foreground">{agent.status}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-8">

          {activeView === 'railvision' ? (
            /* RailVision Sidebar: Performance Studies & Accounts */
            <>
              <Card className="border-none shadow-sm bg-white dark:bg-card rounded-[32px] overflow-hidden">
                <CardHeader className="p-6 pb-2">
                  <CardTitle className="text-lg font-bold">Key Accounts</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {accounts.map((account) => (
                    <div key={account.id} className="space-y-3 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm">{account.account_name}</span>
                        <Badge variant="outline" className="text-[10px] font-normal">{account.segment}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(((Number(account.pipelines[0]?.arr_potential_cad || 0) / 10000000) * 100), 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-emerald-600">
                          ${(Number(account.pipelines[0]?.arr_potential_cad || 0) / 1000000).toFixed(1)}M
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Pipeline Status</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{account.pipelines[0]?.status}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <h3 className="text-xl font-bold px-1">Performance Impact</h3>
                <div className="space-y-4">
                  {performanceStudies.map((study, idx) => (
                    <Card key={study.id} className="border-none shadow-sm bg-white dark:bg-card rounded-[32px] overflow-hidden hover:shadow-md transition-shadow">
                      <div className={cn("h-2 w-full", idx % 2 === 0 ? "bg-emerald-500" : "bg-indigo-500")} />
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className={cn("p-2 rounded-xl", idx % 2 === 0 ? "bg-emerald-100 text-emerald-600" : "bg-indigo-100 text-indigo-600")}>
                            <FontAwesomeIcon icon={faChartLine} className="h-5 w-5" />
                          </div>
                          <Badge variant="outline" className="border-0 bg-slate-100 text-slate-600 font-bold">
                            Verified
                          </Badge>
                        </div>
                        <h3 className="text-3xl font-bold mb-1 text-foreground">{study.improvement_percent}%</h3>
                        <p className="font-bold text-sm text-muted-foreground mb-4">{study.metric_type}</p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {study.methodology_notes}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Platform Sidebar: System Load & Activity */
            <>
              <Card className="border-none shadow-sm bg-white dark:bg-card rounded-[32px] overflow-hidden">
                <CardHeader className="p-6 pb-0">
                  <CardTitle className="text-lg font-bold">System Load</CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col items-center justify-center relative">
                  <div className="h-[250px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                          cornerRadius={10}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-extrabold text-foreground">
                        {Math.round(pieData.reduce((acc, c) => acc + c.value, 0) / (pieData.length || 1))}%
                      </span>
                      <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Avg</span>
                    </div>
                  </div>

                  <div className="w-full space-y-3 mt-4">
                    {pieData.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                          <span className="font-medium text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="font-bold text-foreground">{item.value.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white dark:bg-card rounded-[32px] overflow-hidden">
                <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-bold">Recent Updates</CardTitle>
                  <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative">
                    <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800"></div>
                    <div className="space-y-6 p-6">
                      {data.recent_activity.slice(0, 4).map((activity, idx) => (
                        <div key={activity.id} className="relative pl-8 group">
                          <div className={cn(
                            "absolute left-[1px] top-1.5 h-3 w-3 rounded-full border-2 border-white dark:border-card z-10 transition-all group-hover:scale-125",
                            activity.type === 'project' ? "bg-indigo-500" : "bg-emerald-500"
                          )}></div>
                          <div>
                            <p className="text-sm font-bold text-foreground leading-tight">{activity.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(activity.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
