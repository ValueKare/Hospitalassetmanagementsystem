import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { ApprovalTimeline } from "../shared/ApprovalTimeline";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  Filter,
  Search,
  FileText,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface ApproverDashboardProps {
  onNavigate: (screen: string) => void;
  approverLevel: string; // "level-1", "level-2", "level-3"
  approverName: string;
}

interface PendingRequest {
  id: number;
  requestId: string;
  assetName: string;
  assetType: string;
  department: string;
  requestType: string;
  urgency: "low" | "medium" | "high" | "critical";
  estimatedCost: number;
  requestedBy: string;
  submittedDate: string;
  description: string;
  previousApprovals: { approver: string; status: string; comment: string }[];
}

const mockPendingRequests: PendingRequest[] = [
  {
    id: 1,
    requestId: "REQ-0001",
    assetName: "Ultrasound Machine",
    assetType: "Medical Equipment",
    department: "Radiology",
    requestType: "New Asset Purchase",
    urgency: "high",
    estimatedCost: 450000,
    requestedBy: "Dr. Sarah Johnson",
    submittedDate: "2024-10-15",
    description: "Required for advanced diagnostic imaging in radiology department. Current machine is outdated and causing delays.",
    previousApprovals: [
      {
        approver: "Dr. Raj Kumar (Level 1)",
        status: "approved",
        comment: "Medical necessity confirmed. Approved for next level.",
      },
    ],
  },
  {
    id: 2,
    requestId: "REQ-0003",
    assetName: "Surgical Table",
    assetType: "Surgical Tools",
    department: "Surgery",
    requestType: "Replacement",
    urgency: "critical",
    estimatedCost: 280000,
    requestedBy: "Dr. Michael Chen",
    submittedDate: "2024-10-12",
    description: "Existing surgical table has mechanical issues. Urgent replacement needed for patient safety.",
    previousApprovals: [
      {
        approver: "Dr. Raj Kumar (Level 1)",
        status: "approved",
        comment: "Critical requirement. Fast-track approval recommended.",
      },
    ],
  },
  {
    id: 3,
    requestId: "REQ-0005",
    assetName: "Patient Monitoring System",
    assetType: "Medical Equipment",
    department: "ICU",
    requestType: "New Asset Purchase",
    urgency: "high",
    estimatedCost: 320000,
    requestedBy: "Dr. Priya Sharma",
    submittedDate: "2024-10-16",
    description: "Additional monitoring systems required for expanded ICU capacity.",
    previousApprovals: [
      {
        approver: "Dr. Raj Kumar (Level 1)",
        status: "approved",
        comment: "ICU expansion project approved. Equipment required.",
      },
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

export function ApproverDashboard({
  onNavigate,
  approverLevel,
  approverName,
}: ApproverDashboardProps) {
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isTimelineDialogOpen, setIsTimelineDialogOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleApprove = () => {
    if (!comment.trim()) {
      toast.error("Comment is required for approval");
      return;
    }

    toast.success("Request approved successfully!", {
      description: `Forwarded to ${getLevelDisplay(approverLevel, "next")}`,
    });
    setIsApprovalDialogOpen(false);
    setComment("");
    setSelectedRequest(null);
  };

  const handleReject = () => {
    if (!comment.trim()) {
      toast.error("Comment is required for rejection");
      return;
    }

    toast.success("Request rejected", {
      description: "Notification sent to requester",
    });
    setIsApprovalDialogOpen(false);
    setComment("");
    setSelectedRequest(null);
  };

  const getLevelDisplay = (level: string, type: "current" | "next") => {
    const levels: { [key: string]: { current: string; next: string } } = {
      "level-1": { current: "Level 1 Approver", next: "Level 2 Approver" },
      "level-2": { current: "Level 2 Approver", next: "Level 3 Approver" },
      "level-3": { current: "Level 3 Approver", next: "Department HOD" },
    };
    return levels[level]?.[type] || "Approver";
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

  const filteredRequests = mockPendingRequests.filter((req) => {
    const matchesDepartment = filterDepartment === "all" || req.department === filterDepartment;
    const matchesSearch =
      req.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requestId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#F0F9FF]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-gray-900">{approverName}</h1>
                  <p className="text-gray-500">{getLevelDisplay(approverLevel, "current")}</p>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white">
                {approverName.split(" ").map((n) => n[0]).join("")}
              </span>
            </div>
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
                  <p className="text-gray-500">Pending Approvals</p>
                  <h2 className="mt-2 text-gray-900">{mockPendingRequests.length}</h2>
                  <p className="text-orange-600 mt-1">Action required</p>
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
                  <p className="text-gray-500">Critical Requests</p>
                  <h2 className="mt-2 text-gray-900">1</h2>
                  <p className="text-red-600 mt-1">Immediate attention</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-50 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Approved Today</p>
                  <h2 className="mt-2 text-gray-900">5</h2>
                  <p className="text-green-600 mt-1">Successfully processed</p>
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
                  <p className="text-gray-500">Rejected Today</p>
                  <h2 className="mt-2 text-gray-900">2</h2>
                  <p className="text-red-600 mt-1">With comments</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-50 rounded-lg flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pending Approvals</CardTitle>
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
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Radiology">Radiology</SelectItem>
                    <SelectItem value="Surgery">Surgery</SelectItem>
                    <SelectItem value="ICU">ICU</SelectItem>
                    <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-gray-900">{request.assetName}</h3>
                        {getUrgencyBadge(request.urgency)}
                        <Badge variant="outline">{request.department}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-gray-500">Request ID</p>
                          <p className="text-gray-900">{request.requestId}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Type</p>
                          <p className="text-gray-900">{request.requestType}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Requested By</p>
                          <p className="text-gray-900">{request.requestedBy}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Est. Cost</p>
                          <p className="text-gray-900">₹{request.estimatedCost.toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="text-gray-600">{request.description}</p>
                      
                      {/* Previous Approvals */}
                      {request.previousApprovals.length > 0 && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                          <p className="text-green-800 mb-2">Previous Approvals:</p>
                          {request.previousApprovals.map((approval, index) => (
                            <div key={index} className="flex items-start space-x-2 mb-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                              <div>
                                <p className="text-gray-900">{approval.approver}</p>
                                <p className="text-gray-600">{approval.comment}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRequest(request);
                          setIsTimelineDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Timeline
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setSelectedRequest(request);
                          setIsApprovalDialogOpen(true);
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Request</DialogTitle>
            <DialogDescription>
              Approve or reject this request with mandatory comments
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-gray-900 mb-2">{selectedRequest.assetName}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-gray-600">Request ID</p>
                    <p className="text-gray-900">{selectedRequest.requestId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Department</p>
                    <p className="text-gray-900">{selectedRequest.department}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Estimated Cost</p>
                    <p className="text-gray-900">₹{selectedRequest.estimatedCost.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Urgency</p>
                    {getUrgencyBadge(selectedRequest.urgency)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">
                  Comment <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="comment"
                  placeholder="Enter your approval/rejection comments..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsApprovalDialogOpen(false);
                    setComment("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleApprove}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Timeline Dialog */}
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
                    <p className="text-gray-900">{selectedRequest.requestId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Asset Name</p>
                    <p className="text-gray-900">{selectedRequest.assetName}</p>
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

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-gray-700">
      {children}
    </label>
  );
}
