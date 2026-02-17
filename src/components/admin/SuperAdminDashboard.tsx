import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Building2, Users, Package, ClipboardCheck, Plus, TrendingUp, AlertCircle, Building } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";


// API configuration
// const import.meta.env.VITE_API_URL = "http://localhost:5001";

// API functions
const getAuthToken = () => localStorage.getItem('accessToken');

export const getDashboardSummary = async (hospitalId?: string) => {
  try {
    const token = getAuthToken();
    const url = hospitalId 
      ? `${import.meta.env.VITE_API_URL}/api/dashboard/summary?hospitalId=${hospitalId}`
      : `${import.meta.env.VITE_API_URL}/api/dashboard/summary`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch dashboard summary: ${response.status} ${errorText}`);
    }

    const data: DashboardSummaryResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Summary API error:', error);
    throw error;
  }
};

export const getAssetsByDepartment = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/assets-by-department`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch assets by department: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Department API error:', error);
    throw error;
  }
};

export const getUtilizationData = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/utilization`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
   
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch utilization data: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Utilization API error:', error);
    throw error;
  }
};

export const getCostTrends = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/cost-trends`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch cost trends: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Cost trends API error:', error);
    throw error;
  }
};

export const getDashboardAlerts = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/alerts`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch dashboard alerts: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Alerts API error:', error);
    throw error;
  }
};

export const getHospitalCount = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hospital`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch hospital count: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Hospital count API error:', error);
    throw error;
  }
};

export const getHospitalsByEntity = async (entityCode?: string) => {
  try {
    const token = getAuthToken();
    const url = entityCode 
      ? `${import.meta.env.VITE_API_URL}/api/hospital?entityCode=${entityCode}`
      : `${import.meta.env.VITE_API_URL}/api/hospital`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch entity hospitals: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Entity hospitals API error:', error);
    throw error;
  }
};

interface SuperAdminDashboardProps {
  onNavigate: (screen: string) => void;
  selectedEntity?: any;
}

// TypeScript interfaces for API responses
interface EntityHospitalsResponse {
  success: boolean;
  count: number;
  scope: string;
  entityCode: string;
  entityName: string;
  hospitals: Array<{
    _id: string;
    hospitalId?: string;
    name: string;
    location: string;
    contactEmail: string;
  }>;
}

interface HospitalInfo {
  _id: string;
  hospitalId: string;
  name: string;
  entityId: string;
  location: string;
}

interface DashboardSummaryResponse {
  scope: string;
  hospitalInfo: HospitalInfo;
  totalAssets: number;
  activeAssets: number;
  underMaintenance: number;
  scrappedAssets: number;
  amcDue: number;
  utilizationRate: number;
}

interface DashboardSummary {
  totalAssets: number;
  underMaintenance: number;
  amcDue: number;
  utilizationRate: number;
}

interface DepartmentData {
  department?: string;
  assetCount?: number;
  // Legacy fields for backwards compatibility
  _id?: string;
  value?: number;
}

interface TransformedDepartmentData {
  name: string;
  value: number;
  color: string;
}

interface UtilizationData {
  department: string;
  utilization: number;
}

interface CostData {
  month: number;
  cost: number;
  maintenance: number;
}

interface TransformedCostData {
  month: string;
  cost: number;
  maintenance: number;
}

interface AlertData {
  assetName: string;
  assetCode: string;
  hospitalName: string;
  hospitalLocation: string;
  departmentName: string;
  buildingName: string;
  floorName: string;
  amcExpiryDate: string;
  utilizationStatus: string;
  status: string;
  purchaseCost: number;
  maintenanceCost: number;
  alertType: string;
  daysToExpiry: number;
}

