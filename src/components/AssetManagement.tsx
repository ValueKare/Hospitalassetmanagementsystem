import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

interface AssetManagementProps {
  onNavigate: (screen: string, assetId?: number) => void;
}

const assets = [
  {
    id: 1,
    assetId: "AST-2024-001",
    name: "MRI Scanner",
    model: "Siemens MAGNETOM Vida 3T",
    department: "Radiology",
    vendor: "Siemens Healthineers",
    status: "Active",
    warranty: "2025-12-31",
    cost: 2500000,
  },
  {
    id: 2,
    assetId: "AST-2024-002",
    name: "CT Scanner",
    model: "GE Revolution HD",
    department: "Radiology",
    vendor: "GE Healthcare",
    status: "Under Maintenance",
    warranty: "2024-11-15",
    cost: 1800000,
  },
  {
    id: 3,
    assetId: "AST-2024-003",
    name: "Ventilator",
    model: "Dräger Evita V800",
    department: "ICU",
    vendor: "Dräger Medical",
    status: "Active",
    warranty: "2026-03-20",
    cost: 85000,
  },
  {
    id: 4,
    assetId: "AST-2024-004",
    name: "Blood Gas Analyzer",
    model: "Radiometer ABL90 FLEX",
    department: "Laboratory",
    vendor: "Radiometer",
    status: "Calibration Due",
    warranty: "2024-10-30",
    cost: 45000,
  },
  {
    id: 5,
    assetId: "AST-2024-005",
    name: "Surgical Table",
    model: "Steris Harmony",
    department: "Surgery",
    vendor: "Steris Corporation",
    status: "Active",
    warranty: "2025-06-15",
    cost: 120000,
  },
];

export function AssetManagement({ onNavigate }: AssetManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddAsset, setShowAddAsset] = useState(false);
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

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = filterDepartment === "all" || asset.department === filterDepartment;
    const matchesStatus = filterStatus === "all" || asset.status === filterStatus;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAddAsset(false);
    // Reset form
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

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900">Asset Management</h1>
              <p className="text-gray-500">Track and manage all organizational assets</p>
            </div>
            <Button onClick={() => setShowAddAsset(true)} className="bg-[#0F67FF] hover:bg-[#0F67FF]/90">
              <Plus className="h-5 w-5 mr-2" />
              Add Asset
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Search and Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search by asset ID, name, or model..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Radiology">Radiology</SelectItem>
                  <SelectItem value="ICU">ICU</SelectItem>
                  <SelectItem value="Surgery">Surgery</SelectItem>
                  <SelectItem value="Laboratory">Laboratory</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                  <SelectItem value="Calibration Due">Calibration Due</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Assets Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Assets ({filteredAssets.length})</CardTitle>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
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
                    <TableRow key={asset.id} className="hover:bg-gray-50">
                      <TableCell>{asset.assetId}</TableCell>
                      <TableCell>{asset.name}</TableCell>
                      <TableCell className="text-gray-600">{asset.model}</TableCell>
                      <TableCell>{asset.department}</TableCell>
                      <TableCell className="text-gray-600">{asset.vendor}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(asset.status)} variant="outline">
                          {asset.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{asset.warranty}</TableCell>
                      <TableCell>${asset.cost.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onNavigate("asset-detail", asset.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
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
      </div>

      {/* Add Asset Dialog */}
      <Dialog open={showAddAsset} onOpenChange={setShowAddAsset}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
            <DialogDescription>Enter the details of the new asset to add to the system</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assetId">Asset ID</Label>
                <Input
                  id="assetId"
                  placeholder="AST-2024-XXX"
                  value={formData.assetId}
                  onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Asset Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., MRI Scanner"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  placeholder="e.g., Siemens MAGNETOM"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Input
                  id="vendor"
                  placeholder="e.g., Siemens Healthineers"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Radiology">Radiology</SelectItem>
                    <SelectItem value="ICU">ICU</SelectItem>
                    <SelectItem value="Surgery">Surgery</SelectItem>
                    <SelectItem value="Laboratory">Laboratory</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="warranty">Warranty Expiry</Label>
                <Input
                  id="warranty"
                  type="date"
                  value={formData.warranty}
                  onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost">Cost (USD)</Label>
                <Input
                  id="cost"
                  type="number"
                  placeholder="0.00"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tag">RFID/Barcode Tag</Label>
                <Input
                  id="tag"
                  placeholder="e.g., RFID-123456"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documents">Upload Documents</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0F67FF] transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">Click to upload warranty or manual documents</p>
                <p className="text-gray-400 mt-1">PDF, DOC, or Images (Max 10MB)</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddAsset(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0F67FF] hover:bg-[#0F67FF]/90">
                Add Asset
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}