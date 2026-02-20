import { create } from 'zustand';

// Types for SuperAdmin Dashboard
export interface HospitalInfo {
  _id: string;
  hospitalId: string;
  name: string;
  entityId: string;
  location: string;
}

export interface DashboardSummary {
  totalAssets: number;
  activeAssets: number;
  underMaintenance: number;
  amcDue: number;
  utilizationRate: number;
}

export interface DepartmentData {
  name: string;
  value: number;
  color: string;
}

export interface UtilizationData {
  department: string;
  utilization: number;
}

export interface CostData {
  month: string;
  cost: number;
  maintenance: number;
}

export interface AlertData {
  id: string | number;
  type: string;
  message: string;
  priority: string;
  details?: {
    hospitalName: string;
    hospitalLocation: string;
    departmentName: string;
    buildingName: string;
    floorName: string;
    daysToExpiry: number;
    purchaseCost: number;
    maintenanceCost: number;
    utilizationStatus: string;
  };
}

export interface EntityInfo {
  code: string;
  name: string;
}

export interface SuperAdminState {
  // Loading states
  loading: boolean;
  
  // Hospital data
  totalHospitals: number;
  entityHospitals: any[];
  selectedHospital: any | null;
  selectedHospitalId: string | null;
  hospitalInfo: HospitalInfo | null;
  
  // Dashboard metrics
  dashboardSummary: DashboardSummary | null;
  departmentData: DepartmentData[];
  utilizationData: UtilizationData[];
  costData: CostData[];
  alerts: AlertData[];
  
  // Entity context
  selectedEntity: EntityInfo | null;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setTotalHospitals: (count: number) => void;
  setEntityHospitals: (hospitals: any[]) => void;
  setSelectedHospital: (hospital: any | null) => void;
  setSelectedHospitalId: (hospitalId: string | null) => void;
  setHospitalInfo: (info: HospitalInfo | null) => void;
  setDashboardSummary: (summary: DashboardSummary | null) => void;
  setDepartmentData: (data: DepartmentData[]) => void;
  setUtilizationData: (data: UtilizationData[]) => void;
  setCostData: (data: CostData[]) => void;
  setAlerts: (alerts: AlertData[]) => void;
  setSelectedEntity: (entity: EntityInfo | null) => void;
  
  // Batch update for dashboard data
  updateDashboardData: (data: {
    summary: DashboardSummary | null;
    departmentData: DepartmentData[];
    utilizationData: UtilizationData[];
    costData: CostData[];
    alerts: AlertData[];
  }) => void;
  
  // Reset store
  reset: () => void;
}

const initialState = {
  loading: true,
  totalHospitals: 0,
  entityHospitals: [],
  selectedHospital: null,
  selectedHospitalId: null,
  hospitalInfo: null,
  dashboardSummary: null,
  departmentData: [],
  utilizationData: [],
  costData: [],
  alerts: [],
  selectedEntity: null,
};

export const useSuperAdminStore = create<SuperAdminState>((set) => ({
  ...initialState,
  
  // Actions
  setLoading: (loading) => set({ loading }),
  
  setTotalHospitals: (count) => set({ totalHospitals: count }),
  
  setEntityHospitals: (hospitals) => set({ entityHospitals: hospitals }),
  
  setSelectedHospital: (hospital) => set({ selectedHospital: hospital }),
  
  setSelectedHospitalId: (hospitalId) => set({ selectedHospitalId: hospitalId }),
  
  setHospitalInfo: (info) => set({ hospitalInfo: info }),
  
  setDashboardSummary: (summary) => set({ dashboardSummary: summary }),
  
  setDepartmentData: (data) => set({ departmentData: data }),
  
  setUtilizationData: (data) => set({ utilizationData: data }),
  
  setCostData: (data) => set({ costData: data }),
  
  setAlerts: (alerts) => set({ alerts }),
  
  setSelectedEntity: (entity) => set({ selectedEntity: entity }),
  
  // Batch update for performance
  updateDashboardData: (data) => set({
    dashboardSummary: data.summary,
    departmentData: data.departmentData,
    utilizationData: data.utilizationData,
    costData: data.costData,
    alerts: data.alerts,
  }),
  
  // Reset to initial state
  reset: () => set(initialState),
}));
