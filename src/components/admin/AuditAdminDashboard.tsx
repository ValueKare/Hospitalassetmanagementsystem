import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ClipboardCheck, FileCheck, Clock, Users, AlertCircle, TrendingUp, PlayCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Progress } from "../ui/progress";

interface AuditAdminDashboardProps {
  onNavigate: (screen: string) => void;
}

const auditComplianceData = [
  { month: "Jan", completed: 8, pending: 2, overdue: 0 },
  { month: "Feb", completed: 10, pending: 1, overdue: 0 },
  { month: "Mar", completed: 7, pending: 3, overdue: 1 },
  { month: "Apr", completed: 12, pending: 2, overdue: 0 },
  { month: "May", completed: 9, pending: 4, overdue: 1 },
  { month: "Jun", completed: 11, pending: 3, overdue: 0 },
];

const myActiveAudits = [
  { id: 1, hospital: "City General Hospital", progress: 65, totalAssets: 1245, deadline: "2025-10-25" },
  { id: 2, hospital: "Community Hospital", progress: 45, totalAssets: 756, deadline: "2025-10-28" },
];

const recentActivities = [
  { action: "Approved audit request", hospital: "Regional Health Center", time: "2 hours ago" },
  { action: "Completed audit", hospital: "Metro Medical Center", time: "1 day ago" },
  { action: "Generated new audit", hospital: "Suburban Clinic", time: "2 days ago" },
  { action: "Added audit team member", hospital: "City General Hospital", time: "3 days ago" },
];

export function AuditAdminDashboard({ onNavigate }: AuditAdminDashboardProps) {
  return (
    <div className="flex-1 p-8 bg-[#F9FAFB] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Audit Administrator Dashboard</h1>
        <p className="text-gray-600">Monitor and manage audit operations across all hospitals</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-600">My Active Audits</CardTitle>
              <Clock className="h-5 w-5 text-[#0F67FF]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">2</p>
            <p className="text-gray-500 mt-1">In progress</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-600">Completed This Month</CardTitle>
              <FileCheck className="h-5 w-5 text-[#0EB57D]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-[#0EB57D]">11</p>
            <p className="text-gray-500 mt-1">+3 from last month</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-600">Pending Requests</CardTitle>
              <AlertCircle className="h-5 w-5 text-[#F59E0B]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-[#F59E0B]">5</p>
            <p className="text-gray-500 mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-600">Team Members</CardTitle>
              <Users className="h-5 w-5 text-[#8B5CF6]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">8</p>
            <p className="text-gray-500 mt-1">Active auditors</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-md mb-8">
        <CardHeader>
          <CardTitle className="text-gray-900">Quick Actions</CardTitle>
          <CardDescription>Manage your audit tasks</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button 
            onClick={() => onNavigate("initiate-audit")}
            className="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#8B5CF6]"
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Initiate New Audit
          </Button>
          <Button 
            onClick={() => onNavigate("audit-management")}
            className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC] hover:from-[#0B4FCC] hover:to-[#0F67FF]"
          >
            <ClipboardCheck className="h-4 w-4 mr-2" />
            View All Audits
          </Button>
          <Button 
            onClick={() => onNavigate("audit-users")}
            className="bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#10B981]"
          >
            <Users className="h-4 w-4 mr-2" />
            Manage Audit Team
          </Button>
          <Button 
            onClick={() => onNavigate("admin-reports")}
            className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#F59E0B]"
          >
            <FileCheck className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Audit Performance Trends */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900">Audit Performance Trends</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={auditComplianceData}>
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

        {/* My Active Audits */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900">My Active Audits</CardTitle>
                <CardDescription>Currently assigned to me</CardDescription>
              </div>
              <Button variant="outline" onClick={() => onNavigate("audit-management")}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myActiveAudits.map((audit) => (
                <div key={audit.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-gray-900">{audit.hospital}</h4>
                      <p className="text-gray-600">{audit.totalAssets} assets</p>
                    </div>
                    <span className="text-gray-600">Due: {audit.deadline}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Progress</span>
                      <span>{audit.progress}%</span>
                    </div>
                    <Progress value={audit.progress} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900">Recent Activity</CardTitle>
            <CardDescription>Latest audit operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                  <div className="w-2 h-2 mt-2 rounded-full bg-[#0F67FF]" />
                  <div className="flex-1">
                    <p className="text-gray-900">{activity.action}</p>
                    <p className="text-gray-600">{activity.hospital}</p>
                    <p className="text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Summary */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900">Compliance Summary</CardTitle>
            <CardDescription>Overall audit compliance status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Assets Verified</span>
                  <span className="text-gray-900">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Documentation Complete</span>
                  <span className="text-gray-900">87%</span>
                </div>
                <Progress value={87} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">On-Time Completion</span>
                  <span className="text-gray-900">95%</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Quality Score</span>
                  <span className="text-gray-900">89%</span>
                </div>
                <Progress value={89} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
