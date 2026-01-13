import { useRef, useEffect, useState } from "react";
import ForceGraph2D, { type NodeObject } from "react-force-graph-2d";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

interface GraphNode {
  id: string;
  labels: string[];
  properties: JsonObject;
  x?: number;
  y?: number;
  val?: number;
  color?: string;
}

interface GraphLink {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
  properties: JsonObject;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

type FGNode = NodeObject<GraphNode>;

export function GraphView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data, isLoading, error } = useQuery<GraphData>({
    queryKey: ["graph-visualization"],
    queryFn: async () => {
      // Fetch from the API endpoint provided
      const res = await api.fetch("api/v1/graph/visualization");
      return res.json();
    },
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-muted-foreground">
        Failed to load graph visualization
      </div>
    );
  }

  // Process data for visualization
  const graphData = data ? {
    nodes: data.nodes.map(n => ({
      ...n,
      // Assign color based on label
      color: n.labels.includes("Person") ? "#3b82f6" : // blue
             n.labels.includes("Agent") ? "#10b981" : // green
             n.labels.includes("Document") ? "#f59e0b" : // amber
             n.labels.includes("Memory") ? "#8b5cf6" : // purple
             "#64748b", // slate
      val: n.labels.includes("Agent") ? 10 : 5 // size
    })),
    links: data.links
  } : { nodes: [], links: [] };

  const getNodeLabel = (node: FGNode) => {
    const name = node.properties?.name;
    if (typeof name === "string" && name.trim()) return name;
    const title = node.properties?.title;
    if (typeof title === "string" && title.trim()) return title;
    return String(node.id);
  };

  return (
    <div ref={containerRef} className="w-full h-full min-h-[600px] bg-background border border-border rounded-lg overflow-hidden">
      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel={getNodeLabel}
        nodeCanvasObject={(node: FGNode, ctx: CanvasRenderingContext2D, _globalScale: number) => {
          const label = getNodeLabel(node);
          const r = node.val ? node.val * 1.5 : 5; // Increase node size slightly
          const fontSize = Math.max(3, r / 2.5); // Adapt font size to node size

          // Draw Node
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color;
          ctx.fill();

          // Draw Label
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.lineWidth = 0.5;
          
          // Truncate label if too long for "inside"
          const maxChars = Math.floor(r / (fontSize * 0.4)); 
          const displayLabel = label.length > maxChars ? label.substring(0, maxChars) + '..' : label;

          ctx.strokeText(displayLabel, node.x, node.y);
          ctx.fillText(displayLabel, node.x, node.y);
        }}
        linkColor={() => isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        backgroundColor={isDark ? "#020817" : "#ffffff"} // Match shadcn background
      />
    </div>
  );
}
