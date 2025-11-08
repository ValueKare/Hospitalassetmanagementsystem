import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ApprovalTimeline } from "../shared/ApprovalTimeline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Users,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  Download,
  Filter,
  Search,
  Building2,
  Activity,
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface HODDashboardProps {
  onNavigate: (screen: string) => void;
  hodName: string;
  department: string;
}

interface PendingApproval {
  id: number;
  requestId: string;
  assetName: string;
  requestType: string;
  requestedBy: string;
  urgency: "low" | "medium" | "high" | "critical";
  estimatedCost: number;
  submittedDate: string;
  previousApprovers: string[];
}

const mockPendingApprovals: PendingApproval[] = [
  {
    id: 1,
    requestId: "REQ-0015",
    assetName: "Ventilator",
    requestType: "New Asset Purchase",
    requestedBy: "Dr. Sarah Johnson",
    urgency: "critical",
    estimatedCost: 350000,
    submittedDate: "2024-11-05",
    previousApprovers: ["Level 1", "Level 2", "Level 3"],
  },
  {
    id: 2,
    requestId: "REQ-0018",
    assetName: "Patient Monitor",
    requestType: "Replacement",
    requestedBy: "Nurse Emily Davis",
    urgency: "high",
    estimatedCost: 120000,
    submittedDate: "2024-11-04",
    previousApprovers: ["Level 1", "Level 2"],
  },
];

const departmentAssets = [
  { category: "Medical Equipment", count: 145, value: 25600000 },
  { category: "Diagnostic", count: 89, value: 18400000 },
  { category: "Furniture", count: 234, value: 4500000 },
  { category: "IT Equipment", count: 67, value: 3200000 },
];

const monthlyRequests = [
  { month: "Jun", requested: 12, approved: 10, rejected: 2 },
  { month: "Jul", requested: 15, approved: 13, rejected: 2 },
  { month: "Aug", requested: 18, approved: 15, rejected: 3 },
  { month: "Sep", requested: 22, approved: 19, rejected: 3 },
  { month: "Oct", requested: 20, approved: 17, rejected: 3 },
  { month: "Nov", requested: 14, approved: 11, rejected: 3 },
];

const budgetUtilization = [
  { name: "Utilized", value: 6800000, color: "#0F67FF" },
  { name: "Remaining", value: 3200000, color: "#E8F0FF" },
];

const mockApprovalSteps = [
  {
    id: 1,
    role: "Level 1",
    approverName: "Dr. Raj Kumar",
    approverInitials: "RK",
    status: "approved" as const,
    timestamp: "2024-11-05 10:30 AM",
    comment: "Approved. Medical necessity confirmed.",
  },
  {
    id: 2,
    role: "Level 2",
    approverName: "Dr. Priya Sharma",
    approverInitials: "PS",
    status: "approved" as const,
    timestamp: "2024-11-05 02:15 PM",
    comment: "Approved for urgent medical requirement.",
  },
  {
    id: 3,
    role: "Level 3",
    approverName: "Dr. Amit Patel",
    approverInitials: "AP",
    status: "approved" as const,
    timestamp: "2024-11-05 04:45 PM",
    comment: "Approved. Critical for patient care.",
  },
  {
    id: 4,
    role: "HOD",
    approverName: "Dr. Michael Chen",
    approverInitials: "MC",
    status: "pending" as const,
    timestamp: undefined,
    comment: undefined,
  },
  {
    id: 5,
    role: "Inventory",
    approverName: "John Smith",
    approverInitials: "JS",
    status: "not-reached" as const,
    timestamp: undefined,
    comment: undefined,
  },
  {
    id: 6,
    role: "Purchase",
    approverName: "Emily Davis",
    approverInitials: "ED",
    status: "not-reached" as const,
    timestamp: undefined,
    comment: undefined,
  },
  {
    id: 7,
    role: "Budget",
    approverName: "Robert Wilson",
    approverInitials: "RW",
    status: "not-reached" as const,
    timestamp: undefined,
    comment: undefined,
  },
  {
    id: 8,
    role: "CFO",
    approverName: "Lisa Anderson",
    approverInitials: "LA",
    status: "not-reached" as const,
    timestamp: undefined,
    comment: undefined,
  },
];

