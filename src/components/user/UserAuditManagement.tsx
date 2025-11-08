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
import { ClipboardCheck, Plus, QrCode, FileCheck, Clock, AlertCircle, Scan } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "../ui/progress";
import { Textarea } from "../ui/textarea";

interface UserAuditManagementProps {
  onNavigate: (screen: string) => void;
}

const myAudits = [
  { id: 1, title: "Cardiology Department Audit", requestedDate: "2025-10-01", status: "approved", progress: 65, totalAssets: 245, scannedAssets: 159 },
  { id: 2, title: "Emergency Wing Asset Verification", requestedDate: "2025-09-25", status: "completed", progress: 100, totalAssets: 156, scannedAssets: 156 },
  { id: 3, title: "Annual Equipment Audit", requestedDate: "2025-10-12", status: "pending", progress: 0, totalAssets: 0, scannedAssets: 0 },
];

export function UserAuditManagement({ onNavigate }: UserAuditManagementProps) {
  const [isRequestAuditOpen, setIsRequestAuditOpen] = useState(false);
  const [isScanBarcodeOpen, setIsScanBarcodeOpen] = useState(false);

  const handleRequestAudit = () => {
    toast.success("Audit request submitted successfully!");
    setIsRequestAuditOpen(false);
  };

  const handleScanBarcode = () => {
    toast.success("Asset scanned successfully!");
    setIsScanBarcodeOpen(false);
  };

  return (
    <div className="flex-1 p-8 bg-[#F9FAFB] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Audit Management</h1>
        <p className="text-gray-600">Request audits and track audit progress for your department</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-600">Total Audits</CardTitle>
              <ClipboardCheck className="h-5 w-5 text-[#0F67FF]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">12</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-600">In Progress</CardTitle>
              <Clock className="h-5 w-5 text-[#0F67FF]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-[#0F67FF]">1</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-600">Pending Approval</CardTitle>
              <AlertCircle className="h-5 w-5 text-[#F59E0B]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-[#F59E0B]">1</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-600">Completed</CardTitle>
              <FileCheck className="h-5 w-5 text-[#0EB57D]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-[#0EB57D]">10</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="active" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="active">My Audits</TabsTrigger>
            <TabsTrigger value="history">Audit History</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Dialog open={isScanBarcodeOpen} onOpenChange={setIsScanBarcodeOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  Scan Barcode
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Scan Asset Barcode</DialogTitle>
                  <DialogDescription>Scan or enter asset barcode/QR code</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-center p-8 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <Scan className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 mb-2">Position barcode in camera view</p>
                      <Button variant="outline" size="sm">Open Camera</Button>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-2 text-gray-500">or</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode">Enter Barcode Manually</Label>
                    <Input id="barcode" placeholder="Enter asset barcode..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsScanBarcodeOpen(false)}>Cancel</Button>
                  <Button onClick={handleScanBarcode} className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]">
                    Submit
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={isRequestAuditOpen} onOpenChange={setIsRequestAuditOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]">
                  <Plus className="h-4 w-4 mr-2" />
                  Request Audit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Request New Audit</DialogTitle>
                  <DialogDescription>Submit an audit request for your department</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="audit-title">Audit Title</Label>
                    <Input id="audit-title" placeholder="e.g., Q4 Equipment Audit" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="audit-type">Audit Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audit type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Department Audit</SelectItem>
                        <SelectItem value="partial">Partial Audit</SelectItem>
                        <SelectItem value="verification">Asset Verification</SelectItem>
                        <SelectItem value="compliance">Compliance Check</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department/Area</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="radiology">Radiology</SelectItem>
                        <SelectItem value="icu">ICU</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Audit</Label>
                    <Textarea id="reason" placeholder="Describe why this audit is needed..." rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferred-date">Preferred Start Date</Label>
                    <Input id="preferred-date" type="date" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsRequestAuditOpen(false)}>Cancel</Button>
                  <Button onClick={handleRequestAudit} className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]">
                    Submit Request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* My Audits Tab */}
        <TabsContent value="active">
          <div className="space-y-6">
            {myAudits.map((audit) => (
              <Card key={audit.id} className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-gray-900">{audit.title}</CardTitle>
                      <CardDescription>Requested on {audit.requestedDate}</CardDescription>
                    </div>
                    <Badge 
                      variant={audit.status === "approved" ? "default" : audit.status === "completed" ? "default" : "secondary"}
                      className={
                        audit.status === "approved" ? "bg-[#0F67FF] hover:bg-[#0F67FF]" :
                        audit.status === "completed" ? "bg-[#0EB57D] hover:bg-[#0EB57D]" : ""
                      }
                    >
                      {audit.status === "approved" ? "In Progress" : audit.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {audit.status === "approved" && (
                    <>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-gray-600">
                          <span>Assets Scanned: {audit.scannedAssets} / {audit.totalAssets}</span>
                          <span>{audit.progress}%</span>
                        </div>
                        <Progress value={audit.progress} className="h-2" />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => setIsScanBarcodeOpen(true)} className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]">
                          <QrCode className="h-4 w-4 mr-2" />
                          Scan Asset
                        </Button>
                        <Button variant="outline">View Details</Button>
                      </div>
                    </>
                  )}
                  {audit.status === "pending" && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <AlertCircle className="h-4 w-4 text-[#F59E0B]" />
                      <span>Awaiting admin approval</span>
                    </div>
                  )}
                  {audit.status === "completed" && (
                    <div className="flex gap-2">
                      <Button variant="outline">View Report</Button>
                      <Button variant="outline">Download PDF</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-gray-900">Audit History</CardTitle>
              <CardDescription>All completed audits for your department</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Audit Title</TableHead>
                    <TableHead>Date Completed</TableHead>
                    <TableHead>Assets Audited</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Q3 Equipment Audit</TableCell>
                    <TableCell className="text-gray-600">2025-09-28</TableCell>
                    <TableCell>245</TableCell>
                    <TableCell>
                      <Badge className="bg-[#0EB57D] hover:bg-[#0EB57D]">Completed</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">View Report</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>ICU Asset Verification</TableCell>
                    <TableCell className="text-gray-600">2025-08-15</TableCell>
                    <TableCell>312</TableCell>
                    <TableCell>
                      <Badge className="bg-[#0EB57D] hover:bg-[#0EB57D]">Completed</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">View Report</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
