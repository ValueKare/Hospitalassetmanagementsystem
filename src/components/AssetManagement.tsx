import { useState, useRef, ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Upload,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface AssetManagementProps {
  onNavigate: (screen: string, assetId?: number) => void;
}

/* ================= SAMPLE DATA (INDUSTRY AGNOSTIC) ================= */

const assets = [
  {
    id: 1,
    assetId: "AST-2024-001",
    name: "Industrial CNC Machine",
    model: "HAAS VF-2",
    department: "Manufacturing",
    vendor: "HAAS Automation",
    status: "Active",
    warranty: "2026-12-31",
    cost: 3200000,
  },
  {
    id: 2,
    assetId: "AST-2024-002",
    name: "IT Server Rack",
    model: "Dell PowerEdge R750",
    department: "IT Infrastructure",
    vendor: "Dell Technologies",
    status: "Under Maintenance",
    warranty: "2025-08-15",
    cost: 1800000,
  },
  {
    id: 3,
    assetId: "AST-2024-003",
    name: "Forklift",
    model: "Toyota 8FGCU25",
    department: "Warehouse",
    vendor: "Toyota Industries",
    status: "Active",
    warranty: "2027-03-20",
    cost: 950000,
  },
  {
    id: 4,
    assetId: "AST-2024-004",
    name: "Quality Testing Machine",
    model: "Instron 5985",
    department: "Quality Control",
    vendor: "Instron",
    status: "Calibration Due",
    warranty: "2024-10-30",
    cost: 780000,
  },
];

export function AssetManagement({ onNavigate }: AssetManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    assetId: "",
    name: "",
    model: "",
    vendor: "",
    department: "",
    warranty: "",
    cost: "",
    tag: "",
  });

  /* ================= FILTER LOGIC ================= */

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.model.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      filterDepartment === "all" || asset.department === filterDepartment;

    const matchesStatus =
      filterStatus === "all" || asset.status === filterStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Under Maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "Calibration Due":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  /* ================= CSV UPLOAD ================= */

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    setUploadStatus(null);

    try {
      const response = await fetch(
        "https://ff9hq7hk-5001.inc1.devtunnels.ms/api/upload/universal",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        setUploadStatus({
          success: true,
          message: `Uploaded ${result.inserted} assets successfully`,
        });
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (error) {
      setUploadStatus({
        success: false,
        message: error instanceof Error ? error.message : "Upload failed",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAddAsset(false);
    setFormData({
      assetId: "",
      name: "",
      model: "",
      vendor: "",
      department: "",
      warranty: "",
      cost: "",
      tag: "",
    });
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-gray-900">Asset Management</h1>
            <p className="text-gray-500">
              Track and manage assets across departments and organizations
            </p>
          </div>
          <Button onClick={() => setShowAddAsset(true)} className="bg-[#0F67FF]">
            <Plus className="h-5 w-5 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6 grid md:grid-cols-4 gap-4">
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                <SelectItem value="IT Infrastructure">IT Infrastructure</SelectItem>
                <SelectItem value="Warehouse">Warehouse</SelectItem>
                <SelectItem value="Quality Control">Quality Control</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                <SelectItem value="Calibration Due">Calibration Due</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Assets ({filteredAssets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Warranty</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>{asset.assetId}</TableCell>
                    <TableCell>{asset.name}</TableCell>
                    <TableCell>{asset.model}</TableCell>
                    <TableCell>{asset.department}</TableCell>
                    <TableCell>{asset.vendor}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(asset.status)}>
                        {asset.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{asset.warranty}</TableCell>
                    <TableCell>₹{asset.cost.toLocaleString()}</TableCell>
                    <TableCell className="text-right flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => onNavigate("asset-detail", asset.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add Asset Dialog */}
      <Dialog open={showAddAsset} onOpenChange={setShowAddAsset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
            <DialogDescription>Enter asset details</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Asset ID" required />
            <Input placeholder="Asset Name" required />
            <Input placeholder="Model" required />
            <Input placeholder="Vendor" required />
            <Input type="date" required />
            <Input type="number" placeholder="Cost" required />

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              hidden
              onChange={handleFileUpload}
            />

            <Button type="submit" className="w-full bg-[#0F67FF]">
              Save Asset
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}