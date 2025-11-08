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
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  Search,
  Filter,
  Download,
  FileText,
  Clock,
  PieChart as PieChartIcon,
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface BudgetCommitteeDashboardProps {
  onNavigate: (screen: string) => void;
  committeeMember: string;
}

interface BudgetRequest {
  id: number;
  requestId: string;
  poNumber: string;
  assetName: string;
  department: string;
  quantity: number;
  poAmount: number;
  urgency: "low" | "medium" | "high" | "critical";
  vendor: string;
  budgetHead: string;
  allocatedBudget: number;
  utilized: number;
  remaining: number;
  complianceStatus: "within-budget" | "over-budget" | "near-limit";
}

const mockBudgetRequests: BudgetRequest[] = [
  {
    id: 1,
    requestId: "REQ-0015",
    poNumber: "PO-2024-1157",
    assetName: "Ventilator",
    department: "ICU",
    quantity: 2,
    poAmount: 680000,
    urgency: "critical",
    vendor: "MedTech Solutions",
    budgetHead: "Medical Equipment - ICU",
    allocatedBudget: 5000000,
    utilized: 3200000,
    remaining: 1800000,
    complianceStatus: "within-budget",
  },
  {
    id: 2,
    requestId: "REQ-0022",
    poNumber: "PO-2024-1158",
    assetName: "Surgical Instruments Set",
    department: "Surgery",
    quantity: 5,
    poAmount: 245000,
    urgency: "high",
    vendor: "Surgical Supplies Inc",
    budgetHead: "Surgical Equipment",
    allocatedBudget: 3000000,
    utilized: 2750000,
    remaining: 250000,
    complianceStatus: "within-budget",
  },
];

const budgetHeads = [
  {
    name: "Medical Equipment",
    allocated: 15000000,
    utilized: 10800000,
    remaining: 4200000,
    utilization: 72,
  },
  {
    name: "Surgical Supplies",
    allocated: 8000000,
    utilized: 6500000,
    remaining: 1500000,
    utilization: 81,
  },
  {
    name: "Pharmaceuticals",
    allocated: 20000000,
    utilized: 18200000,
    remaining: 1800000,
    utilization: 91,
  },
  {
    name: "General Supplies",
    allocated: 5000000,
    utilized: 3200000,
    remaining: 1800000,
    utilization: 64,
  },
];

const monthlySpend = [
  { month: "Jun", planned: 8500000, actual: 7800000 },
  { month: "Jul", planned: 9200000, actual: 9500000 },
  { month: "Aug", planned: 8800000, actual: 8200000 },
  { month: "Sep", planned: 10500000, actual: 11200000 },
  { month: "Oct", planned: 9800000, actual: 9600000 },
  { month: "Nov", planned: 8500000, actual: 6800000 },
];

const departmentBudget = [
  { name: "ICU", value: 15000000, color: "#0F67FF" },
  { name: "Surgery", value: 12000000, color: "#0EB57D" },
  { name: "Emergency", value: 10000000, color: "#F59E0B" },
  { name: "Cardiology", value: 8000000, color: "#8B5CF6" },
  { name: "Others", value: 15000000, color: "#6B7280" },
];

