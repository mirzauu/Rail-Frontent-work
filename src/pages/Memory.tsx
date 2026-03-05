import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SidePanel } from "@/components/shared/SidePanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { GraphView } from "@/components/shared/GraphView";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Network, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useEffect } from "react";

interface KnowledgeItem {
  id: string;
  org_id: string;
  title: string;
  content: string;
  summary: string;
  tags: string[];
  category: string;
  source_type: string;
  source_message_id?: string;
  source_conversation_id?: string;
  status: string;
  vector_id: string | null;
  is_verified: boolean;
  priority: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

const memories = [
  { id: 1, title: "APAC Expansion Decision", summary: "Strategic decision to expand operations into APAC market with Japan as primary entry point", agent: "Michael", type: "decision", confidence: 95, source: "chat", created: "2 hours ago" },
  { id: 2, title: "Q4 Budget Allocation", summary: "Allocated 40% of Q4 budget to R&D initiatives focused on AI development", agent: "Raphael", type: "decision", confidence: 88, source: "doc", created: "5 hours ago" },
  { id: 3, title: "Supply Chain Risk Alert", summary: "Identified potential supply chain disruption in Southeast Asian suppliers", agent: "Mary", type: "risk", confidence: 72, source: "integration", created: "1 day ago" },
  { id: 4, title: "Revenue Growth Analysis", summary: "Q3 revenue achieved 34% above target with strong enterprise adoption", agent: "Gabriel", type: "insight", confidence: 91, source: "chat", created: "2 days ago" },
  { id: 5, title: "Technical Debt Assessment", summary: "Current technical debt estimated at 15% of development capacity", agent: "Emily", type: "task", confidence: 85, source: "doc", created: "3 days ago" },
  { id: 6, title: "Competitor Analysis Update", summary: "Main competitor launched new product line targeting enterprise segment", agent: "Michael", type: "insight", confidence: 78, source: "integration", created: "4 days ago" },
];

const globalMemories = [
  { id: 1, title: "Company Vision 2025", scope: "Organization", summary: "Become the leading AI-powered enterprise solution provider globally", created: "1 week ago" },
  { id: 2, title: "Revenue Target Q4", scope: "Finance", summary: "Target $12M ARR by end of Q4 with 15% MoM growth", created: "2 weeks ago" },
  { id: 3, title: "Culture Values Update", scope: "HR", summary: "Updated company values emphasizing innovation and customer focus", created: "1 month ago" },
];

const categoryColors: Record<string, string> = {
  General: "bg-primary/10 text-primary",
  Risk: "bg-destructive/10 text-destructive",
  Insight: "bg-success/10 text-success",
  Task: "bg-warning/10 text-warning",
};

export default function Memory() {
  const [activeTab, setActiveTab] = useState("per-agent");
  const [viewMode, setViewMode] = useState<"list" | "graph">("graph");
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMemory, setSelectedMemory] = useState<KnowledgeItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const fetchKnowledge = async () => {
      try {
        setIsLoading(true);
        const resp = await api.fetch("api/v1/knowledge/?limit=50&offset=0");
        const data = await resp.json();
        setKnowledgeItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch knowledge:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchKnowledge();
  }, []);

  const filteredMemories = knowledgeItems.filter((m) => {
    const matchesSearch = (m.title + m.summary + m.content).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(knowledgeItems.map(m => m.category))).filter(Boolean);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Memory"
        description="Browse and manage agent memories and organizational knowledge"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "list" ? "graph" : "list")}
            >
              <Network className="mr-2 h-4 w-4" />
              {viewMode === "list" ? "Graph View" : "List View"}
            </Button>
          </div>
        }
      />

      {viewMode === "list" ? (
        <div className="relative">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="per-agent">Per Agent</TabsTrigger>
              <TabsTrigger value="global">Global / Org</TabsTrigger>
            </TabsList>

            <TabsContent value="per-agent" className="space-y-4">
              <Card className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search memories..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </Card>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                          <th className="p-4">Title / Summary</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Source</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                              Loading knowledge base...
                            </td>
                          </tr>
                        ) : filteredMemories.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                              No memories found.
                            </td>
                          </tr>
                        ) : filteredMemories.map((memory) => (
                          <tr
                            key={memory.id}
                            onClick={() => setSelectedMemory(memory)}
                            className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                          >
                            <td className="p-4 max-w-md">
                              <div className="font-medium text-foreground">{memory.title}</div>
                              <div className="text-sm text-muted-foreground truncate mt-0.5" title={memory.summary}>
                                {memory.summary}
                              </div>
                            </td>
                            <td className="p-4">
                              <span
                                className={cn(
                                  "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                                  categoryColors[memory.category] || "bg-muted text-muted-foreground"
                                )}
                              >
                                {memory.category}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground capitalize">
                              {memory.source_type}
                            </td>
                            <td className="p-4">
                              <Badge variant={memory.status === 'active' ? 'outline' : 'secondary'} className="capitalize">
                                {memory.status}
                              </Badge>
                            </td>
                            <td className="p-4 text-right text-sm text-muted-foreground">
                              <div className="flex items-center justify-end gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(memory.created_at).toLocaleDateString()}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="global" className="space-y-4">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                          <th className="p-4">Title / Summary</th>
                          <th className="p-4">Scope</th>
                          <th className="p-4 text-right">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {globalMemories.map((memory) => (
                          <tr
                            key={memory.id}
                            className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                          >
                            <td className="p-4 max-w-lg">
                              <div className="font-medium text-foreground">{memory.title}</div>
                              <div className="text-sm text-muted-foreground mt-0.5">
                                {memory.summary}
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="secondary">{memory.scope}</Badge>
                            </td>
                            <td className="p-4 text-right text-sm text-muted-foreground">
                              {memory.created}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <GraphView />
      )}

      {/* Memory Detail Panel */}
      <SidePanel
        isOpen={!!selectedMemory}
        onClose={() => setSelectedMemory(null)}
        title={selectedMemory?.title || ""}
        subtitle={`Knowledge Base Entry`}
      >
        {selectedMemory && (
          <div className="space-y-5">
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Content
              </h4>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {selectedMemory.content}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Category
                </h4>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                    categoryColors[selectedMemory.category] || "bg-muted text-muted-foreground"
                  )}
                >
                  {selectedMemory.category}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Status
                </h4>
                <Badge variant={selectedMemory.status === 'active' ? 'outline' : 'secondary'} className="capitalize">
                  {selectedMemory.status}
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Source
              </h4>
              <p className="text-sm text-muted-foreground capitalize">
                {selectedMemory.source_type} • {new Date(selectedMemory.created_at).toLocaleString()}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedMemory.tags && selectedMemory.tags.length > 0 ? selectedMemory.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
                  >
                    {tag}
                  </span>
                )) : (
                  <span className="text-xs text-muted-foreground italic">No tags</span>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="flex-1">Promote to Global</Button>
              <Button variant="outline" className="flex-1">Archive</Button>
            </div>
          </div>
        )}
      </SidePanel>
    </div>
  );
}
