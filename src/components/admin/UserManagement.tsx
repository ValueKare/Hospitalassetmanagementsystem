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

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  roleId?: string;
  hospital: string;
  hospitalName?: string;
  department?: string;
  ward?: string;
  status: string;
  parentUser?: { id: string; name: string; role: string };
  parentUserId?: string;
  contactNumber?: string;
  joinedDate?: string;
  permissions?: Record<string, boolean>;
  organizationId?: string;
}

export function UserManagement({ onNavigate, selectedEntity }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status?.toLowerCase() === filterStatus;
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

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/roles`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/hospitals?entityCode=${entityCode}&_t=${timestamp}`, {
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
        const freshResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/hospitals?entityCode=${entityCode}&_fresh=${Date.now()}`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/entity/api/v1/hospitals/${hospitalId}/departments`, {
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

  // Fetch users from API
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams();
      if (selectedEntity?.code) params.append('organizationId', selectedEntity.code);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/employee/list?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        const userList = Array.isArray(data.data) ? data.data : data.data.users || [];
        setUsers(userList);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
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
      
      // Fetch departments for the selected hospital
      const orgId = selectedEntity?.code || employeeForm.organizationId;
      const hId = selectedHospital.hospitalId || hospitalId;
      if (orgId) {
        fetchDepartments(orgId, hId);
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

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/employee/add`, {
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
      resetForm();
      fetchUsers();
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
    fetchRoles();
    fetchUsers();
    
    if (selectedEntity) {
      setEmployeeForm(prev => ({ ...prev, organizationId: selectedEntity.code }));
      fetchHospitals(selectedEntity.code);
    }
  }, [selectedEntity]);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/employee/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete user: ${response.status} ${errorText}`);
      }

      toast.success("User deleted successfully!");
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEmployeeForm({
      name: user.name,
      email: user.email,
      organizationId: user.organizationId || selectedEntity?.code || "",
      hospital: user.hospital,
      department: user.department || "",
      ward: user.ward || "",
      role: user.role,
      roleId: user.roleId || "",
      panel: user.role,
      parentUserId: user.parentUserId || user.parentUser?.id || "",
      permissions: user.permissions || {},
      joinedDate: user.joinedDate || "",
      contactNumber: user.contactNumber || ""
    });
    setIsEditUserOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const payload = {
        name: employeeForm.name,
        email: employeeForm.email,
        hospital: employeeForm.hospital,
        department: employeeForm.department,
        ward: employeeForm.ward,
        role: employeeForm.role,
        roleId: employeeForm.roleId,
        parentUserId: employeeForm.parentUserId,
        permissions: employeeForm.permissions,
        joinedDate: employeeForm.joinedDate,
        contactNumber: employeeForm.contactNumber
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/employee/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update user: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to update user');
      }

      toast.success("User updated successfully!");
      setIsEditUserOpen(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user');
      toast.error(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmployeeForm({
      name: "",
      email: "",
      organizationId: selectedEntity?.code || "",
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
    setError(null);
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
            {usersLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
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
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell className="text-gray-600">{user.hospitalName || user.hospital}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-[#E8F0FF] text-[#0F67FF] border-[#0F67FF]/20">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{user.parentUser?.name || user.parentUserId || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={user.status?.toLowerCase() === "active" ? "default" : "secondary"} 
                             className={user.status?.toLowerCase() === "active" ? "bg-[#0EB57D] hover:bg-[#0EB57D]" : ""}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={(open: boolean) => { setIsEditUserOpen(open); if (!open) { setEditingUser(null); resetForm(); } }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>Update employee details</DialogDescription>
          </DialogHeader>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input 
                id="edit-name" 
                placeholder="Enter full name" 
                value={employeeForm.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address *</Label>
              <Input 
                id="edit-email" 
                type="email" 
                placeholder="user@hospital.com" 
                value={employeeForm.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contactNumber">Contact Number</Label>
              <Input 
                id="edit-contactNumber" 
                placeholder="+1234567890" 
                value={employeeForm.contactNumber}
                onChange={(e) => handleFormChange('contactNumber', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-joinedDate">Joined Date</Label>
              <Input 
                id="edit-joinedDate" 
                type="date" 
                value={employeeForm.joinedDate}
                onChange={(e) => handleFormChange('joinedDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-hospital">Hospital *</Label>
              <Select onValueChange={handleHospitalChange} value={employeeForm.hospital}>
                <SelectTrigger>
                  <SelectValue placeholder="Select hospital" />
                </SelectTrigger>
                <SelectContent>
                  {hospitals.map((hospital) => (
                    <SelectItem key={hospital._id} value={hospital._id}>
                      {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">Department</Label>
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
              <Label htmlFor="edit-ward">Ward</Label>
              <Input 
                id="edit-ward" 
                placeholder="Enter ward" 
                value={employeeForm.ward}
                onChange={(e) => handleFormChange('ward', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role *</Label>
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
              <Label htmlFor="edit-parentUserId">Parent User ID</Label>
              <Input 
                id="edit-parentUserId" 
                placeholder="Enter parent user ID" 
                value={employeeForm.parentUserId}
                onChange={(e) => handleFormChange('parentUserId', e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditUserOpen(false); setEditingUser(null); resetForm(); }}>Cancel</Button>
            <Button 
              onClick={handleUpdateUser} 
              className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
