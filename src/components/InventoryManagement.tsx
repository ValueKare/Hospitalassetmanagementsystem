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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Search, Package, AlertTriangle, ShoppingCart, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { Progress } from "./ui/progress";

interface InventoryManagementProps {
  onNavigate: (screen: string) => void;
}

const inventory = [
  {
    id: 1,
    partId: "SP-001",
    name: "MRI Cooling Coil",
    category: "MRI Parts",
    quantity: 3,
    reorderLevel: 5,
    unitCost: 1200,
    vendor: "Siemens Healthineers",
    lastOrdered: "2024-08-15",
    status: "Low Stock",
  },
  {
    id: 2,
    partId: "SP-002",
    name: "CT Scanner Filters",
    category: "CT Parts",
    quantity: 12,
    reorderLevel: 8,
    unitCost: 450,
    vendor: "GE Healthcare",
    lastOrdered: "2024-09-01",
    status: "In Stock",
  },
  {
    id: 3,
    partId: "SP-003",
    name: "Ventilator Tubes",
    category: "Ventilator Parts",
    quantity: 25,
    reorderLevel: 15,
    unitCost: 85,
    vendor: "Dräger Medical",
    lastOrdered: "2024-09-20",
    status: "In Stock",
  },
  {
    id: 4,
    partId: "SP-004",
    name: "Blood Gas Calibration Kit",
    category: "Laboratory",
    quantity: 2,
    reorderLevel: 4,
    unitCost: 320,
    vendor: "Radiometer",
    lastOrdered: "2024-07-10",
    status: "Critical",
  },
  {
    id: 5,
    partId: "SP-005",
    name: "Surgical Table Hydraulic Fluid",
    category: "Surgery Equipment",
    quantity: 8,
    reorderLevel: 6,
    unitCost: 150,
    vendor: "Steris Corporation",
    lastOrdered: "2024-09-15",
    status: "In Stock",
  },
];

export function InventoryManagement({ onNavigate }: InventoryManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showReorderDialog, setShowReorderDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [reorderQuantity, setReorderQuantity] = useState("");

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.partId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800";
      case "Critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStockPercentage = (quantity: number, reorderLevel: number) => {
    return Math.min((quantity / (reorderLevel * 2)) * 100, 100);
  };

  const handleReorder = (item: any) => {
    setSelectedItem(item);
    setReorderQuantity((item.reorderLevel * 2).toString());
    setShowReorderDialog(true);
  };

  const handleSubmitReorder = (e: React.FormEvent) => {
    e.preventDefault();
    setShowReorderDialog(false);
    setSelectedItem(null);
    setReorderQuantity("");
  };

  const criticalCount = inventory.filter(item => item.status === "Critical").length;
  const lowStockCount = inventory.filter(item => item.status === "Low Stock").length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900">Inventory Management</h1>
              <p className="text-gray-500">Track spare parts and consumables</p>
            </div>
            <Button className="bg-[#0F67FF] hover:bg-[#0F67FF]/90">
              <Plus className="h-5 w-5 mr-2" />
              Add Inventory Item
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Total Items</p>
                  <h2 className="mt-2 text-gray-900">{inventory.length}</h2>
                </div>
                <div className="w-12 h-12 bg-[#E8F0FF] rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-[#0F67FF]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Critical Stock</p>
                  <h2 className="mt-2 text-gray-900">{criticalCount}</h2>
                  <p className="text-red-600 mt-1">Requires immediate action</p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Low Stock</p>
                  <h2 className="mt-2 text-gray-900">{lowStockCount}</h2>
                  <p className="text-yellow-600 mt-1">Below reorder level</p>
                </div>
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Total Value</p>
                  <h2 className="mt-2 text-gray-900">${totalValue.toLocaleString()}</h2>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search parts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="MRI Parts">MRI Parts</SelectItem>
                  <SelectItem value="CT Parts">CT Parts</SelectItem>
                  <SelectItem value="Ventilator Parts">Ventilator Parts</SelectItem>
                  <SelectItem value="Laboratory">Laboratory</SelectItem>
                  <SelectItem value="Surgery Equipment">Surgery Equipment</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Spare Parts & Consumables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reorder Level</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell>{item.partId}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-gray-600">{item.category}</TableCell>
                      <TableCell>
                        <div className="w-32">
                          <Progress
                            value={getStockPercentage(item.quantity, item.reorderLevel)}
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.reorderLevel}</TableCell>
                      <TableCell>${item.unitCost}</TableCell>
                      <TableCell className="text-gray-600">{item.vendor}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)} variant="outline">
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReorder(item)}
                          className={item.status === "Critical" || item.status === "Low Stock" ? "border-[#0F67FF] text-[#0F67FF]" : ""}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Reorder
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Reorders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventory.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-[#E8F0FF] rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-[#0F67FF]" />
                    </div>
                    <div>
                      <p className="text-gray-900">{item.name}</p>
                      <p className="text-gray-500">{item.vendor} • Last ordered: {item.lastOrdered}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900">${item.unitCost} / unit</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reorder Dialog */}
      <Dialog open={showReorderDialog} onOpenChange={setShowReorderDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reorder Inventory Item</DialogTitle>
            <DialogDescription>
              Submit a reorder request to the supplier
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <form onSubmit={handleSubmitReorder} className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Item:</span>
                  <span className="text-gray-900">{selectedItem.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vendor:</span>
                  <span className="text-gray-900">{selectedItem.vendor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Current Stock:</span>
                  <span className="text-gray-900">{selectedItem.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Unit Cost:</span>
                  <span className="text-gray-900">${selectedItem.unitCost}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Reorder Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={reorderQuantity}
                  onChange={(e) => setReorderQuantity(e.target.value)}
                  required
                />
                <p className="text-gray-500">
                  Recommended: {selectedItem.reorderLevel * 2} units
                </p>
              </div>

              <div className="p-4 bg-[#E8F0FF] rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-900">Total Cost:</span>
                  <span className="text-[#0F67FF]">
                    ${((parseInt(reorderQuantity) || 0) * selectedItem.unitCost).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowReorderDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#0F67FF] hover:bg-[#0F67FF]/90">
                  Submit Reorder Request
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
