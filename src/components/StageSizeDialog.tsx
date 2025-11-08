import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "@/store/store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface StageSizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StageSizeDialog = ({ open, onOpenChange }: StageSizeDialogProps) => {
  const { t } = useTranslation();
  const stageSize = useStore((state) => state.stageSize);
  const setStageSize = useStore((state) => state.setStageSize);
  
  const [width, setWidth] = useState<string>(stageSize.width.toString());
  const [height, setHeight] = useState<string>(stageSize.height.toString());
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(stageSize.width / stageSize.height);

  // Atualizar valores quando o diálogo abrir
  useEffect(() => {
    if (open) {
      setWidth(stageSize.width.toString());
      setHeight(stageSize.height.toString());
      const newAspectRatio = stageSize.width / stageSize.height;
      setAspectRatio(newAspectRatio);
      setKeepAspectRatio(true);
    }
  }, [open, stageSize]);

  // Manter proporção quando alterar largura
  const handleWidthChange = (value: string) => {
    setWidth(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0 && keepAspectRatio) {
      const newHeight = numValue / aspectRatio;
      setHeight(newHeight.toFixed(2));
    }
  };

  // Manter proporção quando alterar altura
  const handleHeightChange = (value: string) => {
    setHeight(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0 && keepAspectRatio) {
      const newWidth = numValue * aspectRatio;
      setWidth(newWidth.toFixed(2));
    }
  };

  // Atualizar proporção quando desmarcar/manter proporção
  const handleKeepAspectRatioChange = (checked: boolean) => {
    setKeepAspectRatio(checked);
    if (checked) {
      // Recalcular proporção baseada nos valores atuais
      const currentWidth = parseFloat(width);
      const currentHeight = parseFloat(height);
      if (!isNaN(currentWidth) && !isNaN(currentHeight) && currentHeight > 0) {
        setAspectRatio(currentWidth / currentHeight);
      }
    }
  };

  const handleSave = () => {
    const numWidth = parseFloat(width);
    const numHeight = parseFloat(height);
    
    if (isNaN(numWidth) || numWidth <= 0 || isNaN(numHeight) || numHeight <= 0) {
      return;
    }

    setStageSize({
      width: numWidth,
      height: numHeight,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("stageSize.title")}</DialogTitle>
          <DialogDescription>
            {t("stageSize.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="width" className="text-right">
              {t("stageSize.width")}
            </Label>
            <Input
              id="width"
              type="number"
              step="0.1"
              min="1"
              value={width}
              onChange={(e) => handleWidthChange(e.target.value)}
              className="col-span-2"
            />
            <span className="text-sm text-muted-foreground">m</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="height" className="text-right">
              {t("stageSize.height")}
            </Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              min="1"
              value={height}
              onChange={(e) => handleHeightChange(e.target.value)}
              className="col-span-2"
            />
            <span className="text-sm text-muted-foreground">m</span>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="keepAspectRatio"
              checked={keepAspectRatio}
              onCheckedChange={(checked) => handleKeepAspectRatioChange(checked === true)}
            />
            <Label htmlFor="keepAspectRatio" className="text-sm font-normal cursor-pointer">
              {t("stageSize.keepAspectRatio")}
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

