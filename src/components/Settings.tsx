import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, Edit, Trash2, Mail, Shield, Users, Building } from "lucide-react";

interface SettingsProps {
  onNavigate: (screen: string) => void;
  userRole: string;
}

const users = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@hospital.com",
    role: "Hospital Admin",
    department: "Administration",
    status: "Active",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.j@hospital.com",
    role: "Department Head",
    department: "Radiology",
    status: "Active",
  },
  {
    id: 3,
    name: "Michael Chen",
    email: "m.chen@hospital.com",
    role: "Staff",
    department: "Biomedical",
    status: "Active",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.d@hospital.com",
    role: "Department Head",
    department: "ICU",
    status: "Active",
  },
];

const departments = [
  { id: 1, name: "Radiology", head: "Sarah Johnson", assetCount: 450, budget: 500000 },
  { id: 2, name: "ICU", head: "Emily Davis", assetCount: 320, budget: 350000 },
  { id: 3, name: "Surgery", head: "Not Assigned", assetCount: 280, budget: 400000 },
  { id: 4, name: "Laboratory", head: "Not Assigned", assetCount: 150, budget: 200000 },
  { id: 5, name: "Emergency", head: "Not Assigned", assetCount: 180, budget: 250000 },
];

const permissions = [
  { module: "Asset Management", admin: true, deptHead: true, staff: false },
  { module: "Add/Edit Assets", admin: true, deptHead: true, staff: false },
  { module: "Delete Assets", admin: true, deptHead: false, staff: false },
  { module: "Maintenance Scheduling", admin: true, deptHead: true, staff: true },
  { module: "Inventory Management", admin: true, deptHead: true, staff: true },
  { module: "Generate Reports", admin: true, deptHead: true, staff: false },
  { module: "User Management", admin: true, deptHead: false, staff: false },
  { module: "System Settings", admin: true, deptHead: false, staff: false },
];

export function Settings({ onNavigate, userRole }: SettingsProps) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showDepartmentDialog, setShowDepartmentDialog] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
  });
  const [departmentForm, setDepartmentForm] = useState({
    name: "",
    head: "",
    budget: "",
  });

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    setShowInviteDialog(false);
    setInviteForm({ name: "", email: "", role: "", department: "" });
  };

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDepartmentDialog(false);
    setDepartmentForm({ name: "", head: "", budget: "" });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div>
            <h1 className="text-gray-900">Settings & Access Control</h1>
            <p className="text-gray-500">Manage users, departments, and permissions</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="departments">
              <Building className="h-4 w-4 mr-2" />
              Departments
            </TabsTrigger>
            <TabsTrigger value="permissions">
              <Shield className="h-4 w-4 mr-2" />
              Permissions
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user accounts and roles</CardDescription>
                </div>
                <Button onClick={() => setShowInviteDialog(true)} className="bg-[#0F67FF] hover:bg-[#0F67FF]/90">
                  <Plus className="h-5 w-5 mr-2" />
                  Invite User
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50">
                          <TableCell>{user.name}</TableCell>
                          <TableCell className="text-gray-600">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-[#E8F0FF] text-[#0F67FF]">
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.department}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
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

            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Total Users</p>
                      <h2 className="mt-2 text-gray-900">{users.length}</h2>
                    </div>
                    <div className="w-12 h-12 bg-[#E8F0FF] rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-[#0F67FF]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Admins</p>
                      <h2 className="mt-2 text-gray-900">1</h2>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Shield className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Department Heads</p>
                      <h2 className="mt-2 text-gray-900">2</h2>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                      <Building className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Department Setup</CardTitle>
                  <CardDescription>Configure departments and assign heads</CardDescription>
                </div>
                <Button onClick={() => setShowDepartmentDialog(true)} className="bg-[#0F67FF] hover:bg-[#0F67FF]/90">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Department
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department Name</TableHead>
                        <TableHead>Department Head</TableHead>
                        <TableHead>Assets</TableHead>
                        <TableHead>Annual Budget</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departments.map((dept) => (
                        <TableRow key={dept.id} className="hover:bg-gray-50">
                          <TableCell>{dept.name}</TableCell>
                          <TableCell>
                            {dept.head !== "Not Assigned" ? (
                              dept.head
                            ) : (
                              <span className="text-gray-400">{dept.head}</span>
                            )}
                          </TableCell>
                          <TableCell>{dept.assetCount}</TableCell>
                          <TableCell>${dept.budget.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
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
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Role-Based Permission Matrix</CardTitle>
                <CardDescription>Define access levels for each user role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Module / Feature</TableHead>
                        <TableHead className="text-center">Hospital Admin</TableHead>
                        <TableHead className="text-center">Department Head</TableHead>
                        <TableHead className="text-center">Staff</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions.map((perm, index) => (
                        <TableRow key={index} className="hover:bg-gray-50">
                          <TableCell>{perm.module}</TableCell>
                          <TableCell className="text-center">
                            <Switch checked={perm.admin} disabled={userRole !== "admin"} />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch checked={perm.deptHead} disabled={userRole !== "admin"} />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch checked={perm.staff} disabled={userRole !== "admin"} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Permission Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="text-gray-900">Hospital Admin</h4>
                        <p className="text-gray-600">
                          Full system access including user management, settings configuration, and all asset operations.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Building className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="text-gray-900">Department Head</h4>
                        <p className="text-gray-600">
                          Can manage assets within their department, schedule maintenance, generate reports, and manage inventory.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Users className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="text-gray-900">Staff / Biomedical / Store Manager</h4>
                        <p className="text-gray-600">
                          Operational access to view assets, schedule maintenance, and manage inventory for their assigned areas.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Invite User Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
            <DialogDescription>Send an invitation to a new team member</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={inviteForm.name}
                onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@hospital.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={inviteForm.role} onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Hospital Admin</SelectItem>
                  <SelectItem value="dept-head">Department Head</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={inviteForm.department}
                onValueChange={(value) => setInviteForm({ ...inviteForm, department: value })}
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

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0F67FF] hover:bg-[#0F67FF]/90">
                <Mail className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Department Dialog */}
      <Dialog open={showDepartmentDialog} onOpenChange={setShowDepartmentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Department</DialogTitle>
            <DialogDescription>Create a new department in the system</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddDepartment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deptName">Department Name</Label>
              <Input
                id="deptName"
                placeholder="e.g., Cardiology"
                value={departmentForm.name}
                onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deptHead">Department Head</Label>
              <Select
                value={departmentForm.head}
                onValueChange={(value) => setDepartmentForm({ ...departmentForm, head: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department head" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Not Assigned</SelectItem>
                  <SelectItem value="john">John Smith</SelectItem>
                  <SelectItem value="sarah">Sarah Johnson</SelectItem>
                  <SelectItem value="emily">Emily Davis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Annual Budget</Label>
              <Input
                id="budget"
                type="number"
                placeholder="0"
                value={departmentForm.budget}
                onChange={(e) => setDepartmentForm({ ...departmentForm, budget: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowDepartmentDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0F67FF] hover:bg-[#0F67FF]/90">
                Add Department
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
