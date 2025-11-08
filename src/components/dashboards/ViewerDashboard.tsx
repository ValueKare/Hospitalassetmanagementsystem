import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Eye, Download, BarChart3, FileText, TrendingUp, Package, Activity } from "lucide-react";

interface ViewerDashboardProps {
  onNavigate: (screen: string) => void;
}

const utilizationData = [
  { month: "Jan", utilization: 82 },
  { month: "Feb", utilization: 85 },
  { month: "Mar", utilization: 83 },
  { month: "Apr", utilization: 87 },
  { month: "May", utilization: 86 },
  { month: "Jun", utilization: 88 },
];

const departmentData = [
  { name: "Radiology", value: 450, color: "#0F67FF" },
  { name: "ICU", value: 320, color: "#10B981" },
  { name: "Surgery", value: 280, color: "#F59E0B" },
  { name: "Emergency", value: 180, color: "#8B5CF6" },
  { name: "Laboratory", value: 150, color: "#EF4444" },
];

const maintenanceFrequency = [
  { department: "Radiology", frequency: 45 },
  { department: "ICU", frequency: 38 },
  { department: "Surgery", frequency: 32 },
  { department: "Laboratory", frequency: 28 },
  { department: "Emergency", frequency: 25 },
];

const assetSummary = [
  { category: "Diagnostic Equipment", count: 450, value: "$12.5M" },
  { category: "Life Support", count: 320, value: "$8.3M" },
  { category: "Surgical Equipment", count: 280, value: "$15.2M" },
  { category: "Laboratory", count: 150, value: "$4.8M" },
  { category: "Monitoring Systems", count: 180, value: "$3.2M" },
];

export function ViewerDashboard({ onNavigate }: ViewerDashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#F0F9FF]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-gray-900">Analytics Viewer Dashboard</h1>
                  <p className="text-gray-500">Read-only access to reports and analytics</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => onNavigate("reports")}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white">RW</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Info Banner */}
        <div className="bg-gradient-to-r from-[#E8F0FF] to-white border border-[#0F67FF]/20 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Eye className="h-5 w-5 text-[#0F67FF]" />
            <div>
              <p className="text-gray-900">Viewer Access Mode</p>
              <p className="text-gray-600">You have read-only access to analytics and reports. Contact admin for additional permissions.</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Total Assets</p>
                  <h2 className="mt-2 text-gray-900">1,380</h2>
                  <p className="text-gray-600 mt-1">Across all departments</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-[#E8F0FF] to-[#D0E7FF] rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-[#0F67FF]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Avg. Utilization</p>
                  <h2 className="mt-2 text-gray-900">85%</h2>
                  <p className="text-green-600 mt-1">
                    <TrendingUp className="inline h-4 w-4 mr-1" />
                    Above target
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Total Value</p>
                  <h2 className="mt-2 text-gray-900">$44M</h2>
                  <p className="text-gray-600 mt-1">Asset valuation</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Reports Available</p>
                  <h2 className="mt-2 text-gray-900">247</h2>
                  <p className="text-gray-600 mt-1">This quarter</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Asset Utilization Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={utilizationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="utilization"
                    stroke="#0F67FF"
                    strokeWidth={3}
                    name="Utilization %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Department Distribution</CardTitle>
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

        {/* Maintenance Frequency */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Maintenance Frequency by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={maintenanceFrequency}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="department" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Legend />
                <Bar dataKey="frequency" fill="#0F67FF" name="Maintenance Events" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Asset Summary Table */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Asset Category Summary</CardTitle>
              <Badge variant="outline" className="bg-[#E8F0FF] text-[#0F67FF]">Read-Only</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Asset Count</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assetSummary.map((item, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="text-gray-900">{item.category}</TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>{item.value}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" disabled>
                          <Eye className="h-4 w-4 mr-2" />
                          View Only
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Reports */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center"
                onClick={() => onNavigate("reports")}
              >
                <FileText className="h-6 w-6 mb-2 text-[#0F67FF]" />
                <span>Asset Reports</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center"
                onClick={() => onNavigate("reports")}
              >
                <BarChart3 className="h-6 w-6 mb-2 text-[#0F67FF]" />
                <span>Analytics Dashboard</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center"
                onClick={() => onNavigate("reports")}
              >
                <Download className="h-6 w-6 mb-2 text-[#0F67FF]" />
                <span>Export Data</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
