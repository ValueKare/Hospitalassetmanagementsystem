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
  Legend,
} from "recharts";
import {
  ShoppingCart,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  Search,
  Filter,
  Download,
  Users,
  TrendingUp,
  Clock,
  Package,
  Building2,
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface PurchaseDashboardProps {
  onNavigate: (screen: string) => void;
  managerName: string;
}

interface PurchaseRequest {
  id: number;
  requestId: string;
  poNumber?: string;
  assetName: string;
  assetType: string;
  department: string;
  quantity: number;
  estimatedCost: number;
  urgency: "low" | "medium" | "high" | "critical";
  inventorySpecs: string;
  suggestedVendor?: string;
  status: "pending-po" | "po-created" | "vendor-quote" | "po-sent";
}

interface Vendor {
  id: number;
  name: string;
  category: string;
  rating: number;
  totalPOs: number;
  activeContracts: number;
  compliance: "compliant" | "pending" | "non-compliant";
}

const mockPurchaseRequests: PurchaseRequest[] = [
  {
    id: 1,
    requestId: "REQ-0015",
    assetName: "Ventilator",
    assetType: "Medical Equipment",
    department: "ICU",
    quantity: 2,
    estimatedCost: 700000,
    urgency: "critical",
    inventorySpecs:
      "High-flow ICU ventilator with BiPAP mode, minimum 10L capacity, digital display required",
    suggestedVendor: "MedTech Solutions",
    status: "pending-po",
  },
  {
    id: 2,
    requestId: "REQ-0022",
    poNumber: "PO-2024-1156",
    assetName: "Surgical Instruments Set",
    assetType: "Surgical Equipment",
    department: "Surgery",
    quantity: 5,
    estimatedCost: 250000,
    urgency: "high",
    inventorySpecs: "Complete general surgery instrument set, stainless steel, autoclavable",
    suggestedVendor: "Surgical Supplies Inc",
    status: "po-created",
  },
];

const mockVendors: Vendor[] = [
  {
    id: 1,
    name: "MedTech Solutions",
    category: "Medical Equipment",
    rating: 4.8,
    totalPOs: 145,
    activeContracts: 8,
    compliance: "compliant",
  },
  {
    id: 2,
    name: "Surgical Supplies Inc",
    category: "Surgical Equipment",
    rating: 4.6,
    totalPOs: 98,
    activeContracts: 5,
    compliance: "compliant",
  },
  {
    id: 3,
    name: "Pharma Distributors Ltd",
    category: "Pharmaceuticals",
    rating: 4.5,
    totalPOs: 234,
    activeContracts: 12,
    compliance: "pending",
  },
  {
    id: 4,
    name: "Global Healthcare Supplies",
    category: "General Supplies",
    rating: 4.2,
    totalPOs: 67,
    activeContracts: 3,
    compliance: "compliant",
  },
];

const purchaseByCategory = [
  { category: "Medical Equipment", value: 45000000, orders: 145 },
  { category: "Surgical Supplies", value: 28000000, orders: 98 },
  { category: "Pharmaceuticals", value: 62000000, orders: 234 },
  { category: "General Supplies", value: 18000000, orders: 67 },
];

const vendorPerformance = [
  { name: "On-time Delivery", value: 87, color: "#0EB57D" },
  { name: "Delayed", value: 13, color: "#F59E0B" },
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
    comment: "Stock not available. Purchase required.",
  },
  {
    id: 6,
    role: "Purchase",
    approverName: "Emily Davis",
    approverInitials: "ED",
    status: "pending" as const,
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

export function PurchaseDashboard({
  onNavigate,
  managerName,
}: PurchaseDashboardProps) {
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [purchaseComment, setPurchaseComment] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [poAmount, setPoAmount] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreatePO = () => {
    if (!purchaseComment.trim() || !selectedVendor || !poAmount) {
      toast.error("Please fill all required fields");
      return;
    }
    toast.success("Purchase Order created successfully", {
      description: "PO forwarded to Budget Committee for approval",
    });
    setIsReviewDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setPurchaseComment("");
    setSelectedVendor("");
    setPoAmount("");
    setExpectedDelivery("");
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending-po":
        return <Badge className="bg-orange-100 text-orange-800">Pending PO Creation</Badge>;
      case "po-created":
        return <Badge className="bg-blue-100 text-blue-800">PO Created</Badge>;
      case "vendor-quote":
        return <Badge className="bg-yellow-100 text-yellow-800">Awaiting Quote</Badge>;
      case "po-sent":
        return <Badge className="bg-green-100 text-green-800">PO Sent to Vendor</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getComplianceBadge = (compliance: string) => {
    switch (compliance) {
      case "compliant":
        return <Badge className="bg-green-100 text-green-800">✓ Compliant</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Pending</Badge>;
      case "non-compliant":
        return <Badge variant="destructive">✗ Non-Compliant</Badge>;
      default:
        return <Badge variant="outline">{compliance}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#F0F9FF]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">{managerName} - Purchase Dashboard</h1>
                <p className="text-gray-500">Vendor Management & PO Tracking</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export POs
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="purchase-requests" className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="purchase-requests">
              Purchase Requests
              <Badge className="ml-2 bg-orange-100 text-orange-800">
                {mockPurchaseRequests.filter((r) => r.status === "pending-po").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="vendors">Vendor Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Purchase Requests Tab */}
          <TabsContent value="purchase-requests" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Pending POs</p>
                      <h2 className="mt-2 text-gray-900">1</h2>
                      <p className="text-orange-600 mt-1">Awaiting creation</p>
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
                      <p className="text-gray-500">Active POs</p>
                      <h2 className="mt-2 text-gray-900">24</h2>
                      <p className="text-blue-600 mt-1">In process</p>
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
                      <p className="text-gray-500">This Month POs</p>
                      <h2 className="mt-2 text-gray-900">67</h2>
                      <p className="text-green-600 mt-1">+12% vs last month</p>
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
                      <p className="text-gray-500">Total PO Value</p>
                      <h2 className="mt-2 text-gray-900">₹1.2Cr</h2>
                      <p className="text-gray-600 mt-1">This month</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Purchase Requests Table */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Requests from Inventory - Create Purchase Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-600">Request ID</th>
                        <th className="px-4 py-3 text-left text-gray-600">Asset</th>
                        <th className="px-4 py-3 text-left text-gray-600">Department</th>
                        <th className="px-4 py-3 text-left text-gray-600">Quantity</th>
                        <th className="px-4 py-3 text-left text-gray-600">Urgency</th>
                        <th className="px-4 py-3 text-left text-gray-600">Budget</th>
                        <th className="px-4 py-3 text-left text-gray-600">Status</th>
                        <th className="px-4 py-3 text-left text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {mockPurchaseRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">
                            {request.poNumber ? (
                              <div>
                                <p className="text-gray-900">{request.requestId}</p>
                                <p className="text-blue-600">{request.poNumber}</p>
                              </div>
                            ) : (
                              request.requestId
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-gray-900">{request.assetName}</p>
                              <p className="text-gray-500">{request.assetType}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{request.department}</td>
                          <td className="px-4 py-3 text-gray-900">{request.quantity}</td>
                          <td className="px-4 py-3">{getUrgencyBadge(request.urgency)}</td>
                          <td className="px-4 py-3 text-gray-900">
                            ₹{(request.estimatedCost / 1000).toFixed(0)}K
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(request.status)}</td>
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
                              {request.status === "pending-po" ? "Create PO" : "View"}
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

          {/* Vendors Tab */}
          <TabsContent value="vendors" className="space-y-6">
            {/* Vendor Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Total Vendors</p>
                      <h2 className="mt-2 text-gray-900">87</h2>
                      <p className="text-gray-600 mt-1">Active vendors</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-[#0F67FF]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Compliant</p>
                      <h2 className="mt-2 text-gray-900">78</h2>
                      <p className="text-green-600 mt-1">90% compliance</p>
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
                      <p className="text-gray-500">Active Contracts</p>
                      <h2 className="mt-2 text-gray-900">34</h2>
                      <p className="text-blue-600 mt-1">Ongoing</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Avg Rating</p>
                      <h2 className="mt-2 text-gray-900">4.6</h2>
                      <p className="text-yellow-600 mt-1">★★★★★</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Vendors Table */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Registered Vendors</CardTitle>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search vendors..."
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
                        <th className="px-4 py-3 text-left text-gray-600">Vendor Name</th>
                        <th className="px-4 py-3 text-left text-gray-600">Category</th>
                        <th className="px-4 py-3 text-left text-gray-600">Rating</th>
                        <th className="px-4 py-3 text-left text-gray-600">Total POs</th>
                        <th className="px-4 py-3 text-left text-gray-600">Active Contracts</th>
                        <th className="px-4 py-3 text-left text-gray-600">Compliance</th>
                        <th className="px-4 py-3 text-left text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {mockVendors.map((vendor) => (
                        <tr key={vendor.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">{vendor.name}</td>
                          <td className="px-4 py-3 text-gray-600">{vendor.category}</td>
                          <td className="px-4 py-3 text-gray-900">{vendor.rating} ★</td>
                          <td className="px-4 py-3 text-gray-600">{vendor.totalPOs}</td>
                          <td className="px-4 py-3 text-gray-600">{vendor.activeContracts}</td>
                          <td className="px-4 py-3">{getComplianceBadge(vendor.compliance)}</td>
                          <td className="px-4 py-3">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-2" />
                              View
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Purchase by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={purchaseByCategory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#0F67FF" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Vendor Performance - On-Time Delivery</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={vendorPerformance}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {vendorPerformance.map((entry, index) => (
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

      {/* Purchase Order Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Purchase Order - {selectedRequest?.requestId}</DialogTitle>
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
                  <p className="text-gray-600">Department</p>
                  <p className="text-gray-900">{selectedRequest.department}</p>
                </div>
                <div>
                  <p className="text-gray-600">Quantity</p>
                  <p className="text-gray-900">{selectedRequest.quantity} units</p>
                </div>
                <div>
                  <p className="text-gray-600">Estimated Budget</p>
                  <p className="text-gray-900">
                    ₹{(selectedRequest.estimatedCost / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">Inventory Specifications</p>
                  <p className="text-gray-900">{selectedRequest.inventorySpecs}</p>
                </div>
              </div>

              {/* Approval Timeline */}
              <div>
                <h3 className="text-gray-900 mb-4">Approval Progress</h3>
                <ApprovalTimeline steps={mockApprovalSteps} currentStep={5} />
              </div>

              {/* PO Creation Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-900 mb-2 block">
                      Select Vendor <span className="text-red-600">*</span>
                    </label>
                    <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose vendor..." />
                      </SelectTrigger>
                      <SelectContent>
                        {mockVendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.name}>
                            {vendor.name} - {vendor.rating}★
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-gray-900 mb-2 block">
                      PO Amount (₹) <span className="text-red-600">*</span>
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter PO amount"
                      value={poAmount}
                      onChange={(e) => setPoAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-gray-900 mb-2 block">
                      Expected Delivery Date
                    </label>
                    <Input
                      type="date"
                      value={expectedDelivery}
                      onChange={(e) => setExpectedDelivery(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-900 mb-2 block">
                    PO Terms & Conditions <span className="text-red-600">*</span>
                  </label>
                  <Textarea
                    placeholder="Vendor terms, warranty details, payment terms, delivery conditions..."
                    value={purchaseComment}
                    onChange={(e) => setPurchaseComment(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsReviewDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]"
                    onClick={handleCreatePO}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Create PO & Forward to Budget
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
