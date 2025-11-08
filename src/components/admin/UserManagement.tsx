import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Search, Plus, Edit2, Trash2, UserPlus, Download } from "lucide-react";
import { toast } from "sonner";

interface UserManagementProps {
  onNavigate: (screen: string) => void;
}

const mockUsers = [
  { id: 1, name: "Sarah Johnson", email: "sarah@cityhospital.com", role: "department-head", hospital: "City General Hospital", status: "active", parent: "Super Admin" },
  { id: 2, name: "Dr. Michael Chen", email: "michael@cityhospital.com", role: "biomedical", hospital: "City General Hospital", status: "active", parent: "Sarah Johnson" },
  { id: 3, name: "Emily Davis", email: "emily@metromed.com", role: "store-manager", hospital: "Metro Medical Center", status: "active", parent: "Admin User" },
  { id: 4, name: "Robert Wilson", email: "robert@regional.com", role: "viewer", hospital: "Regional Health Center", status: "inactive", parent: "Department Head" },
  { id: 5, name: "Lisa Anderson", email: "lisa@community.com", role: "department-head", hospital: "Community Hospital", status: "active", parent: "Super Admin" },
];

export function UserManagement({ onNavigate }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = () => {
    toast.success("User added successfully!");
    setIsAddUserOpen(false);
  };

  const handleDeleteUser = (userId: number) => {
    toast.success("User deleted successfully!");
  };

  return (
    <div className="flex-1 p-8 bg-[#F9FAFB] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage user accounts and permissions across all hospitals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-600">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">1,256</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-600">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#0EB57D]">1,189</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-600">Inactive Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#F59E0B]">67</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-600">New This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#0F67FF]">48</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-gray-900">All Users</CardTitle>
              <CardDescription>Manage and monitor user accounts</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC] hover:from-[#0B4FCC] hover:to-[#0F67FF]">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>Create a new user account and assign permissions</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="Enter full name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="user@hospital.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hospital">Hospital</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select hospital" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="city">City General Hospital</SelectItem>
                          <SelectItem value="metro">Metro Medical Center</SelectItem>
                          <SelectItem value="regional">Regional Health Center</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="department-head">Department Head</SelectItem>
                          <SelectItem value="biomedical">Biomedical Manager</SelectItem>
                          <SelectItem value="store-manager">Store Manager</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parent">Parent User</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent user" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="super-admin">Super Admin</SelectItem>
                          <SelectItem value="dept-head">Department Head</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Initial Password</Label>
                      <Input id="password" type="password" placeholder="Enter password" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddUser} className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]">
                      Create User
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="department-head">Department Head</SelectItem>
                <SelectItem value="biomedical">Biomedical</SelectItem>
                <SelectItem value="store-manager">Store Manager</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Parent User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell className="text-gray-600">{user.hospital}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-[#E8F0FF] text-[#0F67FF] border-[#0F67FF]/20">
                        {user.role === "department-head" ? "Dept Head" :
                         user.role === "biomedical" ? "Biomedical" :
                         user.role === "store-manager" ? "Store Mgr" :
                         "Viewer"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{user.parent}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "default" : "secondary"} 
                             className={user.status === "active" ? "bg-[#0EB57D] hover:bg-[#0EB57D]" : ""}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
  );
}
