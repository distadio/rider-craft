import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CustomIcon, StageItem, Project } from '@/types';

interface AppStore {
  // Project
  project: Project;
  setProject: (project: Project) => void;
  
  // Stage Items
  stageItems: StageItem[];
  addItem: (item: Omit<StageItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<StageItem>) => void;
  deleteItem: (id: string) => void;
  setStageItems: (items: StageItem[]) => void;
  
  // Custom Icons
  customIcons: CustomIcon[];
  addCustomIcon: (icon: Omit<CustomIcon, 'id' | 'createdAt'>) => void;
  updateCustomIcon: (id: string, updates: Partial<CustomIcon>) => void;
  deleteCustomIcon: (id: string) => void;
  
  // Admin
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      // Project
      project: {
        id: generateId(),
        name: 'Novo Projeto',
        bandName: '',
        contactInfo: {
          email: '',
          phone: '',
          manager: ''
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      setProject: (project) => set({ project }),
      
      // Stage Items
      stageItems: [],
      addItem: (item) => set((state) => ({
        stageItems: [
          ...state.stageItems,
          { ...item, id: generateId() }
        ]
      })),
      updateItem: (id, updates) => set((state) => ({
        stageItems: state.stageItems.map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      })),
      deleteItem: (id) => set((state) => ({
        stageItems: state.stageItems.filter(item => item.id !== id)
      })),
      setStageItems: (items) => set({ stageItems: items }),
      
      // Custom Icons
      customIcons: [],
      addCustomIcon: (icon) => set((state) => ({
        customIcons: [
          ...state.customIcons,
          {
            ...icon,
            id: generateId(),
            createdAt: new Date().toISOString()
          }
        ]
      })),
      updateCustomIcon: (id, updates) => set((state) => ({
        customIcons: state.customIcons.map(icon =>
          icon.id === id ? { ...icon, ...updates } : icon
        )
      })),
      deleteCustomIcon: (id) => set((state) => ({
        customIcons: state.customIcons.filter(icon => icon.id !== id)
      })),
      
      // Admin
      isAdmin: false,
      setIsAdmin: (isAdmin) => set({ isAdmin })
    }),
    {
      name: 'stage-plot-storage',
      partialize: (state) => ({
        customIcons: state.customIcons,
        isAdmin: state.isAdmin,
        project: state.project,
        stageItems: state.stageItems
      })
    }
  )
);
