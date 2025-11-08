import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
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
  Users,
  Building,
  Wrench,
  AlertTriangle,
  TrendingUp,
  Plus,
  Bell,
  Shield,
  UserPlus,
  FolderPlus,
} from "lucide-react";

interface AdminDashboardProps {
  onNavigate: (screen: string) => void;
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

const recentActivities = [
  { id: 1, type: "Role Assignment", user: "Sarah Johnson", action: "Assigned as Department Head - Radiology", time: "2 hours ago" },
  { id: 2, type: "Maintenance Escalation", asset: "MRI Scanner", action: "Escalated to Biomedical Manager", time: "4 hours ago" },
  { id: 3, type: "New User", user: "Michael Chen", action: "Registered as Biomedical Manager", time: "5 hours ago" },
  { id: 4, type: "Department Created", dept: "Cardiology", action: "New department added to system", time: "1 day ago" },
];

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, type: "Role Approval", message: "New user registration pending approval", priority: "high" },
    { id: 2, type: "System Update", message: "Maintenance scheduled for tonight 11 PM", priority: "medium" },
    { id: 3, type: "Budget Alert", message: "Radiology department approaching budget limit", priority: "high" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#F0F9FF]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#0F67FF] to-[#0B4FCC] rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-gray-900">Admin Dashboard</h1>
                  <p className="text-gray-500">Complete system oversight and control</p>
                </div>
              </div>
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
              <div className="w-10 h-10 bg-gradient-to-br from-[#0F67FF] to-[#0B4FCC] rounded-full flex items-center justify-center">
                <span className="text-white">JA</span>
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
            {notifications.map((notif) => (
              <div key={notif.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className={`h-5 w-5 ${notif.priority === 'high' ? 'text-red-500' : 'text-yellow-500'} mt-0.5`} />
                  <div className="flex-1">
                    <p className="text-gray-900">{notif.message}</p>
                    <p className="text-gray-500 mt-1">{notif.type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button
            onClick={() => onNavigate("settings")}
            className="h-24 bg-gradient-to-br from-[#0F67FF] to-[#0B4FCC] hover:from-[#0B4FCC] hover:to-[#0F67FF] shadow-lg"
          >
            <div className="flex flex-col items-center">
              <UserPlus className="h-6 w-6 mb-2" />
              <span>Add User</span>
            </div>
          </Button>
          <Button
            onClick={() => onNavigate("settings")}
            variant="outline"
            className="h-24 border-2 border-[#0F67FF] text-[#0F67FF] hover:bg-[#E8F0FF]"
          >
            <div className="flex flex-col items-center">
              <FolderPlus className="h-6 w-6 mb-2" />
              <span>Add Department</span>
            </div>
          </Button>
          <Button
            onClick={() => onNavigate("assets")}
            variant="outline"
            className="h-24 border-2 hover:bg-gray-50"
          >
            <div className="flex flex-col items-center">
              <Plus className="h-6 w-6 mb-2" />
              <span>Add Asset</span>
            </div>
          </Button>
          <Button
            onClick={() => onNavigate("settings")}
            variant="outline"
            className="h-24 border-2 hover:bg-gray-50"
          >
            <div className="flex flex-col items-center">
              <Shield className="h-6 w-6 mb-2" />
              <span>Assign Role</span>
            </div>
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Total Assets</p>
                  <h2 className="mt-2 text-gray-900">1,380</h2>
                  <p className="text-green-600 mt-1">
                    <TrendingUp className="inline h-4 w-4 mr-1" />
                    +12% growth
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-[#E8F0FF] to-[#D0E7FF] rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-[#0F67FF]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Departments</p>
                  <h2 className="mt-2 text-gray-900">8</h2>
                  <p className="text-gray-600 mt-1">Across hospital</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Active Users</p>
                  <h2 className="mt-2 text-gray-900">47</h2>
                  <p className="text-gray-600 mt-1">System-wide</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Pending Issues</p>
                  <h2 className="mt-2 text-gray-900">23</h2>
                  <p className="text-orange-600 mt-1">Require attention</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Hospital-wide Asset Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={costData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cost" stroke="#0F67FF" strokeWidth={2} name="Asset Cost" />
                  <Line type="monotone" dataKey="maintenance" stroke="#10B981" strokeWidth={2} name="Maintenance" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Department Asset Distribution</CardTitle>
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

        {/* Recent Activity */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Recent System Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start justify-between p-4 bg-gradient-to-r from-[#F9FAFB] to-white rounded-lg border border-gray-100">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-[#E8F0FF] rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-[#0F67FF]" />
                    </div>
                    <div>
                      <p className="text-gray-900">{activity.action}</p>
                      <p className="text-gray-500">{activity.type}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-gray-500">{activity.time}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
