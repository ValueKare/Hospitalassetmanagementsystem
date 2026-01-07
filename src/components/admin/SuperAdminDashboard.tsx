import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Building2, Users, Package, ClipboardCheck, Plus, TrendingUp, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

// API configuration
const API_BASE_URL = "http://localhost:5001/api/dashboard";

// API functions
export const getDashboardSummary = async () => {
  try {
    console.log('Fetching summary from:', `${API_BASE_URL}/summary`);
    const response = await fetch(`${API_BASE_URL}/summary`);
    console.log('Summary response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Summary API error response:', errorText);
      throw new Error(`Failed to fetch dashboard summary: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Summary data received:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Summary API error:', error);
    throw error;
  }
};

export const getAssetsByDepartment = async () => {
  try {
    console.log('Fetching assets by department from:', `${API_BASE_URL}/assets-by-department`);
    const response = await fetch(`${API_BASE_URL}/assets-by-department`);
    console.log('Department response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Department API error response:', errorText);
      throw new Error(`Failed to fetch assets by department: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Department data received:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Department API error:', error);
    throw error;
  }
};

export const getUtilizationData = async () => {
  try {
    console.log('Fetching utilization from:', `${API_BASE_URL}/utilization`);
    const response = await fetch(`${API_BASE_URL}/utilization`);
    console.log('Utilization response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Utilization API error response:', errorText);
      throw new Error(`Failed to fetch utilization data: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Utilization data received:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Utilization API error:', error);
    throw error;
  }
};

export const getCostTrends = async () => {
  try {
    console.log('Fetching cost trends from:', `${API_BASE_URL}/cost-trends`);
    const response = await fetch(`${API_BASE_URL}/cost-trends`);
    console.log('Cost trends response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cost trends API error response:', errorText);
      throw new Error(`Failed to fetch cost trends: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Cost trends data received:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Cost trends API error:', error);
    throw error;
  }
};

export const getDashboardAlerts = async () => {
  try {
    console.log('Fetching alerts from:', `${API_BASE_URL}/alerts`);
    const response = await fetch(`${API_BASE_URL}/alerts`);
    console.log('Alerts response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Alerts API error response:', errorText);
      throw new Error(`Failed to fetch dashboard alerts: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Alerts data received:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Alerts API error:', error);
    throw error;
  }
};

interface SuperAdminDashboardProps {
  onNavigate: (screen: string) => void;
}

// TypeScript interfaces for API responses
interface DashboardSummary {
  totalAssets: number;
  underMaintenance: number;
  amcDue: number;
  utilizationRate: number;
}

interface DepartmentData {
  _id: string;
  value: number;
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
  _id: string;
  assetName: string;
  departmentName: string;
  amcEndDate?: string;
  utilizationStatus?: string;
}

interface TransformedAlert {
  id: string | number;
  type: string;
  message: string;
  priority: string;
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

export function SuperAdminDashboard({ onNavigate }: SuperAdminDashboardProps) {
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('=== STARTING SUPER ADMIN DASHBOARD DATA FETCH ===');
        
        // Fetch data with individual error handling
        const results = await Promise.allSettled([
          getDashboardSummary(),
          getAssetsByDepartment(),
          getUtilizationData(),
          getCostTrends(),
          getDashboardAlerts()
        ]);

        // Extract results and handle failures
        const summary = results[0].status === 'fulfilled' ? results[0].value : null;
        const departmentData = results[1].status === 'fulfilled' ? results[1].value : [];
        const utilizationData = results[2].status === 'fulfilled' ? results[2].value : [];
        const costData = results[3].status === 'fulfilled' ? results[3].value : [];
        const alerts = results[4].status === 'fulfilled' ? results[4].value : [];

        // Log detailed results
        console.log('=== RAW API RESULTS ===');
        console.log('Summary:', summary);
        console.log('Department Data:', departmentData);
        console.log('Utilization Data:', utilizationData);
        console.log('Cost Data:', costData);
        console.log('Alerts:', alerts);

        // Log any failures
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`API ${index} failed:`, result.reason);
          }
        });

        // Transform department data for pie chart (use as asset categories for super admin)
        console.log('=== TRANSFORMING DEPARTMENT DATA ===');
        const transformedAssetCategoryData: TransformedDepartmentData[] = Array.isArray(departmentData) ? departmentData.map((item: DepartmentData, index: number) => {
          console.log(`Transforming item ${index}:`, item);
          return {
            name: item._id || 'Unknown',
            value: item.value,
            color: assetCategoryColors[index % assetCategoryColors.length]
          };
        }) : [];
        console.log('Transformed department data:', transformedAssetCategoryData);

        // Transform cost data with month names
        console.log('=== TRANSFORMING COST DATA ===');
        const transformedCostData: TransformedCostData[] = Array.isArray(costData) ? costData.map((item: CostData) => {
          console.log('Transforming cost item:', item);
          return {
            month: monthNames[item.month] || `Month ${item.month}`,
            cost: item.cost || 0,
            maintenance: item.maintenance || 0
          };
        }) : [];
        console.log('Transformed cost data:', transformedCostData);

        // Transform alerts for super admin notifications
        console.log('=== TRANSFORMING ALERTS ===');
        const transformedAlerts: TransformedAlert[] = Array.isArray(alerts) ? alerts.map((alert: AlertData) => {
          console.log('Transforming alert:', alert);
          return {
            id: alert._id || Math.random(),
            type: alert.amcEndDate ? 'warranty' : 'maintenance',
            message: alert.amcEndDate 
              ? `Warranty expiring for ${alert.assetName} in ${alert.departmentName}`
              : `Maintenance required for ${alert.assetName} in ${alert.departmentName}`,
            priority: 'high'
          };
        }) : [];
        console.log('Transformed alerts:', transformedAlerts);

        // Set final dashboard data
        const finalData = {
          summary,
          departmentData: transformedAssetCategoryData,
          utilizationData: Array.isArray(utilizationData) ? utilizationData : [],
          costData: transformedCostData,
          alerts: transformedAlerts
        };
        
        console.log('=== FINAL DASHBOARD DATA ===');
        console.log('Final data being set:', finalData);
        
        setDashboardData(finalData);
        console.log('=== DASHBOARD DATA SET SUCCESSFULLY ===');

      } catch (error) {
        console.error('=== FETCH ERROR ===');
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

    fetchDashboardData();
  }, []);

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
        <h1 className="text-gray-900 mb-2">Super Admin Dashboard</h1>
        <p className="text-gray-600">Global overview across all hospital entities</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-600">Total Hospitals</CardTitle>
              <Building2 className="h-5 w-5 text-[#0F67FF]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">45</p>
            <p className="text-[#0EB57D] mt-1">+3 this month</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-600">Total Assets</CardTitle>
              <Package className="h-5 w-5 text-[#10B981]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">{dashboardData.summary?.totalAssets?.toLocaleString() || '0'}</p>
            <p className="text-[#0EB57D] mt-1">+1,245 this quarter</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-600">Active Audits</CardTitle>
              <ClipboardCheck className="h-5 w-5 text-[#F59E0B]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">{dashboardData.alerts.length}</p>
            <p className="text-gray-500 mt-1">Critical issues</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-600">Active Users</CardTitle>
              <Users className="h-5 w-5 text-[#8B5CF6]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">1,256</p>
            <p className="text-[#0EB57D] mt-1">+48 this month</p>
          </CardContent>
        </Card>
      </div>

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
                {console.log('=== RENDERING PIE CHART ===')}
                {console.log('Chart data:', dashboardData.departmentData)}
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
                  {dashboardData.departmentData.map((entry: TransformedDepartmentData, index: number) => {
                    console.log(`Rendering pie slice ${index}:`, entry);
                    return (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    );
                  })}
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
                {console.log('=== RENDERING BAR CHART ===')}
                {console.log('Bar chart data:', dashboardData.costData)}
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
