import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import {
  ArrowLeft,
  Download,
  Edit,
  Package,
  FileText,
  Calendar,
  DollarSign,
  MapPin,
  Wrench,
  CheckCircle2,
  Circle,
  AlertTriangle,
} from "lucide-react";

interface AssetDetailProps {
  assetId?: number;
  onNavigate: (screen: string) => void;
}

const assetData = {
  assetId: "AST-2024-001",
  name: "MRI Scanner",
  model: "Siemens MAGNETOM Vida 3T",
  department: "Radiology",
  vendor: "Siemens Healthineers",
  status: "Active",
  warranty: "2025-12-31",
  cost: 2500000,
  procurementDate: "2023-01-15",
  installationDate: "2023-02-20",
  location: "Building A, Floor 2, Room 205",
  serialNumber: "SN-MGN-2023-001",
  tag: "RFID-789456123",
};

const timeline = [
  { date: "2023-01-15", event: "Procured", status: "completed", description: "Asset purchased from Siemens Healthineers" },
  { date: "2023-02-20", event: "Installed", status: "completed", description: "Installation and setup completed" },
  { date: "2023-05-10", event: "Calibration", status: "completed", description: "Initial calibration performed" },
  { date: "2023-08-15", event: "Maintenance", status: "completed", description: "Routine maintenance check" },
  { date: "2024-02-20", event: "Annual Maintenance", status: "completed", description: "Annual comprehensive maintenance" },
  { date: "2024-10-18", event: "Upcoming Maintenance", status: "pending", description: "Scheduled routine maintenance" },
  { date: "2025-12-31", event: "Warranty Expiry", status: "upcoming", description: "Warranty period ends" },
];

const maintenanceHistory = [
  {
    id: 1,
    date: "2024-02-20",
    type: "Annual Maintenance",
    technician: "John Smith",
    duration: "4 hours",
    spareParts: ["Cooling coil", "Filter replacement"],
    cost: 5000,
    status: "Completed",
  },
  {
    id: 2,
    date: "2023-08-15",
    type: "Routine Check",
    technician: "Sarah Johnson",
    duration: "2 hours",
    spareParts: ["None"],
    cost: 1200,
    status: "Completed",
  },
  {
    id: 3,
    date: "2023-05-10",
    type: "Calibration",
    technician: "Michael Chen",
    duration: "3 hours",
    spareParts: ["Calibration kit"],
    cost: 2500,
    status: "Completed",
  },
];

const documents = [
  { name: "User Manual - MAGNETOM Vida 3T.pdf", size: "12.5 MB", uploaded: "2023-02-20" },
  { name: "Warranty Certificate.pdf", size: "2.1 MB", uploaded: "2023-01-15" },
  { name: "Installation Report.pdf", size: "5.3 MB", uploaded: "2023-02-20" },
  { name: "Maintenance Log 2024.pdf", size: "1.8 MB", uploaded: "2024-02-20" },
];

export function AssetDetail({ assetId, onNavigate }: AssetDetailProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Circle className="h-5 w-5 text-yellow-500" />;
      case "upcoming":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => onNavigate("assets")} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Assets
              </Button>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-gray-900">{assetData.name}</h1>
                  <Badge className="bg-green-100 text-green-800" variant="outline">
                    {assetData.status}
                  </Badge>
                </div>
                <p className="text-gray-500">{assetData.assetId} • {assetData.department}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Download className="h-5 w-5 mr-2" />
                Export Details
              </Button>
              <Button className="bg-[#0F67FF] hover:bg-[#0F67FF]/90">
                <Edit className="h-5 w-5 mr-2" />
                Edit Asset
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#E8F0FF] rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-[#0F67FF]" />
                </div>
                <div>
                  <p className="text-gray-500">Model</p>
                  <p className="text-gray-900">{assetData.model}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-500">Cost</p>
                  <p className="text-gray-900">${assetData.cost.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-gray-500">Warranty Expiry</p>
                  <p className="text-gray-900">{assetData.warranty}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-500">Location</p>
                  <p className="text-gray-900">Floor 2, Room 205</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Lifecycle Timeline</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance History</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Asset Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-500 mb-1">Asset ID</p>
                    <p className="text-gray-900">{assetData.assetId}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Serial Number</p>
                    <p className="text-gray-900">{assetData.serialNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Vendor</p>
                    <p className="text-gray-900">{assetData.vendor}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Department</p>
                    <p className="text-gray-900">{assetData.department}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">RFID/Barcode Tag</p>
                    <p className="text-gray-900">{assetData.tag}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Procurement Date</p>
                    <p className="text-gray-900">{assetData.procurementDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Installation Date</p>
                    <p className="text-gray-900">{assetData.installationDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Location</p>
                    <p className="text-gray-900">{assetData.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Asset Lifecycle Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {timeline.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex flex-col items-center">
                        {getStatusIcon(item.status)}
                        {index < timeline.length - 1 && (
                          <div className="w-0.5 h-16 bg-gray-200 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-gray-900">{item.event}</h4>
                          <span className="text-gray-500">{item.date}</span>
                        </div>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Maintenance History</CardTitle>
                <Button className="bg-[#0F67FF] hover:bg-[#0F67FF]/90">
                  <Wrench className="h-5 w-5 mr-2" />
                  Raise Maintenance Ticket
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maintenanceHistory.map((maintenance) => (
                    <div key={maintenance.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-gray-900">{maintenance.type}</h4>
                          <p className="text-gray-500">{maintenance.date}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800" variant="outline">
                          {maintenance.status}
                        </Badge>
                      </div>
                      <Separator className="my-3" />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-gray-500">Technician</p>
                          <p className="text-gray-900">{maintenance.technician}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Duration</p>
                          <p className="text-gray-900">{maintenance.duration}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Spare Parts Used</p>
                          <p className="text-gray-900">{maintenance.spareParts.join(", ")}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Cost</p>
                          <p className="text-gray-900">${maintenance.cost.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Documents & Manuals</CardTitle>
                <Button variant="outline">
                  <FileText className="h-5 w-5 mr-2" />
                  Upload Document
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-gray-900">{doc.name}</p>
                          <p className="text-gray-500">
                            {doc.size} • Uploaded {doc.uploaded}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-5 w-5" />
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
