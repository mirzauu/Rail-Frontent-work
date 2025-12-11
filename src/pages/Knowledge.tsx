import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SidePanel } from "@/components/shared/SidePanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Upload,
  Plus,
  Link2,
  FileText,
  File,
  Globe,
  Clock,
  Folder,
  Tag,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

const documents = [
  { id: 1, title: "Q4 Strategy Deck", type: "pdf", tags: ["Strategy", "Q4"], scope: "Global", source: "Manual", updated: "Today", owner: "John Doe" },
  { id: 2, title: "Budget Forecast 2024", type: "spreadsheet", tags: ["Finance", "Budget"], scope: "CFO", source: "GDrive", updated: "Yesterday", owner: "Sarah Miller" },
  { id: 3, title: "Operations Playbook v2", type: "doc", tags: ["Operations", "Process"], scope: "COO", source: "Manual", updated: "2 days ago", owner: "Mike Chen" },
  { id: 4, title: "Marketing Campaign Brief", type: "pdf", tags: ["Marketing", "Campaign"], scope: "CMO", source: "Slack", updated: "3 days ago", owner: "Emily Wang" },
  { id: 5, title: "Technical Architecture Overview", type: "doc", tags: ["Tech", "Architecture"], scope: "CTO", source: "GDrive", updated: "1 week ago", owner: "Alex Johnson" },
  { id: 6, title: "Company Policies 2024", type: "pdf", tags: ["HR", "Policy"], scope: "Global", source: "Manual", updated: "2 weeks ago", owner: "HR Team" },
];

const folders = [
  { name: "All Documents", count: 342, icon: FileText },
  { name: "PDFs", count: 128, icon: File },
  // { name: "Web Pages", count: 89, icon: Globe },
  { name: "Notes", count: 125, icon: FileText },
];

const tagGroups = [
  { name: "Finance", count: 45 },
  { name: "Strategy", count: 38 },
  { name: "Operations", count: 52 },
  { name: "HR", count: 31 },
];

const typeIcons = {
  pdf: <File className="h-4 w-4 text-destructive" />,
  doc: <FileText className="h-4 w-4 text-primary" />,
  spreadsheet: <FileText className="h-4 w-4 text-success" />,
};

export default function Knowledge() {
  const [selectedDoc, setSelectedDoc] = useState<typeof documents[0] | null>(null);
  const [activeFolder, setActiveFolder] = useState("All Documents");

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Knowledge Base"
        description="Manage documents and data sources for your agents"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Link2 className="mr-2 h-4 w-4" />
              Connect Source
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Doc
            </Button>
          </div>
        }
      />

      <div className="flex gap-6 h-[calc(100vh-12rem)]">
        {/* Left Sidebar - Filters */}
        <Card className="w-60 flex-shrink-0 overflow-hidden flex flex-col">
          <CardContent className="p-4 flex-1 overflow-auto scrollbar-thin">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search docs..." className="pl-9" />
            </div>

            {/* Folders */}
            <div className="mb-6">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                By Type
              </h3>
              <div className="space-y-1">
                {folders.map((folder) => (
                  <button
                    key={folder.name}
                    onClick={() => setActiveFolder(folder.name)}
                    className={cn(
                      "w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                      activeFolder === folder.name
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <folder.icon className="h-4 w-4" />
                      {folder.name}
                    </div>
                    <span className="text-xs text-muted-foreground">{folder.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            {/* <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tag Groups
              </h3>
              <div className="space-y-1">
                {tagGroups.map((tag) => (
                  <button
                    key={tag.name}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    {tag.name}
                    <span className="text-xs text-muted-foreground">{tag.count}</span>
                  </button>
                ))}
              </div>
            </div> */}
          </CardContent>
        </Card>

        {/* Main Content - Document List */}
        <Card className="flex-1 overflow-hidden flex flex-col">
          <CardContent className="p-0 flex-1 overflow-auto scrollbar-thin">
            <table className="w-full">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                  <th className="p-4">Title</th>
                  <th className="p-4">Tags</th>
                  <th className="p-4">Scope</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4 text-right">Updated</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {typeIcons[doc.type as keyof typeof typeIcons]}
                        <span className="font-medium text-foreground">{doc.title}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {doc.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={doc.scope === "Global" ? "default" : "outline"}>
                        {doc.scope}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{doc.source}</td>
                    <td className="p-4 text-sm text-muted-foreground">{doc.owner}</td>
                    <td className="p-4 text-right text-sm text-muted-foreground">
                      <div className="flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3" />
                        {doc.updated}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Document Detail Panel */}
      <SidePanel
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title={selectedDoc?.title || ""}
        subtitle={`${selectedDoc?.type.toUpperCase()} • Last updated ${selectedDoc?.updated}`}
        width="lg"
      >
        {selectedDoc && (
          <div className="space-y-6">
            {/* Preview placeholder */}
            <div className="aspect-[4/3] rounded-lg border border-border bg-muted/50 flex items-center justify-center">
              <div className="text-center">
                {typeIcons[selectedDoc.type as keyof typeof typeIcons]}
                <p className="mt-2 text-sm text-muted-foreground">Document Preview</p>
              </div>
            </div>

            {/* Assignment Section */}
            <div className="space-y-4 border-t border-border pt-4">
              <h4 className="text-sm font-medium text-foreground">Assignment</h4>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="global-toggle" className="text-sm">
                    Global Memory
                  </Label>
                </div>
                <Switch id="global-toggle" defaultChecked={selectedDoc.scope === "Global"} />
              </div>

              <div>
                <Label className="text-sm mb-2 block">Assigned Agents</Label>
                <div className="flex flex-wrap gap-2">
                  {["CSO", "CFO", "COO", "CMO", "CTO"].map((agent) => (
                    <button
                      key={agent}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors",
                        selectedDoc.scope === agent || selectedDoc.scope === "Global"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <Bot className="h-3 w-3" />
                      {agent}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3 border-t border-border pt-4">
              <Label className="text-sm">Tags</Label>
              <div className="flex flex-wrap gap-2">
                {selectedDoc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
                <button className="rounded-full border border-dashed border-border px-2.5 py-0.5 text-xs text-muted-foreground hover:bg-muted">
                  + Add tag
                </button>
              </div>
            </div>

            {/* Activity */}
            <div className="space-y-3 border-t border-border pt-4">
              <h4 className="text-sm font-medium text-foreground">Activity</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Ingested: {selectedDoc.updated}</p>
                <p>Last indexed: {selectedDoc.updated}</p>
                <p>Sync status: Active</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="flex-1">Re-index</Button>
              <Button variant="outline" className="flex-1">Edit</Button>
            </div>
          </div>
        )}
      </SidePanel>
    </div>
  );
}
