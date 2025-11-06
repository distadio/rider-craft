import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface StageCanvasProps {
  items: any[];
  onItemsChange: (items: any[]) => void;
}

export const StageCanvas = ({ items, onItemsChange }: StageCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [draggedItem, setDraggedItem] = useState<any>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // For now, create placeholder item
    const newItem = {
      id: Date.now().toString(),
      type: "instrument",
      label: "Item",
      position: { x, y, rotation: 0 }
    };

    onItemsChange([...items, newItem]);
  };

  return (
    <div className="flex-1 flex flex-col bg-muted/30">
      {/* Canvas Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Stage: 40ft × 30ft</span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setZoom(Math.max(50, zoom - 10))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-12 text-center">{zoom}%</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setZoom(Math.min(200, zoom + 10))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setZoom(100)}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto p-8 relative">
        <div className="w-full h-full flex items-center justify-center">
          <div
            ref={canvasRef}
            className="relative bg-canvas-bg border-2 border-canvas-outline rounded-sm shadow-elevated"
            style={{
              width: `${800 * (zoom / 100)}px`,
              height: `${600 * (zoom / 100)}px`,
              backgroundImage: `
                linear-gradient(hsl(var(--canvas-grid)) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--canvas-grid)) 1px, transparent 1px)
              `,
              backgroundSize: `${40 * (zoom / 100)}px ${40 * (zoom / 100)}px`,
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Stage Items */}
            {items.map((item) => (
              <div
                key={item.id}
                className="absolute w-12 h-12 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-xs shadow-md cursor-move hover:scale-110 transition-transform"
                style={{
                  left: `${item.position.x}%`,
                  top: `${item.position.y}%`,
                  transform: `translate(-50%, -50%) rotate(${item.position.rotation}deg)`,
                }}
              >
                {item.label.substring(0, 2)}
              </div>
            ))}

            {/* Empty State */}
            {items.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg font-medium mb-2">Drag items from the library</p>
                  <p className="text-sm">or click + Add Item to start building your stage plot</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
