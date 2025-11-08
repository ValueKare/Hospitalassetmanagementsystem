import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Building2, Plus, Edit2, Trash2, MapPin, Layers, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface EntitySetupProps {
  onNavigate: (screen: string) => void;
}

const mockHospitals = [
  { id: 1, name: "City General Hospital", code: "CGH-001", location: "New York, NY", buildings: 5, totalAssets: 12450 },
  { id: 2, name: "Metro Medical Center", code: "MMC-002", location: "Los Angeles, CA", buildings: 3, totalAssets: 9800 },
  { id: 3, name: "Regional Health Center", code: "RHC-003", location: "Chicago, IL", buildings: 6, totalAssets: 15600 },
  { id: 4, name: "Community Hospital", code: "CH-004", location: "Houston, TX", buildings: 2, totalAssets: 7560 },
];

const mockBuildings = [
  { id: 1, name: "Main Building", hospital: "City General Hospital", floors: 8, departments: 12 },
  { id: 2, name: "Emergency Wing", hospital: "City General Hospital", floors: 3, departments: 5 },
  { id: 3, name: "Research Center", hospital: "Metro Medical Center", floors: 5, departments: 8 },
];

const mockDepartments = [
  { id: 1, name: "Cardiology", building: "Main Building", floor: "3rd Floor", costCenter: "CC-001", assets: 245 },
  { id: 2, name: "Emergency", building: "Emergency Wing", floor: "Ground Floor", costCenter: "CC-002", assets: 156 },
  { id: 3, name: "Radiology", building: "Main Building", floor: "2nd Floor", costCenter: "CC-003", assets: 189 },
  { id: 4, name: "ICU", building: "Main Building", floor: "5th Floor", costCenter: "CC-004", assets: 312 },
];

export function EntitySetup({ onNavigate }: EntitySetupProps) {
  const [isAddHospitalOpen, setIsAddHospitalOpen] = useState(false);
  const [isAddBuildingOpen, setIsAddBuildingOpen] = useState(false);
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);

  return (
    <div className="flex-1 p-8 bg-[#F9FAFB] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Entity Setup</h1>
        <p className="text-gray-600">Manage hospitals, buildings, floors, and organizational structure</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="hospitals" className="space-y-6">
        <TabsList className="grid w-full md:w-auto grid-cols-4">
          <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
          <TabsTrigger value="buildings">Buildings</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="cost-centers">Cost Centers</TabsTrigger>
        </TabsList>

        {/* Hospitals Tab */}
        <TabsContent value="hospitals">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-900">Hospital Entities</CardTitle>
                  <CardDescription>Manage hospital organizations</CardDescription>
                </div>
                <Dialog open={isAddHospitalOpen} onOpenChange={setIsAddHospitalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Hospital
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Hospital</DialogTitle>
                      <DialogDescription>Register a new hospital entity in the system</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="hospital-name">Hospital Name</Label>
                        <Input id="hospital-name" placeholder="Enter hospital name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hospital-code">Hospital Code</Label>
                        <Input id="hospital-code" placeholder="e.g., CGH-001" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" placeholder="City, State" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact">Contact Person</Label>
                        <Input id="contact" placeholder="Administrator name" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddHospitalOpen(false)}>Cancel</Button>
                      <Button 
                        className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]"
                        onClick={() => {
                          toast.success("Hospital added successfully!");
                          setIsAddHospitalOpen(false);
                        }}
                      >
                        Add Hospital
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
                    <TableHead>Hospital Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Buildings</TableHead>
                    <TableHead>Total Assets</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockHospitals.map((hospital) => (
                    <TableRow key={hospital.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-[#0F67FF]" />
                          {hospital.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-[#E8F0FF] text-[#0F67FF]">
                          {hospital.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">{hospital.location}</TableCell>
                      <TableCell>{hospital.buildings}</TableCell>
                      <TableCell>{hospital.totalAssets.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Buildings Tab */}
        <TabsContent value="buildings">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-900">Building Management</CardTitle>
                  <CardDescription>Manage hospital buildings and facilities</CardDescription>
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
                      <DialogDescription>Add a building to a hospital</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="building-name">Building Name</Label>
                        <Input id="building-name" placeholder="e.g., Main Building" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="building-hospital">Select Hospital</Label>
                        <Input id="building-hospital" placeholder="Search hospital..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="floors">Number of Floors</Label>
                        <Input id="floors" type="number" placeholder="e.g., 8" />
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
                    <TableHead>Hospital</TableHead>
                    <TableHead>Floors</TableHead>
                    <TableHead>Departments</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBuildings.map((building) => (
                    <TableRow key={building.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-[#10B981]" />
                          {building.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{building.hospital}</TableCell>
                      <TableCell>{building.floors}</TableCell>
                      <TableCell>{building.departments}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-900">Department Management</CardTitle>
                  <CardDescription>Manage hospital departments and units</CardDescription>
                </div>
                <Dialog open={isAddDepartmentOpen} onOpenChange={setIsAddDepartmentOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Department
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Department</DialogTitle>
                      <DialogDescription>Create a new department or unit</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="dept-name">Department Name</Label>
                        <Input id="dept-name" placeholder="e.g., Cardiology" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dept-building">Building</Label>
                        <Input id="dept-building" placeholder="Select building..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dept-floor">Floor</Label>
                        <Input id="dept-floor" placeholder="e.g., 3rd Floor" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dept-cost-center">Cost Center Code</Label>
                        <Input id="dept-cost-center" placeholder="e.g., CC-001" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDepartmentOpen(false)}>Cancel</Button>
                      <Button 
                        className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]"
                        onClick={() => {
                          toast.success("Department added successfully!");
                          setIsAddDepartmentOpen(false);
                        }}
                      >
                        Add Department
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
                    <TableHead>Department Name</TableHead>
                    <TableHead>Building</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Cost Center</TableHead>
                    <TableHead>Assets</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockDepartments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#F59E0B]" />
                          {dept.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{dept.building}</TableCell>
                      <TableCell className="text-gray-600">{dept.floor}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-[#FEF3C7] text-[#F59E0B]">
                          {dept.costCenter}
                        </Badge>
                      </TableCell>
                      <TableCell>{dept.assets}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
              <CardTitle className="text-gray-900">Cost Center Management</CardTitle>
              <CardDescription>Manage financial cost centers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Cost center management interface</p>
                <Button className="mt-4 bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Cost Center
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
