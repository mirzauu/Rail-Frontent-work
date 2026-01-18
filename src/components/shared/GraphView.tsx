import { useRef, useEffect, useState, useMemo } from "react";
import ForceGraph2D, { type NodeObject } from "react-force-graph-2d";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2, Plus, Network } from "lucide-react";
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
  const fgRef = useRef<any>();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data, isLoading, error } = useQuery<GraphData>({
    queryKey: ["graph-visualization"],
    queryFn: async () => {
      const res = await api.fetch("api/v1/graph/visualization");
      return res.json();
    },
    // Keep data fresh but don't over-fetch
    staleTime: 30000,
  });

  useEffect(() => {
    const onResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Memoize processed graph data
  const graphData = useMemo(() => {
    if (!data) return { nodes: [], links: [] };

    const nodes = data.nodes.map(n => ({
      ...n,
      color: n.labels.includes("Person") ? "#3b82f6" :
        n.labels.includes("Agent") ? "#10b981" :
          n.labels.includes("Document") ? "#f59e0b" :
            n.labels.includes("Memory") ? "#8b5cf6" :
              "#64748b",
      val: n.labels.includes("Agent") ? 8 : 4,
      degree: 0 // Will be calculated below
    }));

    // Ensure link source/target references are correct and calculate degrees
    const nodeIdMap = new Map(nodes.map(n => [n.id, n]));
    const links = data.links.filter(l => {
      if (!l.source || !l.target) return false;
      const sId = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const tId = typeof l.target === 'string' ? l.target : (l.target as any).id;
      const source = nodeIdMap.get(sId);
      const target = nodeIdMap.get(tId);

      if (source && target) {
        source.degree++;
        target.degree++;
        return true;
      }
      return false;
    });

    return { nodes, links };
  }, [data]);

  // Configure forces for a better cluster/round pattern
  useEffect(() => {
    if (fgRef.current) {
      const fg = fgRef.current;

      // Center the graph
      fg.d3Force("center").x(dimensions.width / 2).y(dimensions.height / 2);

      // Stronger repulsion for better spacing, adjusted by degree to keep unlinked nodes closer
      fg.d3Force("charge").strength((d: any) => d.degree === 0 ? -150 : -350).distanceMax(500);

      // Link distance based on connections
      fg.d3Force("link").distance(80).iterations(2);

      // Collision to prevent overlapping
      fg.d3Force("collide", (d: any) => (d.val || 5) * 3);

      // Warm up the simulation
      fg.d3ReheatSimulation();
    }
  }, [dimensions, graphData]);

  // Handle initial zoom and centering
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      // Small timeout to allow the simulation to position nodes before fitting
      const timer = setTimeout(() => {
        if (fgRef.current) {
          fgRef.current.zoomToFit(400, 100); // 400ms animation, 100px padding
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [graphData.nodes.length]); // Only refit when nodes are first loaded or count changes

  const getNodeLabel = (node: any) => {
    return node.properties?.name || node.properties?.title || String(node.id);
  };

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

  return (
    <div ref={containerRef} className="fixed inset-0 w-screen h-screen bg-background relative">
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeRelSize={6}
        nodeAutoColorBy="labels"
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        linkColor={() => isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}
        backgroundColor={isDark ? "#020817" : "#ffffff"}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const label = getNodeLabel(node);
          const fontSize = 12 / globalScale;
          const r = (node.val || 4) + 2 / globalScale;

          // Drawing circles with a slight glow
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color;
          ctx.fill();

          // Add a border
          ctx.strokeStyle = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.2)";
          ctx.lineWidth = 1 / globalScale;
          ctx.stroke();

          // Label text
          if (globalScale >= 1.5) {
            ctx.font = `${fontSize}px Inter, system-ui`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)";
            ctx.fillText(label, node.x, node.y + r + 2);
          }
        }}
        // Interactions
        onNodeClick={(node: any) => {
          // You could pass callbacks here
          console.log("Clicked node:", node);
        }}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />

      {/* Graph Controls Overlay */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <button
          onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 1.5, 400)}
          className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-md border border-border shadow-lg flex items-center justify-center hover:bg-accent transition-colors"
          title="Zoom In"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={() => fgRef.current?.zoom(fgRef.current.zoom() / 1.5, 400)}
          className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-md border border-border shadow-lg flex items-center justify-center hover:bg-accent transition-colors"
          title="Zoom Out"
        >
          <div className="h-0.5 w-3 bg-foreground" />
        </button>
        <button
          onClick={() => fgRef.current?.zoomToFit(400, 100)}
          className="w-10 h-10 rounded-full bg-primary/90 text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary transition-colors"
          title="Fit View"
        >
          <Network className="h-4 w-4" />
        </button>
      </div>

      {/* Legend Overlay */}
      <div className="absolute top-6 left-6 p-4 rounded-xl bg-card/80 backdrop-blur-md border border-border shadow-lg space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Entity Types</h3>
        <div className="space-y-2">
          {[
            { label: "Agent", color: "#10b981" },
            { label: "Person", color: "#3b82f6" },
            { label: "Document", color: "#f59e0b" },
            { label: "Memory", color: "#8b5cf6" },
          ].map(type => (
            <div key={type.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
              <span className="text-xs font-medium">{type.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