interface TransformedAlert {
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

// Month mapping for cost trends
const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Colors for departments
const departmentColors = ["#0F67FF", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4", "#84CC16", "#F97316"];

// Asset category colors
const assetCategoryColors = ["#0F67FF", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"];

const maintenanceTrendData = [
  { month: "Jan", completed: 65, pending: 28, overdue: 7 },
  { month: "Feb", completed: 72, pending: 24, overdue: 4 },
  { month: "Mar", completed: 68, pending: 30, overdue: 5 },
  { month: "Apr", completed: 85, pending: 22, overdue: 3 },
  { month: "May", completed: 90, pending: 20, overdue: 2 },
  { month: "Jun", completed: 95, pending: 18, overdue: 2 },
];

const auditStatusData = [
  { hospital: "City General Hospital", status: "In Progress", assets: 1245, completion: 65 },
  { hospital: "Metro Medical Center", status: "Completed", assets: 980, completion: 100 },
  { hospital: "Regional Health Center", status: "Scheduled", assets: 1560, completion: 0 },
  { hospital: "Community Hospital", status: "In Progress", assets: 756, completion: 45 },
];

export function SuperAdminDashboard({ onNavigate, selectedEntity }: SuperAdminDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [hospitalInfo, setHospitalInfo] = useState<HospitalInfo | null>(null);
  const [hospitalCount, setHospitalCount] = useState<number>(0);
  const [entityHospitals, setEntityHospitals] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<{
    summary: DashboardSummary | null;
    departmentData: TransformedDepartmentData[];
    utilizationData: UtilizationData[];
    costData: TransformedCostData[];
    alerts: TransformedAlert[];
  }>({
    summary: null,
    departmentData: [],
    utilizationData: [],
    costData: [],
    alerts: []
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
        console.log('=== STARTING SUPER ADMIN DASHBOARD DATA FETCH ===');
        
        // Fetch data with individual error handling
        const results = await Promise.allSettled([
          getDashboardSummary(selectedHospitalId || undefined),
          getAssetsByDepartment(),
          getUtilizationData(),
          getCostTrends(),
          getDashboardAlerts(),
          selectedEntity ? getHospitalsByEntity(selectedEntity.code) : getHospitalCount()
        ]);

        // Extract results and handle failures
        const summaryResponse = results[0].status === 'fulfilled' ? results[0].value : null;
        const departmentData = results[1].status === 'fulfilled' ? results[1].value : [];
        const utilizationData = results[2].status === 'fulfilled' ? results[2].value : [];
        const costData = results[3].status === 'fulfilled' ? results[3].value : [];
        const alertsResponse = results[4].status === 'fulfilled' ? results[4].value : null;
        const hospitalsResponse = results[5].status === 'fulfilled' ? results[5].value : null;

        // Set hospital info if available
        if (summaryResponse?.hospitalInfo) {
          setHospitalInfo(summaryResponse.hospitalInfo);
        }

        // Set hospital count from entity hospitals or global count
        const hospitalsArray = hospitalsResponse?.hospitals || hospitalsResponse?.data || (Array.isArray(hospitalsResponse) ? hospitalsResponse : []);
        const count = hospitalsResponse?.count ?? hospitalsArray.length ?? 0;
        setHospitalCount(count);

        // Store entity hospitals for dropdown
        if (hospitalsResponse?.hospitals) {
          setEntityHospitals(hospitalsResponse.hospitals);
          // Auto-select first hospital if none selected
          if (hospitalsResponse.hospitals.length > 0 && !selectedHospital) {
            const firstHospital = hospitalsResponse.hospitals[0];
            setSelectedHospital(firstHospital);
            setSelectedHospitalId(firstHospital.hospitalId || firstHospital._id);
          }
        }

        // Extract alerts array from response
        const alerts = alertsResponse?.alerts || [];

        // Transform summary response to DashboardSummary format
        const summary: DashboardSummary | null = summaryResponse ? {
          totalAssets: summaryResponse.totalAssets,
          underMaintenance: summaryResponse.underMaintenance,
          amcDue: summaryResponse.amcDue,
          utilizationRate: summaryResponse.utilizationRate
        } : null;

        // Log any failures
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`API ${index} failed:`, result.reason);
          }
        });

        // Transform department data for pie chart (use as asset categories for super admin)
        const transformedAssetCategoryData: TransformedDepartmentData[] = Array.isArray(departmentData) ? departmentData.map((item: DepartmentData, index: number) => ({
          name: item.department || item._id || 'Unknown',
          value: item.assetCount ?? item.value ?? 0,
          color: assetCategoryColors[index % assetCategoryColors.length]
        })) : [];

        // Transform cost data with month names
        const transformedCostData: TransformedCostData[] = Array.isArray(costData) ? costData.map((item: CostData) => ({
          month: monthNames[item.month] || `Month ${item.month}`,
          cost: item.cost,
          maintenance: item.maintenance
        })) : [];

        // Transform alerts
        const transformedAlerts: TransformedAlert[] = Array.isArray(alerts) ? alerts.map((alert: AlertData, index: number) => ({
          id: index,
          type: alert.alertType.toLowerCase().replace(' ', '_'),
          message: `${alert.assetName} (${alert.assetCode}) - ${alert.alertType}`,
          priority: alert.daysToExpiry <= 7 ? 'high' : alert.daysToExpiry <= 15 ? 'medium' : 'low',
          details: {
            hospitalName: alert.hospitalName,
            hospitalLocation: alert.hospitalLocation,
            departmentName: alert.departmentName,
            buildingName: alert.buildingName,
            floorName: alert.floorName,
            daysToExpiry: alert.daysToExpiry,
            purchaseCost: alert.purchaseCost,
            maintenanceCost: alert.maintenanceCost,
            utilizationStatus: alert.utilizationStatus
          }
        })) : [];

        // Set final dashboard data
        const finalData = {
          summary,
          departmentData: transformedAssetCategoryData,
          utilizationData: Array.isArray(utilizationData) ? utilizationData : [],
          costData: transformedCostData,
          alerts: transformedAlerts
        };
        
        setDashboardData(finalData);

      } catch (error) {
        console.error('Failed to fetch super admin dashboard data:', error);
        // Set empty data on error - no fallback mock data
        setDashboardData({
          summary: null,
          departmentData: [],
          utilizationData: [],
          costData: [],
          alerts: []
        });
      } finally {
        setLoading(false);
      }
    };

  //   fetchDashboardData();
  // }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedHospitalId]);

  // Update dashboard when entity changes
  useEffect(() => {
    if (selectedEntity) {
      // Reset selected hospital when entity changes
      setSelectedHospital(null);
      setSelectedHospitalId(null);
      fetchDashboardData();
    }
  }, [selectedEntity]);

  // Update dashboard when hospital changes
  useEffect(() => {
    if (selectedHospital) {
      fetchDashboardData();
    }
  }, [selectedHospital]);

  const handleHospitalChange = (hospitalId: string) => {
    const hospital = entityHospitals.find(h => (h.hospitalId || h._id) === hospitalId);
    if (hospital) {
      setSelectedHospital(hospital);
      setSelectedHospitalId(hospital.hospitalId || hospital._id);
    }
  };

  return (
    <div className="flex-1 p-8 bg-[#F9FAFB] min-h-screen">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading super admin dashboard...</div>
        </div>
      ) : (
        <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-gray-900 mb-2">Super Admin Dashboard</h1>
            <p className="text-gray-600">Global overview across all hospital entities</p>
            {selectedEntity && (
              <div className="mt-2 flex items-center gap-2">
                <Building className="h-4 w-4 text-[#0F67FF]" />
                <span className="text-sm text-gray-700">
                  Current Entity: <span className="font-semibold">{selectedEntity.name}</span> ({selectedEntity.code})
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={fetchDashboardData}
              className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]"
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Hospital Information */}
      {hospitalInfo && (
        <Card className="border-0 shadow-md mb-8">
          <CardHeader>
            <CardTitle className="text-gray-900">Hospital Information</CardTitle>
            <CardDescription>Current hospital details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Hospital ID</p>
                <p className="text-lg font-semibold text-gray-900">{hospitalInfo.hospitalId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Hospital Name</p>
                <p className="text-lg font-semibold text-gray-900">{hospitalInfo.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Entity ID</p>
                <p className="text-lg font-semibold text-gray-900">{hospitalInfo.entityId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="text-lg font-semibold text-gray-900">{hospitalInfo.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs text-gray-600">Total Hospitals</CardTitle>
              <Building2 className="h-4 w-4 text-[#0F67FF]" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-lg font-semibold text-gray-900">{hospitalCount}</p>
            <p className="text-xs text-[#0EB57D] mt-1">
              {selectedEntity ? `${selectedEntity.name} hospitals` : 'Registered hospitals'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs text-gray-600">Total Assets</CardTitle>
              <Package className="h-4 w-4 text-[#10B981]" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-lg font-semibold text-gray-900">{dashboardData.summary?.totalAssets?.toLocaleString() || '0'}</p>
            <p className="text-xs text-[#0EB57D] mt-1">Total equipment</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs text-gray-600">Active Assets</CardTitle>
              <TrendingUp className="h-4 w-4 text-[#0F67FF]" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-lg font-semibold text-gray-900">{dashboardData.summary?.totalAssets?.toLocaleString() || '0'}</p>
            <p className="text-xs text-[#0EB57D] mt-1">In operation</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs text-gray-600">Under Maintenance</CardTitle>
              <AlertCircle className="h-4 w-4 text-[#F59E0B]" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-lg font-semibold text-gray-900">{dashboardData.summary?.underMaintenance?.toLocaleString() || '0'}</p>
            <p className="text-xs text-gray-500 mt-1">Service required</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs text-gray-600">AMC Due</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-[#EF4444]" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-lg font-semibold text-gray-900">{dashboardData.summary?.amcDue?.toLocaleString() || '0'}</p>
            <p className="text-xs text-gray-500 mt-1">Contract renewal</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs text-gray-600">Utilization Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-[#10B981]" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-lg font-semibold text-gray-900">{dashboardData.summary?.utilizationRate || 0}%</p>
            <p className="text-xs text-[#0EB57D] mt-1">Efficiency rate</p>
          </CardContent>
        </Card>

        </div>

      {/* Recent Alerts */}
      <Card className="border-0 shadow-md mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900">Recent Alerts</CardTitle>
              <CardDescription>Latest asset notifications and AMC expiry warnings</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">{dashboardData.alerts.length} active</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboardData.alerts.length > 0 ? (
              dashboardData.alerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <h4 className="font-semibold text-gray-900">{alert.message}</h4>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          alert.priority === 'high' ? 'bg-red-100 text-red-800' :
                          alert.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {alert.priority}
                        </span>
                      </div>
                      
                      {alert.details && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Hospital:</span>
                            <p className="font-medium">{alert.details.hospitalName}</p>
                            <p className="text-xs text-gray-500">{alert.details.hospitalLocation}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Location:</span>
                            <p className="font-medium">{alert.details.buildingName}</p>
                            <p className="text-xs text-gray-500">{alert.details.floorName} • {alert.details.departmentName}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Status:</span>
                            <p className="font-medium capitalize">{alert.details.utilizationStatus.replace('_', ' ')}</p>
                            {alert.details.daysToExpiry !== undefined && (
                              <p className="text-xs text-gray-500">
                                {alert.details.daysToExpiry} days to expiry
                              </p>
                            )}
                          </div>
                          <div>
                            <span className="text-gray-600">Purchase Cost:</span>
                            <p className="font-medium">₹{alert.details.purchaseCost.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Maintenance Cost:</span>
                            <p className="font-medium">₹{alert.details.maintenanceCost.toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No active alerts at this time</p>
                <p className="text-sm text-gray-400 mt-1">All systems operating normally</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 shadow-md mb-8">
        <CardHeader>
          <CardTitle className="text-gray-900">Quick Actions</CardTitle>
          <CardDescription>Frequently used administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button 
            onClick={() => onNavigate("entity-setup")}
            className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC] hover:from-[#0B4FCC] hover:to-[#0F67FF]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Hospital
          </Button>
          <Button 
            onClick={() => onNavigate("user-management")}
            className="bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#10B981]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
          <Button 
            onClick={() => onNavigate("audit-management")}
            className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#F59E0B]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Generate Audit
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Asset Category Distribution */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900">Asset Category Distribution</CardTitle>
            <CardDescription>Across all hospitals</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dashboardData.departmentData.map((entry: TransformedDepartmentData, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Maintenance Trends */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900">Maintenance Trends</CardTitle>
            <CardDescription>Last 6 months overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.costData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cost" fill="#0EB57D" name="Cost" />
                <Bar dataKey="maintenance" fill="#F59E0B" name="Maintenance" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Audit Status */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900">Active Audit Status</CardTitle>
              <CardDescription>Current audit progress across hospitals</CardDescription>
            </div>
            <Button 
              variant="outline"
              onClick={() => onNavigate("audit-management")}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditStatusData.map((audit, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="text-gray-900">{audit.hospital}</p>
                  <p className="text-gray-600">
                    {audit.assets} assets
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-gray-900">{audit.completion}% Complete</p>
                    <span className={`inline-block px-2 py-1 rounded-full ${
                      audit.status === "Completed" ? "bg-green-100 text-green-800" :
                      audit.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {audit.status}
                    </span>
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#0F67FF] h-2 rounded-full transition-all"
                      style={{ width: `${audit.completion}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
}
