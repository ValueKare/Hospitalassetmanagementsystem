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
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Stethoscope,
  Package,
  Bell,
  RefreshCw,
  AlertCircle,
  FileText,
  Search,
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface ClinicalDashboardProps {
  onNavigate: (screen: string) => void;
  userRole: string; // "doctor" or "nurse"
}

const assignedEquipment = [
  { id: 1, name: "ECG Machine", assetId: "ECG-001", location: "Ward 3A", status: "Active", lastMaintenance: "2024-09-15", nextMaintenance: "2024-12-15" },
  { id: 2, name: "Vital Signs Monitor", assetId: "VSM-045", location: "ICU-2", status: "Active", lastMaintenance: "2024-08-20", nextMaintenance: "2024-11-20" },
  { id: 3, name: "Infusion Pump", assetId: "INF-112", location: "Ward 3A", status: "Under Repair", lastMaintenance: "2024-10-01", nextMaintenance: "2024-10-30" },
  { id: 4, name: "Pulse Oximeter", assetId: "POX-234", location: "Ward 3B", status: "Active", lastMaintenance: "2024-09-10", nextMaintenance: "2024-12-10" },
  { id: 5, name: "Defibrillator", assetId: "DEF-089", location: "Emergency", status: "Active", lastMaintenance: "2024-10-05", nextMaintenance: "2025-01-05" },
  { id: 6, name: "Blood Pressure Monitor", assetId: "BPM-156", location: "Ward 3A", status: "Pending Calibration", lastMaintenance: "2024-07-15", nextMaintenance: "2024-10-15" },
];

const recentNotifications = [
  { id: 1, type: "Repair Complete", message: "Infusion Pump INF-112 has been repaired and is ready for use", time: "2 hours ago", priority: "success" },
  { id: 2, type: "Maintenance Update", message: "Blood Pressure Monitor BPM-156 scheduled for calibration on Oct 18", time: "5 hours ago", priority: "warning" },
  { id: 3, type: "Replacement Approved", message: "Your replacement request for Vital Signs Monitor has been approved", time: "1 day ago", priority: "success" },
  { id: 4, type: "Issue Acknowledged", message: "Biomedical team acknowledged your reported issue with ECG-001", time: "2 days ago", priority: "info" },
];

const maintenanceUpdates = [
  { equipment: "Infusion Pump INF-112", status: "Completed", technician: "Michael Chen", date: "2024-10-16", issue: "Calibration error fixed" },
  { equipment: "Vital Signs Monitor VSM-045", status: "In Progress", technician: "Sarah Johnson", date: "2024-10-17", issue: "Display flickering" },
  { equipment: "ECG Machine ECG-001", status: "Scheduled", technician: "John Smith", date: "2024-10-20", issue: "Routine maintenance" },
];

