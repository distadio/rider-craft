export interface CustomIcon {
  id: string;
  name: string;
  category: string;
  svgData: string;
  isCustom: boolean;
  createdAt: string;
  createdBy: string;
}

export interface StageItem {
  id: string;
  label: string;
  icon: string;
  category: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  isCustom?: boolean;
}

export interface Project {
  id: string;
  name: string;
  bandName: string;
  contactInfo: {
    email: string;
    phone: string;
    manager: string;
  };
  createdAt: string;
  updatedAt: string;
}
