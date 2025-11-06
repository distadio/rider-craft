import { useState } from "react";
import { ProjectHeader } from "@/components/ProjectHeader";
import { StageCanvas } from "@/components/StageCanvas";
import { IconLibrary } from "@/components/IconLibrary";
import { InputList } from "@/components/InputList";
import { Button } from "@/components/ui/button";
import { FileDown, Plus } from "lucide-react";

const Index = () => {
  const [projectName, setProjectName] = useState("New Stage Plot");
  const [stageItems, setStageItems] = useState<any[]>([]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ProjectHeader 
        projectName={projectName} 
        onProjectNameChange={setProjectName}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Icon Library Sidebar */}
        <aside className="w-64 border-r border-border bg-card">
          <IconLibrary onDragStart={(item) => console.log("Dragging:", item)} />
        </aside>

        {/* Main Canvas Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>
            <Button size="sm" className="bg-gradient-accent">
              <FileDown className="w-4 h-4 mr-1" />
              Export Rider
            </Button>
          </div>
          
          <StageCanvas items={stageItems} onItemsChange={setStageItems} />
        </main>

        {/* Input List Panel */}
        <aside className="w-96 border-l border-border bg-card overflow-auto">
          <InputList items={stageItems} />
        </aside>
      </div>
    </div>
  );
};

export default Index;
