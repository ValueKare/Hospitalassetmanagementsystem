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
  AreaChart,
  Area,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Eye,
  Building2,
  Layers,
  MapPin,
  Search,
  Filter,
  Download,
  FileText,
  AlertCircle,
  Activity,
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface CFODashboardProps {
  onNavigate: (screen: string) => void;
  cfoName: string;
}

interface FinalApproval {
  id: number;
  requestId: string;
  poNumber: string;
  assetName: string;
  department: string;
  building: string;
  floor: string;
  quantity: number;
  poAmount: number;
  urgency: "low" | "medium" | "high" | "critical";
  vendor: string;
  roi: number;
  paybackPeriod: number;
  strategicImportance: "high" | "medium" | "low";
}

const mockFinalApprovals: FinalApproval[] = [
  {
    id: 1,
    requestId: "REQ-0015",
    poNumber: "PO-2024-1157",
    assetName: "Ventilator",
    department: "ICU",
    building: "Main Building",
    floor: "5th Floor",
    quantity: 2,
    poAmount: 680000,
    urgency: "critical",
    vendor: "MedTech Solutions",
    roi: 18.5,
    paybackPeriod: 3.2,
    strategicImportance: "high",
  },
  {
    id: 2,
    requestId: "REQ-0022",
    poNumber: "PO-2024-1158",
    assetName: "Surgical Instruments Set",
    department: "Surgery",
    building: "Main Building",
    floor: "3rd Floor",
    quantity: 5,
    poAmount: 245000,
    urgency: "high",
    vendor: "Surgical Supplies Inc",
    roi: 22.3,
    paybackPeriod: 2.8,
    strategicImportance: "high",
  },
];

const financialOverview = [
  { metric: "Total Assets Value", value: 8500000000, change: 12.5 },
  { metric: "Annual Capex Budget", value: 4800000000, change: 8.2 },
  { metric: "Utilized Budget", value: 3870000000, change: 15.3 },
  { metric: "Pending Approvals", value: 92500000, change: -5.4 },
];

const monthlyFinancials = [
  { month: "Jun", revenue: 125000000, expenses: 98000000, profit: 27000000 },
  { month: "Jul", revenue: 138000000, expenses: 102000000, profit: 36000000 },
  { month: "Aug", revenue: 142000000, expenses: 105000000, profit: 37000000 },
  { month: "Sep", revenue: 156000000, expenses: 112000000, profit: 44000000 },
  { month: "Oct", revenue: 148000000, expenses: 108000000, profit: 40000000 },
  { month: "Nov", revenue: 132000000, expenses: 98000000, profit: 34000000 },
];

const assetDistribution = [
  { name: "Medical Equipment", value: 3500000000, color: "#0F67FF" },
  { name: "Surgical Equipment", value: 1800000000, color: "#0EB57D" },
  { name: "Diagnostic Equipment", value: 1500000000, color: "#F59E0B" },
  { name: "IT Infrastructure", value: 900000000, color: "#8B5CF6" },
  { name: "Furniture & Others", value: 800000000, color: "#6B7280" },
];

const floorMapping = [
  {
    building: "Main Building",
    floors: [
      { floor: "Ground Floor", departments: ["Emergency", "Reception"], assets: 145, value: 28000000 },
      { floor: "1st Floor", departments: ["Pharmacy", "Lab"], assets: 98, value: 15000000 },
      { floor: "2nd Floor", departments: ["Radiology", "Imaging"], assets: 67, value: 45000000 },
      { floor: "3rd Floor", departments: ["Surgery", "OT"], assets: 156, value: 62000000 },
      { floor: "4th Floor", departments: ["Cardiology", "CCU"], assets: 89, value: 38000000 },
      { floor: "5th Floor", departments: ["ICU", "Critical Care"], assets: 234, value: 95000000 },
    ],
  },
  {
    building: "Emergency Wing",
    floors: [
      { floor: "Ground Floor", departments: ["Emergency", "Trauma"], assets: 178, value: 42000000 },
      { floor: "1st Floor", departments: ["Emergency OT"], assets: 92, value: 28000000 },
    ],
  },
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
    comment: "PO created.",
  },
  {
    id: 7,
    role: "Budget",
    approverName: "Robert Wilson",
    approverInitials: "RW",
    status: "approved" as const,
    timestamp: "2024-11-06 05:45 PM",
    comment: "Budget approved.",
  },
  {
    id: 8,
    role: "CFO",
    approverName: "Lisa Anderson",
    approverInitials: "LA",
    status: "pending" as const,
    timestamp: undefined,
    comment: undefined,
  },
];

