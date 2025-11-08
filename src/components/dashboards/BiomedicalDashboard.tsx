import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Wrench,
  CheckCircle,
  Clock,
  AlertTriangle,
  Activity,
  FileText,
  Calendar,
} from "lucide-react";

interface BiomedicalDashboardProps {
  onNavigate: (screen: string) => void;
}

const maintenanceTickets = [
  {
    id: "TKT-001",
    asset: "MRI Scanner",
    assetId: "AST-2024-001",
    department: "Radiology",
    type: "Routine Maintenance",
    priority: "High",
    status: "In Progress",
    assignedDate: "2024-10-14",
    dueDate: "2024-10-18",
  },
  {
    id: "TKT-002",
    asset: "Ventilator",
    assetId: "AST-2024-003",
    department: "ICU",
    type: "Calibration",
    priority: "Critical",
    status: "Pending",
    assignedDate: "2024-10-15",
    dueDate: "2024-10-16",
  },
  {
    id: "TKT-003",
    asset: "X-Ray Machine",
    assetId: "AST-2024-006",
    department: "Emergency",
    type: "Repair",
    priority: "Medium",
    status: "In Progress",
    assignedDate: "2024-10-13",
    dueDate: "2024-10-20",
  },
];

const calibrationSchedule = [
  { asset: "Blood Gas Analyzer", department: "Laboratory", dueDate: "2024-10-18", status: "Due Soon" },
  { asset: "ECG Machine", department: "Cardiology", dueDate: "2024-10-20", status: "Scheduled" },
  { asset: "Defibrillator", department: "Emergency", dueDate: "2024-10-25", status: "Scheduled" },
  { asset: "Infusion Pump", department: "ICU", dueDate: "2024-10-16", status: "Overdue" },
];

const recentServiceLogs = [
  { id: 1, asset: "CT Scanner", action: "Completed routine maintenance", technician: "You", date: "2024-10-14", duration: "3 hours" },
  { id: 2, asset: "Ultrasound", action: "Calibration completed", technician: "You", date: "2024-10-13", duration: "2 hours" },
  { id: 3, asset: "Surgical Table", action: "Parts replacement", technician: "You", date: "2024-10-12", duration: "4 hours" },
];

export function BiomedicalDashboard({ onNavigate }: BiomedicalDashboardProps) {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-gray-900">Biomedical Manager Dashboard</h1>
                  <p className="text-gray-500">Maintenance, calibration & service management</p>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white">MC</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Assigned Tickets</p>
                  <h2 className="mt-2 text-gray-900">18</h2>
                  <p className="text-blue-600 mt-1">Active tasks</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">In Progress</p>
                  <h2 className="mt-2 text-gray-900">5</h2>
                  <p className="text-yellow-600 mt-1">Working on</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Completed Today</p>
                  <h2 className="mt-2 text-gray-900">3</h2>
                  <p className="text-green-600 mt-1">Tasks finished</p>
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
                  <p className="text-gray-500">Overdue</p>
                  <h2 className="mt-2 text-gray-900">2</h2>
                  <p className="text-red-600 mt-1">Urgent action</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-50 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="tickets" className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="tickets">Maintenance Tickets</TabsTrigger>
            <TabsTrigger value="calibration">Calibration Schedule</TabsTrigger>
            <TabsTrigger value="logs">Service Logs</TabsTrigger>
          </TabsList>

          {/* Maintenance Tickets */}
          <TabsContent value="tickets">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Assigned Maintenance Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket ID</TableHead>
                        <TableHead>Asset</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {maintenanceTickets.map((ticket) => (
                        <TableRow key={ticket.id} className="hover:bg-gray-50">
                          <TableCell>{ticket.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-gray-900">{ticket.asset}</p>
                              <p className="text-gray-500">{ticket.assetId}</p>
                            </div>
                          </TableCell>
                          <TableCell>{ticket.department}</TableCell>
                          <TableCell>{ticket.type}</TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(ticket.priority)} variant="outline">
                              {ticket.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(ticket.status)} variant="outline">
                              {ticket.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{ticket.dueDate}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" className="bg-[#0F67FF] hover:bg-[#0B4FCC]">
                                Update Status
                              </Button>
                              <Button size="sm" variant="outline">
                                Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calibration Schedule */}
          <TabsContent value="calibration">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Equipment Calibration Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {calibrationSchedule.map((item, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        item.status === "Overdue"
                          ? "bg-gradient-to-r from-red-50 to-white border-red-200"
                          : item.status === "Due Soon"
                          ? "bg-gradient-to-r from-orange-50 to-white border-orange-200"
                          : "bg-gradient-to-r from-blue-50 to-white border-blue-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              item.status === "Overdue"
                                ? "bg-red-100"
                                : item.status === "Due Soon"
                                ? "bg-orange-100"
                                : "bg-blue-100"
                            }`}
                          >
                            <Activity
                              className={`h-5 w-5 ${
                                item.status === "Overdue"
                                  ? "text-red-600"
                                  : item.status === "Due Soon"
                                  ? "text-orange-600"
                                  : "text-blue-600"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="text-gray-900">{item.asset}</p>
                            <p className="text-gray-500">{item.department}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            className={getStatusColor(item.status)}
                            variant="outline"
                          >
                            {item.status}
                          </Badge>
                          <p className="text-gray-600 mt-2">Due: {item.dueDate}</p>
                          <Button size="sm" variant="outline" className="mt-2">
                            Schedule
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service Logs */}
          <TabsContent value="logs">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Recent Service History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentServiceLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-[#F0F9FF] to-white rounded-lg border border-blue-100"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-gray-900">{log.asset}</p>
                          <p className="text-gray-600">{log.action}</p>
                          <p className="text-gray-500">
                            {log.technician} • {log.date} • {log.duration}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        View Report
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
