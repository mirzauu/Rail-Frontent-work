import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { ElementType } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFreebsd } from "@fortawesome/free-brands-svg-icons";
import {
  Search,
  Globe,
  PanelLeft,
  PanelRight,
  Info,
  SlidersHorizontal,
  MoreVertical,
  Pin,
  Copy,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckSquare,
  Send,
  Mic,
  DollarSign,
  Settings,
  Users,
  TrendingUp,
  Code,
  Plus,
  Check,
  Zap,
  Bot,
  Shield,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ChatBubble, type ToolCall } from "@/components/shared/ChatBubble";
import { useQuery } from "@tanstack/react-query";
import { api, type StreamDelta } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define AI agents with their details
const aiAgents: Record<string, { id: string; name: string; role: string; icon: ElementType; color: string; textColor: string }> = {
  cso: {
    id: "cca83ff0-e54a-4bf2-a772-c884b53cd637",
    name: "Michael",
    role: "CSO",
    icon: Shield,
    color: "bg-red-500",
    textColor: "text-red-500"
  },
  cfo: {
    id: "9b1d9d6f-1e3a-4aaf-9d8a-0f6a6a1c9b12",
    name: "Elena ",
    role: "CFO",
    icon: DollarSign,
    color: "bg-orange-500",
    textColor: "text-orange-500"
  },
  coo: {
    id: "5c2e8f3a-7dbe-4f9b-b1a2-3a9e4d6f8c21",
    name: "David ",
    role: "COO",
    icon: Settings,
    color: "bg-purple-500",
    textColor: "text-purple-500"
  },
  chro: {
    id: "2a7c1b9e-4d3f-4e2a-9f8b-7e6c5d4a3b2c",
    name: "Amelia ",
    role: "CHRO",
    icon: Users,
    color: "bg-pink-500",
    textColor: "text-pink-500"
  },
  cmo: {
    id: "8f3d2a1b-9c7e-4b5a-8d1f-2e3c4b5a6d7e",
    name: "Sarah ",
    role: "CMO",
    icon: TrendingUp,
    color: "bg-blue-500",
    textColor: "text-blue-500"
  },
  cto: {
    id: "1e2d3c4b-5a6f-7e8d-9c0b-1a2f3e4d5c6b",
    name: "Marcus ",
    role: "CTO",
    icon: Code,
    color: "bg-green-500",
    textColor: "text-green-500"
  }
};

// Reasoning step type
interface ReasoningStep {
  id: number;
  title: string;
  status: 'completed' | 'loading' | 'pending';
  details?: string[];
  isExpanded?: boolean;
}

// Message type with reasoning
interface Message {
  id: number;
  type: string;
  agent?: string;
  content: string;
  time: string;
  reasoning?: ReasoningStep[];
  tool_calls?: ToolCall[];
}

interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

