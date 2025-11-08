import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { RequestForm, RequestData } from "../shared/RequestForm";
import { ApprovalTimeline } from "../shared/ApprovalTimeline";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Package
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface RequestorDashboardProps {
  onNavigate: (screen: string) => void;
  userRole: string;
  userName: string;
  userDepartment: string;
}

interface Request {
  id: number;
  assetName: string;
  assetType: string;
  department: string;
  requestType: string;
  status: "pending" | "approved" | "rejected" | "in-progress" | "completed";
  urgency: "low" | "medium" | "high" | "critical";
  submittedDate: string;
  lastUpdate: string;
  currentApprover: string;
  estimatedCost?: number;
}

const mockRequests: Request[] = [
  {
    id: 1,
    assetName: "Ultrasound Machine",
    assetType: "Medical Equipment",
    department: "Radiology",
    requestType: "New Asset Purchase",
    status: "pending",
    urgency: "high",
    submittedDate: "2024-10-15",
    lastUpdate: "2024-10-16 10:30 AM",
    currentApprover: "Level 2 Approver",
    estimatedCost: 450000,
  },
  {
    id: 2,
    assetName: "ECG Machine",
    assetType: "Diagnostic Equipment",
    department: "Cardiology",
    requestType: "Maintenance Required",
    status: "approved",
    urgency: "medium",
    submittedDate: "2024-10-10",
    lastUpdate: "2024-10-14 03:45 PM",
    currentApprover: "Completed",
    estimatedCost: 15000,
  },
  {
    id: 3,
    assetName: "Surgical Table",
    assetType: "Surgical Tools",
    department: "Surgery",
    requestType: "Replacement",
    status: "in-progress",
    urgency: "high",
    submittedDate: "2024-10-12",
    lastUpdate: "2024-10-17 09:15 AM",
    currentApprover: "HOD",
    estimatedCost: 280000,
  },
  {
    id: 4,
    assetName: "Medicine Cabinet",
    assetType: "Pharmacy",
    department: "Pharmacy",
    requestType: "New Asset Purchase",
    status: "rejected",
    urgency: "low",
    submittedDate: "2024-10-08",
    lastUpdate: "2024-10-09 11:20 AM",
    currentApprover: "Level 1 Approver",
    estimatedCost: 12000,
  },
];

const mockApprovalSteps = [
  {
    id: 1,
    role: "Level 1",
    approverName: "Dr. Raj Kumar",
    approverInitials: "RK",
    status: "approved" as const,
    timestamp: "2024-10-15 02:30 PM",
    comment: "Approved. Medical necessity confirmed.",
  },
  {
    id: 2,
    role: "Level 2",
    approverName: "Dr. Priya Sharma",
    approverInitials: "PS",
    status: "pending" as const,
    timestamp: undefined,
    comment: undefined,
  },
  {
    id: 3,
    role: "Level 3",
    approverName: "Dr. Amit Patel",
    approverInitials: "AP",
    status: "not-reached" as const,
    timestamp: undefined,
    comment: undefined,
  },
  {
    id: 4,
    role: "HOD",
    approverName: "Dr. Sarah Johnson",
    approverInitials: "SJ",
    status: "not-reached" as const,
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
    approverName: "Michael Chen",
    approverInitials: "MC",
    status: "not-reached" as const,
    timestamp: undefined,
    comment: undefined,
  },
  {
    id: 8,
    role: "CFO",
    approverName: "Robert Wilson",
    approverInitials: "RW",
    status: "not-reached" as const,
    timestamp: undefined,
    comment: undefined,
  },
];

export function RequestorDashboard({
  onNavigate,
  userRole,
  userName,
  userDepartment,
}: RequestorDashboardProps) {
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isTimelineDialogOpen, setIsTimelineDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmitRequest = (data: RequestData) => {
    toast.success("Request submitted successfully!", {
      description: "Your request has been forwarded to Level 1 Approver",
    });
    setIsRequestDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">✓ Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">✗ Rejected</Badge>;
      case "pending":
        return <Badge className="bg-orange-100 text-orange-800">⏳ Pending</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800">⟳ In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">✓ Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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

  const filteredRequests = mockRequests.filter(
    (req) =>
      req.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.assetType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: mockRequests.length,
    pending: mockRequests.filter((r) => r.status === "pending").length,
    approved: mockRequests.filter((r) => r.status === "approved").length,
    rejected: mockRequests.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#F0F9FF]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-gray-900">{userName}</h1>
                  <p className="text-gray-500">{userDepartment} - Request Management</p>
                </div>
              </div>
            </div>
            <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]">
                  <Plus className="h-4 w-4 mr-2" />
                  Raise New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Submit Asset/Maintenance Request</DialogTitle>
                </DialogHeader>
                <RequestForm
                  onSubmit={handleSubmitRequest}
                  userDepartment={userDepartment}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Total Requests</p>
                  <h2 className="mt-2 text-gray-900">{stats.total}</h2>
                  <p className="text-blue-600 mt-1">All time</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-[#E8F0FF] to-[#D0E7FF] rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-[#0F67FF]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Pending</p>
                  <h2 className="mt-2 text-gray-900">{stats.pending}</h2>
                  <p className="text-orange-600 mt-1">Awaiting approval</p>
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
                  <p className="text-gray-500">Approved</p>
                  <h2 className="mt-2 text-gray-900">{stats.approved}</h2>
                  <p className="text-green-600 mt-1">Successfully approved</p>
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
                  <p className="text-gray-500">Rejected</p>
                  <h2 className="mt-2 text-gray-900">{stats.rejected}</h2>
                  <p className="text-red-600 mt-1">Need review</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-50 rounded-lg flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Requests Table */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Requests</CardTitle>
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
                    <th className="px-4 py-3 text-left text-gray-600">Asset</th>
                    <th className="px-4 py-3 text-left text-gray-600">Type</th>
                    <th className="px-4 py-3 text-left text-gray-600">Department</th>
                    <th className="px-4 py-3 text-left text-gray-600">Urgency</th>
                    <th className="px-4 py-3 text-left text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left text-gray-600">Current Stage</th>
                    <th className="px-4 py-3 text-left text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">
                        REQ-{String(request.id).padStart(4, "0")}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-gray-900">{request.assetName}</p>
                          <p className="text-gray-500">{request.assetType}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {request.requestType}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {request.department}
                      </td>
                      <td className="px-4 py-3">{getUrgencyBadge(request.urgency)}</td>
                      <td className="px-4 py-3">{getStatusBadge(request.status)}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {request.currentApprover}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsTimelineDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {request.status === "pending" && (
                            <>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Timeline Dialog */}
      <Dialog open={isTimelineDialogOpen} onOpenChange={setIsTimelineDialogOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Request Approval Timeline</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Request ID</p>
                    <p className="text-gray-900">
                      REQ-{String(selectedRequest.id).padStart(4, "0")}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Asset Name</p>
                    <p className="text-gray-900">{selectedRequest.assetName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Submitted Date</p>
                    <p className="text-gray-900">{selectedRequest.submittedDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                </div>
              </div>
              <ApprovalTimeline steps={mockApprovalSteps} currentStep={1} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
