import { useRef, useEffect, useState, useMemo } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { useTheme } from "next-themes";

interface GraphNode {
  id: string;
  name: string;
  val?: number;
  color?: string;
  group?: string;
}

interface GraphLink {
  source: string;
  target: string;
}

export function LoginMemoryGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const { theme } = useTheme();

  // Force dark mode style for the login page right side which is dark
  const isDark = true;

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const graphData = useMemo(() => {
    const nodes: GraphNode[] = [
      { id: "railvision", name: "RailVision AI", val: 24, color: "#ffffff", group: "core" },

      // Primary Agent Nodes (varied sizes slightly)
      { id: "cso", name: "CSO Agent", val: 12, color: "#ef4444", group: "agent" },
      { id: "cfo", name: "CFO Agent", val: 10, color: "#f97316", group: "agent" },
      { id: "cco", name: "CCO Agent", val: 9, color: "#a855f7", group: "agent" },
      { id: "chro", name: "CHRO Agent", val: 8, color: "#ec4899", group: "agent" },
      { id: "cro", name: "CRO Agent", val: 9, color: "#3b82f6", group: "agent" },
      { id: "cto", name: "CTO Agent", val: 11, color: "#22c55e", group: "agent" },

      // Sub nodes / Capabilities (varied sizes and lighter colors)
      { id: "cso_1", name: "Strategy", val: 5, color: "#fca5a5", group: "sub" },
      { id: "cso_2", name: "Intelligence", val: 3, color: "#f87171", group: "sub" },
      { id: "cso_3", name: "M&A", val: 4, color: "#fca5a5", group: "sub" },

      { id: "cfo_1", name: "Budget", val: 4, color: "#fdba74", group: "sub" },
      { id: "cfo_2", name: "Investment", val: 5, color: "#fb923c", group: "sub" },

      { id: "cco_1", name: "Sales", val: 4, color: "#d8b4fe", group: "sub" },
      { id: "cco_2", name: "Success", val: 3, color: "#c084fc", group: "sub" },

      { id: "chro_1", name: "Talent", val: 4, color: "#f9a8d4", group: "sub" },
      { id: "chro_2", name: "Culture", val: 3, color: "#f472b6", group: "sub" },

      { id: "cro_1", name: "Pipeline", val: 4, color: "#93c5fd", group: "sub" },
      { id: "cro_2", name: "Retention", val: 5, color: "#60a5fa", group: "sub" },

      { id: "cto_1", name: "Security", val: 5, color: "#4ade80", group: "sub" },
      { id: "cto_2", name: "Architecture", val: 4, color: "#86efac", group: "sub" },
      { id: "cto_3", name: "Tech Debt", val: 3, color: "#86efac", group: "sub" },
    ];

    const links: GraphLink[] = [
      // Links from core to agents
      { source: "railvision", target: "cso" },
      { source: "railvision", target: "cfo" },
      { source: "railvision", target: "cco" },
      { source: "railvision", target: "chro" },
      { source: "railvision", target: "cro" },
      { source: "railvision", target: "cto" },

      // Ring connecting the core agents
      { source: "cso", target: "cfo" },
      { source: "cfo", target: "cco" },
      { source: "cco", target: "chro" },
      { source: "chro", target: "cro" },
      { source: "cro", target: "cto" },
      { source: "cto", target: "cso" },

      // Sub-node connections
      { source: "cso", target: "cso_1" },
      { source: "cso", target: "cso_2" },
      { source: "cso", target: "cso_3" },

      { source: "cfo", target: "cfo_1" },
      { source: "cfo", target: "cfo_2" },

      { source: "cco", target: "cco_1" },
      { source: "cco", target: "cco_2" },

      { source: "chro", target: "chro_1" },
      { source: "chro", target: "chro_2" },

      { source: "cro", target: "cro_1" },
      { source: "cro", target: "cro_2" },

      { source: "cto", target: "cto_1" },
      { source: "cto", target: "cto_2" },
      { source: "cto", target: "cto_3" },

      // Cross-departmental synergies added for network density
      { source: "cso_1", target: "cro_1" },
      { source: "cto_1", target: "cso_2" },
      { source: "cfo_1", target: "cco_1" }
    ];

    return { nodes, links };
  }, []);

  useEffect(() => {
    if (fgRef.current) {
      const fg = fgRef.current;
      fg.d3Force("charge").strength(-200);
      fg.d3Force("link").distance(70);
      fg.d3ReheatSimulation();
    }
  }, [graphData]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeRelSize={6}
          nodeColor="color"
          backgroundColor="rgba(0,0,0,0)" // Transparent to let background show
          linkColor={() => "rgba(255,255,255,0.2)"}
          nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
            const label = node.name;
            const fontSize = 12 / globalScale;
            const r = node.val || 4;

            // Draw node
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.color;
            ctx.fill();

            // Glow effect for center node
            if (node.id === 'railvision') {
              ctx.shadowBlur = 15;
              ctx.shadowColor = "rgba(255,255,255,0.5)";
            } else {
              ctx.shadowBlur = 0;
            }

            // Text label
            if (globalScale >= 0.8 || node.id === 'railvision') {
              ctx.font = `${node.id === 'railvision' ? 'bold ' : ''}${fontSize}px Inter, sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = "rgba(255,255,255,0.9)";
              ctx.fillText(label, node.x, node.y + r + 6);
            }

            // Reset shadow
            ctx.shadowBlur = 0;
          }}
          enableNodeDrag={false}
          enableZoom={false}
          enablePan={false}
        // We can enable interaction if desired, but for a background/visual element maybe keep it static-ish?
        // Let's enable interaction but keep it contained.
        />
      </div>

      {/* Overlay Text similar to original design */}
      <div className="absolute bottom-10 left-10 right-10 z-20 pointer-events-none">
        <h2 className="text-3xl font-bold mb-2 text-white">RailVision AI</h2>
      </div>
    </div>
  );
}
