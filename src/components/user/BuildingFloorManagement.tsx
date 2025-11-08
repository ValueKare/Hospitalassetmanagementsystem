import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Building2, Layers, Plus, Edit2, MapPin, DollarSign } from "lucide-react";
import { BuildingFloorHierarchy } from "../shared/BuildingFloorHierarchy";
import { toast } from "sonner";

interface BuildingFloorManagementProps {
  onNavigate: (screen: string) => void;
}

const mockBuildings = [
  { id: 1, name: "Main Building", code: "MB", floors: 8, departments: 12, assets: 1245 },
  { id: 2, name: "Emergency Wing", code: "EW", floors: 3, departments: 5, assets: 567 },
  { id: 3, name: "Outpatient Center", code: "OPC", floors: 4, departments: 8, assets: 389 },
];

const mockFloors = [
  { id: 1, building: "Main Building", floor: "Ground Floor", departments: ["Reception", "Pharmacy"], assets: 156 },
  { id: 2, building: "Main Building", floor: "1st Floor", departments: ["Radiology", "Lab"], assets: 234 },
  { id: 3, building: "Main Building", floor: "2nd Floor", departments: ["Cardiology"], assets: 189 },
  { id: 4, building: "Main Building", floor: "3rd Floor", departments: ["Surgery", "ICU"], assets: 312 },
];

const mockCostCenters = [
  { id: 1, code: "CC-001", name: "Cardiology Department", building: "Main Building", floor: "2nd Floor", budget: "$250,000" },
  { id: 2, code: "CC-002", name: "Emergency Department", building: "Emergency Wing", floor: "Ground Floor", budget: "$180,000" },
  { id: 3, code: "CC-003", name: "Radiology Department", building: "Main Building", floor: "1st Floor", budget: "$320,000" },
];

const hierarchyData = [
  {
    id: 1,
    name: "Main Building",
    number: "MB",
    entity: "City General Hospital",
    totalAssets: 1245,
    floors: [
      { id: 1, name: "Ground Floor", number: "GF", assetCount: 156, departments: ["Reception", "Pharmacy"] },
      { id: 2, name: "1st Floor", number: "1F", assetCount: 234, departments: ["Radiology", "Lab"] },
      { id: 3, name: "2nd Floor", number: "2F", assetCount: 189, departments: ["Cardiology"] },
      { id: 4, name: "3rd Floor", number: "3F", assetCount: 312, departments: ["Surgery", "ICU"] },
    ],
  },
  {
    id: 2,
    name: "Emergency Wing",
    number: "EW",
    entity: "City General Hospital",
    totalAssets: 567,
    floors: [
      { id: 5, name: "Ground Floor", number: "GF", assetCount: 345, departments: ["Emergency", "Trauma"] },
      { id: 6, name: "1st Floor", number: "1F", assetCount: 222, departments: ["Observation"] },
    ],
  },
];

