import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ProjectHeader } from "@/components/ProjectHeader";
import { StageCanvas } from "@/components/StageCanvas";
import { IconLibrary } from "@/components/IconLibrary";
import { InputList } from "@/components/InputList";
import { Button } from "@/components/ui/button";
import { FileDown, Plus, Settings } from "lucide-react";
import { useStore } from "@/store/store";
import { IconManager } from "@/components/Admin/IconManager";
import { AdminLogin } from "@/components/Auth/AdminLogin";

const Index = () => {
  const { t } = useTranslation();
  const [projectName, setProjectName] = useState(t("common.newProject"));
  const [stageItems, setStageItems] = useState<any[]>([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  
  const isAdmin = useStore(state => state.isAdmin);
  const setIsAdmin = useStore(state => state.setIsAdmin);

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }
  }, [setIsAdmin]);

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
    setShowAdminPanel(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ProjectHeader 
        projectName={projectName} 
        onProjectNameChange={setProjectName}
      />
      
      {showAdminPanel && isAdmin ? (
        <div className="flex-1 overflow-auto p-8 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <div className="mb-4">
              <Button onClick={() => setShowAdminPanel(false)} variant="outline">
                ← {t('common.back')}
              </Button>
            </div>
            <IconManager />
          </div>
        </div>
      ) : (
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
                {t("canvas.addItem")}
              </Button>
            </div>
            <Button size="sm" className="bg-gradient-accent">
              <FileDown className="w-4 h-4 mr-1" />
              {t("canvas.exportRider")}
            </Button>
          </div>
          
          <StageCanvas items={stageItems} onItemsChange={setStageItems} />
        </main>

        {/* Input List Panel */}
        <aside className="w-96 border-l border-border bg-card overflow-auto">
          <InputList items={stageItems} />
        </aside>
        </div>
      )}

      {/* Admin Button - Floating */}
      <div className="fixed bottom-4 right-4 z-50">
        {isAdmin ? (
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              variant="default"
              size="lg"
              className="shadow-lg"
            >
              <Settings className="w-4 h-4 mr-2" />
              {showAdminPanel ? t('admin.closeAdmin') : t('admin.adminPanel')}
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="lg"
              className="shadow-lg"
            >
              {t('admin.logout')}
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setShowAdminLogin(true)}
            variant="outline"
            size="lg"
            className="shadow-lg"
          >
            🔒 {t('admin.adminAccess')}
          </Button>
        )}
      </div>

      <AdminLogin open={showAdminLogin} onOpenChange={setShowAdminLogin} />
    </div>
  );
};

export default Index;
