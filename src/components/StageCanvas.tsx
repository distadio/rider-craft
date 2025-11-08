import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ZoomIn, ZoomOut, Maximize2, Settings, Plus, Minus, Copy, Trash2, Type } from "lucide-react";
import { useStore } from "@/store/store";
import { StageSizeDialog } from "./StageSizeDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface StageItem {
  id: string;
  label: string;
  icon: string;
  category: string;
  position: { x: number; y: number; rotation: number };
  size?: number; // Tamanho do ícone (padrão: 1.0)
  isCustom?: boolean;
  showLabel?: boolean; // Controla se a legenda deve ser exibida
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
  const [showSizeDialog, setShowSizeDialog] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuItem, setContextMenuItem] = useState<StageItem | null>(null);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [labelText, setLabelText] = useState<string>("");
  
  const stageSize = useStore((state) => state.stageSize);
  
  // Converter metros para pixels (escala: 1 metro = 50 pixels)
  const PIXELS_PER_METER = 50;
  const stageWidthPx = stageSize.width * PIXELS_PER_METER;
  const stageHeightPx = stageSize.height * PIXELS_PER_METER;

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
          size: 1.0,
          showLabel: false, // Não mostrar label por padrão
          isCustom: itemData.isCustom || false
        };
        onItemsChange([...items, newItem]);
      } catch (error) {
        console.error("Error parsing drag data:", error);
      }
    }
  };

  // Handle item click - detect double click
  const handleItemClick = (e: React.MouseEvent, item: StageItem) => {
    e.stopPropagation();
    
    // Se não clicou em um botão
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    if (clickTimeout) {
      // Double click detected
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      setContextMenuItem(item);
      setContextMenuOpen(true);
    } else {
      // Single click - set timeout and select item
      setSelectedItemId(item.id);
      const timeout = setTimeout(() => {
        setClickTimeout(null);
      }, 300);
      setClickTimeout(timeout);
    }
  };

  // Handle item mouse down for dragging
  const handleItemMouseDown = (e: React.MouseEvent, item: StageItem) => {
    // Não iniciar drag se clicar nos botões de tamanho
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

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

  // Handle delete item
  const handleDeleteItem = (itemId: string) => {
    onItemsChange(items.filter(item => item.id !== itemId));
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
    }
  };

  // Handle duplicate item
  const handleDuplicateItem = (item: StageItem) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Duplicar com pequeno offset
    const offsetX = 5; // 5% offset
    const offsetY = 5;
    
    const duplicatedItem: StageItem = {
      ...item,
      id: Date.now().toString(),
      position: {
        x: Math.min(100, item.position.x + offsetX),
        y: Math.min(100, item.position.y + offsetY),
        rotation: item.position.rotation
      },
      size: item.size || 1.0,
      showLabel: item.showLabel || false
    };
    
    onItemsChange([...items, duplicatedItem]);
    setSelectedItemId(duplicatedItem.id);
  };

  // Handle size change
  const handleSizeChange = (itemId: string, delta: number) => {
    onItemsChange(
      items.map((item) => {
        if (item.id === itemId) {
          const currentSize = item.size || 1.0;
          const newSize = Math.max(0.3, Math.min(3.0, currentSize + delta));
          return { ...item, size: newSize };
        }
        return item;
      })
    );
  };

  // Handle add/edit label
  const handleAddLabel = (item: StageItem) => {
    setEditingLabelId(item.id);
    setLabelText(item.label);
    setContextMenuOpen(false);
  };

  // Handle save label
  const handleSaveLabel = (itemId: string) => {
    onItemsChange(
      items.map((item) => {
        if (item.id === itemId) {
          return { 
            ...item, 
            label: labelText.trim() || item.label,
            showLabel: true 
          };
        }
        return item;
      })
    );
    setEditingLabelId(null);
    setLabelText("");
  };

  // Handle cancel label editing
  const handleCancelLabel = () => {
    setEditingLabelId(null);
    setLabelText("");
  };


  return (
    <div className="flex-1 flex flex-col bg-muted/30" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Canvas Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t("canvas.stage")}: {stageSize.width.toFixed(1)}m × {stageSize.height.toFixed(1)}m
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSizeDialog(true)}
            className="ml-2"
          >
            <Settings className="w-4 h-4 mr-1" />
            {t("stageSize.configure")}
          </Button>
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
              width: `${stageWidthPx * (zoom / 100)}px`,
              height: `${stageHeightPx * (zoom / 100)}px`,
              overflow: 'visible',
              backgroundImage: `
                linear-gradient(hsl(var(--canvas-grid)) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--canvas-grid)) 1px, transparent 1px)
              `,
              backgroundSize: `${(PIXELS_PER_METER / 2) * (zoom / 100)}px ${(PIXELS_PER_METER / 2) * (zoom / 100)}px`,
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
              const itemSize = item.size || 1.0;
              const baseSize = 48; // Tamanho base em pixels
              const iconSize = baseSize * itemSize;
              
              return (
                <div key={item.id}>
                  <div
                    className={`
                      absolute flex flex-col items-center justify-center gap-1
                      cursor-move transition-all rounded-lg
                      ${isSelected ? 'ring-2 ring-accent shadow-lg' : 'hover:ring-1 hover:ring-accent/50'}
                      ${isDragging ? 'opacity-70' : ''}
                    `}
                    style={{
                      left: `${item.position.x}%`,
                      top: `${item.position.y}%`,
                      transform: `translate(-50%, -50%) rotate(${item.position.rotation}deg)`,
                    }}
                    onMouseDown={(e) => handleItemMouseDown(e, item)}
                    onClick={(e) => handleItemClick(e, item)}
                  >
                    {/* Size Controls - Mostrar apenas quando selecionado */}
                    {isSelected && !isDragging && (
                      <div 
                        className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-card border border-border rounded-md shadow-lg p-1 z-50 pointer-events-auto"
                        style={{ transform: 'translate(-50%, 0)' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSizeChange(item.id, -0.1);
                          }}
                          disabled={itemSize <= 0.3}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-xs font-medium px-2 min-w-[3rem] text-center">
                          {Math.round(itemSize * 100)}%
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSizeChange(item.id, 0.1);
                          }}
                          disabled={itemSize >= 3.0}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {/* Icon Container with scale */}
                    <div
                      style={{
                        transform: `scale(${itemSize})`,
                        transformOrigin: 'center center',
                      }}
                    >

                      {/* Icon Display */}
                      <div 
                        className="flex items-center justify-center bg-card rounded-full shadow-md border border-border"
                        style={{
                          width: `${baseSize}px`,
                          height: `${baseSize}px`,
                        }}
                      >
                        {item.isCustom ? (
                          item.icon.startsWith('data:image') ? (
                            <img
                              src={item.icon}
                              alt={item.label}
                              className="object-contain pointer-events-none"
                              style={{
                                width: `${baseSize * 0.67}px`,
                                height: `${baseSize * 0.67}px`,
                              }}
                              draggable={false}
                            />
                          ) : (
                            <div
                              dangerouslySetInnerHTML={{ __html: item.icon }}
                              className="pointer-events-none"
                              style={{
                                width: `${baseSize * 0.67}px`,
                                height: `${baseSize * 0.67}px`,
                              }}
                            />
                          )
                        ) : (
                          <span 
                            className="pointer-events-none text-4xl"
                            style={{
                              fontSize: `${baseSize * 0.67}px`,
                              lineHeight: `${baseSize * 0.67}px`,
                            }}
                          >
                            {item.icon}
                          </span>
                        )}
                      </div>
                      
                      {/* Label - Mostrar apenas se showLabel for true */}
                      {item.showLabel && editingLabelId !== item.id && (
                        <span className="text-xs font-medium text-foreground bg-card/90 px-2 py-0.5 rounded shadow-sm whitespace-nowrap pointer-events-none">
                          {item.label}
                        </span>
                      )}
                      
                      {/* Editor de Label */}
                      {editingLabelId === item.id && (
                        <div className="flex items-center gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
                          <Input
                            type="text"
                            value={labelText}
                            onChange={(e) => setLabelText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveLabel(item.id);
                              } else if (e.key === 'Escape') {
                                handleCancelLabel();
                              }
                            }}
                            onBlur={() => handleSaveLabel(item.id)}
                            className="h-7 text-xs px-2 py-1 min-w-[80px] max-w-[150px]"
                            placeholder={t("canvas.labelPlaceholder")}
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                  </div>
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
      
      <StageSizeDialog open={showSizeDialog} onOpenChange={setShowSizeDialog} />
      
      {/* Context Menu Dialog - acionado por duplo clique */}
      <Dialog open={contextMenuOpen} onOpenChange={setContextMenuOpen}>
        <DialogContent className="sm:max-w-[300px]">
          <DialogHeader>
            <DialogTitle>{contextMenuItem?.label || t("canvas.itemActions")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                if (contextMenuItem) {
                  handleAddLabel(contextMenuItem);
                }
              }}
            >
              <Type className="w-4 h-4 mr-2" />
              {t("canvas.addLabel")}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                if (contextMenuItem) {
                  handleDuplicateItem(contextMenuItem);
                }
                setContextMenuOpen(false);
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              {t("canvas.duplicate")}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => {
                if (contextMenuItem) {
                  handleDeleteItem(contextMenuItem.id);
                }
                setContextMenuOpen(false);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t("canvas.delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
