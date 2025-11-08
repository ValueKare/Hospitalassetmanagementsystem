import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Calendar } from "../ui/calendar";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
  CheckCircle,
  Clock,
  TrendingDown,
  Building,
  Calendar as CalendarIcon,
} from "lucide-react";

interface DepartmentHeadDashboardProps {
  onNavigate: (screen: string) => void;
}

const performanceData = [
  { month: "Jan", uptime: 98, downtime: 2 },
  { month: "Feb", uptime: 96, downtime: 4 },
  { month: "Mar", uptime: 99, downtime: 1 },
  { month: "Apr", uptime: 97, downtime: 3 },
  { month: "May", uptime: 98, downtime: 2 },
  { month: "Jun", uptime: 99, downtime: 1 },
];

const pendingApprovals = [
  { id: 1, type: "Maintenance Request", asset: "X-Ray Machine", requestedBy: "John Smith", date: "2024-10-15", priority: "High" },
  { id: 2, type: "Asset Purchase", item: "Ultrasound System", amount: "$45,000", date: "2024-10-14", priority: "Medium" },
  { id: 3, type: "Calibration", asset: "CT Scanner", requestedBy: "Sarah Chen", date: "2024-10-13", priority: "High" },
];

const upcomingMaintenance = [
  { asset: "MRI Scanner", date: "2024-10-18", technician: "Michael Chen", type: "Routine" },
  { asset: "X-Ray Machine", date: "2024-10-20", technician: "John Smith", type: "Calibration" },
  { asset: "Ultrasound", date: "2024-10-22", technician: "Sarah Johnson", type: "Inspection" },
];

export function DepartmentHeadDashboard({ onNavigate }: DepartmentHeadDashboardProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#F0F9FF]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-gray-900">Department Head - Radiology</h1>
                  <p className="text-gray-500">Manage your department's assets and operations</p>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white">SJ</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Department Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Department Assets</p>
                  <h2 className="mt-2 text-gray-900">450</h2>
                  <p className="text-green-600 mt-1">128 Active</p>
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
                  <p className="text-gray-500">Under Maintenance</p>
                  <h2 className="mt-2 text-gray-900">12</h2>
                  <p className="text-orange-600 mt-1">2.7% of total</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Warranty Expiring</p>
                  <h2 className="mt-2 text-gray-900">8</h2>
                  <p className="text-red-600 mt-1">Next 30 days</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-50 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Pending Approvals</p>
                  <h2 className="mt-2 text-gray-900">{pendingApprovals.length}</h2>
                  <p className="text-blue-600 mt-1">Action required</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Approvals Panel */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pending Approvals</CardTitle>
              <Badge variant="destructive">{pendingApprovals.length} New</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingApprovals.map((approval) => (
                <div key={approval.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-[#FFF8F0] to-white rounded-lg border border-orange-200">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge className={approval.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'} variant="outline">
                        {approval.priority}
                      </Badge>
                      <p className="text-gray-900">{approval.type}</p>
                    </div>
                    <p className="text-gray-600">
                      {approval.asset || approval.item} • {approval.requestedBy || approval.amount}
                    </p>
                    <p className="text-gray-500 mt-1">Requested: {approval.date}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline">
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts and Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Chart */}
          <Card className="border-0 shadow-md lg:col-span-2">
            <CardHeader>
              <CardTitle>Department Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="uptime" fill="#10B981" name="Uptime %" />
                  <Bar dataKey="downtime" fill="#EF4444" name="Downtime %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Maintenance Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Maintenance */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Upcoming Maintenance Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingMaintenance.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-[#F0F9FF] to-white rounded-lg border border-blue-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-[#E8F0FF] rounded-lg flex items-center justify-center">
                      <CalendarIcon className="h-5 w-5 text-[#0F67FF]" />
                    </div>
                    <div>
                      <p className="text-gray-900">{task.asset}</p>
                      <p className="text-gray-500">{task.type} • Assigned to {task.technician}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900">{task.date}</p>
                    <Button size="sm" variant="outline" className="mt-2">View Details</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
