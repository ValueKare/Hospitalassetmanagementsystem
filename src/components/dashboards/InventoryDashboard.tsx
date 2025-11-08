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
  DialogTrigger,
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
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Package,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Eye,
  Send,
  Search,
  Filter,
  FileText,
  Download,
  Warehouse,
  PackageCheck,
  PackageX,
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface InventoryDashboardProps {
  onNavigate: (screen: string) => void;
  managerName: string;
}

interface ApprovedRequest {
  id: number;
  requestId: string;
  assetName: string;
  assetType: string;
  department: string;
  quantity: number;
  estimatedCost: number;
  urgency: "low" | "medium" | "high" | "critical";
  requestedBy: string;
  approvedBy: string[];
  hodApprovedDate: string;
  stockAvailable: boolean;
}

interface StockItem {
  id: number;
  assetName: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  lastRestocked: string;
  status: "optimal" | "low" | "critical" | "out-of-stock";
}

const mockApprovedRequests: ApprovedRequest[] = [
  {
    id: 1,
    requestId: "REQ-0015",
    assetName: "Ventilator",
    assetType: "Medical Equipment",
    department: "ICU",
    quantity: 2,
    estimatedCost: 700000,
    urgency: "critical",
    requestedBy: "Dr. Sarah Johnson",
    approvedBy: ["Level 1", "Level 2", "Level 3", "HOD"],
    hodApprovedDate: "2024-11-05",
    stockAvailable: false,
  },
  {
    id: 2,
    requestId: "REQ-0018",
    assetName: "Patient Monitor",
    assetType: "Diagnostic Equipment",
    department: "Emergency",
    quantity: 5,
    estimatedCost: 600000,
    urgency: "high",
    requestedBy: "Nurse Emily Davis",
    approvedBy: ["Level 1", "Level 2", "HOD"],
    hodApprovedDate: "2024-11-04",
    stockAvailable: true,
  },
];

const mockStockItems: StockItem[] = [
  {
    id: 1,
    assetName: "Surgical Gloves",
    category: "Medical Supplies",
    currentStock: 2500,
    minStock: 5000,
    maxStock: 15000,
    unit: "boxes",
    lastRestocked: "2024-10-28",
    status: "low",
  },
  {
    id: 2,
    assetName: "N95 Masks",
    category: "Medical Supplies",
    currentStock: 800,
    minStock: 2000,
    maxStock: 10000,
    unit: "boxes",
    lastRestocked: "2024-10-15",
    status: "critical",
  },
  {
    id: 3,
    assetName: "Syringes (10ml)",
    category: "Medical Supplies",
    currentStock: 0,
    minStock: 1000,
    maxStock: 8000,
    unit: "boxes",
    lastRestocked: "2024-09-20",
    status: "out-of-stock",
  },
  {
    id: 4,
    assetName: "IV Fluid Sets",
    category: "Medical Supplies",
    currentStock: 8500,
    minStock: 3000,
    maxStock: 12000,
    unit: "units",
    lastRestocked: "2024-11-01",
    status: "optimal",
  },
];

