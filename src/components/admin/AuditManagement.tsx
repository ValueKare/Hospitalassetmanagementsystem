import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ClipboardCheck, Plus, FileCheck, Clock, CheckCircle2, AlertCircle, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "../ui/progress";

interface AuditManagementProps {
  onNavigate: (screen: string) => void;
}

const activeAudits = [
  { id: 1, hospital: "City General Hospital", auditor: "Jane Auditor", startDate: "2025-10-01", progress: 65, status: "in-progress", totalAssets: 1245, auditedAssets: 809 },
  { id: 2, hospital: "Metro Medical Center", auditor: "John Smith", startDate: "2025-09-15", progress: 100, status: "completed", totalAssets: 980, auditedAssets: 980 },
  { id: 3, hospital: "Community Hospital", auditor: "Jane Auditor", startDate: "2025-10-10", progress: 45, status: "in-progress", totalAssets: 756, auditedAssets: 340 },
];

const auditRequests = [
  { id: 1, hospital: "Regional Health Center", requester: "Sarah Johnson", requestDate: "2025-10-14", reason: "Annual compliance audit", status: "pending" },
  { id: 2, hospital: "Suburban Clinic", requester: "Michael Chen", requestDate: "2025-10-12", reason: "Asset verification", status: "approved" },
];

export function AuditManagement({ onNavigate }: AuditManagementProps) {
  const [isGenerateAuditOpen, setIsGenerateAuditOpen] = useState(false);

  const handleGenerateAudit = () => {
    toast.success("Audit generated successfully!");
    setIsGenerateAuditOpen(false);
  };

  const handleApproveRequest = (id: number) => {
    toast.success("Audit request approved!");
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
            <p className="text-gray-900">12</p>
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
            <p className="text-[#0EB57D]">48</p>
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
            <p className="text-[#F59E0B]">5</p>
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
            <p className="text-gray-900">8</p>
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
          <Dialog open={isGenerateAuditOpen} onOpenChange={setIsGenerateAuditOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]">
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
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a hospital" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="city">City General Hospital</SelectItem>
                      <SelectItem value="metro">Metro Medical Center</SelectItem>
                      <SelectItem value="regional">Regional Health Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audit-type">Audit Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audit type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Asset Audit</SelectItem>
                      <SelectItem value="partial">Partial Audit</SelectItem>
                      <SelectItem value="compliance">Compliance Audit</SelectItem>
                      <SelectItem value="verification">Asset Verification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auditor">Assign Auditor</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select auditor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jane">Jane Auditor</SelectItem>
                      <SelectItem value="john">John Smith</SelectItem>
                      <SelectItem value="maria">Maria Garcia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input id="start-date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input id="deadline" type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input id="notes" placeholder="Add any special instructions..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsGenerateAuditOpen(false)}>Cancel</Button>
                <Button onClick={handleGenerateAudit} className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]">
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
              <div className="space-y-4">
                {activeAudits.filter(a => a.status === "in-progress").map((audit) => (
                  <div key={audit.id} className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-gray-900 mb-1">{audit.hospital}</h3>
                        <div className="flex items-center gap-4 text-gray-600">
                          <span>Auditor: {audit.auditor}</span>
                          <span>•</span>
                          <span>Started: {audit.startDate}</span>
                        </div>
                      </div>
                      <Badge className="bg-[#0F67FF] hover:bg-[#0F67FF]">In Progress</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Assets Audited: {audit.auditedAssets} / {audit.totalAssets}</span>
                        <span>{audit.progress}%</span>
                      </div>
                      <Progress value={audit.progress} className="h-2" />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.hospital}</TableCell>
                      <TableCell className="text-gray-600">{request.requester}</TableCell>
                      <TableCell className="text-gray-600">{request.requestDate}</TableCell>
                      <TableCell className="text-gray-600">{request.reason}</TableCell>
                      <TableCell>
                        <Badge variant={request.status === "pending" ? "secondary" : "default"}
                               className={request.status === "approved" ? "bg-[#0EB57D] hover:bg-[#0EB57D]" : ""}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {request.status === "pending" && (
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              size="sm" 
                              className="bg-[#0EB57D] hover:bg-[#0EB57D]/90"
                              onClick={() => handleApproveRequest(request.id)}
                            >
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                {activeAudits.filter(a => a.status === "completed").map((audit) => (
                  <div key={audit.id} className="p-6 border rounded-lg bg-green-50 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-gray-900 mb-1">{audit.hospital}</h3>
                        <div className="flex items-center gap-4 text-gray-600">
                          <span>Auditor: {audit.auditor}</span>
                          <span>•</span>
                          <span>Completed: {audit.startDate}</span>
                        </div>
                      </div>
                      <Badge className="bg-[#0EB57D] hover:bg-[#0EB57D]">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-4 text-gray-600">
                      <span>Total Assets Audited: {audit.totalAssets}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
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
