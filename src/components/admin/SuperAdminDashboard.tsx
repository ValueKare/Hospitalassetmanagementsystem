import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Building2, Users, Package, ClipboardCheck, Plus, TrendingUp, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface SuperAdminDashboardProps {
  onNavigate: (screen: string) => void;
}

const assetCategoryData = [
  { name: "Medical Equipment", value: 450, color: "#0F67FF" },
  { name: "Furniture", value: 280, color: "#10B981" },
  { name: "IT Equipment", value: 320, color: "#F59E0B" },
  { name: "Lab Equipment", value: 195, color: "#8B5CF6" },
  { name: "Others", value: 155, color: "#EF4444" },
];

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
  return (
    <div className="flex-1 p-8 bg-[#F9FAFB] min-h-screen">
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
            <p className="text-gray-900">62,450</p>
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
            <p className="text-gray-900">12</p>
            <p className="text-gray-500 mt-1">8 hospitals</p>
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
                <Pie
                  data={assetCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetCategoryData.map((entry, index) => (
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
              <BarChart data={maintenanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#0EB57D" name="Completed" />
                <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
                <Bar dataKey="overdue" fill="#EF4444" name="Overdue" />
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
    </div>
  );
}
