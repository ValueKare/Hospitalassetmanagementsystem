import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Truck,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface StoreManagerDashboardProps {
  onNavigate: (screen: string) => void;
}

const stockAlerts = [
  {
    id: 1,
    partId: "SP-001",
    name: "MRI Cooling Coil",
    currentStock: 2,
    reorderLevel: 5,
    status: "Critical",
    vendor: "Siemens Healthineers",
    unitCost: 1200,
  },
  {
    id: 2,
    partId: "SP-004",
    name: "Blood Gas Calibration Kit",
    currentStock: 3,
    reorderLevel: 4,
    status: "Low",
    vendor: "Radiometer",
    unitCost: 320,
  },
  {
    id: 3,
    partId: "SP-007",
    name: "ECG Electrodes (Box)",
    currentStock: 8,
    reorderLevel: 15,
    status: "Low",
    vendor: "3M Healthcare",
    unitCost: 45,
  },
];

const consumptionTrends = [
  { month: "Jan", usage: 120 },
  { month: "Feb", usage: 135 },
  { month: "Mar", usage: 125 },
  { month: "Apr", usage: 145 },
  { month: "May", usage: 150 },
  { month: "Jun", usage: 160 },
];

const topConsumables = [
  { item: "Surgical Gloves", usage: 2400, cost: 1200 },
  { item: "Syringes", usage: 1850, cost: 925 },
  { item: "IV Tubing", usage: 1200, cost: 2400 },
  { item: "Bandages", usage: 980, cost: 490 },
];

export function StoreManagerDashboard({ onNavigate }: StoreManagerDashboardProps) {
  const [showReorderDialog, setShowReorderDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleReorder = (item: any) => {
    setSelectedItem(item);
    setShowReorderDialog(true);
  };

  const getStockPercentage = (current: number, reorder: number) => {
    return Math.min((current / (reorder * 2)) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#F0F9FF]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-gray-900">Store Manager Dashboard</h1>
                  <p className="text-gray-500">Inventory & supply chain management</p>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white">ED</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Inventory Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Total Items</p>
                  <h2 className="mt-2 text-gray-900">248</h2>
                  <p className="text-gray-600 mt-1">In inventory</p>
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
                  <p className="text-gray-500">Critical Stock</p>
                  <h2 className="mt-2 text-gray-900">12</h2>
                  <p className="text-red-600 mt-1">
                    <TrendingDown className="inline h-4 w-4 mr-1" />
                    Immediate action
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-50 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Pending Orders</p>
                  <h2 className="mt-2 text-gray-900">8</h2>
                  <p className="text-blue-600 mt-1">In transit</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Monthly Spend</p>
                  <h2 className="mt-2 text-gray-900">$28.4K</h2>
                  <p className="text-green-600 mt-1">
                    <TrendingUp className="inline h-4 w-4 mr-1" />
                    On budget
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stock Alerts */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Low Stock Alerts</CardTitle>
              <Badge variant="destructive">{stockAlerts.length} Items</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stockAlerts.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-gradient-to-r from-red-50 to-white rounded-lg border border-red-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge
                          className={
                            item.status === "Critical"
                              ? "bg-red-100 text-red-800"
                              : "bg-orange-100 text-orange-800"
                          }
                          variant="outline"
                        >
                          {item.status}
                        </Badge>
                        <p className="text-gray-900">{item.name}</p>
                      </div>
                      <p className="text-gray-600">
                        {item.partId} • {item.vendor} • ${item.unitCost}/unit
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#0F67FF] hover:bg-[#0B4FCC]"
                      onClick={() => handleReorder(item)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Reorder Now
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current Stock: {item.currentStock}</span>
                      <span className="text-gray-600">Reorder Level: {item.reorderLevel}</span>
                    </div>
                    <Progress
                      value={getStockPercentage(item.currentStock, item.reorderLevel)}
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Consumption Trends */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Monthly Consumption Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={consumptionTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="usage"
                    stroke="#0F67FF"
                    strokeWidth={3}
                    name="Items Consumed"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Consumables */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Top Consumables by Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topConsumables} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" stroke="#6B7280" />
                  <YAxis dataKey="item" type="category" stroke="#6B7280" width={120} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="usage" fill="#0F67FF" name="Units Used" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Supplier Quick Links */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Quick Reorder - Frequent Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <Truck className="h-6 w-6 mb-2 text-[#0F67FF]" />
                <span>Siemens Healthineers</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <Truck className="h-6 w-6 mb-2 text-[#0F67FF]" />
                <span>GE Healthcare</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <Truck className="h-6 w-6 mb-2 text-[#0F67FF]" />
                <span>3M Medical</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reorder Dialog */}
      <Dialog open={showReorderDialog} onOpenChange={setShowReorderDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reorder Item</DialogTitle>
            <DialogDescription>Submit purchase order request</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
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
                  <span className="text-gray-500">Unit Cost:</span>
                  <span className="text-gray-900">${selectedItem.unitCost}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Order Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  defaultValue={selectedItem.reorderLevel * 2}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowReorderDialog(false)}>
                  Cancel
                </Button>
                <Button className="bg-[#0F67FF] hover:bg-[#0B4FCC]">Submit Order</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
