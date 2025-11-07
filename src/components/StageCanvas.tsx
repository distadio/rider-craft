import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface StageItem {
  id: string;
  label: string;
  icon: string;
  category: string;
  position: { x: number; y: number; rotation: number };
  isCustom?: boolean;
}

interface StageCanvasProps {
  items: StageItem[];
  onItemsChange: (items: StageItem[]) => void;
}

export const StageCanvas = ({ items, onItemsChange }: StageCanvasProps) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Get data from drag event (from IconLibrary)
    const dragData = e.dataTransfer.getData("application/json");
    if (dragData) {
      try {
        const itemData = JSON.parse(dragData);
        const newItem: StageItem = {
          id: Date.now().toString(),
          label: itemData.label,
          icon: itemData.icon,
          category: itemData.category || "custom",
          position: { x, y, rotation: 0 },
          isCustom: itemData.isCustom || false
        };
        onItemsChange([...items, newItem]);
      } catch (error) {
        console.error("Error parsing drag data:", error);
      }
    }
  };

  // Handle item mouse down for dragging
  const handleItemMouseDown = (e: React.MouseEvent, item: StageItem) => {
    e.stopPropagation();
    setSelectedItemId(item.id);
    setDraggingItemId(item.id);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Calculate offset from item center
    const itemCenterX = (item.position.x / 100) * rect.width;
    const itemCenterY = (item.position.y / 100) * rect.height;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    setDragOffset({
      x: clickX - itemCenterX,
      y: clickY - itemCenterY
    });
  };

  // Handle mouse move for dragging items
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!draggingItemId) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;

    // Constrain to canvas bounds
    const constrainedX = Math.max(0, Math.min(100, x));
    const constrainedY = Math.max(0, Math.min(100, y));

    onItemsChange(
      items.map((item) =>
        item.id === draggingItemId
          ? { ...item, position: { ...item.position, x: constrainedX, y: constrainedY } }
          : item
      )
    );
  };

  // Handle mouse up to stop dragging
  const handleCanvasMouseUp = () => {
    setDraggingItemId(null);
  };

  // Handle canvas click to deselect
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.stage-canvas-bg')) {
      setSelectedItemId(null);
    }
  };

  // Handle keyboard shortcuts (Delete key)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' && selectedItemId) {
      onItemsChange(items.filter(item => item.id !== selectedItemId));
      setSelectedItemId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-muted/30" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Canvas Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t("canvas.stage")}: 40ft × 30ft</span>
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
            className="stage-canvas-bg relative bg-canvas-bg border-2 border-canvas-outline rounded-sm shadow-elevated select-none"
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
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onClick={handleCanvasClick}
          >
            {/* Stage Items */}
            {items.map((item) => {
              const isSelected = selectedItemId === item.id;
              const isDragging = draggingItemId === item.id;
              
              return (
                <div
                  key={item.id}
                  className={`
                    absolute flex flex-col items-center justify-center gap-1 p-2
                    cursor-move transition-all rounded-lg
                    ${isSelected ? 'ring-2 ring-accent shadow-lg scale-110' : 'hover:scale-105'}
                    ${isDragging ? 'opacity-70 scale-110' : ''}
                  `}
                  style={{
                    left: `${item.position.x}%`,
                    top: `${item.position.y}%`,
                    transform: `translate(-50%, -50%) rotate(${item.position.rotation}deg)`,
                  }}
                  onMouseDown={(e) => handleItemMouseDown(e, item)}
                >
                  {/* Icon Display */}
                  <div className="w-12 h-12 flex items-center justify-center text-4xl bg-card rounded-full shadow-md border border-border">
                    {item.isCustom ? (
                      item.icon.startsWith('data:image') ? (
                        <img
                          src={item.icon}
                          alt={item.label}
                          className="w-8 h-8 object-contain pointer-events-none"
                          draggable={false}
                        />
                      ) : (
                        <div
                          dangerouslySetInnerHTML={{ __html: item.icon }}
                          className="w-8 h-8 pointer-events-none"
                        />
                      )
                    ) : (
                      <span className="pointer-events-none">{item.icon}</span>
                    )}
                  </div>
                  
                  {/* Label */}
                  <span className="text-xs font-medium text-foreground bg-card/90 px-2 py-0.5 rounded shadow-sm whitespace-nowrap pointer-events-none">
                    {item.label}
                  </span>
                </div>
              );
            })}

            {/* Empty State */}
            {items.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg font-medium mb-2">{t("canvas.emptyTitle")}</p>
                  <p className="text-sm">{t("canvas.emptyDescription")}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
