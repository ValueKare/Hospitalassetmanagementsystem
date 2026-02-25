import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Plus, FileCheck, Clock, CheckCircle2, AlertCircle, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "../ui/progress";

interface Audit {
  _id: string;
  auditCode: string;
  hospitalId: {
    _id: string;
    name: string;
    hospitalId: string;
  };
  auditType: string;
  status: string;
  startedAt: string;
  createdAt: string;
  periodFrom?: string;
  periodTo?: string;
  assignedAuditors: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  initiatedBy: {
    _id: string;
    name: string;
    email: string;
  };
  stats: {
    totalAssets: number;
    verifiedAssets: number;
    discrepancyAssets: number;
    verificationRate: number;
  };
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
}

interface AuditRequest {
  _id: string;
  auditId: {
    _id: string;
    auditCode: string;
  };
  hospitalId: {
    _id: string;
    name: string;
    hospitalId: string;
  };
  hospitalName: string;
  requesterId: {
    _id: string;
    name?: string;
    username?: string;
    email: string;
  };
  requesterName: string;
  requestDate: string;
  auditType: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: {
    _id: string;
    name?: string;
    username?: string;
    email: string;
  };
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

interface AuditManagementProps {
  onNavigate: (screen: string) => void;
  selectedEntity?: any;
}

export function AuditManagement({ onNavigate, selectedEntity }: AuditManagementProps) {
  const [isGenerateAuditOpen, setIsGenerateAuditOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [entityHospitals, setEntityHospitals] = useState<any[]>([]);
  const [auditAdmins, setAuditAdmins] = useState<any[]>([]);
  const [selectedAuditor, setSelectedAuditor] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [dateError, setDateError] = useState("");
  const [auditType, setAuditType] = useState("");
  const [notes, setNotes] = useState("");
  const [activeAudits, setActiveAudits] = useState<Audit[]>([]);
  const [auditsLoading, setAuditsLoading] = useState(false);
  const [auditRequests, setAuditRequests] = useState<AuditRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20
  });
  const [requestsPagination, setRequestsPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20
  });

  // Stats state
  const [stats, setStats] = useState({
    activeCount: 0,
    completedCount: 0,
    pendingCount: 0,
    thisMonthCount: 0
  });

  // Fetch hospitals and audit admins when selectedEntity changes
  useEffect(() => {
    const fetchEntityHospitals = async () => {
      try {
        if (selectedEntity && selectedEntity.code) {
          const token = localStorage.getItem('accessToken');
          if (!token) {
            toast.error("Authentication token missing. Please log in again.");
            return;
          }

          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/hospitals?entityCode=${selectedEntity.code}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const json = await res.json();
          if (json.success && json.hospitals) {
            setEntityHospitals(json.hospitals);
          }
        }
      } catch (err) {
        console.error('Failed to load entity hospitals:', err);
        toast.error("Failed to load entity hospitals");
      }
    };

    const fetchAuditAdmins = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          toast.error("Authentication token missing. Please log in again.");
          return;
        }

        const params = new URLSearchParams();
        params.append('role', 'audit');
        if (selectedEntity?.code) {
          params.append('organizationId', selectedEntity.code);
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/employee/all?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const json = await res.json();
        if (json.success && json.data) {
          const adminList = Array.isArray(json.data) ? json.data : json.data.users || [];
          setAuditAdmins(adminList);
        }
      } catch (err) {
        console.error('Failed to load audit admins:', err);
        toast.error("Failed to load audit admins");
      }
    };

    if (selectedEntity && selectedEntity.code) {
      fetchEntityHospitals();
    }
    fetchAuditAdmins();
    fetchActiveAudits();
    fetchAuditRequests();
    fetchAuditStats();
  }, [selectedEntity]);

  // Fetch active audits from backend
  const fetchActiveAudits = async () => {
    try {
      setAuditsLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error("Authentication token missing. Please log in again.");
        return;
      }

      const params = new URLSearchParams();
      params.append('status', 'in_progress');
      params.append('page', '1');
      params.append('limit', '20');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/audit?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch audits');
      }

      setActiveAudits(data.audits || []);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching active audits:', err);
      toast.error('Failed to load active audits');
    } finally {
      setAuditsLoading(false);
    }
  };

  // Fetch audit stats for dashboard cards
  const fetchAuditStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      // Fetch all audits to calculate stats
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/audit?status=all&limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) return;

      const allAudits = data.audits || [];
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Calculate stats
      const activeCount = allAudits.filter((audit: Audit) => audit.status === 'in_progress').length;
      const completedCount = allAudits.filter((audit: Audit) => audit.status === 'closed').length;
      
      // Count audits created this month
      const thisMonthCount = allAudits.filter((audit: Audit) => {
        const auditDate = new Date(audit.startedAt || audit.createdAt);
        return auditDate.getMonth() === currentMonth && auditDate.getFullYear() === currentYear;
      }).length;

      setStats(prev => ({
        ...prev,
        activeCount,
        completedCount,
        thisMonthCount
      }));
    } catch (err) {
      console.error('Error fetching audit stats:', err);
    }
  };

  // Update pending count when auditRequests change
  useEffect(() => {
    const pendingCount = auditRequests.filter(req => req.status === 'pending').length;
    setStats(prev => ({ ...prev, pendingCount }));
  }, [auditRequests]);

  // Generate unique audit code
  const generateAuditCode = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100 + Math.random() * 900); // 3-digit random number
    return `AUD-${year}-${randomNum}`;
  };

  const handleGenerateAudit = async () => {
    // Validate required fields
    if (!selectedHospital) {
      toast.error("Please select a hospital");
      return;
    }
    if (!auditType) {
      toast.error("Please select an audit type");
      return;
    }
    if (!selectedAuditor) {
      toast.error("Please assign an auditor");
      return;
    }

    // Validate dates
    if (startDate && deadline) {
      if (new Date(startDate) >= new Date(deadline)) {
        setDateError("Start date must be before deadline");
        toast.error("Start date must be before deadline");
        return;
      }
    }
    setDateError("");

    // Generate audit code
    const auditCode = generateAuditCode();

    // Prepare API payload matching backend expectations
    const auditPayload = {
      auditCode,
      hospitalId: selectedHospital, // Backend expects hospitalId string, converts to ObjectId
      auditType: auditType, // Frontend now uses same values as backend: statutory, internal, physical, surprise
      periodFrom: startDate || undefined,
      periodTo: deadline || undefined,
      assignedAuditors: selectedAuditor ? [selectedAuditor] : [],
      remarks: notes || undefined
    };

    console.log('Audit payload:', auditPayload);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error("Authentication token missing. Please log in again.");
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/audit/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(auditPayload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to initiate audit');
      }

      toast.success(`Audit request created successfully! Audit Code: ${auditCode}. Pending SuperAdmin approval.`);
      setIsGenerateAuditOpen(false);

      // Reset form after submission
      setSelectedHospital("");
      setAuditType("");
      setSelectedAuditor("");
      setStartDate("");
      setDeadline("");
      setNotes("");

      // Refresh both lists
      fetchAuditRequests();
      fetchActiveAudits();

    } catch (error) {
      console.error('Error initiating audit:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to initiate audit');
    }
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    setDateError("");
    // If deadline is already set and is before start date, clear deadline
    if (deadline && new Date(value) >= new Date(deadline)) {
      setDeadline("");
    }
  };

  const handleDeadlineChange = (value: string) => {
    if (startDate && new Date(value) <= new Date(startDate)) {
      setDateError("Deadline must be after start date");
      toast.error("Deadline must be after start date");
      return;
    }
    setDateError("");
    setDeadline(value);
  };

  // Fetch audit requests from backend
  const fetchAuditRequests = async () => {
    try {
      setRequestsLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error("Authentication token missing. Please log in again.");
        return;
      }

      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('limit', '20');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/audit/requests?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch audit requests');
      }

      setAuditRequests(data.requests || []);
      setRequestsPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching audit requests:', err);
      toast.error('Failed to load audit requests');
    } finally {
      setRequestsLoading(false);
    }
  };

  // Handle approve audit request
  const handleApproveRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error("Authentication token missing. Please log in again.");
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/audit/requests/${requestId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to approve audit request');
      }

      toast.success(`Audit request approved! ${data.totalAssets} assets assigned.`);
      
      // Refresh both lists
      fetchAuditRequests();
      fetchActiveAudits();
    } catch (error) {
      console.error('Error approving audit request:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to approve audit request');
    }
  };

  // Handle reject audit request
  const handleRejectRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error("Authentication token missing. Please log in again.");
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/audit/requests/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason: 'Rejected by SuperAdmin' })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reject audit request');
      }

      toast.success('Audit request rejected');
      
      // Refresh the list
      fetchAuditRequests();
    } catch (error) {
      console.error('Error rejecting audit request:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to reject audit request');
    }
  };

  return (
    <div className="flex-1 p-8 bg-[#F9FAFB] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Audit Management</h1>
        <p className="text-gray-600">Generate, monitor, and approve audits across all hospitals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-600">Active Audits</CardTitle>
              <Clock className="h-5 w-5 text-[#0F67FF]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{stats.activeCount}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-600">Completed</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-[#0EB57D]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#0EB57D]">{stats.completedCount}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-600">Pending Requests</CardTitle>
              <AlertCircle className="h-5 w-5 text-[#F59E0B]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#F59E0B]">{stats.pendingCount}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-600">This Month</CardTitle>
              <FileCheck className="h-5 w-5 text-[#8B5CF6]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{stats.thisMonthCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="active" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="active">Active Audits</TabsTrigger>
            <TabsTrigger value="requests">Audit Requests</TabsTrigger>
            <TabsTrigger value="completed">Completed Audits</TabsTrigger>
          </TabsList>

          {/* New Audit Form */}
          <Dialog open={isGenerateAuditOpen} onOpenChange={setIsGenerateAuditOpen}>
            <DialogTrigger asChild>
              <Button className="bg-linear-to-r from-[#0F67FF] to-[#0B4FCC]">
                <Plus className="h-4 w-4 mr-2" />
                Generate Audit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Generate New Audit</DialogTitle>
                <DialogDescription>Create a new audit for a hospital entity</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="audit-hospital">Select Hospital</Label>
                  <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a hospital" />
                    </SelectTrigger>
                    <SelectContent>
                      {entityHospitals.map((hospital) => (
                        <SelectItem key={hospital._id || hospital.hospitalId} value={hospital.hospitalId}>
                          {hospital.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audit-type">Audit Type</Label>
                  <Select value={auditType} onValueChange={setAuditType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audit type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="statutory">Statutory Audit</SelectItem>
                      <SelectItem value="internal">Internal Audit</SelectItem>
                      <SelectItem value="physical">Physical Audit</SelectItem>
                      <SelectItem value="surprise">Surprise Audit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auditor">Assign Auditor</Label>
                  <Select value={selectedAuditor} onValueChange={setSelectedAuditor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select auditor" />
                    </SelectTrigger>
                    <SelectContent>
                      {auditAdmins.length === 0 ? (
                        <SelectItem value="none" disabled>No audit admins available</SelectItem>
                      ) : (
                        auditAdmins.map((admin) => (
                          <SelectItem key={admin._id} value={admin._id}>
                            {admin.name || admin.username || admin.email} ({admin.role})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className={dateError ? "border-red-500" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={deadline}
                      onChange={(e) => handleDeadlineChange(e.target.value)}
                      min={startDate ? new Date(new Date(startDate).getTime() + 86400000).toISOString().split('T')[0] : undefined}
                      className={dateError ? "border-red-500" : ""}
                    />
                  </div>
                </div>
                {dateError && (
                  <p className="text-sm text-red-500">{dateError}</p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Add any special instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsGenerateAuditOpen(false)}>Cancel</Button>
                <Button onClick={handleGenerateAudit} className="bg-linear-to-r from-[#0F67FF] to-[#0B4FCC]">
                  Generate Audit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Audits Tab */}
        <TabsContent value="active">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-gray-900">Active Audits</CardTitle>
              <CardDescription>Currently ongoing audit operations</CardDescription>
            </CardHeader>
            <CardContent>
              {auditsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F67FF] mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading audits...</p>
                  </div>
                </div>
              ) : activeAudits.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No active audits found</p>
                  <p className="text-sm text-gray-400 mt-1">Generate a new audit to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeAudits.map((audit) => (
                    <div key={audit._id} className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-gray-900 mb-1">{audit.hospitalId?.name || 'Unknown Hospital'}</h3>
                          <p className="text-sm text-gray-500 mb-2">Audit Code: {audit.auditCode}</p>
                          <div className="flex items-center gap-4 text-gray-600">
                            <span>Auditor: {audit.assignedAuditors?.map(a => a.name).join(', ') || 'Not assigned'}</span>
                            <span>•</span>
                            <span>Started: {new Date(audit.startedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Badge className="bg-[#0F67FF] hover:bg-[#0F67FF]">In Progress</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-gray-600">
                          <span>Assets Audited: {audit.stats?.verifiedAssets || 0} / {audit.stats?.totalAssets || 0}</span>
                          <span>{audit.stats?.verificationRate || 0}%</span>
                        </div>
                        <Progress value={parseFloat(String(audit.stats?.verificationRate || 0))} className="h-2" />
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={() => onNavigate("audit-details")}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export Report
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Requests Tab */}
        <TabsContent value="requests">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-gray-900">Audit Requests</CardTitle>
              <CardDescription>Review and approve audit requests from hospitals</CardDescription>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F67FF] mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading audit requests...</p>
                  </div>
                </div>
              ) : auditRequests.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No audit requests found</p>
                  <p className="text-sm text-gray-400 mt-1">Generate a new audit to create a request</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hospital</TableHead>
                      <TableHead>Requester</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Audit Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditRequests.map((request) => (
                      <TableRow key={request._id}>
                        <TableCell>{request.hospitalName || request.hospitalId?.name || 'Unknown Hospital'}</TableCell>
                        <TableCell className="text-gray-600">
                          {request.requesterName || request.requesterId?.name || request.requesterId?.username || request.requesterId?.email || 'Unknown'}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {request.requestDate ? new Date(request.requestDate).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-gray-600 capitalize">{request.auditType}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={request.status === "pending" ? "secondary" : "default"}
                            className={
                              request.status === "approved" 
                                ? "bg-[#0EB57D] hover:bg-[#0EB57D]" 
                                : request.status === "rejected"
                                ? "bg-red-500 hover:bg-red-500"
                                : ""
                            }
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {request.status === "pending" && (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                className="bg-[#0EB57D] hover:bg-[#0EB57D]/90"
                                onClick={() => handleApproveRequest(request._id)}
                              >
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => handleRejectRequest(request._id)}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                          {request.status === "approved" && (
                            <span className="text-sm text-gray-500">
                              Approved by {request.approvedBy?.name || request.approvedBy?.username || 'SuperAdmin'}
                            </span>
                          )}
                          {request.status === "rejected" && (
                            <span className="text-sm text-red-500" title={request.rejectionReason}>
                              Rejected
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed Audits Tab */}
        <TabsContent value="completed">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-gray-900">Completed Audits</CardTitle>
              <CardDescription>Historical audit records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeAudits.filter(a => a.status === "closed").map((audit) => (
                  <div key={audit._id} className="p-6 border rounded-lg bg-green-50 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-gray-900 mb-1">{audit.hospitalId?.name || 'Unknown Hospital'}</h3>
                        <p className="text-sm text-gray-500 mb-2">Audit Code: {audit.auditCode}</p>
                        <div className="flex items-center gap-4 text-gray-600">
                          <span>Auditor: {audit.assignedAuditors?.map(a => a.name).join(', ') || 'Not assigned'}</span>
                          <span>•</span>
                          <span>Completed: {new Date(audit.startedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge className="bg-[#0EB57D] hover:bg-[#0EB57D]">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-4 text-gray-600">
                      <span>Total Assets Audited: {audit.stats?.totalAssets || 0}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => onNavigate("audit-details")}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Report
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