// Agent-specific conversations with reasoning
const agentConversations: Record<string, Message[]> = {
  cso: [
    { id: 1, type: "user", content: "What are the key security risks we should address this quarter?", time: "09:30" },
    {
      id: 2,
      type: "agent",
      agent: "cso",
      content: "Based on my analysis, we have three critical areas to address: 1) Cloud infrastructure security gaps that need immediate patching, 2) Employee security awareness training is overdue for 40% of staff, and 3) Third-party vendor access controls need strengthening. I recommend prioritizing the cloud security patches this week.",
      time: "09:35",
      reasoning: [
        { id: 1, title: "Security scan analyzed successfully", status: "completed", details: ["Analyzing file - security/vulnerability_report.json", "[ 'critical: 3 ', ' high: 12 ', ' medium: 24 ', ' low: 45 ']"] },
        { id: 2, title: "Fetching compliance data", status: "completed", details: ["fetching contents for file security/compliance_status.json"] },
      ]
    },
    { id: 3, type: "user", content: "What's the estimated budget for these security improvements?", time: "09:40" },
    {
      id: 4,
      type: "agent",
      agent: "cso",
      content: "For comprehensive coverage: Cloud security upgrades ($180K), Security awareness program ($45K), Vendor management platform ($75K). Total investment: $300K. This will reduce our risk exposure by approximately 60% and bring us into full compliance with SOC 2 requirements.",
      time: "09:45",
      reasoning: [
        { id: 1, title: "Budget analysis completed", status: "completed", details: ["Analyzing file - finance/security_budget_2025.xlsx", "[ 'category: infrastructure ', ' amount: $180K ']"] },
        { id: 2, title: "ROI calculation completed", status: "completed", details: ["calculating risk reduction metrics"] },
      ]
    },
  ],
  cfo: [
    { id: 1, type: "user", content: "Can you provide a budget breakdown for these initiatives?", time: "10:07" },
    {
      id: 2,
      type: "agent",
      agent: "cfo",
      content: "I've prepared a comprehensive financial model. The total investment required is $2.4M spread across Q1-Q2. Expected ROI is 180% within 18 months. Here's the breakdown: Digital transformation ($950K), Customer experience ($800K), Strategic partnerships ($650K). We have adequate runway and can finance this through existing reserves.",
      time: "10:15",
      reasoning: [
        { id: 1, title: "Financial model analyzed successfully", status: "completed", details: ["Analyzing file - finance/budget_model_q1q2.xlsx", "[ 'total: $2.4M ', ' roi: 180% ', ' timeline: 18 months ']"] },
        { id: 2, title: "Fetching runway data", status: "completed", details: ["fetching contents for file finance/cash_reserves.json"] },
      ]
    },
    { id: 3, type: "user", content: "What's our current cash position?", time: "10:20" },
    {
      id: 4,
      type: "agent",
      agent: "cfo",
      content: "Our current cash reserves stand at $8.2M with a monthly burn rate of $420K. We have 19 months of runway. The proposed $2.4M investment would reduce this to 14 months, which is still within our comfortable threshold. Revenue projections show break-even on these initiatives by month 8.",
      time: "10:25",
      reasoning: [
        { id: 1, title: "Cash flow analyzed successfully", status: "completed", details: ["Analyzing file - finance/cash_flow_statement.xlsx", "[ 'reserves: $8.2M ', ' burn_rate: $420K/mo ', ' runway: 19 months ']"] },
        { id: 2, title: "Revenue projection fetched", status: "completed", details: ["fetching contents for file finance/revenue_projections.json"] },
      ]
    },
  ],
  coo: [
    { id: 1, type: "user", content: "How can we improve our operational efficiency?", time: "11:00" },
    {
      id: 2,
      type: "agent",
      agent: "coo",
      content: "From an operational standpoint, I've identified three key opportunities: 1) Automating our order processing could reduce fulfillment time by 35%, 2) Consolidating our warehouse locations would save $200K annually, 3) Implementing predictive maintenance would reduce equipment downtime by 50%. I recommend starting with order automation.",
      time: "11:08",
      reasoning: [
        { id: 1, title: "Operations data analyzed successfully", status: "completed", details: ["Analyzing file - operations/efficiency_metrics.json", "[ 'fulfillment_time: 48hrs ', ' warehouse_cost: $800K ', ' downtime: 12% ']"] },
        { id: 2, title: "Fetching automation benchmarks", status: "completed", details: ["fetching contents for file operations/automation_roi.json"] },
      ]
    },
    { id: 3, type: "user", content: "What's the timeline for the automation project?", time: "11:15" },
    {
      id: 4,
      type: "agent",
      agent: "coo",
      content: "The automation project would take 12 weeks: Phase 1 (weeks 1-4) - System integration and testing, Phase 2 (weeks 5-8) - Pilot with 20% of orders, Phase 3 (weeks 9-12) - Full rollout and optimization. We can run this parallel to current operations with minimal disruption.",
      time: "11:20",
      reasoning: [
        { id: 1, title: "Project timeline generated", status: "completed", details: ["Analyzing file - operations/project_templates.json", "[ 'phase1: 4 weeks ', ' phase2: 4 weeks ', ' phase3: 4 weeks ']"] },
        { id: 2, title: "Resource allocation checked", status: "completed", details: ["fetching contents for file hr/team_availability.json"] },
      ]
    },
  ],
  cmo: [
    { id: 1, type: "user", content: "What marketing strategies should we focus on for Q2?", time: "14:00" },
    {
      id: 2,
      type: "agent",
      agent: "cmo",
      content: "Based on our Q1 performance data, I recommend three priority strategies: 1) Double down on LinkedIn content - it's driving 45% of our qualified leads, 2) Launch a customer referral program - our NPS of 72 indicates strong advocacy potential, 3) Invest in video marketing - video content has 3x engagement vs. static posts. Budget allocation: Content (40%), Referral program (30%), Video production (30%).",
      time: "14:10",
      reasoning: [
        { id: 1, title: "Marketing analytics analyzed", status: "completed", details: ["Analyzing file - marketing/q1_performance.json", "[ 'linkedin_leads: 45% ', ' nps: 72 ', ' video_engagement: 3x ']"] },
        { id: 2, title: "Competitor analysis fetched", status: "completed", details: ["fetching contents for file marketing/competitor_strategies.json"] },
      ]
    },
    { id: 3, type: "user", content: "How do we measure success for these campaigns?", time: "14:18" },
    {
      id: 4,
      type: "agent",
      agent: "cmo",
      content: "Key metrics by initiative: LinkedIn - target 500 MQLs/month (currently 320), Referral program - aim for 15% of new customers from referrals, Video content - 10K views per video average with 8% CTR. I'll set up a weekly dashboard tracking pipeline impact, cost per lead, and conversion rates at each funnel stage.",
      time: "14:25",
      reasoning: [
        { id: 1, title: "KPI benchmarks loaded", status: "completed", details: ["Analyzing file - marketing/kpi_targets.json", "[ 'mql_target: 500 ', ' referral_target: 15% ', ' video_views: 10K ']"] },
        { id: 2, title: "Dashboard template prepared", status: "completed", details: ["generating dashboard config from templates/marketing_dashboard.json"] },
      ]
    },
  ],
  cto: [
    { id: 1, type: "user", content: "What's the status of our cloud migration project?", time: "15:30" },
    {
      id: 2,
      type: "agent",
      agent: "cto",
      content: "We're 65% complete on the migration to AWS. Core services are live in production. Remaining work: Database migration (2 weeks), Legacy API modernization (3 weeks), and final security hardening (1 week). We've already seen 40% improvement in API response times and 25% reduction in infrastructure costs.",
      time: "15:38",
      reasoning: [
        { id: 1, title: "Code structure analyzed successfully", status: "completed", details: ["Analyzing file - app/modules/auth/auth_service.py", "[ ' class: AuthService ', ' method: login ', ' method: signup ', ' method: check_auth ']"] },
        { id: 2, title: "Fetching file content", status: "completed", details: ["fetching contents for file app/modules/auth/auth_service.py"] },
      ]
    },
    { id: 3, type: "user", content: "Any technical debt we should address?", time: "15:45" },
    {
      id: 4,
      type: "agent",
      agent: "cto",
      content: "Critical technical debt items: 1) Monolithic auth service needs to be split into microservices - blocking scalability, 2) Test coverage is at 45%, should be 80%+, 3) CI/CD pipeline needs optimization - builds taking 25 mins, target is 8 mins. I propose dedicating 20% of sprint capacity to debt reduction over the next 3 sprints.",
      time: "15:52",
      reasoning: [
        { id: 1, title: "Technical debt scan completed", status: "completed", details: ["Analyzing file - devops/tech_debt_report.json", "[ 'auth_service: monolithic ', ' test_coverage: 45% ', ' build_time: 25min ']"] },
        { id: 2, title: "Sprint capacity checked", status: "completed", details: ["fetching contents for file project/sprint_planning.json"] },
      ]
    },
  ],
};