const stockTrends = [
  { month: "Jun", inbound: 450, outbound: 380 },
  { month: "Jul", inbound: 520, outbound: 420 },
  { month: "Aug", inbound: 480, outbound: 460 },
  { month: "Sep", inbound: 610, outbound: 510 },
  { month: "Oct", inbound: 580, outbound: 540 },
  { month: "Nov", inbound: 380, outbound: 420 },
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
    comment: "Approved for urgent requirement.",
  },
  {
    id: 5,
    role: "Inventory",
    approverName: "John Smith",
    approverInitials: "JS",
    status: "pending" as const,
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

export function InventoryDashboard({
  onNavigate,
  managerName,
}: InventoryDashboardProps) {
  const [selectedRequest, setSelectedRequest] = useState<ApprovedRequest | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [inventoryComment, setInventoryComment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("all");

  const handleStockAvailable = () => {
    if (!inventoryComment.trim()) {
      toast.error("Please provide stock details");
      return;
    }
    toast.success("Stock allocated successfully", {
      description: "Request marked as fulfilled",
    });
    setIsReviewDialogOpen(false);
    setInventoryComment("");
  };

  const handleForwardToPurchase = () => {
    if (!inventoryComment.trim()) {
      toast.error("Please provide purchase specifications");
      return;
    }
    toast.success("Request forwarded to Purchase Department", {
      description: "Purchase order creation initiated",
    });
    setIsReviewDialogOpen(false);
    setInventoryComment("");
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

  const getStockStatusBadge = (status: string) => {
    switch (status) {
      case "optimal":
        return <Badge className="bg-green-100 text-green-800">✓ Optimal</Badge>;
      case "low":
        return <Badge className="bg-yellow-100 text-yellow-800">⚠ Low Stock</Badge>;
      case "critical":
        return <Badge className="bg-orange-100 text-orange-800">⚠ Critical</Badge>;
      case "out-of-stock":
        return <Badge variant="destructive">✗ Out of Stock</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredStock = mockStockItems.filter((item) => {
    const matchesSearch = item.assetName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = stockFilter === "all" || item.status === stockFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#F0F9FF]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Warehouse className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">{managerName} - Inventory Dashboard</h1>
                <p className="text-gray-500">Stock Management & Request Processing</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Inventory
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="pending-requests" className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="pending-requests">
              Pending Requests
              <Badge className="ml-2 bg-orange-100 text-orange-800">
                {mockApprovedRequests.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="stock-management">Stock Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Pending Requests Tab */}
          <TabsContent value="pending-requests" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Pending Review</p>
                      <h2 className="mt-2 text-gray-900">2</h2>
                      <p className="text-orange-600 mt-1">Awaiting action</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Stock Available</p>
                      <h2 className="mt-2 text-gray-900">1</h2>
                      <p className="text-green-600 mt-1">Can fulfill</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-lg flex items-center justify-center">
                      <PackageCheck className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Need Purchase</p>
                      <h2 className="mt-2 text-gray-900">1</h2>
                      <p className="text-blue-600 mt-1">Forward to PO</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-[#0F67FF]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Total Value</p>
                      <h2 className="mt-2 text-gray-900">₹13L</h2>
                      <p className="text-gray-600 mt-1">This month</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Requests Table */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Requests Approved by HOD - Awaiting Stock Check</CardTitle>
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
                        <th className="px-4 py-3 text-left text-gray-600">Cost</th>
                        <th className="px-4 py-3 text-left text-gray-600">Stock Status</th>
                        <th className="px-4 py-3 text-left text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {mockApprovedRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">{request.requestId}</td>
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
                          <td className="px-4 py-3">
                            {request.stockAvailable ? (
                              <Badge className="bg-green-100 text-green-800">
                                ✓ Available
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">
                                ✗ Not Available
                              </Badge>
                            )}
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
                              Process
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

          {/* Stock Management Tab */}
          <TabsContent value="stock-management" className="space-y-6">
            {/* Stock Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Total SKUs</p>
                      <h2 className="mt-2 text-gray-900">1,245</h2>
                      <p className="text-gray-600 mt-1">Active items</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-[#0F67FF]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Low Stock Items</p>
                      <h2 className="mt-2 text-gray-900">34</h2>
                      <p className="text-yellow-600 mt-1">Need reorder</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg flex items-center justify-center">
                      <TrendingDown className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Out of Stock</p>
                      <h2 className="mt-2 text-gray-900">8</h2>
                      <p className="text-red-600 mt-1">Urgent action</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-50 rounded-lg flex items-center justify-center">
                      <PackageX className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Inventory Value</p>
                      <h2 className="mt-2 text-gray-900">₹8.5Cr</h2>
                      <p className="text-green-600 mt-1">Total worth</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-lg flex items-center justify-center">
                      <Warehouse className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stock Items Table */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Current Stock Levels</CardTitle>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search stock..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={stockFilter} onValueChange={setStockFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Items</SelectItem>
                        <SelectItem value="optimal">Optimal</SelectItem>
                        <SelectItem value="low">Low Stock</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-600">Asset Name</th>
                        <th className="px-4 py-3 text-left text-gray-600">Category</th>
                        <th className="px-4 py-3 text-left text-gray-600">Current Stock</th>
                        <th className="px-4 py-3 text-left text-gray-600">Min Stock</th>
                        <th className="px-4 py-3 text-left text-gray-600">Max Stock</th>
                        <th className="px-4 py-3 text-left text-gray-600">Status</th>
                        <th className="px-4 py-3 text-left text-gray-600">Last Restocked</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredStock.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">{item.assetName}</td>
                          <td className="px-4 py-3 text-gray-600">{item.category}</td>
                          <td className="px-4 py-3 text-gray-900">
                            {item.currentStock} {item.unit}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {item.minStock} {item.unit}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {item.maxStock} {item.unit}
                          </td>
                          <td className="px-4 py-3">{getStockStatusBadge(item.status)}</td>
                          <td className="px-4 py-3 text-gray-600">{item.lastRestocked}</td>
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
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Stock Movement Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stockTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="inbound"
                      stroke="#0EB57D"
                      name="Stock In"
                    />
                    <Line
                      type="monotone"
                      dataKey="outbound"
                      stroke="#F59E0B"
                      name="Stock Out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Request Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Process Request - {selectedRequest?.requestId}</DialogTitle>
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
                  <p className="text-gray-600">Quantity Required</p>
                  <p className="text-gray-900">{selectedRequest.quantity} units</p>
                </div>
                <div>
                  <p className="text-gray-600">Estimated Cost</p>
                  <p className="text-gray-900">
                    ₹{(selectedRequest.estimatedCost / 1000).toFixed(0)}K
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Stock Available</p>
                  {selectedRequest.stockAvailable ? (
                    <Badge className="bg-green-100 text-green-800">✓ Yes</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">✗ No - Need Purchase</Badge>
                  )}
                </div>
                <div>
                  <p className="text-gray-600">Urgency</p>
                  {getUrgencyBadge(selectedRequest.urgency)}
                </div>
              </div>

              {/* Approval Timeline */}
              <div>
                <h3 className="text-gray-900 mb-4">Approval Progress</h3>
                <ApprovalTimeline steps={mockApprovalSteps} currentStep={4} />
              </div>

              {/* Action Section */}
              <div className="space-y-4">
                <div>
                  <label className="text-gray-900 mb-2 block">
                    Inventory Comments/Specifications{" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <Textarea
                    placeholder={
                      selectedRequest.stockAvailable
                        ? "Provide stock allocation details, warehouse location, expected delivery date..."
                        : "Provide purchase specifications, preferred vendors, technical requirements..."
                    }
                    value={inventoryComment}
                    onChange={(e) => setInventoryComment(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsReviewDialogOpen(false);
                      setInventoryComment("");
                    }}
                  >
                    Cancel
                  </Button>
                  {selectedRequest.stockAvailable ? (
                    <Button
                      className="bg-gradient-to-r from-green-600 to-green-700"
                      onClick={handleStockAvailable}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Allocate Stock & Fulfill
                    </Button>
                  ) : (
                    <Button
                      className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]"
                      onClick={handleForwardToPurchase}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Forward to Purchase
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