const mockApprovalSteps = [
  {
    id: 1,
    role: "Level 1",
    approverName: "Dr. Raj Kumar",
    approverInitials: "RK",
    status: "approved" as const,
    timestamp: "2024-11-05 10:30 AM",
    comment: "Approved.",
  },
  {
    id: 2,
    role: "Level 2",
    approverName: "Dr. Priya Sharma",
    approverInitials: "PS",
    status: "approved" as const,
    timestamp: "2024-11-05 02:15 PM",
    comment: "Approved.",
  },
  {
    id: 3,
    role: "Level 3",
    approverName: "Dr. Amit Patel",
    approverInitials: "AP",
    status: "approved" as const,
    timestamp: "2024-11-05 04:45 PM",
    comment: "Approved.",
  },
  {
    id: 4,
    role: "HOD",
    approverName: "Dr. Michael Chen",
    approverInitials: "MC",
    status: "approved" as const,
    timestamp: "2024-11-06 09:15 AM",
    comment: "Approved.",
  },
  {
    id: 5,
    role: "Inventory",
    approverName: "John Smith",
    approverInitials: "JS",
    status: "approved" as const,
    timestamp: "2024-11-06 11:30 AM",
    comment: "Stock not available.",
  },
  {
    id: 6,
    role: "Purchase",
    approverName: "Emily Davis",
    approverInitials: "ED",
    status: "approved" as const,
    timestamp: "2024-11-06 03:20 PM",
    comment: "PO created with MedTech Solutions.",
  },
  {
    id: 7,
    role: "Budget",
    approverName: "Robert Wilson",
    approverInitials: "RW",
    status: "pending" as const,
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

export function BudgetCommitteeDashboard({
  onNavigate,
  committeeMember,
}: BudgetCommitteeDashboardProps) {
  const [selectedRequest, setSelectedRequest] = useState<BudgetRequest | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [budgetComment, setBudgetComment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleApprove = () => {
    if (!budgetComment.trim()) {
      toast.error("Please provide budget approval comments");
      return;
    }
    toast.success("Budget approved successfully", {
      description: "Request forwarded to CFO for final approval",
    });
    setIsReviewDialogOpen(false);
    setBudgetComment("");
  };

  const handleReject = () => {
    if (!budgetComment.trim()) {
      toast.error("Please provide reason for budget rejection");
      return;
    }
    toast.error("Budget request rejected", {
      description: "Request sent back to Purchase Department",
    });
    setIsReviewDialogOpen(false);
    setBudgetComment("");
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

  const getComplianceBadge = (status: string) => {
    switch (status) {
      case "within-budget":
        return <Badge className="bg-green-100 text-green-800">✓ Within Budget</Badge>;
      case "near-limit":
        return <Badge className="bg-yellow-100 text-yellow-800">⚠ Near Limit</Badge>;
      case "over-budget":
        return <Badge variant="destructive">✗ Over Budget</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#F0F9FF]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">{committeeMember} - Budget Committee</h1>
                <p className="text-gray-500">Budget Compliance & Financial Review</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Budget Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="pending-review" className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="pending-review">
              Pending Review
              <Badge className="ml-2 bg-orange-100 text-orange-800">
                {mockBudgetRequests.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="budget-overview">Budget Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Pending Review Tab */}
          <TabsContent value="pending-review" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Pending Approval</p>
                      <h2 className="mt-2 text-gray-900">2</h2>
                      <p className="text-orange-600 mt-1">Awaiting review</p>
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
                      <p className="text-gray-500">Total PO Value</p>
                      <h2 className="mt-2 text-gray-900">₹9.25L</h2>
                      <p className="text-blue-600 mt-1">Current requests</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-[#0F67FF]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Within Budget</p>
                      <h2 className="mt-2 text-gray-900">2</h2>
                      <p className="text-green-600 mt-1">Compliant</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">This Month</p>
                      <h2 className="mt-2 text-gray-900">₹6.8Cr</h2>
                      <p className="text-gray-600 mt-1">Total approved</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Requests Table */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Purchase Orders - Budget Compliance Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-600">PO Number</th>
                        <th className="px-4 py-3 text-left text-gray-600">Asset</th>
                        <th className="px-4 py-3 text-left text-gray-600">Department</th>
                        <th className="px-4 py-3 text-left text-gray-600">PO Amount</th>
                        <th className="px-4 py-3 text-left text-gray-600">Budget Head</th>
                        <th className="px-4 py-3 text-left text-gray-600">Remaining</th>
                        <th className="px-4 py-3 text-left text-gray-600">Status</th>
                        <th className="px-4 py-3 text-left text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {mockBudgetRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-gray-900">{request.poNumber}</p>
                              <p className="text-gray-500">{request.requestId}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-900">{request.assetName}</td>
                          <td className="px-4 py-3 text-gray-600">{request.department}</td>
                          <td className="px-4 py-3 text-gray-900">
                            ₹{(request.poAmount / 1000).toFixed(0)}K
                          </td>
                          <td className="px-4 py-3 text-gray-600">{request.budgetHead}</td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-gray-900">
                                ₹{(request.remaining / 100000).toFixed(1)}L
                              </p>
                              <p className="text-gray-500">
                                of ₹{(request.allocatedBudget / 100000).toFixed(1)}L
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {getComplianceBadge(request.complianceStatus)}
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRequest(request);
                                setIsReviewDialogOpen(true);
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

          {/* Budget Overview Tab */}
          <TabsContent value="budget-overview" className="space-y-6">
            {/* Budget Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-gray-900">Total Allocated</CardTitle>
                </CardHeader>
                <CardContent>
                  <h2 className="text-[#0F67FF]">₹48Cr</h2>
                  <p className="text-gray-500 mt-2">Annual Budget FY 2024-25</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-gray-900">Utilized</CardTitle>
                </CardHeader>
                <CardContent>
                  <h2 className="text-gray-900">₹38.7Cr</h2>
                  <p className="text-orange-600 mt-2">80.6% utilized</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-gray-900">Remaining</CardTitle>
                </CardHeader>
                <CardContent>
                  <h2 className="text-[#0EB57D]">₹9.3Cr</h2>
                  <p className="text-gray-500 mt-2">19.4% available</p>
                </CardContent>
              </Card>
            </div>

            {/* Budget Heads Table */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Budget Heads - Utilization Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-600">Budget Head</th>
                        <th className="px-4 py-3 text-left text-gray-600">Allocated</th>
                        <th className="px-4 py-3 text-left text-gray-600">Utilized</th>
                        <th className="px-4 py-3 text-left text-gray-600">Remaining</th>
                        <th className="px-4 py-3 text-left text-gray-600">Utilization</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {budgetHeads.map((head, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">{head.name}</td>
                          <td className="px-4 py-3 text-gray-900">
                            ₹{(head.allocated / 10000000).toFixed(1)}Cr
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            ₹{(head.utilized / 10000000).toFixed(1)}Cr
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            ₹{(head.remaining / 10000000).toFixed(1)}Cr
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    head.utilization > 85
                                      ? "bg-red-500"
                                      : head.utilization > 70
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                  }`}
                                  style={{ width: `${head.utilization}%` }}
                                />
                              </div>
                              <span className="text-gray-900 w-12">{head.utilization}%</span>
                            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Monthly Spend - Planned vs Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlySpend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="planned" stroke="#0F67FF" name="Planned" />
                      <Line type="monotone" dataKey="actual" stroke="#0EB57D" name="Actual" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Department-wise Budget Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={departmentBudget}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) =>
                          `${name}: ₹${(value / 10000000).toFixed(1)}Cr`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {departmentBudget.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Budget Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Budget Compliance Review - {selectedRequest?.poNumber}</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-gray-600">PO Number</p>
                  <p className="text-gray-900">{selectedRequest.poNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600">Asset</p>
                  <p className="text-gray-900">{selectedRequest.assetName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Department</p>
                  <p className="text-gray-900">{selectedRequest.department}</p>
                </div>
                <div>
                  <p className="text-gray-600">Vendor</p>
                  <p className="text-gray-900">{selectedRequest.vendor}</p>
                </div>
                <div>
                  <p className="text-gray-600">PO Amount</p>
                  <p className="text-gray-900">
                    ₹{(selectedRequest.poAmount / 1000).toFixed(0)}K
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Quantity</p>
                  <p className="text-gray-900">{selectedRequest.quantity} units</p>
                </div>
              </div>

              {/* Budget Analysis */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-gray-900 mb-4">Budget Analysis</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Budget Head</p>
                    <p className="text-gray-900">{selectedRequest.budgetHead}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Allocated Budget</p>
                    <p className="text-gray-900">
                      ₹{(selectedRequest.allocatedBudget / 100000).toFixed(1)}L
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Already Utilized</p>
                    <p className="text-gray-900">
                      ₹{(selectedRequest.utilized / 100000).toFixed(1)}L
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Remaining Budget</p>
                    <p className="text-green-600">
                      ₹{(selectedRequest.remaining / 100000).toFixed(1)}L
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">After This PO</p>
                    <p className="text-gray-900">
                      ₹
                      {(
                        (selectedRequest.remaining - selectedRequest.poAmount) /
                        100000
                      ).toFixed(1)}
                      L
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Compliance Status</p>
                    {getComplianceBadge(selectedRequest.complianceStatus)}
                  </div>
                </div>
              </div>

              {/* Approval Timeline */}
              <div>
                <h3 className="text-gray-900 mb-4">Approval Progress</h3>
                <ApprovalTimeline steps={mockApprovalSteps} currentStep={6} />
              </div>

              {/* Action Section */}
              <div className="space-y-4">
                <div>
                  <label className="text-gray-900 mb-2 block">
                    Budget Committee Comments <span className="text-red-600">*</span>
                  </label>
                  <Textarea
                    placeholder="Provide budget compliance review comments, financial analysis, recommendations..."
                    value={budgetComment}
                    onChange={(e) => setBudgetComment(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsReviewDialogOpen(false);
                      setBudgetComment("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleReject}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject - Over Budget
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]"
                    onClick={handleApprove}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Approve & Forward to CFO
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