const agentEmptyPrompts: Record<string, string> = {
  cso: "How can I help you today?",
  cfo: "How can I help you today?",
  coo: "How can I help you today?",
  cmo: "How can I help you today?",
  cto: "How can I help you today?",
  chro: "How can I help you today?",
};

// AI Models
const aiModels = [
  { id: "auto", name: "Auto", description: "Automatically select the best model", icon: Zap },
  { id: "gpt", name: "GPT", description: "OpenAI GPT-4o", icon: Bot },
  { id: "perplexity", name: "Perplexity", description: "Perplexity Sonar", icon: Globe },
  { id: "claude", name: "Claude", description: "Anthropic Claude 3.5 Sonnet", icon: Bot, disabled: true },
];

// Agent capabilities for each agent type
const agentCapabilities: Record<string, { id: string; name: string; description: string }[]> = {
  cso: [
    { id: "auto", name: "Auto", description: "Automatically select capability" },
    { id: "strategy", name: "Strategy", description: "Strategic Asset Analysis" },
    { id: "value_prop", name: "Value Prop", description: "Value Proposition Design" },
    { id: "gtm", name: "GTM", description: "Go-to-Market Strategy" },
    { id: "railroad_intel", name: "Railroad Intel", description: "Railroad Network Intelligence" },
    { id: "mna", name: "M&A", description: "Corporate Development Strategy" },
    { id: "artifact", name: "Artifact", description: "Artifact Generation" },
  ],
  cfo: [
    { id: "auto", name: "Auto", description: "Automatically select the best capability" },
    { id: "budget-planning", name: "Budget Planning", description: "Annual and quarterly budgets" },
    { id: "cash-flow-analysis", name: "Cash Flow Analysis", description: "Liquidity and cash management" },
    { id: "investment-strategy", name: "Investment Strategy", description: "Capital allocation and ROI" },
  ],
  coo: [
    { id: "auto", name: "Auto", description: "Automatically select the best capability" },
    { id: "process-optimization", name: "Process Optimization", description: "Workflow and efficiency improvements" },
    { id: "supply-chain", name: "Supply Chain", description: "Logistics and vendor management" },
    { id: "resource-planning", name: "Resource Planning", description: "Capacity and allocation planning" },
  ],
  chro: [
    { id: "auto", name: "Auto", description: "Automatically select the best capability" },
    { id: "talent-acquisition", name: "Talent Acquisition", description: "Recruitment and hiring strategy" },
    { id: "employee-engagement", name: "Employee Engagement", description: "Culture and satisfaction metrics" },
    { id: "workforce-planning", name: "Workforce Planning", description: "Headcount and skills forecasting" },
  ],
  cmo: [
    { id: "auto", name: "Auto", description: "Automatically select the best capability" },
    { id: "campaign-analytics", name: "Campaign Analytics", description: "Marketing performance metrics" },
    { id: "brand-strategy", name: "Brand Strategy", description: "Brand positioning and messaging" },
    { id: "customer-insights", name: "Customer Insights", description: "Customer behavior and segmentation" },
  ],
  cto: [
    { id: "auto", name: "Auto", description: "Automatically select the best capability" },
    { id: "architecture-review", name: "Architecture Review", description: "System design and scalability" },
    { id: "tech-debt-analysis", name: "Tech Debt Analysis", description: "Code quality and maintenance" },
    { id: "security-assessment", name: "Security Assessment", description: "Vulnerability and compliance" },
  ],
};

