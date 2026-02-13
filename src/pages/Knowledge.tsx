import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { SidePanel } from "@/components/shared/SidePanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
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
  Download,
  BookOpen,
  Filter,
  MoreHorizontal,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faFileWord, faFileExcel, faFileAlt, faFileCode, faSearch } from "@fortawesome/free-solid-svg-icons";

type DocumentItem = {
  id: string;
  org_id: string;
  project_id: string | null;
  uploaded_by: string;
  filename: string;
  original_filename: string;
  file_type: string;
  mime_type: string | null;
  file_size_bytes: number;
  storage_path: string;
  storage_backend: string;
  status: string;
  title: string | null;
  description: string | null;
  scope: string;
  assigned_agent_ids: string[];
  category: string | null;
  tags: string[];
  created_at: string;
};

const getTypeIcon = (fileType: string) => {
  const t = (fileType || "").toLowerCase();
  if (t === "pdf") return <FontAwesomeIcon icon={faFilePdf} className="h-5 w-5 text-rose-500" />;
  if (["doc", "docx"].includes(t)) return <FontAwesomeIcon icon={faFileWord} className="h-5 w-5 text-blue-500" />;
  if (["xls", "xlsx", "csv"].includes(t)) return <FontAwesomeIcon icon={faFileExcel} className="h-5 w-5 text-emerald-500" />;
  if (["txt", "md"].includes(t)) return <FontAwesomeIcon icon={faFileAlt} className="h-5 w-5 text-slate-500" />;
  return <FontAwesomeIcon icon={faFileCode} className="h-5 w-5 text-slate-400" />;
};

