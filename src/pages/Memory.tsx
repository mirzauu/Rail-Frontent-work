import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SidePanel } from "@/components/shared/SidePanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, Network, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const memories = [
  { id: 1, title: "APAC Expansion Decision", summary: "Strategic decision to expand operations into APAC market with Japan as primary entry point", agent: "CSO", type: "decision", confidence: 95, source: "chat", created: "2 hours ago" },
  { id: 2, title: "Q4 Budget Allocation", summary: "Allocated 40% of Q4 budget to R&D initiatives focused on AI development", agent: "CFO", type: "decision", confidence: 88, source: "doc", created: "5 hours ago" },
  { id: 3, title: "Supply Chain Risk Alert", summary: "Identified potential supply chain disruption in Southeast Asian suppliers", agent: "COO", type: "risk", confidence: 72, source: "integration", created: "1 day ago" },
  { id: 4, title: "Marketing Campaign Results", summary: "Q3 campaign achieved 34% above target with 2.3M impressions", agent: "CMO", type: "insight", confidence: 91, source: "chat", created: "2 days ago" },
  { id: 5, title: "Technical Debt Assessment", summary: "Current technical debt estimated at 15% of development capacity", agent: "CTO", type: "task", confidence: 85, source: "doc", created: "3 days ago" },
  { id: 6, title: "Competitor Analysis Update", summary: "Main competitor launched new product line targeting enterprise segment", agent: "CSO", type: "insight", confidence: 78, source: "integration", created: "4 days ago" },
];

const globalMemories = [
  { id: 1, title: "Company Vision 2025", scope: "Organization", summary: "Become the leading AI-powered enterprise solution provider globally", created: "1 week ago" },
  { id: 2, title: "Revenue Target Q4", scope: "Finance", summary: "Target $12M ARR by end of Q4 with 15% MoM growth", created: "2 weeks ago" },
  { id: 3, title: "Culture Values Update", scope: "HR", summary: "Updated company values emphasizing innovation and customer focus", created: "1 month ago" },
];

const typeColors = {
  decision: "bg-primary/10 text-primary",
  risk: "bg-destructive/10 text-destructive",
  insight: "bg-success/10 text-success",
  task: "bg-warning/10 text-warning",
};

export default function Memory() {
  const [activeTab, setActiveTab] = useState("per-agent");
  const [selectedMemory, setSelectedMemory] = useState<typeof memories[0] | null>(null);
  const [agentFilter, setAgentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredMemories = memories.filter((m) => {
    if (agentFilter !== "all" && m.agent !== agentFilter) return false;
    if (typeFilter !== "all" && m.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Memory"
        description="Browse and manage agent memories and organizational knowledge"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Network className="mr-2 h-4 w-4" />
              Graph View
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="per-agent">Per Agent</TabsTrigger>
          <TabsTrigger value="global">Global / Org</TabsTrigger>
        </TabsList>

        <TabsContent value="per-agent" className="space-y-4">
          {/* Filter Bar */}
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search memories..." className="pl-9" />
              </div>
              <Select value={agentFilter} onValueChange={setAgentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Agents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  <SelectItem value="CSO">CSO Agent</SelectItem>
                  <SelectItem value="CFO">CFO Agent</SelectItem>
                  <SelectItem value="COO">COO Agent</SelectItem>
                  <SelectItem value="CMO">CMO Agent</SelectItem>
                  <SelectItem value="CTO">CTO Agent</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="decision">Decision</SelectItem>
                  <SelectItem value="risk">Risk</SelectItem>
                  <SelectItem value="insight">Insight</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Memory Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                      <th className="p-4">Title / Summary</th>
                      <th className="p-4">Agent</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Source</th>
                      <th className="p-4">Confidence</th>
                      <th className="p-4 text-right">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMemories.map((memory) => (
                      <tr
                        key={memory.id}
                        onClick={() => setSelectedMemory(memory)}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                      >
                        <td className="p-4 max-w-sm">
                          <div className="font-medium text-foreground">{memory.title}</div>
                          <div className="text-sm text-muted-foreground truncate mt-0.5">
                            {memory.summary}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{memory.agent}</Badge>
                        </td>
                        <td className="p-4">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                              typeColors[memory.type as keyof typeof typeColors]
                            )}
                          >
                            {memory.type}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground capitalize">
                          {memory.source}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${memory.confidence}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {memory.confidence}%
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right text-sm text-muted-foreground">
                          <div className="flex items-center justify-end gap-1">
                            <Clock className="h-3 w-3" />
                            {memory.created}
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

      {/* Memory Detail Panel */}
      <SidePanel
        isOpen={!!selectedMemory}
        onClose={() => setSelectedMemory(null)}
        title={selectedMemory?.title || ""}
        subtitle={`Memory from ${selectedMemory?.agent} Agent`}
      >
        {selectedMemory && (
          <div className="space-y-5">
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Summary
              </h4>
              <p className="text-sm text-foreground leading-relaxed">
                {selectedMemory.summary}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Type
                </h4>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                    typeColors[selectedMemory.type as keyof typeof typeColors]
                  )}
                >
                  {selectedMemory.type}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Confidence
                </h4>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${selectedMemory.confidence}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{selectedMemory.confidence}%</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Source
              </h4>
              <p className="text-sm text-muted-foreground capitalize">
                {selectedMemory.source} • {selectedMemory.created}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {["Strategy", "Q4", selectedMemory.agent].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
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
