import { create } from 'zustand';

// Asset interface
export interface Asset {
  id: number | string;
  asset_id: string;
  asset_description: string;
  serial_number: string;
  model_number: string;
  location: string;
  status: string;
  last_maintenance: string;
  class: string;
  cost_centre: string;
  quantity: number;
  bus_area: string | null;
  amount: string | null;
  hospitalId?: string;
  hospitalName?: string;
}

// Asset metadata for aggregated information
export interface AssetMetadata {
  totalAssets: number;
  totalValue: number;
  assetsByStatus: {
    active: number;
    maintenance: number;
    retired: number;
    calibration: number;
  };
  assetsByLocation: Array<{
    location: string;
    count: number;
  }>;
  recentAssets: Asset[];
  lastUpdated: Date | null;
}

// Hospital asset summary for entity setup
export interface HospitalAssetSummary {
  hospitalId: string;
  hospitalName: string;
  totalAssets: number;
  activeAssets: number;
  maintenanceAssets: number;
  totalValue: number;
  lastUpdated: Date | null;
}

export interface AssetState {
  // Asset data
  assets: Asset[];
  selectedHospitalId: string | null;
  
  // Metadata
  metadata: AssetMetadata;
  hospitalSummaries: Map<string, HospitalAssetSummary>;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  pageSize: number;
  
  // Filters
  searchQuery: string;
  filterStatus: string;
  
  // Loading state
  loading: boolean;
  
  // Actions - Asset Management
  setAssets: (assets: Asset[]) => void;
  addAsset: (asset: Asset) => void;
  updateAsset: (id: string | number, updates: Partial<Asset>) => void;
  deleteAsset: (id: string | number) => void;
  
  // Actions - Hospital Selection
  setSelectedHospitalId: (hospitalId: string | null) => void;
  
  // Actions - Metadata
  setMetadata: (metadata: AssetMetadata) => void;
  updateMetadata: (updates: Partial<AssetMetadata>) => void;
  setHospitalSummary: (hospitalId: string, summary: HospitalAssetSummary) => void;
  getHospitalSummary: (hospitalId: string) => HospitalAssetSummary | undefined;
  
  // Actions - Pagination
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setPageSize: (size: number) => void;
  
  // Actions - Filters
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: string) => void;
  
  // Actions - Loading
  setLoading: (loading: boolean) => void;
  
  // Helper to calculate metadata from assets
  calculateMetadata: () => void;
  
  // Reset
  reset: () => void;
}

const initialMetadata: AssetMetadata = {
  totalAssets: 0,
  totalValue: 0,
  assetsByStatus: {
    active: 0,
    maintenance: 0,
    retired: 0,
    calibration: 0,
  },
  assetsByLocation: [],
  recentAssets: [],
  lastUpdated: null,
};

const initialState = {
  assets: [],
  selectedHospitalId: null,
  metadata: initialMetadata,
  hospitalSummaries: new Map<string, HospitalAssetSummary>(),
  currentPage: 1,
  totalPages: 1,
  pageSize: 50,
  searchQuery: '',
  filterStatus: 'all',
  loading: false,
};

export const useAssetStore = create<AssetState>((set, get) => ({
  ...initialState,
  
  // Asset Management Actions
  setAssets: (assets) => {
    set({ assets, loading: false });
    // Auto-calculate metadata when assets change
    get().calculateMetadata();
  },
  
  addAsset: (asset) => {
    set((state) => ({
      assets: [asset, ...state.assets],
    }));
    get().calculateMetadata();
  },
  
  updateAsset: (id, updates) => {
    set((state) => ({
      assets: state.assets.map((asset) =>
        asset.id === id ? { ...asset, ...updates } : asset
      ),
    }));
    get().calculateMetadata();
  },
  
  deleteAsset: (id) => {
    set((state) => ({
      assets: state.assets.filter((asset) => asset.id !== id),
    }));
    get().calculateMetadata();
  },
  
  // Hospital Selection
  setSelectedHospitalId: (hospitalId) => set({ selectedHospitalId: hospitalId }),
  
  // Metadata Actions
  setMetadata: (metadata) => set({ metadata }),
  
  updateMetadata: (updates) =>
    set((state) => ({
      metadata: { ...state.metadata, ...updates, lastUpdated: new Date() },
    })),
  
  setHospitalSummary: (hospitalId, summary) =>
    set((state) => {
      const newSummaries = new Map(state.hospitalSummaries);
      newSummaries.set(hospitalId, summary);
      return { hospitalSummaries: newSummaries };
    }),
  
  getHospitalSummary: (hospitalId) => {
    return get().hospitalSummaries.get(hospitalId);
  },
  
  // Pagination Actions
  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (pages) => set({ totalPages: pages }),
  setPageSize: (size) => set({ pageSize: size }),
  
  // Filter Actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  
  // Loading
  setLoading: (loading) => set({ loading }),
  
  // Calculate metadata from current assets
  calculateMetadata: () => {
    const { assets } = get();
    
    // Calculate total value
    const totalValue = assets.reduce((sum, asset) => {
      const amount = parseFloat(asset.amount || '0');
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    // Count by status
    const assetsByStatus = {
      active: assets.filter((a) => a.status?.toLowerCase() === 'active').length,
      maintenance: assets.filter((a) => 
        a.status?.toLowerCase().includes('maintenance')
      ).length,
      retired: assets.filter((a) => a.status?.toLowerCase() === 'retired').length,
      calibration: assets.filter((a) => 
        a.status?.toLowerCase().includes('calibration')
      ).length,
    };
    
    // Group by location
    const locationMap = new Map<string, number>();
    assets.forEach((asset) => {
      const location = asset.location || 'Unassigned';
      locationMap.set(location, (locationMap.get(location) || 0) + 1);
    });
    
    const assetsByLocation = Array.from(locationMap.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 locations
    
    // Get recent assets (last 10)
    const recentAssets = [...assets]
      .sort((a, b) => {
        // Sort by last_maintenance date if available
        const dateA = new Date(a.last_maintenance || 0);
        const dateB = new Date(b.last_maintenance || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 10);
    
    set({
      metadata: {
        totalAssets: assets.length,
        totalValue,
        assetsByStatus,
        assetsByLocation,
        recentAssets,
        lastUpdated: new Date(),
      },
    });
  },
  
  // Reset
  reset: () => set(initialState),
}));
