import { useState, useMemo, useRef, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { FullscreenLoader } from "@/components/shared/Spinner";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Upload,
  Link2,
  FileText,
  File,
  Globe,
  Clock,
  Folder,
  Tag,
  Bot,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  const { data: docs, isLoading: isDocsLoading } = useQuery<DocumentItem[]>({
    queryKey: ["documents"],
    queryFn: async () => {
      const r = await api.fetch("api/v1/documents/");
      return r.json();
    },
  });
  const queryClient = useQueryClient();
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [activeFolder, setActiveFolder] = useState("All Documents");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocDescription, setNewDocDescription] = useState("");
  const [newDocScope, setNewDocScope] = useState("");
  const [newDocCategory, setNewDocCategory] = useState("");
  const [newDocTags, setNewDocTags] = useState("");
  const [selectedFileForDialog, setSelectedFileForDialog] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const dialogFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const startSimulatedProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        // Realistic progress: faster at first, then slower
        const diff = Math.random() * 10;
        const next = prev + (prev < 50 ? diff : diff / 2);
        return Math.min(next, 95);
      });
    }, 200);
    return interval;
  };

  const handleDialogUpload = async () => {
    if (!selectedFileForDialog) {
      toast({
        title: "Validation Error",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    const progressInterval = startSimulatedProgress();
    try {
      setIsCreating(true);
      
      await api.uploadDocument(selectedFileForDialog, {
        title: newDocTitle || selectedFileForDialog.name,
        description: newDocDescription,
        scope: newDocScope,
        category: newDocCategory,
        tags: newDocTags
      });

      setUploadProgress(100);
      toast({
        title: "Success",
        description: "Document uploaded successfully.",
      });

      setTimeout(() => {
        setIsCreateDialogOpen(false);
        setNewDocTitle("");
        setNewDocDescription("");
        setNewDocScope("");
        setNewDocCategory("");
        setNewDocTags("");
        setSelectedFileForDialog(null);
      }, 500);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Error",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsCreating(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  // Compute dynamic folder counts and filtered docs
  const { folderStats, filteredDocs } = useMemo(() => {
    const allDocs = docs || [];
    const pdfCount = allDocs.filter(d => (d.file_type || "").toLowerCase() === 'pdf').length;
    // Consider everything else as "Notes" for now, or check for specific text types
    const notesCount = allDocs.filter(d => (d.file_type || "").toLowerCase() !== 'pdf').length;

    const stats = [
      { name: "All Documents", count: allDocs.length, icon: FileText },
      { name: "PDFs", count: pdfCount, icon: File },
      { name: "Notes", count: notesCount, icon: FileText },
    ];

    let filtered = allDocs;
    if (activeFolder === "PDFs") {
      filtered = allDocs.filter(d => (d.file_type || "").toLowerCase() === 'pdf');
    } else if (activeFolder === "Notes") {
      filtered = allDocs.filter(d => (d.file_type || "").toLowerCase() !== 'pdf');
    }

    return { folderStats: stats, filteredDocs: filtered };
  }, [docs, activeFolder]);

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
            <Button
              size="sm"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
        }
      />

      <div className="flex gap-6 min-h-[calc(100vh-12rem)]">
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
                {isDocsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="w-full flex items-center justify-between rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 w-3/5">
                        <Skeleton className="h-4 w-4 rounded-sm" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-3 w-8" />
                    </div>
                  ))
                ) : (
                  folderStats.map((folder) => (
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
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content - Document List */}
        <Card className="flex-1 flex flex-col">
          <CardContent className="p-0">
            {isDocsLoading ? (
              <table className="w-full">
                <thead className="sticky top-0 bg-card z-10">
                  <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                    <th className="p-4">Title</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Scope</th>
                    <th className="p-4">Source</th>
                    <th className="p-4">Uploader</th>
                    <th className="p-4 text-right">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-4 w-4 rounded-sm" />
                          <Skeleton className="h-4 w-40" />
                        </div>
                      </td>
                      <td className="p-4"><Skeleton className="h-4 w-48" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-16 rounded-full" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-16 rounded-full" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end items-center gap-1">
                          <Skeleton className="h-3 w-3" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full">
                <thead className="sticky top-0 bg-card z-10">
                  <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                    <th className="p-4">Title</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Scope</th>
                    <th className="p-4">Source</th>
                    <th className="p-4">Uploader</th>
                    <th className="p-4 text-right">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map((doc) => (
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
                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                          {doc.description || "No description provided."}
                        </p>
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant="outline"
                          className={cn(
                            "capitalize",
                            doc.status === 'ingested' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : ""
                          )}
                        >
                          {doc.status}
                        </Badge>
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
            )}
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
            <div className="aspect-[4/3] rounded-lg border border-border bg-muted/50 flex items-center justify-center overflow-hidden">
              {(() => {
                const path = selectedDoc.storage_path.replace(/\\/g, "/").split('/').map(p => encodeURIComponent(p)).join('/');
                const url = `${import.meta.env.VITE_API_BASE_URL}${path}`;
                const ft = (selectedDoc.file_type || "").toLowerCase();

                if (ft === 'pdf') {
                  return <iframe src={url} className="w-full h-full" title={selectedDoc.title || "Preview"} />;
                }
                if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ft)) {
                  return <img src={url} className="w-full h-full object-contain" alt={selectedDoc.title || "Preview"} />;
                }

                return (
                  <div className="text-center">
                    {getTypeIcon(selectedDoc.file_type)}
                    <p className="mt-2 text-sm text-muted-foreground">Preview not available</p>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 text-xs text-primary hover:underline block">
                      Download File
                    </a>
                  </div>
                );
              })()}
            </div>

            {/* Assignment Section */}
            <div className="space-y-4 border-t border-border pt-4">
              <h4 className="text-sm font-medium text-foreground">Document Details</h4>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Description</Label>
                <p className="text-sm text-foreground leading-relaxed">
                  {selectedDoc.description || "No description provided."}
                </p>
              </div>

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

            {/* Activity */}
            <div className="space-y-3 border-t border-border pt-4">
              <h4 className="text-sm font-medium text-foreground">Activity</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex justify-between">
                  <span>Status:</span>
                  <Badge 
                    variant="outline"
                    className={cn(
                      "capitalize h-5",
                      selectedDoc.status === 'ingested' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : ""
                    )}
                  >
                    {selectedDoc.status}
                  </Badge>
                </p>
                <p className="flex justify-between">
                  <span>Ingested:</span>
                  <span>{new Date(selectedDoc.created_at).toLocaleString()}</span>
                </p>
                <p className="flex justify-between">
                  <span>Last indexed:</span>
                  <span>{new Date(selectedDoc.created_at).toLocaleString()}</span>
                </p>
                <p className="flex justify-between">
                  <span>Sync status:</span>
                  <span className="text-emerald-500">Active</span>
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="flex-1">Re-index</Button>
              <Button variant="outline" className="flex-1">Edit</Button>
            </div>
          </div>
        )}
      </SidePanel>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Upload New Document</DialogTitle>
            <DialogDescription>
              Select a file and provide metadata for your knowledge base.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="dialog-file">File</Label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="dialog-file"
                  ref={dialogFileInputRef}
                  className="hidden"
                  accept=".pdf,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const extension = file.name.split('.').pop()?.toLowerCase();
                      if (extension !== 'pdf' && extension !== 'docx') {
                        toast({
                          title: "Unsupported File Format",
                          description: "Only PDF and DOCX files are supported. Please convert your file.",
                          variant: "destructive",
                        });
                        e.target.value = ""; // Clear the input
                        setSelectedFileForDialog(null);
                        return;
                      }
                      setSelectedFileForDialog(file);
                    }
                  }}
                />
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => dialogFileInputRef.current?.click()}
                >
                  {selectedFileForDialog ? selectedFileForDialog.name : "Choose file..."}
                </Button>
                {selectedFileForDialog && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedFileForDialog(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="grid gap-3">
                <Label htmlFor="title" className="text-base">Title</Label>
                <Input
                  id="title"
                  placeholder="Defaults to filename"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="h-12 text-base"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="category" className="text-base">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g. strategy"
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value)}
                  className="h-12 text-base"
                />
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="tags" className="text-base">Tags</Label>
              <Input
                id="tags"
                placeholder="comma separated"
                value={newDocTags}
                onChange={(e) => setNewDocTags(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description" className="text-base">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the document"
                className="min-h-[150px] text-base"
                value={newDocDescription}
                onChange={(e) => setNewDocDescription(e.target.value)}
              />
            </div>
          </div>
          {isCreating && (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>Uploading document...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleDialogUpload} disabled={isCreating}>
              {isCreating ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
