import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { SidePanel } from "@/components/shared/SidePanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

type DocumentItem = {
  id: string;
  org_id: string;
  project_id: string | null;
  uploaded_by: string;
  filename: string;
  original_filename: string;
  file_type: string; // e.g., "txt", "pdf", "docx"
  mime_type: string | null;
  file_size_bytes: number;
  storage_path: string;
  storage_backend: string; // e.g., "local", "s3"
  status: string; // e.g., "uploaded"
  title: string | null;
  description: string | null;
  scope: string; // e.g., "organization"
  assigned_agent_ids: string[];
  category: string | null;
  tags: string[];
  created_at: string;
};

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

const getTypeIcon = (fileType: string) => {
  const t = (fileType || "").toLowerCase();
  if (t === "pdf") return <File className="h-4 w-4 text-destructive" />;
  if (["doc", "docx", "txt", "md"].includes(t)) return <FileText className="h-4 w-4 text-primary" />;
  if (["xls", "xlsx", "csv"].includes(t)) return <FileText className="h-4 w-4 text-success" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
};

export default function Knowledge() {
  const { data: docs } = useQuery<DocumentItem[]>({
    queryKey: ["documents"],
    queryFn: async () => {
      const r = await api.fetch("api/v1/documents/");
      return r.json();
    },
  });
  const queryClient = useQueryClient();
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [activeFolder, setActiveFolder] = useState("All Documents");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadScope, setUploadScope] = useState("organization");
  const [uploading, setUploading] = useState(false);

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
            <Button variant="outline" size="sm" onClick={() => setUploadOpen(true)}>
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
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>File</Label>
                <Input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Optional title" />
              </div>
              <div className="space-y-2">
                <Label>Scope</Label>
                <Select value={uploadScope} onValueChange={setUploadScope}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="organization">Organization</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadOpen(false)} disabled={uploading}>Cancel</Button>
              <Button
                onClick={async () => {
                  if (!uploadFile || uploading) return;
                  setUploading(true);
                  try {
                    const resp = await api.uploadDocument(uploadFile, {
                      title: uploadTitle,
                      scope: uploadScope,
                      description: "",
                      category: "",
                      tags: "",
                    });
                    await resp.json();
                    setUploadOpen(false);
                    setUploadFile(null);
                    setUploadTitle("");
                    queryClient.invalidateQueries({ queryKey: ["documents"] });
                  } finally {
                    setUploading(false);
                  }
                }}
                disabled={!uploadFile || uploading}
              >
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                {(docs || []).map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(doc.file_type)}
                        <span className="font-medium text-foreground">{doc.title || doc.original_filename || doc.filename}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {(doc.tags || []).map((tag) => (
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
                      <Badge variant="outline">{doc.scope}</Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{doc.storage_backend}</td>
                    <td className="p-4 text-sm text-muted-foreground">{doc.uploaded_by || "—"}</td>
                    <td className="p-4 text-right text-sm text-muted-foreground">
                      <div className="flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(doc.created_at).toLocaleString()}
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
        subtitle={`${(selectedDoc?.file_type || "").toUpperCase()} • Created ${selectedDoc ? new Date(selectedDoc.created_at).toLocaleString() : ""}`}
        width="lg"
      >
        {selectedDoc && (
          <div className="space-y-6">
            {/* Preview placeholder */}
            <div className="aspect-[4/3] rounded-lg border border-border bg-muted/50 flex items-center justify-center">
              <div className="text-center">
                {getTypeIcon(selectedDoc.file_type)}
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
                <Switch id="global-toggle" defaultChecked={selectedDoc.scope === "organization"} />
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
                {(selectedDoc.tags || []).map((tag) => (
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
                <p>Ingested: {new Date(selectedDoc.created_at).toLocaleString()}</p>
                <p>Last indexed: {new Date(selectedDoc.created_at).toLocaleString()}</p>
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