const DocxPreview = ({ url }: { url: string }) => {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then(res => res.arrayBuffer())
      .then(buffer => mammoth.convertToHtml({ arrayBuffer: buffer }))
      .then(result => {
        setHtml(result.value);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [url]);

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (error) return <div className="p-4 text-red-500 text-sm text-center">Failed to render DOCX preview.</div>;
  if (!html) return <div className="p-4 text-muted-foreground text-sm text-center">Empty document</div>;
  
  return (
    <div className="bg-white p-8 h-full w-full overflow-auto prose prose-sm max-w-none">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

const XlsxPreview = ({ url }: { url: string }) => {
  const [data, setData] = useState<any[][] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then(res => res.arrayBuffer())
      .then(buffer => {
        const wb = XLSX.read(buffer, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        setData(json.slice(0, 100)); // Limit to 100 rows for preview
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [url]);

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (error) return <div className="p-4 text-red-500 text-sm text-center">Failed to render Excel preview.</div>;
  if (!data || data.length === 0) return <div className="p-4 text-muted-foreground text-sm text-center">Empty spreadsheet</div>;

  return (
    <div className="bg-white h-full w-full overflow-auto text-sm">
      <table className="w-full border-collapse">
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
              {row.map((cell, j) => (
                <td key={j} className="p-2 border-r border-gray-200 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                  {cell !== null && cell !== undefined ? String(cell) : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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

  const { folderStats, filteredDocs } = useMemo(() => {
    const allDocs = docs || [];
    const pdfCount = allDocs.filter(d => (d.file_type || "").toLowerCase() === 'pdf').length;
    const notesCount = allDocs.filter(d => (d.file_type || "").toLowerCase() !== 'pdf').length;

    const stats = [
      { name: "All Documents", count: allDocs.length, icon: BookOpen },
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 font-sans p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-3">
            <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center text-white">
              <BookOpen className="h-4 w-4" />
            </div>
            Knowledge Base
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium ml-1">
            Manage your organization's intelligence and data sources.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-full h-10 px-5 text-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-card text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50">
            <Link2 className="mr-2 h-3.5 w-3.5" /> Connect Source
          </Button>
          <Button 
            className="rounded-full h-10 px-5 text-sm bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-100 dark:shadow-none"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Upload className="mr-2 h-3.5 w-3.5" /> Upload Document
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar / Filters */}
        <Card className="lg:w-64 flex-shrink-0 border-none shadow-sm bg-white dark:bg-card rounded-[24px] overflow-hidden h-fit">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-base font-bold">Library</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="relative mb-4">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
              <Input 
                placeholder="Search..." 
                className="pl-9 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border-none text-sm" 
              />
            </div>

            <div className="space-y-1">
              {isDocsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-xl" />
                ))
              ) : (
                folderStats.map((folder) => (
                  <button
                    key={folder.name}
                    onClick={() => setActiveFolder(folder.name)}
                    className={cn(
                      "w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      activeFolder === folder.name
                        ? "bg-orange-500 text-white shadow-md shadow-orange-100"
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <folder.icon className={cn("h-3.5 w-3.5", activeFolder === folder.name ? "text-white" : "text-slate-400")} />
                      {folder.name}
                    </div>
                    <Badge variant="secondary" className={cn(
                      "rounded-md px-1.5 min-w-[1.5rem] justify-center text-[10px]",
                      activeFolder === folder.name ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    )}>
                      {folder.count}
                    </Badge>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card className="flex-1 border-none shadow-sm bg-white dark:bg-card rounded-[24px] overflow-hidden min-h-[500px]">
          <CardHeader className="p-6 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">{activeFolder}</CardTitle>
            <div className="flex items-center gap-2">
               <Button variant="ghost" size="sm" className="rounded-full text-slate-500 h-8 px-3 text-xs">
                 <Filter className="mr-1.5 h-3.5 w-3.5" /> Filter
               </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isDocsLoading ? (
               <div className="p-6 space-y-3">
                 {Array.from({ length: 5 }).map((_, i) => (
                   <div key={i} className="flex items-center gap-3">
                     <Skeleton className="h-10 w-10 rounded-xl" />
                     <div className="space-y-2 flex-1">
                       <Skeleton className="h-3 w-1/3" />
                       <Skeleton className="h-2 w-1/4" />
                     </div>
                   </div>
                 ))}
               </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="grid grid-cols-12 px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                   <div className="col-span-5">Document</div>
                   <div className="col-span-2">Status</div>
                   <div className="col-span-2">Scope</div>
                   <div className="col-span-3 text-right">Last Updated</div>
                </div>
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className="grid grid-cols-12 px-6 py-4 items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        {getTypeIcon(doc.file_type)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate pr-3">
                          {doc.title || doc.original_filename || doc.filename}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {(doc.file_size_bytes / 1024).toFixed(0)} KB • {doc.file_type.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                       <Badge variant="secondary" className={cn(
                         "rounded-md px-2 py-0.5 font-semibold text-[10px] capitalize",
                         doc.status === 'ingested' 
                           ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" 
                           : "bg-slate-100 text-slate-600"
                       )}>
                         {doc.status}
                       </Badge>
                    </div>

                    <div className="col-span-2">
                      <div className="flex items-center gap-1.5">
                         <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                         <span className="text-xs font-medium text-slate-600 dark:text-slate-300 capitalize">{doc.scope}</span>
                      </div>
                    </div>

                    <div className="col-span-3 text-right">
                       <p className="text-xs font-medium text-slate-900 dark:text-slate-100">
                         {new Date(doc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                       </p>
                       <p className="text-[10px] text-slate-500 mt-0.5">
                         by {doc.uploaded_by || "System"}
                       </p>
                    </div>
                  </div>
                ))}
              </div>
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
          <div className="space-y-8">
            {/* Preview placeholder */}
            <div className="aspect-[4/3] rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden relative group shadow-inner">
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

                if (['doc', 'docx'].includes(ft)) {
                   return <DocxPreview url={url} />;
                }
                
                if (['xls', 'xlsx', 'csv'].includes(ft)) {
                   return <XlsxPreview url={url} />;
                }

                return (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <div className="h-20 w-20 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                      {getTypeIcon(selectedDoc.file_type)}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-foreground">Preview Unavailable</h3>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                         This file type cannot be previewed directly. Please download it to view.
                      </p>
                    </div>
                    <Button onClick={() => window.open(url, '_blank')} className="mt-4 rounded-full px-6">
                      <Download className="mr-2 h-4 w-4" /> Download File
                    </Button>
                  </div>
                );
              })()}
            </div>

            {/* Assignment Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-foreground">Document Details</h4>
                <Button variant="ghost" size="sm" className="rounded-full"><MoreHorizontal className="h-4 w-4" /></Button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-3">
                <Label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Description</Label>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedDoc.description || "No description provided."}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <Label htmlFor="global-toggle" className="text-sm font-bold block">Global Memory</Label>
                    <span className="text-xs text-muted-foreground">Available to all agents</span>
                  </div>
                </div>
                <Switch id="global-toggle" defaultChecked={selectedDoc.scope === "organization"} />
              </div>

              <div>
                <Label className="text-sm font-bold mb-3 block">Assigned Agents</Label>
                <div className="flex flex-wrap gap-2">
                  {["CSO", "CFO", "COO", "CMO", "CTO"].map((agent) => (
                    <button
                      key={agent}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border transition-all",
                        selectedDoc.scope === agent || selectedDoc.scope === "Global"
                          ? "bg-black text-white border-black"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50 bg-white"
                      )}
                    >
                      <Bot className="h-3.5 w-3.5" />
                      {agent}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Metadata</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                   <p className="text-xs text-slate-400 font-bold">Status</p>
                   <p className="text-sm font-semibold text-emerald-600 capitalize flex items-center gap-2 mt-1">
                     <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                     {selectedDoc.status}
                   </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                   <p className="text-xs text-slate-400 font-bold">Uploaded</p>
                   <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">
                     {new Date(selectedDoc.created_at).toLocaleDateString()}
                   </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button className="flex-1 rounded-xl h-12 font-bold bg-black hover:bg-slate-800 text-white shadow-lg">Re-index</Button>
              <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold border-slate-200">Edit</Button>
            </div>
          </div>
        )}
      </SidePanel>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-[24px] p-0 border-none shadow-2xl">
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-xl font-extrabold">Upload New Document</DialogTitle>
            <DialogDescription className="text-sm mt-1">
              Select a file and provide metadata for your knowledge base.
            </DialogDescription>
          </div>
          
          <div className="p-6 bg-white dark:bg-card space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dialog-file" className="text-xs font-bold uppercase tracking-wider text-slate-400">File</Label>
              <div 
                className={cn(
                  "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors cursor-pointer text-center",
                  selectedFileForDialog ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                )}
                onClick={() => dialogFileInputRef.current?.click()}
              >
                <input
                  type="file"
                  id="dialog-file"
                  ref={dialogFileInputRef}
                  className="hidden"
                  accept=".pdf,.docx,.xlsx,.pptx,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const extension = file.name.split('.').pop()?.toLowerCase();
                      if (!['pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'txt'].includes(extension || '')) {
                        toast({
                          title: "Unsupported File Format",
                          description: "Please upload PDF, Word, Excel, PowerPoint, or Text files.",
                          variant: "destructive",
                        });
                        e.target.value = "";
                        setSelectedFileForDialog(null);
                        return;
                      }
                      setSelectedFileForDialog(file);
                    }
                  }}
                />
                
                {selectedFileForDialog ? (
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <FileText className="h-5 w-5" />
                    </div>
                    <p className="font-bold text-sm text-emerald-700">{selectedFileForDialog.name}</p>
                    <p className="text-[10px] text-emerald-600">{(selectedFileForDialog.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <>
                    <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="font-bold text-sm text-slate-700">Click to browse or drag file here</p>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-slate-400">Title</Label>
                <Input
                  id="title"
                  placeholder="Defaults to filename"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="h-10 rounded-lg bg-slate-50 border-transparent focus:bg-white transition-all font-medium text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-slate-400">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g. strategy"
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value)}
                  className="h-10 rounded-lg bg-slate-50 border-transparent focus:bg-white transition-all font-medium text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                 <Label htmlFor="scope" className="text-xs font-bold uppercase tracking-wider text-slate-400">Scope</Label>
                 <Input
                   id="scope"
                   placeholder="e.g. organization"
                   value={newDocScope}
                   onChange={(e) => setNewDocScope(e.target.value)}
                   className="h-10 rounded-lg bg-slate-50 border-transparent focus:bg-white transition-all font-medium text-sm"
                 />
               </div>
               <div className="space-y-1.5">
                 <Label htmlFor="tags" className="text-xs font-bold uppercase tracking-wider text-slate-400">Tags</Label>
                 <Input
                   id="tags"
                   placeholder="comma, separated, tags"
                   value={newDocTags}
                   onChange={(e) => setNewDocTags(e.target.value)}
                   className="h-10 rounded-lg bg-slate-50 border-transparent focus:bg-white transition-all font-medium text-sm"
                 />
               </div>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the document"
                className="min-h-[80px] rounded-lg bg-slate-50 border-transparent focus:bg-white transition-all resize-none font-medium text-sm"
                value={newDocDescription}
                onChange={(e) => setNewDocDescription(e.target.value)}
              />
            </div>
          </div>
          
          {isCreating && (
            <div className="px-6 pb-4">
              <div className="flex justify-between text-xs font-bold text-emerald-600 mb-2">
                <span>Uploading document...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1.5 bg-emerald-100" />
            </div>
          )}

          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreating} className="rounded-xl font-bold text-slate-500 hover:text-slate-900 h-10">
              Cancel
            </Button>
            <Button onClick={handleDialogUpload} disabled={isCreating} className="rounded-xl px-6 font-bold bg-black text-white hover:bg-slate-800 shadow-lg h-10">
              {isCreating ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
