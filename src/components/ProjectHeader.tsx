import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Music, Save, FolderOpen } from "lucide-react";

interface ProjectHeaderProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
}

export const ProjectHeader = ({ projectName, onProjectNameChange }: ProjectHeaderProps) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-gradient-accent flex items-center justify-center">
          <Music className="w-4 h-4 text-accent-foreground" />
        </div>
        
        {isEditing ? (
          <Input
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
            className="w-64 h-8"
            autoFocus
          />
        ) : (
          <h1 
            className="text-lg font-semibold cursor-pointer hover:text-accent transition-colors"
            onClick={() => setIsEditing(true)}
          >
            {projectName}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <FolderOpen className="w-4 h-4 mr-1" />
          {t("header.open")}
        </Button>
        <Button variant="outline" size="sm">
          <Save className="w-4 h-4 mr-1" />
          {t("header.save")}
        </Button>
        <LanguageSwitcher />
      </div>
    </header>
  );
};