// Chat history for each agent
const agentChatHistory: Record<string, { title: string; hasMenu: boolean; isActive: boolean }[]> = {
  cso: [
    { title: "Q1 Security audit review", hasMenu: true, isActive: false },
    { title: "Risk assessment framework", hasMenu: false, isActive: true },
    { title: "Compliance policy update", hasMenu: false, isActive: false },
    { title: "Strategic roadmap 2025", hasMenu: false, isActive: false },
    { title: "Cybersecurity budget", hasMenu: false, isActive: false },
    { title: "Vendor risk analysis", hasMenu: false, isActive: false },
    { title: "Data protection strategy", hasMenu: false, isActive: false },
    { title: "Incident response plan", hasMenu: false, isActive: false },
  ],
  cfo: [
    { title: "Q4 Financial report", hasMenu: true, isActive: false },
    { title: "Budget allocation 2025", hasMenu: false, isActive: true },
    { title: "Revenue forecast analysis", hasMenu: false, isActive: false },
    { title: "Cost optimization plan", hasMenu: false, isActive: false },
    { title: "Investment portfolio review", hasMenu: false, isActive: false },
    { title: "Cash flow projections", hasMenu: false, isActive: false },
    { title: "Tax strategy planning", hasMenu: false, isActive: false },
    { title: "Quarterly earnings call", hasMenu: false, isActive: false },
  ],
  coo: [
    { title: "Operations efficiency review", hasMenu: true, isActive: false },
    { title: "Supply chain optimization", hasMenu: false, isActive: true },
    { title: "Process automation plan", hasMenu: false, isActive: false },
    { title: "Facility expansion", hasMenu: false, isActive: false },
    { title: "Vendor management", hasMenu: false, isActive: false },
    { title: "Quality assurance metrics", hasMenu: false, isActive: false },
    { title: "Logistics improvement", hasMenu: false, isActive: false },
    { title: "Operational KPIs dashboard", hasMenu: false, isActive: false },
  ],
  cmo: [
    { title: "Brand strategy 2025", hasMenu: true, isActive: false },
    { title: "Marketing campaign ROI", hasMenu: false, isActive: true },
    { title: "Social media analytics", hasMenu: false, isActive: false },
    { title: "Customer acquisition plan", hasMenu: false, isActive: false },
    { title: "Content marketing strategy", hasMenu: false, isActive: false },
    { title: "Product launch timeline", hasMenu: false, isActive: false },
    { title: "Competitor analysis", hasMenu: false, isActive: false },
    { title: "Customer feedback review", hasMenu: false, isActive: false },
  ],
  cto: [
    { title: "Tech stack modernization", hasMenu: true, isActive: false },
    { title: "Cloud migration strategy", hasMenu: false, isActive: true },
    { title: "API architecture review", hasMenu: false, isActive: false },
    { title: "DevOps pipeline setup", hasMenu: false, isActive: false },
    { title: "Security infrastructure", hasMenu: false, isActive: false },
    { title: "AI/ML implementation", hasMenu: false, isActive: false },
    { title: "Technical debt reduction", hasMenu: false, isActive: false },
    { title: "Engineering team scaling", hasMenu: false, isActive: false },
  ],
};