export function CFODashboard({ onNavigate, cfoName }: CFODashboardProps) {
  const [selectedRequest, setSelectedRequest] = useState<FinalApproval | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [cfoComment, setCfoComment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("Main Building");

  const handleApprove = () => {
    if (!cfoComment.trim()) {
      toast.error("Please provide CFO approval comments");
      return;
    }
    toast.success("Request approved successfully!", {
      description: "Purchase order finalized and sent to vendor",
    });
    setIsReviewDialogOpen(false);
    setCfoComment("");
  };

  const handleReject = () => {
    if (!cfoComment.trim()) {
      toast.error("Please provide reason for rejection");
      return;
    }
    toast.error("Request rejected by CFO", {
      description: "Request sent back to Budget Committee",
    });
    setIsReviewDialogOpen(false);
    setCfoComment("");
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

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High Priority</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>;
      case "low":
        return <Badge className="bg-gray-100 text-gray-800">Low Priority</Badge>;
      default:
        return <Badge variant="outline">{importance}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#F0F9FF]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">{cfoName} - CFO Dashboard</h1>
                <p className="text-gray-500">Financial Overview & Final Approvals</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Financial Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-4">
            <TabsTrigger value="overview">Financial Overview</TabsTrigger>
            <TabsTrigger value="final-approvals">
              Final Approvals
              <Badge className="ml-2 bg-orange-100 text-orange-800">
                {mockFinalApprovals.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="floor-mapping">Floor Mapping</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Financial Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Financial KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {financialOverview.map((item, idx) => (
                <Card key={idx} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500">{item.metric}</p>
                        <h2 className="mt-2 text-gray-900">
                          ₹{(item.value / 10000000).toFixed(1)}Cr
                        </h2>
                        <div className="flex items-center mt-1">
                          {item.change >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                          )}
                          <p
                            className={
                              item.change >= 0 ? "text-green-600" : "text-red-600"
                            }
                          >
                            {item.change >= 0 ? "+" : ""}
                            {item.change}%
                          </p>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-[#0F67FF]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Financial Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Monthly Financial Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyFinancials}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stackId="1"
                        stroke="#0F67FF"
                        fill="#0F67FF"
                        name="Revenue"
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stackId="2"
                        stroke="#F59E0B"
                        fill="#F59E0B"
                        name="Expenses"
                      />
                      <Area
                        type="monotone"
                        dataKey="profit"
                        stackId="3"
                        stroke="#0EB57D"
                        fill="#0EB57D"
                        name="Profit"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Asset Distribution by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={assetDistribution}
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
                        {assetDistribution.map((entry, index) => (
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

          {/* Final Approvals Tab */}
          <TabsContent value="final-approvals" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Pending CFO Approval</p>
                      <h2 className="mt-2 text-gray-900">2</h2>
                      <p className="text-orange-600 mt-1">Final stage</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Total Value</p>
                      <h2 className="mt-2 text-gray-900">₹9.25L</h2>
                      <p className="text-blue-600 mt-1">Pending requests</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-[#0F67FF]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Approved This Month</p>
                      <h2 className="mt-2 text-gray-900">142</h2>
                      <p className="text-green-600 mt-1">+18% vs last month</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Avg ROI</p>
                      <h2 className="mt-2 text-gray-900">20.4%</h2>
                      <p className="text-green-600 mt-1">Good returns</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Final Approvals Table */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Requests Pending CFO Final Approval</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-600">PO Number</th>
                        <th className="px-4 py-3 text-left text-gray-600">Asset</th>
                        <th className="px-4 py-3 text-left text-gray-600">Location</th>
                        <th className="px-4 py-3 text-left text-gray-600">PO Amount</th>
                        <th className="px-4 py-3 text-left text-gray-600">ROI</th>
                        <th className="px-4 py-3 text-left text-gray-600">Payback</th>
                        <th className="px-4 py-3 text-left text-gray-600">Priority</th>
                        <th className="px-4 py-3 text-left text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {mockFinalApprovals.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-gray-900">{request.poNumber}</p>
                              <p className="text-gray-500">{request.requestId}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-gray-900">{request.assetName}</p>
                              <p className="text-gray-500">{request.department}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-gray-900">{request.building}</p>
                              <p className="text-gray-500">{request.floor}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            ₹{(request.poAmount / 1000).toFixed(0)}K
                          </td>
                          <td className="px-4 py-3 text-green-600">{request.roi}%</td>
                          <td className="px-4 py-3 text-gray-900">
                            {request.paybackPeriod} yrs
                          </td>
                          <td className="px-4 py-3">
                            {getImportanceBadge(request.strategicImportance)}
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

          {/* Floor Mapping Tab */}
          <TabsContent value="floor-mapping" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Asset Distribution - Floor Mapping</CardTitle>
                  <div className="flex items-center space-x-3">
                    <select
                      value={selectedBuilding}
                      onChange={(e) => setSelectedBuilding(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      {floorMapping.map((building, idx) => (
                        <option key={idx} value={building.building}>
                          {building.building}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {floorMapping
                    .find((b) => b.building === selectedBuilding)
                    ?.floors.map((floor, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <Layers className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-gray-900">{floor.floor}</h3>
                              <p className="text-gray-600">
                                {floor.departments.join(", ")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-8">
                            <div className="text-center">
                              <p className="text-gray-500">Assets</p>
                              <p className="text-gray-900">{floor.assets}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-500">Total Value</p>
                              <p className="text-[#0F67FF]">
                                ₹{(floor.value / 10000000).toFixed(1)}Cr
                              </p>
                            </div>
                            <Button size="sm" variant="outline">
                              <MapPin className="h-4 w-4 mr-2" />
                              View Map
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
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
                    <h2 className="text-[#0EB57D]">94%</h2>
                    <p className="text-gray-500 mt-2">Last 30 days</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Approved:</span>
                        <span>142</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Rejected:</span>
                        <span>9</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-gray-900">Avg Processing Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <h2 className="text-[#0F67FF]">4.8 hrs</h2>
                    <p className="text-gray-500 mt-2">From submission to CFO</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Fastest:</span>
                        <span>2.5 hrs</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Slowest:</span>
                        <span>18 hrs</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-gray-900">Cost Savings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <h2 className="text-gray-900">₹12.4Cr</h2>
                    <p className="text-gray-500 mt-2">This fiscal year</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Budget optimized:</span>
                        <span>18%</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Savings rate:</span>
                        <span>+8.2%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* CFO Final Approval Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>CFO Final Review - {selectedRequest?.poNumber}</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-indigo-50 rounded-lg">
                <div>
                  <p className="text-gray-600">Purchase Order</p>
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
                  <p className="text-gray-600">Location</p>
                  <p className="text-gray-900">
                    {selectedRequest.building} - {selectedRequest.floor}
                  </p>
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
              </div>

              {/* Financial Analysis */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-gray-900 mb-4">Financial Analysis</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-600">Expected ROI</p>
                    <p className="text-green-600">{selectedRequest.roi}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payback Period</p>
                    <p className="text-gray-900">{selectedRequest.paybackPeriod} years</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Strategic Importance</p>
                    {getImportanceBadge(selectedRequest.strategicImportance)}
                  </div>
                </div>
              </div>

              {/* Approval Timeline */}
              <div>
                <h3 className="text-gray-900 mb-4">Complete Approval Journey</h3>
                <ApprovalTimeline steps={mockApprovalSteps} currentStep={7} />
              </div>

              {/* CFO Decision */}
              <div className="space-y-4">
                <div>
                  <label className="text-gray-900 mb-2 block">
                    CFO Final Decision & Comments{" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <Textarea
                    placeholder="Provide final approval comments, strategic justification, financial impact assessment..."
                    value={cfoComment}
                    onChange={(e) => setCfoComment(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsReviewDialogOpen(false);
                      setCfoComment("");
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
                    Final Approval - Execute PO
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
