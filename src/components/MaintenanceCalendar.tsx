import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar } from "./ui/calendar";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Calendar as CalendarIcon, Plus, Wrench, CheckCircle, AlertCircle, Bell, AlertTriangle, Clock } from "lucide-react";

interface MaintenanceCalendarProps {
  onNavigate: (screen: string) => void;
}

const maintenanceSchedule = [
  {
    id: 1,
    assetId: "AST-2024-001",
    assetName: "MRI Scanner",
    department: "Radiology",
    type: "Routine Maintenance",
    scheduledDate: "2024-10-18",
    assignedTo: "John Smith",
    status: "Scheduled",
    lastMaintenance: "2024-02-20",
  },
  {
    id: 2,
    assetId: "AST-2024-003",
    assetName: "Ventilator",
    department: "ICU",
    type: "Calibration",
    scheduledDate: "2024-10-20",
    assignedTo: "Sarah Johnson",
    status: "Scheduled",
    lastMaintenance: "2024-07-15",
  },
  {
    id: 3,
    assetId: "AST-2024-004",
    assetName: "Blood Gas Analyzer",
    department: "Laboratory",
    type: "Calibration",
    scheduledDate: "2024-10-16",
    assignedTo: "Michael Chen",
    status: "Overdue",
    lastMaintenance: "2024-04-10",
  },
  {
    id: 4,
    assetId: "AST-2024-002",
    assetName: "CT Scanner",
    department: "Radiology",
    type: "Repair",
    scheduledDate: "2024-10-15",
    assignedTo: "John Smith",
    status: "In Progress",
    lastMaintenance: "2024-09-01",
  },
];

export function MaintenanceCalendar({ onNavigate }: MaintenanceCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    assetId: "",
    type: "",
    priority: "",
    description: "",
    scheduledDate: "",
    assignedTo: "",
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setShowTicketDialog(false);
    setTicketForm({
      assetId: "",
      type: "",
      priority: "",
      description: "",
      scheduledDate: "",
      assignedTo: "",
    });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900">Maintenance & Calibration</h1>
              <p className="text-gray-500">Schedule and track asset maintenance</p>
            </div>
            <Button onClick={() => setShowTicketDialog(true)} className="bg-[#0F67FF] hover:bg-[#0F67FF]/90">
              <Plus className="h-5 w-5 mr-2" />
              Raise Maintenance Ticket
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Maintenance Alerts Section */}
        <Card className="border-0 shadow-md bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-900">Maintenance Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-gray-900">2 Assets Overdue for Maintenance</p>
                  <p className="text-gray-600">Blood Gas Analyzer (Lab) & X-Ray Machine (Radiology)</p>
                </div>
                <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                  Schedule Now
                </Button>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                <Clock className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-gray-900">5 AMC Contracts Expiring Soon</p>
                  <p className="text-gray-600">Within next 30 days - Action required</p>
                </div>
                <Button size="sm" variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                  View Details
                </Button>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-gray-900">3 Warranty Expiring This Month</p>
                  <p className="text-gray-600">Ventilator, CT Scanner, Ultrasound Machine</p>
                </div>
                <Button size="sm" variant="outline" className="border-yellow-200 text-yellow-600 hover:bg-yellow-50">
                  Renew
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Scheduled</p>
                  <h2 className="mt-2 text-gray-900">8</h2>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">In Progress</p>
                  <h2 className="mt-2 text-gray-900">3</h2>
                </div>
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Overdue</p>
                  <h2 className="mt-2 text-gray-900">2</h2>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Completed (Month)</p>
                  <h2 className="mt-2 text-gray-900">15</h2>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <Card className="border-0 shadow-sm lg:col-span-1">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Scheduled</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-600">In Progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600">Overdue</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Schedule Table */}
          <Card className="border-0 shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle>Upcoming Maintenance Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Scheduled Date</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenanceSchedule.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <p className="text-gray-900">{item.assetName}</p>
                            <p className="text-gray-500">{item.assetId}</p>
                          </div>
                        </TableCell>
                        <TableCell>{item.department}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.scheduledDate}</TableCell>
                        <TableCell>{item.assignedTo}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(item.status)} variant="outline">
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            {item.status === "In Progress" ? "Mark Complete" : "View Details"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Maintenance Details */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Maintenance Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {maintenanceSchedule.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      item.status === 'Overdue' ? 'bg-red-50' : 
                      item.status === 'In Progress' ? 'bg-yellow-50' : 'bg-blue-50'
                    }`}>
                      <Wrench className={`h-5 w-5 ${
                        item.status === 'Overdue' ? 'text-red-600' : 
                        item.status === 'In Progress' ? 'text-yellow-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <p className="text-gray-900">{item.assetName}</p>
                      <p className="text-gray-500">{item.type} • Last maintenance: {item.lastMaintenance}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900">{item.scheduledDate}</p>
                    <p className="text-gray-500">{item.assignedTo}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Raise Maintenance Ticket Dialog */}
      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Raise Maintenance Ticket</DialogTitle>
            <DialogDescription>Create a new maintenance or calibration request</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assetId">Asset ID</Label>
                <Input
                  id="assetId"
                  placeholder="AST-2024-XXX"
                  value={ticketForm.assetId}
                  onChange={(e) => setTicketForm({ ...ticketForm, assetId: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Maintenance Type</Label>
                <Select
                  value={ticketForm.type}
                  onValueChange={(value) => setTicketForm({ ...ticketForm, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine Maintenance</SelectItem>
                    <SelectItem value="calibration">Calibration</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={ticketForm.priority}
                  onValueChange={(value) => setTicketForm({ ...ticketForm, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Scheduled Date</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={ticketForm.scheduledDate}
                  onChange={(e) => setTicketForm({ ...ticketForm, scheduledDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assign Technician</Label>
              <Select
                value={ticketForm.assignedTo}
                onValueChange={(value) => setTicketForm({ ...ticketForm, assignedTo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="john">John Smith</SelectItem>
                  <SelectItem value="sarah">Sarah Johnson</SelectItem>
                  <SelectItem value="michael">Michael Chen</SelectItem>
                  <SelectItem value="emily">Emily Davis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the maintenance requirements..."
                value={ticketForm.description}
                onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowTicketDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0F67FF] hover:bg-[#0F67FF]/90">
                Create Ticket
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
