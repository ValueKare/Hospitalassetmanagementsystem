import { useState, useEffect } from "react";
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
  selectedEntity?: Entity | null;
}

interface Entity {
  _id: string;
  name: string;
  code: string;
  state: string | null;
  city: string | null;
  address: string;
  meta: {
    contactPerson: string;
    email: string;
    phone: string;
    totalBuildings: number;
    totalAssets: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Role {
  _id: string;
  name: string;
  permissions: Record<string, boolean>;
  isSystemRole: boolean;
}

interface Department {
  _id: string;
  departmentId: string;
  name: string;
  code: string;
  organizationId: string;
  hospitalId: string;
  buildingId?: string;
  floorId?: string;
  headOfDepartment?: string;
  totalAssets?: number;
  totalStaff?: number;
  costCenters?: string[];
}

interface Hospital {
  _id: string;
  hospitalId: string;
  name: string;
  code: string;
  organizationId: string;
}

const mockUsers = [
  { id: 1, name: "Sarah Johnson", email: "sarah@cityhospital.com", role: "department-head", hospital: "City General Hospital", status: "active", parent: "Super Admin" },
  { id: 2, name: "Dr. Michael Chen", email: "michael@cityhospital.com", role: "biomedical", hospital: "City General Hospital", status: "active", parent: "Sarah Johnson" },
  { id: 3, name: "Emily Davis", email: "emily@metromed.com", role: "store-manager", hospital: "Metro Medical Center", status: "active", parent: "Admin User" },
  { id: 4, name: "Robert Wilson", email: "robert@regional.com", role: "viewer", hospital: "Regional Health Center", status: "inactive", parent: "Department Head" },
  { id: 5, name: "Lisa Anderson", email: "lisa@community.com", role: "department-head", hospital: "Community Hospital", status: "active", parent: "Super Admin" },
];

export function UserManagement({ onNavigate, selectedEntity }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  
  // Form state for employee addition
  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    email: "",
    organizationId: "",
    hospital: "",
    department: "",
    ward: "",
    role: "",
    roleId: "",
    panel: "",
    parentUserId: "",
    permissions: {} as Record<string, boolean>,
    joinedDate: "",
    contactNumber: ""
  });
  
