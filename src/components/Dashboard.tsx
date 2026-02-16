import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";

// API configuration
const API_BASE_URL = "http://localhost:5001";

// API functions
export const getDashboardSummary = async () => {
  try {
    console.log('Fetching summary from:', `${API_BASE_URL}/api/dashboard/summary`);
    const response = await fetch(`${API_BASE_URL}/api/dashboard/summary`);
    console.log('Summary response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Summary API error response:', errorText);
      throw new Error(`Failed to fetch dashboard summary: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Summary data received:', data);
    return data;
  } catch (error) {
    console.error('Summary API error:', error);
    throw error;
  }
};

export const getAssetsByDepartment = async () => {
  try {
    console.log('Fetching assets by department from:', `${API_BASE_URL}/api/dashboard/assets-by-department`);
    const response = await fetch(`${API_BASE_URL}/api/dashboard/assets-by-department`);
    console.log('Department response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Department API error response:', errorText);
      throw new Error(`Failed to fetch assets by department: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Department data received:', data);
    return data;
  } catch (error) {
    console.error('Department API error:', error);
    throw error;
  }
};

export const getUtilizationData = async () => {
  try {
    console.log('Fetching utilization from:', `${API_BASE_URL}/api/dashboard/utilization`);
    const response = await fetch(`${API_BASE_URL}/api/dashboard/utilization`);
    console.log('Utilization response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Utilization API error response:', errorText);
      throw new Error(`Failed to fetch utilization data: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Utilization data received:', data);
    return data;
  } catch (error) {
    console.error('Utilization API error:', error);
    throw error;
  }
};

export const getCostTrends = async () => {
  try {
    console.log('Fetching cost trends from:', `${API_BASE_URL}/api/dashboard/cost-trends`);
    const response = await fetch(`${API_BASE_URL}/api/dashboard/cost-trends`);
    console.log('Cost trends response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cost trends API error response:', errorText);
      throw new Error(`Failed to fetch cost trends: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Cost trends data received:', data);
    return data;
  } catch (error) {
    console.error('Cost trends API error:', error);
    throw error;
  }
};

export const getDashboardAlerts = async () => {
  try {
    console.log('Fetching alerts from:', `${API_BASE_URL}/api/dashboard/alerts`);
    const response = await fetch(`${API_BASE_URL}/api/dashboard/alerts`);
    console.log('Alerts response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Alerts API error response:', errorText);
      throw new Error(`Failed to fetch dashboard alerts: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Alerts data received:', data);
    return data;
  } catch (error) {
    console.error('Alerts API error:', error);
    throw error;
  }
};


import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Package,
  Wrench,
  AlertTriangle,
  TrendingUp,
  Plus,
  Search,
  FileText,
  Bell,
  Activity,
  Calendar,
} from "lucide-react";

interface DashboardProps {
  onNavigate: (screen: string) => void;
  userRole: string;
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

export function Dashboard({ onNavigate, userRole }: DashboardProps) {
  const [showNotifications, setShowNotifications] = useState(false);
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
        console.log('=== STARTING DASHBOARD DATA FETCH ===');
        
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

        // Transform department data for pie chart
        console.log('=== TRANSFORMING DEPARTMENT DATA ===');
        const transformedDepartmentData: TransformedDepartmentData[] = Array.isArray(departmentData) ? departmentData.map((item: DepartmentData, index: number) => {
          console.log(`Transforming item ${index}:`, item);
          return {
            name: item._id || 'Unknown',
            value: item.value,
            color: departmentColors[index % departmentColors.length]
          };
        }) : [];
        console.log('Transformed department data:', transformedDepartmentData);

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

        // Transform alerts for notifications
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
          departmentData: transformedDepartmentData,
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
        console.error('Failed to fetch dashboard data:', error);
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
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900">Dashboard</h1>
              <p className="text-gray-500">Welcome back, {userRole === 'admin' ? 'Administrator' : userRole === 'department-head' ? 'Department Head' : 'Staff Member'}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                className="relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
              <div className="w-10 h-10 bg-[#E8F0FF] rounded-full flex items-center justify-center">
                <span className="text-[#0F67FF]">
                  {userRole === 'admin' ? 'A' : userRole === 'department-head' ? 'D' : 'S'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-6 top-20 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3>Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {dashboardData.alerts.map((alert) => (
              <div key={alert.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className={`h-5 w-5 ${alert.priority === 'high' ? 'text-red-500' : 'text-yellow-500'} mt-0.5`} />
                  <div className="flex-1">
                    <p className="text-gray-900">{alert.message}</p>
                    <p className="text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-200">
            <Button variant="ghost" className="w-full">View All Notifications</Button>
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading dashboard data...</div>
          </div>
        ) : (
          <>
        {/* Alert Banner */}
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{dashboardData.alerts.length} urgent items</strong> require your attention: {dashboardData.summary?.underMaintenance || 0} maintenance overdue, {dashboardData.alerts.filter(a => a.type === 'expiry').length} warranty expiring
          </AlertDescription>
        </Alert>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Total Assets</p>
                  <h2 className="mt-2 text-gray-900">{dashboardData.summary?.totalAssets?.toLocaleString() || '0'}</h2>
                  <p className="text-green-600 mt-1">
                    <TrendingUp className="inline h-4 w-4 mr-1" />
                    +12% from last month
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#E8F0FF] rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-[#0F67FF]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Under Maintenance</p>
                  <h2 className="mt-2 text-gray-900">{dashboardData.summary?.underMaintenance || '0'}</h2>
                  <p className="text-gray-600 mt-1">
                    {dashboardData.summary?.totalAssets ? 
                      `${((dashboardData.summary.underMaintenance / dashboardData.summary.totalAssets) * 100).toFixed(1)}%` : 
                      '0%'
                    } of total assets
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Warranty Expiring</p>
                  <h2 className="mt-2 text-gray-900">{dashboardData.summary?.amcDue || '0'}</h2>
                  <p className="text-orange-600 mt-1">Within next 30 days</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Utilization Rate</p>
                  <h2 className="mt-2 text-gray-900">{dashboardData.summary?.utilizationRate || '0'}%</h2>
                  <p className={(dashboardData.summary?.utilizationRate || 0) >= 80 ? "text-green-600" : "text-yellow-600"} mt-1>
                    {(dashboardData.summary?.utilizationRate || 0) >= 80 ? "Optimal range" : "Needs attention"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button
                onClick={() => onNavigate("add-asset")}
                className="h-24 bg-[#0F67FF] hover:bg-[#0F67FF]/90 flex flex-col items-center justify-center"
              >
                <Plus className="h-6 w-6 mb-2" />
                Add Asset
              </Button>
              <Button
                onClick={() => onNavigate("assets")}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center border-2"
              >
                <Search className="h-6 w-6 mb-2" />
                Track Asset
              </Button>
              <Button
                onClick={() => onNavigate("maintenance")}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center border-2"
              >
                <Calendar className="h-6 w-6 mb-2" />
                Schedule Maintenance
              </Button>
              <Button
                onClick={() => onNavigate("reports")}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center border-2"
              >
                <FileText className="h-6 w-6 mb-2" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost vs Maintenance */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Cost vs Maintenance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.costData}>
                  {console.log('=== RENDERING LINE CHART ===')}
                  {console.log('Line chart data:', dashboardData.costData)}
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cost" stroke="#0F67FF" strokeWidth={2} name="Procurement Cost" />
                  <Line type="monotone" dataKey="maintenance" stroke="#10B981" strokeWidth={2} name="Maintenance Cost" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Department Distribution */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Asset Distribution by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  {console.log('=== RENDERING PIE CHART ===')}
                  {console.log('Pie chart data:', dashboardData.departmentData)}
                  <Pie
                    data={dashboardData.departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
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
        </div>

        {/* Utilization Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Department-wise Asset Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.utilizationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="department" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Legend />
                <Bar dataKey="utilization" fill="#0F67FF" name="Utilization %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Alerts & Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.alerts.map((alert: TransformedAlert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className={`h-5 w-5 ${alert.priority === 'high' ? 'text-red-500' : 'text-yellow-500'}`} />
                    <div>
                      <p className="text-gray-900">{alert.message}</p>
                      <p className="text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <Badge variant={alert.priority === 'high' ? 'destructive' : 'default'}>
                    {alert.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
          </>
        )}
      </div>
    </div>
  );
}