export function BuildingFloorManagement({ onNavigate }: BuildingFloorManagementProps) {
  const [isAddBuildingOpen, setIsAddBuildingOpen] = useState(false);
  const [isAddFloorOpen, setIsAddFloorOpen] = useState(false);
  const [isAddCostCenterOpen, setIsAddCostCenterOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<number>();
  const [selectedFloor, setSelectedFloor] = useState<number>();

  return (
    <div className="flex-1 p-8 bg-[#F9FAFB] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Building & Floor Management</h1>
        <p className="text-gray-600">Manage your hospital's physical infrastructure</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-600">Total Buildings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">3</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-600">Total Floors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#0F67FF]">15</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-600">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#10B981]">25</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-600">Cost Centers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">18</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs with Hierarchy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="buildings" className="space-y-6">
            <TabsList className="grid w-full md:w-auto grid-cols-3">
              <TabsTrigger value="buildings">Buildings</TabsTrigger>
              <TabsTrigger value="floors">Floors</TabsTrigger>
              <TabsTrigger value="cost-centers">Cost Centers</TabsTrigger>
            </TabsList>

            {/* Buildings Tab */}
            <TabsContent value="buildings">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-900">Hospital Buildings</CardTitle>
                  <CardDescription>View and manage building information</CardDescription>
                </div>
                <Dialog open={isAddBuildingOpen} onOpenChange={setIsAddBuildingOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Building
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Building</DialogTitle>
                      <DialogDescription>Register a new building in the system</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="building-name">Building Name</Label>
                        <Input id="building-name" placeholder="e.g., Main Building" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="building-code">Building Code</Label>
                        <Input id="building-code" placeholder="e.g., MB" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="floors-count">Number of Floors</Label>
                        <Input id="floors-count" type="number" placeholder="e.g., 8" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddBuildingOpen(false)}>Cancel</Button>
                      <Button 
                        className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]"
                        onClick={() => {
                          toast.success("Building added successfully!");
                          setIsAddBuildingOpen(false);
                        }}
                      >
                        Add Building
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Building Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Floors</TableHead>
                    <TableHead>Departments</TableHead>
                    <TableHead>Total Assets</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBuildings.map((building) => (
                    <TableRow key={building.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-[#0F67FF]" />
                          {building.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-[#E8F0FF] text-[#0F67FF]">
                          {building.code}
                        </Badge>
                      </TableCell>
                      <TableCell>{building.floors}</TableCell>
                      <TableCell>{building.departments}</TableCell>
                      <TableCell>{building.assets}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Floors Tab */}
        <TabsContent value="floors">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-900">Floor Management</CardTitle>
                  <CardDescription>Organize departments by floor</CardDescription>
                </div>
                <Dialog open={isAddFloorOpen} onOpenChange={setIsAddFloorOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Floor Info
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Floor Information</DialogTitle>
                      <DialogDescription>Define floor details and departments</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="floor-building">Building</Label>
                        <Input id="floor-building" placeholder="Select building..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="floor-name">Floor Name</Label>
                        <Input id="floor-name" placeholder="e.g., 3rd Floor" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="floor-departments">Departments (comma-separated)</Label>
                        <Input id="floor-departments" placeholder="e.g., Cardiology, ICU" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddFloorOpen(false)}>Cancel</Button>
                      <Button 
                        className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]"
                        onClick={() => {
                          toast.success("Floor information added!");
                          setIsAddFloorOpen(false);
                        }}
                      >
                        Add Floor
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Building</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Departments</TableHead>
                    <TableHead>Assets</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockFloors.map((floor) => (
                    <TableRow key={floor.id}>
                      <TableCell className="text-gray-600">{floor.building}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-[#10B981]" />
                          {floor.floor}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {floor.departments.map((dept, idx) => (
                            <Badge key={idx} variant="outline" className="bg-[#F0FDF4] text-[#10B981]">
                              {dept}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{floor.assets}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cost Centers Tab */}
        <TabsContent value="cost-centers">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-900">Cost Center Management</CardTitle>
                  <CardDescription>Manage departmental cost centers and budgets</CardDescription>
                </div>
                <Dialog open={isAddCostCenterOpen} onOpenChange={setIsAddCostCenterOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Cost Center
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Cost Center</DialogTitle>
                      <DialogDescription>Create a new departmental cost center</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="cc-code">Cost Center Code</Label>
                        <Input id="cc-code" placeholder="e.g., CC-001" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cc-name">Department Name</Label>
                        <Input id="cc-name" placeholder="e.g., Cardiology Department" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cc-building">Building</Label>
                        <Input id="cc-building" placeholder="Select building..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cc-floor">Floor</Label>
                        <Input id="cc-floor" placeholder="e.g., 2nd Floor" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cc-budget">Annual Budget</Label>
                        <Input id="cc-budget" placeholder="e.g., $250,000" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddCostCenterOpen(false)}>Cancel</Button>
                      <Button 
                        className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]"
                        onClick={() => {
                          toast.success("Cost center created successfully!");
                          setIsAddCostCenterOpen(false);
                        }}
                      >
                        Create Cost Center
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Building</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCostCenters.map((cc) => (
                    <TableRow key={cc.id}>
                      <TableCell>
                        <Badge variant="outline" className="bg-[#FEF3C7] text-[#F59E0B]">
                          {cc.code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#F59E0B]" />
                          {cc.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{cc.building}</TableCell>
                      <TableCell className="text-gray-600">{cc.floor}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-gray-900">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          {cc.budget}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>

        {/* Right Panel - Building Hierarchy */}
        <div className="lg:col-span-1">
          <BuildingFloorHierarchy
            data={hierarchyData}
            selectedBuilding={selectedBuilding}
            selectedFloor={selectedFloor}
            onBuildingSelect={setSelectedBuilding}
            onFloorSelect={(buildingId, floorId) => {
              setSelectedBuilding(buildingId);
              setSelectedFloor(floorId);
              toast.success(`Selected floor from ${hierarchyData.find(b => b.id === buildingId)?.name}`);
            }}
          />
        </div>
      </div>
    </div>
  );
}
