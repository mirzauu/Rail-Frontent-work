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
      { id: "railvision", name: "RailVision AI", val: 20, color: "#ffffff", group: "core" },
      { id: "memory", name: "Long-term Memory", val: 8, color: "#8b5cf6", group: "feature" },
      { id: "perception", name: "Visual Perception", val: 8, color: "#3b82f6", group: "feature" },
      { id: "reasoning", name: "Reasoning Engine", val: 8, color: "#10b981", group: "feature" },
      { id: "users", name: "User Context", val: 5, color: "#f59e0b", group: "data" },
      { id: "knowledge", name: "Knowledge Graph", val: 8, color: "#ec4899", group: "feature" },
      { id: "security", name: "Security Layer", val: 5, color: "#ef4444", group: "system" },
      
      // Secondary nodes
      { id: "mem_1", name: "Episodic", val: 3, color: "#a78bfa", group: "sub" },
      { id: "mem_2", name: "Semantic", val: 3, color: "#a78bfa", group: "sub" },
      { id: "perc_1", name: "Object Det", val: 3, color: "#60a5fa", group: "sub" },
      { id: "perc_2", name: "Scene Und", val: 3, color: "#60a5fa", group: "sub" },
    ];

    const links: GraphLink[] = [
      { source: "railvision", target: "memory" },
      { source: "railvision", target: "perception" },
      { source: "railvision", target: "reasoning" },
      { source: "railvision", target: "users" },
      { source: "railvision", target: "knowledge" },
      { source: "railvision", target: "security" },
      
      { source: "memory", target: "mem_1" },
      { source: "memory", target: "mem_2" },
      { source: "perception", target: "perc_1" },
      { source: "perception", target: "perc_2" },
      
      { source: "knowledge", target: "reasoning" },
      { source: "users", target: "memory" },
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
