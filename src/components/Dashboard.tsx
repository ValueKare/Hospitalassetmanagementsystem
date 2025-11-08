import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
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

const costData = [
  { month: "Jan", cost: 45000, maintenance: 12000 },
  { month: "Feb", cost: 52000, maintenance: 15000 },
  { month: "Mar", cost: 48000, maintenance: 11000 },
  { month: "Apr", cost: 61000, maintenance: 18000 },
  { month: "May", cost: 55000, maintenance: 14000 },
  { month: "Jun", cost: 67000, maintenance: 19000 },
];

const departmentData = [
  { name: "Radiology", value: 450, color: "#0F67FF" },
  { name: "ICU", value: 320, color: "#10B981" },
  { name: "Surgery", value: 280, color: "#F59E0B" },
  { name: "Emergency", value: 180, color: "#8B5CF6" },
  { name: "Laboratory", value: 150, color: "#EF4444" },
];

const utilizationData = [
  { department: "Radiology", utilization: 92 },
  { department: "ICU", utilization: 85 },
  { department: "Surgery", utilization: 78 },
  { department: "Emergency", utilization: 88 },
  { department: "Laboratory", utilization: 72 },
];

export function Dashboard({ onNavigate, userRole }: DashboardProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const alerts = [
    { id: 1, type: "maintenance", message: "MRI Scanner - Dept. Radiology maintenance due in 3 days", priority: "high" },
    { id: 2, type: "expiry", message: "Warranty expiring for 5 assets in ICU next month", priority: "medium" },
    { id: 3, type: "calibration", message: "Blood Gas Analyzer calibration overdue", priority: "high" },
  ];

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
            {alerts.map((alert) => (
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
        {/* Alert Banner */}
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>3 urgent items</strong> require your attention: 2 maintenance overdue, 1 calibration needed
          </AlertDescription>
        </Alert>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Total Assets</p>
                  <h2 className="mt-2 text-gray-900">1,380</h2>
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
                  <h2 className="mt-2 text-gray-900">47</h2>
                  <p className="text-gray-600 mt-1">3.4% of total assets</p>
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
                  <h2 className="mt-2 text-gray-900">23</h2>
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
                  <h2 className="mt-2 text-gray-900">83%</h2>
                  <p className="text-green-600 mt-1">Optimal range</p>
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
                <LineChart data={costData}>
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
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
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
              <BarChart data={utilizationData}>
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
              {alerts.map((alert) => (
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
      </div>
    </div>
  );
}