export default function Agents() {
  const { agentId } = useParams<{ agentId: string }>();

  // Check if mobile on initial render
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("auto");
  const [selectedCapability, setSelectedCapability] = useState("auto");
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [expandedReasonings, setExpandedReasonings] = useState<Record<number, boolean>>({});
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isNewChat, setIsNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const leftSidebarRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const currentUser = api.getUser();
  const userName = currentUser?.full_name?.trim()
    ? currentUser.full_name.trim().split(/\s+/)[0]
    : "there";
  const currentAgentKey = agentId || "cso";
  const currentAgentMeta = aiAgents[currentAgentKey];
  const { data: projectsData } = useQuery<ProjectItem[]>({
    queryKey: ["projects-by-agent", currentAgentMeta.id],
    queryFn: async () => {
      const r = await api.fetch(`api/v1/projects/by-agent/${currentAgentMeta.id}`);
      return r.json();
    },
  });
  const sortedProjects = projectsData
    ? [...projectsData].sort((a, b) => {
      const ad = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bd = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bd - ad;
    })
    : undefined;
  const renderedChatHistory = sortedProjects
    ? sortedProjects.map((p) => ({ title: p.name, projectId: p.id, hasMenu: false, isActive: (selectedProjectId ?? sortedProjects[0]?.id) === p.id }))
    : (agentChatHistory[currentAgentKey] || agentChatHistory.cso).map((c, idx) => ({ title: c.title, projectId: "", hasMenu: c.hasMenu, isActive: idx === 0 }));
  const initialConversation = agentConversations[agentId || "cso"] || agentConversations.cso;

  // Initialize messages with current conversation when agent changes
  const currentAgent = agentId || "cso";
  if (messages.length === 0 || (messages.length > 0 && messages[0]?.agent !== currentAgent && messages[0]?.type === "agent")) {
    // Only reset if we haven't initialized or agent changed
  }

  // Get the conversation to display (initial + new messages)
  const displayMessages = messages;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isLeftSidebarOpen &&
        leftSidebarRef.current &&
        !leftSidebarRef.current.contains(event.target as Node)
      ) {
        setIsLeftSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLeftSidebarOpen]);

  useEffect(() => {
    const loadInitial = async () => {
      if (!sortedProjects || sortedProjects.length === 0) return;
      if (messages.length > 0) return;
      if (isNewChat) return;
      const firstId = selectedProjectId ?? sortedProjects[0].id;
      if (!selectedProjectId) setSelectedProjectId(firstId);
      const r = await api.fetch(`api/v1/conversations/history/${firstId}`);
      const d = await r.json();
      setConversationId(d?.conversation_id ?? null);
      const arr = Array.isArray(d?.messages) ? d.messages : [];
      const conv = arr.map((m: HistoryMessage, idx: number) => ({
        id: Date.now() + idx,
        type: m.role === "user" ? "user" : "agent",
        agent: m.role === "assistant" ? currentAgentKey : undefined,
        content: m.content,
        time: new Date(m.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      }));
      setMessages(conv);
    };
    void loadInitial();
  }, [projectsData, currentAgentKey]);

  const lastScrollTime = useRef(0);

  useEffect(() => {
    const scroll = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: isStreaming ? "auto" : "smooth",
          block: "end",
        });
      }
    };

    // Immediate scroll
    scroll();

    // If streaming, extra scroll to ensure we catch rapid height changes
    if (isStreaming) {
      const timer = setTimeout(scroll, 50);
      return () => clearTimeout(timer);
    }
  }, [messages, isStreaming, agentId]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isStreaming) return;
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const userMessage: Message = { id: Date.now(), type: "user", content: inputMessage, time: currentTime };
    const assistantId = Date.now() + 1;
    const assistantMessage: Message = {
      id: assistantId,
      type: "agent",
      agent: currentAgent,
      content: "",
      time: currentTime,
      tool_calls: []
    };
    setMessages([...messages, userMessage, assistantMessage]);
    setIsStreaming(true);
    try {
      let projectId = selectedProjectId ?? null;
      if (isNewChat && !projectId) {
        const createBody = {
          name: inputMessage.slice(0, 50),
          description: inputMessage,
          type: "single_chat",
          status: "active",
          settings: { additionalProp1: {} },
          objective: inputMessage,
          tags: ["general"],
          category: "general",
          priority: "medium",
          agent_id: currentAgentMeta.id,
        };
        const resp = await api.fetch("api/v1/projects/", { method: "POST", body: JSON.stringify(createBody) });
        const data: { id?: string; name?: string; created_at?: string } = await resp.json();
        if (data?.id) {
          projectId = data.id;
          setSelectedProjectId(projectId);
          const fullName = (data.name ?? "string") as string;
          queryClient.setQueryData<ProjectItem[]>(["projects-by-agent", currentAgentMeta.id], (prev) => {
            const base = Array.isArray(prev) ? prev : [];
            const newItem: ProjectItem = { id: data.id as string, name: "", created_at: data.created_at };
            return [newItem, ...base];
          });
          let i = 0;
          const interval = setInterval(() => {
            i++;
            const partial = fullName.slice(0, i);
            queryClient.setQueryData<ProjectItem[]>(["projects-by-agent", currentAgentMeta.id], (prev) => {
              const base = Array.isArray(prev) ? prev : [];
              return base.map((p) => (p.id === data.id ? { ...p, name: partial } : p));
            });
            if (i >= fullName.length) {
              clearInterval(interval);
            }
          }, 40);
        }
      }
      const defaultProjectId = projectId ?? projectsData?.[0]?.id ?? "default";
      const modelValue =
        selectedModel === "auto"
          ? "string"
          : selectedModel === "gpt"
            ? "openai/gpt-4.1-mini"
            : selectedModel;
      const agentValue =
        selectedCapability === "auto"
          ? "auto"
          : selectedCapability.toLowerCase().replace(/-/g, "_");
      const payload = {
        query: inputMessage,
        project_id: defaultProjectId,
        framework: currentAgentKey,
        model: modelValue,
        agent: agentValue,
        attachment: "",
      };

      const isToolCall = (v: unknown): v is ToolCall => {
        if (!v || typeof v !== "object") return false;
        const o = v as Record<string, unknown>;
        return (
          typeof o.call_id === "string" &&
          typeof o.event_type === "string" &&
          typeof o.tool_name === "string"
        );
      };

      await api.streamChat(payload, (chunk: StreamDelta) => {
        if (!chunk) return;
        setMessages((prev) => prev.map((m) => {
          if (m.id !== assistantId) return m;

          let newContent = m.content || "";
          if (chunk.response && typeof chunk.response === "string") {
            newContent += chunk.response;
          }

          const newToolCalls: ToolCall[] = m.tool_calls ? [...m.tool_calls] : [];
          if (Array.isArray(chunk.tool_calls)) {
            chunk.tool_calls.filter(isToolCall).forEach((incoming) => {
              const existingIndex = newToolCalls.findIndex(
                (tc) => tc.call_id === incoming.call_id
              );
              if (existingIndex >= 0) {
                const existing = newToolCalls[existingIndex];

                // Deep merge summary
                const existingSummary = existing.tool_call_details?.summary || {};
                const incomingSummary = incoming.tool_call_details?.summary || {};

                const mergedSummary = {
                  ...existingSummary,
                  ...incomingSummary,
                  // If incoming has args/result, they should override or merge
                  args: incomingSummary.args || existingSummary.args,
                  result: incomingSummary.result || existingSummary.result
                };

                const mergedDetails = {
                  ...existing.tool_call_details,
                  ...incoming.tool_call_details,
                  summary: mergedSummary,
                };

                newToolCalls[existingIndex] = {
                  ...existing,
                  ...incoming,
                  tool_call_details: mergedDetails,
                  // Keep tool_response if it exists in either, prefer incoming if not empty
                  tool_response: incoming.tool_response || existing.tool_response
                };
              } else {
                newToolCalls.push(incoming);
              }
            });
          }

          return { ...m, content: newContent, tool_calls: newToolCalls };
        }));
      });
      if (isNewChat) {
        setIsNewChat(false);
      }
    } finally {
      setIsStreaming(false);
      setInputMessage("");
    }
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputMessage.trim()) {
      handleSendMessage();
    }
  };

  const isComingSoon = currentAgentKey !== "cso";

  return (
    <div className="flex h-full w-full bg-background overflow-hidden border-t border-border relative">
      {isComingSoon && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
          <div className="bg-background/95 border border-border px-8 py-4 rounded-full shadow-lg">
            <span className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Coming Soon
            </span>
          </div>
        </div>
      )}
      {/* Left Sidebar - Chat History */}
      <div
        ref={leftSidebarRef}
        className={cn(
          "flex flex-col border-border bg-[#f8fafc] dark:bg-card/30 transition-all duration-300 ease-in-out",
          isLeftSidebarOpen
            ? "w-[280px] lg:w-[320px] flex-shrink-0 border-r"
            : "w-0 overflow-hidden opacity-0"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/50 min-w-[280px]">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <span>Chat History</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => setIsLeftSidebarOpen(false)}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col min-w-[280px]">
          {/* Search Bar */}
          <div className="p-3 space-y-3">
            {/* New Chat Button */}
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-9"
              onClick={() => {
                setIsNewChat(true);
                setMessages([]);
                setConversationId(null);
                setSelectedProjectId(null);
              }}
            >
              <Plus className="h-4 w-4" />
              New chat
            </Button>
          </div>

          {/* Chat History List */}
          <div className="flex-1 overflow-auto">
            {/* Your chats header */}
            <div className="px-3 py-2 flex items-center justify-between group">
              <span className="text-sm text-muted-foreground font-medium">Your chats</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Chat list */}
            <div className="space-y-0.5">
              {renderedChatHistory.map((chat, i) => (
                <div
                  key={chat.projectId || i}
                  className={cn(
                    "px-3 py-2.5 flex items-center justify-between group cursor-pointer transition-colors relative",
                    chat.isActive
                      ? "bg-muted/70"
                      : "hover:bg-muted/50"
                  )}
                  onClick={async () => {
                    if (!chat.projectId) return;
                    setSelectedProjectId(chat.projectId);
                    const r = await api.fetch(`api/v1/conversations/history/${chat.projectId}`);
                    const d = await r.json();
                    setConversationId(d?.conversation_id ?? null);
                    const arr = Array.isArray(d?.messages) ? d.messages : [];
                    const conv = arr.map((m: HistoryMessage, idx: number) => ({
                      id: Date.now() + idx,
                      type: m.role === "user" ? "user" : "agent",
                      agent: m.role === "assistant" ? currentAgentKey : undefined,
                      content: m.content,
                      time: new Date(m.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
                    }));
                    setMessages(conv);
                  }}
                >
                  <span className={cn(
                    "text-sm truncate pr-2",
                    chat.isActive ? "text-foreground font-medium" : "text-foreground/80"
                  )}>
                    {chat.title}
                  </span>
                  {chat.isActive && (
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                  {chat.hasMenu && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#fefcf8] dark:bg-background relative transition-all duration-300">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 h-[60px]">
          <div className="flex items-center gap-2">
            {!isLeftSidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground mr-2"
                onClick={() => setIsLeftSidebarOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            <h2 className="font-semibold text-lg">Chat</h2>
            <Info className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
          </div>
          <div className="flex items-center gap-2">
            {!isRightSidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground ml-2"
                onClick={() => setIsRightSidebarOpen(true)}
              >
                <PanelRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Chat Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-[95%] mx-auto space-y-6 pb-40">
            {/* Conversation Messages */}
            {displayMessages.length === 0 ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground">
                    {`Hi ${userName}, ${agentEmptyPrompts[currentAgent] || "How can I help you?"}`}
                  </h3>
                </div>
              </div>
            ) : (
              displayMessages.map((message, index) => {
                if (message.type === "user") {
                  return (
                    <ChatBubble
                      key={message.id}
                      role="user"
                      content={message.content}
                      timestamp={message.time}
                      name="You"
                    />
                  );
                } else {
                  const agent = aiAgents[message.agent as keyof typeof aiAgents];
                  const isReasoningExpanded = expandedReasonings[message.id] ?? false;
                  const isLast = index === displayMessages.length - 1;
                  const showTyping = isStreaming && isLast && (message.content || "").trim().length === 0;

                  return (
                    <div key={message.id} className="flex items-start gap-3">
                      <Avatar className={cn("h-8 w-8 flex-shrink-0", agent.color)}>
                        <AvatarFallback className={cn(agent.color, "text-white")}>
                          <FontAwesomeIcon icon={faFreebsd} className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col flex-1 max-w-[85%]">
                        {/* Reasoning Panel */}
                        {message.reasoning && message.reasoning.length > 0 && (
                          <div className="mb-2">
                            {/* Reasoning Header */}
                            <button
                              onClick={() => setExpandedReasonings(prev => ({
                                ...prev,
                                [message.id]: !prev[message.id]
                              }))}
                              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                            >
                              <span className="font-medium">Reasoning completed</span>
                              {isReasoningExpanded ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                              )}
                            </button>

                            {/* Expanded Reasoning Steps */}
                            {isReasoningExpanded && (
                              <div className="mt-1 space-y-1 pl-1">
                                {message.reasoning.map((step) => {
                                  const stepKey = `${message.id}-${step.id}`;
                                  const isStepExpanded = expandedSteps[stepKey] ?? false;

                                  return (
                                    <div key={step.id} className="space-y-0.5">
                                      {/* Step Header */}
                                      <button
                                        onClick={() => setExpandedSteps(prev => ({
                                          ...prev,
                                          [stepKey]: !prev[stepKey]
                                        }))}
                                        className="flex items-center gap-2 text-sm w-full text-left py-0.5"
                                      >
                                        {step.status === 'completed' ? (
                                          <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                                        ) : step.status === 'loading' ? (
                                          <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin flex-shrink-0" />
                                        ) : (
                                          <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30 flex-shrink-0" />
                                        )}
                                        <span className="text-foreground/80">{step.title}</span>
                                        {step.details && (
                                          isStepExpanded ? (
                                            <ChevronUp className="h-3 w-3 text-muted-foreground ml-auto" />
                                          ) : (
                                            <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto" />
                                          )
                                        )}
                                      </button>

                                      {/* Step Details */}
                                      {isStepExpanded && step.details && (
                                        <div className="pl-6 space-y-0.5">
                                          {step.details.map((detail, idx) => (
                                            <p key={idx} className="text-xs text-muted-foreground font-mono">
                                              {detail}
                                            </p>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        <ChatBubble
                          role="assistant"
                          content={message.content}
                          timestamp={message.time}
                          name={agent.name}
                          tool_calls={message.tool_calls}
                          isLoading={showTyping}
                        />
                      </div>
                    </div>
                  );
                }
              }))}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="absolute bottom-0 w-full p-4 bg-background/20 backdrop-blur-lg z-10">
          <div className="max-w-[95%] mx-auto">
            <div className="bg-[#f8fafc]/80 dark:bg-muted/50 border border-border rounded-xl overflow-hidden shadow-sm">
              {/* Input Field */}
              <div className="px-4 pt-3">
                <input
                  type="text"
                  placeholder="Ask a follow-up"
                  className="w-full bg-transparent text-foreground placeholder-muted-foreground text-sm outline-none"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
              </div>

              {/* Toolbar */}
              <div className="flex items-center justify-between px-3 py-2">
                {/* Left side icons */}
                <div className="flex items-center gap-1">
                  {/* <Button
                    size="icon"
                    className="h-8 w-8 rounded-lg bg-primary hover:bg-primary/90"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </Button>
                  <div className="w-px h-5 bg-border mx-1" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button> */}
                </div>

                {/* Right side icons */}
                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="7" height="7" rx="1" />
                              <rect x="14" y="3" width="7" height="7" rx="1" />
                              <rect x="3" y="14" width="7" height="7" rx="1" />
                              <rect x="14" y="14" width="7" height="7" rx="1" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Model</p>
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align="start" className="w-52">
                      {aiModels.map((model) => (
                        <DropdownMenuItem
                          key={model.id}
                          onClick={() => !model.disabled && setSelectedModel(model.id)}
                          disabled={model.disabled}
                          className={cn(
                            "flex items-center gap-2 py-2 cursor-pointer",
                            model.disabled && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">{model.name}</div>
                            <div className="text-xs text-muted-foreground">{model.description}</div>
                          </div>
                          {selectedModel === model.id && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Agent Capability Selector */}
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <Layers className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Agents</p>
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align="start" className="w-56">
                      {(agentCapabilities[currentAgent] || agentCapabilities.cso).map((capability) => (
                        <DropdownMenuItem
                          key={capability.id}
                          onClick={() => setSelectedCapability(capability.id)}
                          className="flex items-center gap-2 py-2 cursor-pointer"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">{capability.name}</div>
                            <div className="text-xs text-muted-foreground">{capability.description}</div>
                          </div>
                          {selectedCapability === capability.id && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>





                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        className={cn(
                          "h-8 w-8 rounded-lg transition-all duration-200",
                          inputMessage.trim()
                            ? "bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground cursor-not-allowed"
                        )}
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isStreaming}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Send Message</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Context */}
      <div
        className={cn(
          "flex flex-col border-border bg-[#f8fafc] dark:bg-card/30 transition-all duration-300 ease-in-out",
          isRightSidebarOpen
            ? "w-[300px] lg:w-[350px] flex-shrink-0 border-l"
            : "w-0 overflow-hidden opacity-0"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/50 h-[60px] min-w-[300px]">
          <h2 className="font-semibold text-lg">Context</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => setIsRightSidebarOpen(false)}
          >
            <PanelRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
            <div className="bg-background/95 border border-border px-8 py-4 rounded-full shadow-lg">
              <span className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Coming Soon
              </span>
            </div>
          </div>
          <ScrollArea className="h-full p-4 min-w-[300px]">
            <div className="space-y-6">
              {/* Context Note */}
              <div className="bg-secondary/30 rounded-lg p-3 text-sm text-foreground/80 leading-relaxed">
                Discussion focusing on budget breakdown and resource allocation for Q1-Q2 initiatives across digital transformation, customer experience, and strategic partnerships.
              </div>

              {/* Docs Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-semibold text-sm">Docs</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 py-1 text-muted-foreground hover:text-foreground cursor-pointer">
                    <ChevronDown className="h-4 w-4" />
                    <span className="text-sm font-medium">Thread Summary</span>
                  </div>

                  <div className="pl-2 space-y-2 mt-2">
                    {[
                      { name: "Q1-Q2 Financial Model.xlsx", type: "spreadsheet" },
                      { name: "Talent Acquisition Strategy.pdf", type: "pdf" },
                      { name: "Project Timeline.doc", type: "doc" }
                    ].map((doc, i) => {
                      // Determine color based on file type
                      const getFileColor = (type: string) => {
                        switch (type) {
                          case 'pdf':
                            return 'text-red-500';
                          case 'spreadsheet':
                            return 'text-green-500';
                          case 'doc':
                            return 'text-blue-500';
                          default:
                            return 'text-primary';
                        }
                      };

                      return (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                          <FileText className={cn("h-4 w-4", getFileColor(doc.type))} />
                          <span className="text-sm text-foreground/80 truncate">{doc.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Related Memory */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-semibold text-sm">Related Memory</span>
                </div>
                <div className="space-y-2">
                  {[
                    { text: "Budget Planning Session (Dec 1)", type: "planning" },
                    { text: "Talent Network Review (Nov 28)", type: "review" },
                    { text: "Infrastructure Assessment (Nov 25)", type: "assessment" }
                  ].map((memory, i) => {
                    // Determine color based on memory type
                    const getMemoryColor = (type: string) => {
                      switch (type) {
                        case 'planning':
                          return 'text-purple-500';
                        case 'review':
                          return 'text-amber-500';
                        case 'assessment':
                          return 'text-cyan-500';
                        default:
                          return 'text-orange-400';
                      }
                    };

                    return (
                      <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <FileText className={cn("h-4 w-4 mt-0.5 flex-shrink-0", getMemoryColor(memory.type))} />
                        <span className="text-sm text-foreground/80 leading-tight line-clamp-2">
                          {memory.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
interface ProjectItem {
  id: string;
  name: string;
  created_at?: string;
}