export function ClinicalDashboard({ onNavigate, userRole }: ClinicalDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isReplacementDialogOpen, setIsReplacementDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string>("");
  const [issueDescription, setIssueDescription] = useState("");
  const [urgency, setUrgency] = useState("");
  const [replacementReason, setReplacementReason] = useState("");

  const isDoctor = userRole === "doctor";
  const userName = isDoctor ? "Dr. Sarah Johnson" : "Nurse Emily Chen";
  const userInitials = isDoctor ? "SJ" : "EC";
  const userDepartment = "Cardiology - Ward 3A";

  const activeEquipment = assignedEquipment.filter(eq => eq.status === "Active").length;
  const underRepair = assignedEquipment.filter(eq => eq.status === "Under Repair" || eq.status === "Pending Calibration").length;

  const filteredEquipment = assignedEquipment.filter(eq =>
    eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eq.assetId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReportIssue = () => {
    if (!selectedEquipment || !issueDescription || !urgency) {
      toast.error("Please fill in all required fields");
      return;
    }

    toast.success("Equipment issue reported successfully", {
      description: "Biomedical team has been notified"
    });
    
    setIsReportDialogOpen(false);
    setSelectedEquipment("");
    setIssueDescription("");
    setUrgency("");
  };

  const handleRequestReplacement = () => {
    if (!selectedEquipment || !replacementReason) {
      toast.error("Please fill in all required fields");
      return;
    }

    toast.success("Replacement request submitted successfully", {
      description: "Department Head will review your request"
    });
    
    setIsReplacementDialogOpen(false);
    setSelectedEquipment("");
    setReplacementReason("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Under Repair":
        return "bg-red-100 text-red-800";
      case "Pending Calibration":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "info":
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#F0F9FF]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-gray-900">{userName}</h1>
                  <p className="text-gray-500">{userDepartment}</p>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white">{userInitials}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Clinical Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Assigned Equipment</p>
                  <h2 className="mt-2 text-gray-900">{assignedEquipment.length}</h2>
                  <p className="text-green-600 mt-1">{activeEquipment} Active</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-[#E8F0FF] to-[#D0E7FF] rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-[#0F67FF]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Under Repair</p>
                  <h2 className="mt-2 text-gray-900">{underRepair}</h2>
                  <p className="text-orange-600 mt-1">Pending Service</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Reported Issues</p>
                  <h2 className="mt-2 text-gray-900">3</h2>
                  <p className="text-blue-600 mt-1">Last 7 days</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">New Updates</p>
                  <h2 className="mt-2 text-gray-900">{recentNotifications.length}</h2>
                  <p className="text-purple-600 mt-1">Notifications</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center">
                  <Bell className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report Equipment Issue
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Report Equipment Issue</DialogTitle>
                    <DialogDescription>
                      Report any malfunction or problem with assigned equipment
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-gray-700">Select Equipment</label>
                      <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose equipment..." />
                        </SelectTrigger>
                        <SelectContent>
                          {assignedEquipment.map(eq => (
                            <SelectItem key={eq.id} value={eq.assetId}>
                              {eq.name} ({eq.assetId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-gray-700">Urgency Level</label>
                      <Select value={urgency} onValueChange={setUrgency}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical - Immediate attention needed</SelectItem>
                          <SelectItem value="high">High - Within 24 hours</SelectItem>
                          <SelectItem value="medium">Medium - Within 3 days</SelectItem>
                          <SelectItem value="low">Low - Routine maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-gray-700">Issue Description</label>
                      <Textarea
                        placeholder="Describe the issue in detail..."
                        value={issueDescription}
                        onChange={(e) => setIssueDescription(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleReportIssue} className="bg-red-600 hover:bg-red-700">
                        Submit Report
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {isDoctor && (
                <Dialog open={isReplacementDialogOpen} onOpenChange={setIsReplacementDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#0F67FF] hover:bg-blue-700">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Request Replacement
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>Request Equipment Replacement</DialogTitle>
                      <DialogDescription>
                        Request a replacement for faulty or outdated equipment
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-gray-700">Select Equipment to Replace</label>
                        <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose equipment..." />
                          </SelectTrigger>
                          <SelectContent>
                            {assignedEquipment.map(eq => (
                              <SelectItem key={eq.id} value={eq.assetId}>
                                {eq.name} ({eq.assetId})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-gray-700">Reason for Replacement</label>
                        <Textarea
                          placeholder="Explain why this equipment needs to be replaced..."
                          value={replacementReason}
                          onChange={(e) => setReplacementReason(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-yellow-800">
                          Note: Replacement requests will be reviewed by the Department Head and require approval.
                        </p>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsReplacementDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleRequestReplacement} className="bg-[#0F67FF] hover:bg-blue-700">
                          Submit Request
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              <Button variant="outline" onClick={() => onNavigate("maintenance")}>
                <Clock className="h-4 w-4 mr-2" />
                View Maintenance Status
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assigned Equipment Table */}
          <Card className="border-0 shadow-md lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Assigned Equipment</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search equipment..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-600">Equipment</th>
                      <th className="px-4 py-3 text-left text-gray-600">Asset ID</th>
                      <th className="px-4 py-3 text-left text-gray-600">Location</th>
                      <th className="px-4 py-3 text-left text-gray-600">Status</th>
                      <th className="px-4 py-3 text-left text-gray-600">Next Service</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEquipment.map((equipment) => (
                      <tr key={equipment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">{equipment.name}</td>
                        <td className="px-4 py-3 text-gray-600">{equipment.assetId}</td>
                        <td className="px-4 py-3 text-gray-600">{equipment.location}</td>
                        <td className="px-4 py-3">
                          <Badge className={getStatusColor(equipment.status)} variant="outline">
                            {equipment.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{equipment.nextMaintenance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Panel */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentNotifications.map((notification) => (
                  <div key={notification.id} className="p-3 bg-gradient-to-r from-[#F0F9FF] to-white rounded-lg border border-blue-100">
                    <div className="flex items-start space-x-3">
                      {getPriorityIcon(notification.priority)}
                      <div className="flex-1">
                        <p className="text-gray-900">{notification.type}</p>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-gray-400 mt-2">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Maintenance Updates */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Maintenance & Repair Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {maintenanceUpdates.map((update, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-[#F0F9FF] to-white rounded-lg border border-blue-100">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge 
                        className={
                          update.status === "Completed" ? "bg-green-100 text-green-800" :
                          update.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                          "bg-yellow-100 text-yellow-800"
                        } 
                        variant="outline"
                      >
                        {update.status}
                      </Badge>
                      <p className="text-gray-900">{update.equipment}</p>
                    </div>
                    <p className="text-gray-600">{update.issue}</p>
                    <p className="text-gray-500 mt-1">Technician: {update.technician} • {update.date}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