export function HODDashboard({
  onNavigate,
  hodName,
  department,
}: HODDashboardProps) {
  const [selectedRequest, setSelectedRequest] = useState<PendingApproval | null>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [approvalComment, setApprovalComment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleApprove = () => {
    if (!approvalComment.trim()) {
      toast.error("Please provide a comment for approval");
      return;
    }
    toast.success("Request approved successfully", {
      description: "Request forwarded to Inventory Department",
    });
    setIsApprovalDialogOpen(false);
    setApprovalComment("");
    setSelectedRequest(null);
  };

  const handleReject = () => {
    if (!approvalComment.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    toast.error("Request rejected", {
      description: "Requestor will be notified",
    });
    setIsApprovalDialogOpen(false);
    setApprovalComment("");
    setSelectedRequest(null);
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return <Badge variant="destructive">🚨 Critical</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low":
        return <Badge className="bg-gray-100 text-gray-800">Low</Badge>;
      default:
        return <Badge variant="outline">{urgency}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#F0F9FF]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">{hodName} - HOD Dashboard</h1>
                <p className="text-gray-500">{department} Department</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="approvals">
              Pending Approvals
              <Badge className="ml-2 bg-orange-100 text-orange-800">
                {mockPendingApprovals.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="team">Team Performance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Total Assets</p>
                      <h2 className="mt-2 text-gray-900">535</h2>
                      <p className="text-green-600 mt-1">+12 this month</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-[#0F67FF]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Active Requests</p>
                      <h2 className="mt-2 text-gray-900">14</h2>
                      <p className="text-orange-600 mt-1">2 pending approval</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Budget Utilization</p>
                      <h2 className="mt-2 text-gray-900">68%</h2>
                      <p className="text-blue-600 mt-1">₹68L / ₹100L</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Team Members</p>
                      <h2 className="mt-2 text-gray-900">24</h2>
                      <p className="text-gray-600 mt-1">Doctors & Nurses</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Department Assets by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentAssets}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0F67FF" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Budget Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={budgetUtilization}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) =>
                          `${name}: ₹${(value / 100000).toFixed(1)}L`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {budgetUtilization.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Requests Trend */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Request Trends (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyRequests}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="requested"
                      stroke="#0F67FF"
                      name="Requested"
                    />
                    <Line
                      type="monotone"
                      dataKey="approved"
                      stroke="#0EB57D"
                      name="Approved"
                    />
                    <Line
                      type="monotone"
                      dataKey="rejected"
                      stroke="#F87171"
                      name="Rejected"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Requests Pending Your Approval</CardTitle>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search requests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-600">Request ID</th>
                        <th className="px-4 py-3 text-left text-gray-600">Asset Name</th>
                        <th className="px-4 py-3 text-left text-gray-600">Type</th>
                        <th className="px-4 py-3 text-left text-gray-600">Requested By</th>
                        <th className="px-4 py-3 text-left text-gray-600">Urgency</th>
                        <th className="px-4 py-3 text-left text-gray-600">Cost</th>
                        <th className="px-4 py-3 text-left text-gray-600">Date</th>
                        <th className="px-4 py-3 text-left text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {mockPendingApprovals.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">{request.requestId}</td>
                          <td className="px-4 py-3 text-gray-900">{request.assetName}</td>
                          <td className="px-4 py-3 text-gray-600">{request.requestType}</td>
                          <td className="px-4 py-3 text-gray-600">{request.requestedBy}</td>
                          <td className="px-4 py-3">{getUrgencyBadge(request.urgency)}</td>
                          <td className="px-4 py-3 text-gray-900">
                            ₹{(request.estimatedCost / 1000).toFixed(0)}K
                          </td>
                          <td className="px-4 py-3 text-gray-600">{request.submittedDate}</td>
                          <td className="px-4 py-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRequest(request);
                                setIsApprovalDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-gray-900">Approval Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <h2 className="text-[#0EB57D]">87%</h2>
                    <p className="text-gray-500 mt-2">Last 30 days</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Approved:</span>
                        <span>48</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Rejected:</span>
                        <span>7</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-gray-900">Average Approval Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <h2 className="text-[#0F67FF]">2.4 hrs</h2>
                    <p className="text-gray-500 mt-2">Response time</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Fastest:</span>
                        <span>15 min</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Slowest:</span>
                        <span>8 hrs</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-gray-900">Cost Approved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <h2 className="text-gray-900">₹42.5L</h2>
                    <p className="text-gray-500 mt-2">This month</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Last month:</span>
                        <span>₹38.2L</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Growth:</span>
                        <span>+11.2%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team Performance Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Department Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Dr. Sarah Johnson", role: "Senior Doctor", requests: 12, approved: 11 },
                    { name: "Nurse Emily Davis", role: "Head Nurse", requests: 8, approved: 8 },
                    { name: "Dr. Michael Chen", role: "Doctor", requests: 6, approved: 5 },
                    { name: "Nurse Robert Wilson", role: "Nurse", requests: 4, approved: 4 },
                  ].map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-gray-900">{member.name}</p>
                          <p className="text-gray-500">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-gray-500">Requests</p>
                          <p className="text-gray-900">{member.requests}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Approved</p>
                          <p className="text-green-600">{member.approved}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Rate</p>
                          <p className="text-blue-600">
                            {((member.approved / member.requests) * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Request - {selectedRequest?.requestId}</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-gray-600">Asset Name</p>
                  <p className="text-gray-900">{selectedRequest.assetName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Request Type</p>
                  <p className="text-gray-900">{selectedRequest.requestType}</p>
                </div>
                <div>
                  <p className="text-gray-600">Requested By</p>
                  <p className="text-gray-900">{selectedRequest.requestedBy}</p>
                </div>
                <div>
                  <p className="text-gray-600">Estimated Cost</p>
                  <p className="text-gray-900">
                    ₹{(selectedRequest.estimatedCost / 1000).toFixed(0)}K
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Urgency</p>
                  {getUrgencyBadge(selectedRequest.urgency)}
                </div>
                <div>
                  <p className="text-gray-600">Submitted</p>
                  <p className="text-gray-900">{selectedRequest.submittedDate}</p>
                </div>
              </div>

              {/* Approval Timeline */}
              <div>
                <h3 className="text-gray-900 mb-4">Approval Progress</h3>
                <ApprovalTimeline steps={mockApprovalSteps} currentStep={3} />
              </div>

              {/* Approval Actions */}
              <div className="space-y-4">
                <div>
                  <label className="text-gray-900 mb-2 block">
                    Your Comment/Decision <span className="text-red-600">*</span>
                  </label>
                  <Textarea
                    placeholder="Provide your comments, justification, or reasons..."
                    value={approvalComment}
                    onChange={(e) => setApprovalComment(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsApprovalDialogOpen(false);
                      setApprovalComment("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleReject}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Request
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-green-600 to-green-700"
                    onClick={handleApprove}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve & Forward
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
