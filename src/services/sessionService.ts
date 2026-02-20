// Session initialization service
import { useSuperAdminStore } from '../store/useSuperAdminStore';
import { useAssetStore } from '../store/useAssetStore';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Initialize user session after login
 * Fetches role-specific dashboard data and populates the global store
 */
export const initializeSession = async (accessToken: string, userRole: string): Promise<boolean> => {
  try {
    console.log('🚀 Initializing session for role:', userRole);

    const response = await fetch(`${API_URL}/api/session/initialize`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      console.error('❌ Session initialization failed:', response.status);
      return false;
    }

    const data = await response.json();
    console.log('✅ Session data received:', data);

    if (!data.success) {
      console.error('❌ Session initialization unsuccessful');
      return false;
    }

    // Populate store based on role
    if (data.dashboard) {
      populateStore(data.dashboard, userRole);
    }

    return true;
  } catch (error) {
    console.error('❌ Session initialization error:', error);
    return false;
  }
};

/**
 * Populate the appropriate store based on user role
 */
function populateStore(dashboardData: any, userRole: string) {
  // Populate SuperAdmin store
  if (userRole === 'SuperAdmin' || userRole === 'superadmin') {
    const store = useSuperAdminStore.getState();
    
    // Update all dashboard data at once
    if (dashboardData.summary) {
      store.setLoading(true);
      
      // Set basic metrics
      store.setTotalHospitals(dashboardData.summary.totalHospitals || 0);
      store.setDashboardSummary({
        totalAssets: dashboardData.summary.totalAssets || 0,
        activeAssets: dashboardData.summary.activeAssets || 0,
        underMaintenance: dashboardData.summary.underMaintenance || 0,
        amcDue: dashboardData.summary.amcDue || 0,
        utilizationRate: dashboardData.summary.utilizationRate || 0
      });

      // Set chart data
      store.setDepartmentData(dashboardData.departmentData || []);
      store.setUtilizationData(dashboardData.utilizationData || []);
      store.setCostData(dashboardData.costData || []);
      store.setAlerts(dashboardData.alerts || []);
      
      store.setLoading(false);
      console.log('✅ SuperAdmin store populated successfully');
    }
  }
  
  // TODO: Add other role-specific store population
  // else if (userRole === 'Admin') { ... }
  // else if (userRole === 'HOD') { ... }
  // etc.
}

/**
 * Clear session data from stores
 */
export const clearSessionStores = () => {
  // Clear SuperAdmin store
  const superAdminStore = useSuperAdminStore.getState();
  superAdminStore.reset();
  
  // Clear Asset store
  const assetStore = useAssetStore.getState();
  assetStore.reset();
  
  // TODO: Clear other stores as they are implemented
  console.log('✅ All stores cleared');
};

export default {
  initializeSession,
  clearSessionStores
};