  // API data states
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('accessToken');
  };

  // Fetch roles from API
  const fetchRoles = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5001/api/roles', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch roles: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.data ? 'API returned unsuccessful response' : 'Invalid response format');
      }

      setRoles(data.data);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError(err instanceof Error ? err.message : 'Failed to load roles');
    }
  };

  // Fetch hospitals based on selected entity
  const fetchHospitals = async (entityCode: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await fetch(`http://localhost:5001/api/dashboard/hospitals?entityCode=${entityCode}&_t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      console.log('Hospitals API response status:', response.status);
      console.log('Hospitals API response headers:', response.headers);

      // Handle 304 responses by making a fresh request
      if (response.status === 304) {
        console.log('Got 304, making fresh request...');
        const freshResponse = await fetch(`http://localhost:5001/api/dashboard/hospitals?entityCode=${entityCode}&_fresh=${Date.now()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        if (freshResponse.ok) {
          const data = await freshResponse.json();
          console.log('Fresh hospitals data:', data);
          
          if (data.success && data.data?.hospitals) {
            setHospitals(data.data.hospitals);
          } else if (data.hospitals) {
            // Handle direct hospitals array response
            setHospitals(data.hospitals);
          } else {
            console.warn('Unexpected hospitals response structure:', data);
          }
        }
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch hospitals: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Hospitals data received:', data);
      
      if (data.success && data.data?.hospitals) {
        setHospitals(data.data.hospitals);
      } else if (data.hospitals) {
        // Handle direct hospitals array response
        setHospitals(data.hospitals);
      } else {
        console.warn('Unexpected hospitals response structure:', data);
      }
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      setError(err instanceof Error ? err.message : 'Failed to load hospitals');
    }
  };

  // Fetch departments based on selected hospital
  const fetchDepartments = async (organizationId: string, hospitalId: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch departments for the specific hospital
      const response = await fetch(`http://localhost:5001/api/entity/api/v1/hospitals/${hospitalId}/departments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      let data;
      if (response.ok) {
        data = await response.json();
        if (data.success && data.data?.departments) {
          setDepartments(data.data.departments);
        } else if (data.departments) {
          // Handle direct departments array response
          setDepartments(data.departments);
        } else {
          console.warn('Unexpected departments response structure:', data);
        }
      } else {
        console.warn('Failed to fetch departments, status:', response.status);
        data = await response.json();
        console.warn('Departments API error response:', data);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load departments');
    }
  };

  // Handle form field changes
  const handleFormChange = (field: string, value: string) => {
    setEmployeeForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle role selection
  const handleRoleChange = (roleId: string) => {
    console.log('Role change triggered with ID:', roleId);
    console.log('Available roles:', roles);
    
    const selectedRole = roles.find(role => role._id === roleId);
    console.log('Found role:', selectedRole);
    
    if (selectedRole) {
      setEmployeeForm(prev => ({
        ...prev,
        roleId,
        role: selectedRole.name.toLowerCase(),
        panel: selectedRole.name.toLowerCase(),
        permissions: selectedRole.permissions
      }));
      console.log('Updated form role fields:', {
        roleId,
        role: selectedRole.name.toLowerCase(),
        panel: selectedRole.name.toLowerCase()
      });
    } else {
      console.error('Role not found with ID:', roleId);
    }
  };

  // Handle hospital change
  const handleHospitalChange = (hospitalId: string) => {
    console.log('Hospital change triggered with ID:', hospitalId);
    console.log('Available hospitals:', hospitals);
    
    const selectedHospital = hospitals.find(h => h._id === hospitalId || h.hospitalId === hospitalId);
    console.log('Found hospital:', selectedHospital);
    
    if (selectedHospital) {
      setEmployeeForm(prev => ({ ...prev, hospital: hospitalId }));
      console.log('Updated form hospital field to:', hospitalId);
      
      // Fetch departments for the selected hospital
      if (employeeForm.organizationId) {
        fetchDepartments(employeeForm.organizationId, hospitalId);
      }
    } else {
      console.error('Hospital not found with ID:', hospitalId);
    }
  };

  // Handle employee creation
  const handleAddUser = async () => {
    setLoading(true);
    setError(null);
    
    // Debug: Log current form state
    console.log('Current form state:', employeeForm);
    console.log('Required fields check:', {
      name: !!employeeForm.name,
      email: !!employeeForm.email,
      organizationId: !!employeeForm.organizationId,
      hospital: !!employeeForm.hospital,
      roleId: !!employeeForm.roleId
    });
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Validate required fields with more specific error messages
      const missingFields = [];
      if (!employeeForm.name) missingFields.push('Name');
      if (!employeeForm.email) missingFields.push('Email');
      if (!employeeForm.organizationId) missingFields.push('Organization');
      if (!employeeForm.hospital) missingFields.push('Hospital');
      if (!employeeForm.roleId) missingFields.push('Role');
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      }

      const payload = {
        name: employeeForm.name,
        email: employeeForm.email,
        organizationId: employeeForm.organizationId,
        hospital: employeeForm.hospital,
        department: employeeForm.department,
        ward: employeeForm.ward,
        role: employeeForm.role,
        roleId: employeeForm.roleId,
        panel: employeeForm.panel,
        parentUserId: employeeForm.parentUserId,
        permissions: employeeForm.permissions,
        joinedDate: employeeForm.joinedDate,
        contactNumber: employeeForm.contactNumber
      };

      const response = await fetch('http://localhost:5001/api/employee/add', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create employee: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create employee');
      }

      toast.success("Employee added successfully!");
      setIsAddUserOpen(false);
      
      // Reset form
      setEmployeeForm({
        name: "",
        email: "",
        organizationId: "",
        hospital: "",
        department: "",
        ward: "",
        role: "",
        roleId: "",
        panel: "",
        parentUserId: "",
        permissions: {},
        joinedDate: "",
        contactNumber: ""
      });
    } catch (err) {
      console.error('Error creating employee:', err);
      setError(err instanceof Error ? err.message : 'Failed to create employee');
      toast.error(err instanceof Error ? err.message : 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  // Load initial data when component mounts or entity changes
  useEffect(() => {
    console.log('UserManagement useEffect triggered, selectedEntity:', selectedEntity);
    fetchRoles();
    
    if (selectedEntity) {
      console.log('Fetching hospitals for entity:', selectedEntity.code);
      setEmployeeForm(prev => ({ ...prev, organizationId: selectedEntity.code }));
      fetchHospitals(selectedEntity.code);
    } else {
      console.log('No selected entity available');
    }
  }, [selectedEntity]);

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
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                    <DialogDescription>Create a new employee account and assign permissions</DialogDescription>
                  </DialogHeader>
                  
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 py-4">
                    {/* Basic Information */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input 
                        id="name" 
                        placeholder="Enter full name" 
                        value={employeeForm.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="user@hospital.com" 
                        value={employeeForm.email}
                        onChange={(e) => handleFormChange('email', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactNumber">Contact Number</Label>
                      <Input 
                        id="contactNumber" 
                        placeholder="+1234567890" 
                        value={employeeForm.contactNumber}
                        onChange={(e) => handleFormChange('contactNumber', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="joinedDate">Joined Date</Label>
                      <Input 
                        id="joinedDate" 
                        type="date" 
                        value={employeeForm.joinedDate}
                        onChange={(e) => handleFormChange('joinedDate', e.target.value)}
                      />
                    </div>
                    
                    {/* Organization and Hospital */}
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization *</Label>
                      <Input 
                        id="organization" 
                        value={selectedEntity?.name || employeeForm.organizationId}
                        disabled
                        className="bg-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hospital">Hospital *</Label>
                      <Select onValueChange={handleHospitalChange} value={employeeForm.hospital}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select hospital" />
                        </SelectTrigger>
                        <SelectContent>
                          {hospitals.length === 0 ? (
                            <SelectItem value="no-hospitals" disabled>
                              No hospitals available
                            </SelectItem>
                          ) : (
                            hospitals.map((hospital) => (
                              <SelectItem key={hospital._id} value={hospital._id}>
                                {hospital.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {hospitals.length === 0 && (
                        <p className="text-xs text-gray-500">No hospitals loaded. Check console for details.</p>
                      )}
                    </div>
                    
                    {/* Department and Ward */}
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select onValueChange={(value: string) => handleFormChange('department', value)} value={employeeForm.department}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((department) => (
                            <SelectItem key={department._id} value={department._id}>
                              {department.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ward">Ward</Label>
                      <Input 
                        id="ward" 
                        placeholder="Enter ward" 
                        value={employeeForm.ward}
                        onChange={(e) => handleFormChange('ward', e.target.value)}
                      />
                    </div>
                    
                    {/* Role and Parent User */}
                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <Select onValueChange={handleRoleChange} value={employeeForm.roleId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role._id} value={role._id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parentUserId">Parent User ID</Label>
                      <Input 
                        id="parentUserId" 
                        placeholder="Enter parent user ID" 
                        value={employeeForm.parentUserId}
                        onChange={(e) => handleFormChange('parentUserId', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
                    <Button 
                      onClick={handleAddUser} 
                      className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]"
                      disabled={loading}
                    >
                      {loading ? 'Creating...' : 'Create Employee'}
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
