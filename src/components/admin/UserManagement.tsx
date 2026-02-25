import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Search, Plus, Edit2, Trash2, Download, Eye } from "lucide-react";
import { toast } from "sonner";

interface UserManagementProps {
  onNavigate: (screen: string) => void;
  selectedEntity?: Entity | null;
  userRoleFilter?: string; // 'audit' for audit users, undefined for regular admins
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
  name?: string;
  username?: string;
  email: string;
  role: string;
  roleId?: string | { _id: string; name: string; permissions?: Record<string, boolean> };
  hospital?: string | { _id: string; name: string; hospitalId?: string };
  hospitalId?: string | { _id: string; name: string; hospitalId?: string };
  hospitalName?: string;
  department?: string | { _id: string; name: string; code?: string };
  ward?: string;
  status?: string;
  isOnline?: boolean;
  parentUser?: { id: string; name: string; role: string };
  parentUserId?: string;
  contactNumber?: string;
  joinedDate?: string;
  permissions?: Record<string, boolean>;
  organizationId?: string;
  panel?: string;
  lastActive?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Helper function to get hospital name from user
const getHospitalName = (user: User): string => {
  if (user.hospitalName) return user.hospitalName;
  const hospitalField = user.hospital || user.hospitalId;
  if (typeof hospitalField === 'string') return hospitalField;
  return hospitalField?.name || '';
};

// Helper function to get hospital ID from user
const getHospitalId = (user: User): string => {
  const hospitalField = user.hospital || user.hospitalId;
  if (typeof hospitalField === 'string') return hospitalField;
  return hospitalField?._id || '';
};

// Helper function to get department ID from user
const getDepartmentId = (user: User): string => {
  if (!user.department) return '';
  if (typeof user.department === 'string') return user.department;
  return user.department._id || '';
};

// Helper function to get user name
const getUserName = (user: User): string => {
  return user.name || user.username || 'Unknown';
};

export function UserManagement({ selectedEntity, userRoleFilter }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isViewUserOpen, setIsViewUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
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
    const userName = getUserName(user);
    const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
  const fetchDepartments = async (_organizationId: string, hospitalId: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (!hospitalId) {
        setDepartments([]);
        return;
      }

      console.log('Fetching departments for hospital:', hospitalId);

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
        console.log('Departments API response:', data);
        if (data.success && data.data?.departments) {
          setDepartments(data.data.departments);
        } else if (data.departments) {
          // Handle direct departments array response
          setDepartments(data.departments);
        } else {
          console.warn('Unexpected departments response structure:', data);
          setDepartments([]);
        }
      } else {
        console.warn('Failed to fetch departments, status:', response.status);
        try {
          data = await response.json();
          console.warn('Departments API error response:', data);
        } catch (e) {
          console.warn('Could not parse error response');
        }
        setDepartments([]);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      setDepartments([]);
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
      
      // Get current user info from localStorage to check if superadmin
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const isSuperadmin = currentUser?.role === 'superadmin';
      
      // For superadmin, include all admins across all organizations
      if (isSuperadmin) {
        params.append('includeAll', 'true');
      } else if (selectedEntity?.code) {
        params.append('organizationId', selectedEntity.code);
      }
      
      // Add role filter for audit users
      if (userRoleFilter) {
        params.append('role', userRoleFilter);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/employee/all?${params.toString()}`, {
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
      console.log('Users API response:', data);
      if (data.success && data.data) {
        const userList = Array.isArray(data.data) ? data.data : data.data.users || [];
        console.log('Setting users list:', userList.length, 'users');
        setUsers(userList);
      } else {
        console.warn('Unexpected API response format:', data);
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
  const handleRoleChange = (roleValue: string) => {
    console.log('Role change triggered with value:', roleValue);
    
    // Map role values to their display names and permissions
    const roleConfig: Record<string, { displayName: string; panel: string; permissions: Record<string, boolean> }> = {
      'auditadmin': {
        displayName: 'Audit Admin',
        panel: 'audit',
        permissions: {
          'audit.read': true,
          'audit.write': true,
          'audit.delete': false,
          'audit.manage': true
        }
      },
      'admin': {
        displayName: 'Admin',
        panel: 'admin',
        permissions: {
          'admin.read': true,
          'admin.write': true,
          'admin.delete': true,
          'admin.manage': true
        }
      },
      'cfo': {
        displayName: 'CFO',
        panel: 'finance',
        permissions: {
          'finance.read': true,
          'finance.write': true,
          'finance.reports': true
        }
      },
      'hod': {
        displayName: 'HOD',
        panel: 'department',
        permissions: {
          'department.read': true,
          'department.write': true,
          'department.manage': true
        }
      },
      'staff': {
        displayName: 'Staff',
        panel: 'staff',
        permissions: {
          'staff.read': true,
          'staff.write': false
        }
      },
      'doctor': {
        displayName: 'Doctor',
        panel: 'doctor',
        permissions: {
          'doctor.read': true,
          'doctor.write': true,
          'doctor.patient': true
        }
      }
    };
    
    const config = roleConfig[roleValue];
    if (config) {
      setEmployeeForm(prev => ({
        ...prev,
        roleId: roleValue,
        role: roleValue, // Store the database format value
        panel: config.panel,
        permissions: config.permissions
      }));
      console.log('Updated form role fields:', {
        roleId: roleValue,
        role: roleValue,
        panel: config.panel
      });
    } else {
      console.error('Unknown role value:', roleValue);
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

  // Fetch departments when edit dialog opens and hospital is already selected
  useEffect(() => {
    if (isEditUserOpen && employeeForm.hospital && employeeForm.organizationId) {
      console.log('Edit dialog opened with hospital:', employeeForm.hospital);
      fetchDepartments(employeeForm.organizationId, employeeForm.hospital);
    }
  }, [isEditUserOpen]);

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
    
    // Get roleId as string
    const roleIdStr = typeof user.roleId === 'string' 
      ? user.roleId 
      : user.roleId?._id || '';
    
    const hospitalId = getHospitalId(user);
    const orgId = user.organizationId || selectedEntity?.code || "";
    
    setEmployeeForm({
      name: user.name || user.username || '',
      email: user.email,
      organizationId: orgId,
      hospital: hospitalId,
      department: getDepartmentId(user),
      ward: user.ward || "",
      role: user.role,
      roleId: roleIdStr,
      panel: user.panel || user.role,
      parentUserId: user.parentUserId || user.parentUser?.id || "",
      permissions: user.permissions || {},
      joinedDate: user.joinedDate || "",
      contactNumber: user.contactNumber || ""
    });
    
    // Fetch departments for the selected hospital if hospital is set
    if (hospitalId && orgId) {
      fetchDepartments(orgId, hospitalId);
    }
    
    setIsEditUserOpen(true);
  };

  const handleViewUser = (user: User) => {
    setViewingUser(user);
    setIsViewUserOpen(true);
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
        <h1 className="text-gray-900 mb-2">
          {userRoleFilter === 'audit' ? 'Audit User Management' : 'User Management'}
        </h1>
        <p className="text-gray-600">
          {userRoleFilter === 'audit' 
            ? 'Manage audit administrator accounts and permissions' 
            : 'Manage user accounts and permissions across all hospitals'}
        </p>
      </div>

      {/* Stats Cards - Dynamic based on users data */}
      {(() => {
        // Filter users based on role filter
        const filteredUsers = userRoleFilter === 'audit' 
          ? users.filter(u => 
              ['audit', 'audit-admin', 'audit_admin', 'auditadmin'].includes(
                (u.role || '').toLowerCase()
              )
            )
          : users;
        
        const totalUsers = filteredUsers.length;
        const activeUsers = filteredUsers.filter(u => u.status?.toLowerCase() === 'active' || u.isOnline).length;
        const inactiveUsers = filteredUsers.filter(u => u.status?.toLowerCase() === 'inactive' || (!u.status && !u.isOnline)).length;
        
        // Calculate new users this month (based on createdAt from MongoDB)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newThisMonth = filteredUsers.filter(u => {
          // Check createdAt field (from MongoDB) or joinedDate
          const userDate = u.createdAt ? new Date(u.createdAt) : 
                          u.joinedDate ? new Date(u.joinedDate) : null;
          return userDate && userDate >= startOfMonth;
        }).length;
        
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-gray-600">
                  {userRoleFilter === 'audit' ? 'Total Audit Users' : 'Total Users'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900">{totalUsers.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-gray-600">
                  {userRoleFilter === 'audit' ? 'Active Audit Users' : 'Active Users'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#0EB57D]">{activeUsers.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-gray-600">
                  {userRoleFilter === 'audit' ? 'Inactive Audit Users' : 'Inactive Users'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#F59E0B]">{inactiveUsers.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-gray-600">New This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#0F67FF]">{newThisMonth.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* Main Content */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-gray-900">
                {userRoleFilter === 'audit' ? 'Audit Users' : 'All Users'}
              </CardTitle>
              <CardDescription>
                {userRoleFilter === 'audit' 
                  ? 'Manage and monitor audit administrator accounts' 
                  : 'Manage and monitor user accounts'}
              </CardDescription>
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
                    {userRoleFilter === 'audit' ? 'Add Audit User' : 'Add User'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {userRoleFilter === 'audit' ? 'Add New Audit User' : 'Add New Employee'}
                    </DialogTitle>
                    <DialogDescription>
                      {userRoleFilter === 'audit' 
                        ? 'Create a new audit administrator account' 
                        : 'Create a new employee account and assign permissions'}
                    </DialogDescription>
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
                          {departments.length === 0 ? (
                            <SelectItem value="no-departments" disabled>
                              No departments available
                            </SelectItem>
                          ) : (
                            departments.map((department) => (
                              <SelectItem key={department._id} value={department._id}>
                                {department.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {departments.length === 0 && employeeForm.hospital && (
                        <p className="text-xs text-gray-500">No departments found for this hospital.</p>
                      )}
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
                          {userRoleFilter === 'audit' ? (
                            // Audit mode: only show Audit Admin
                            <SelectItem value="auditadmin">Audit Admin</SelectItem>
                          ) : (
                            // All available roles with display name and database value
                            <>
                              <SelectItem value="auditadmin">Audit Admin</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="cfo">CFO</SelectItem>
                              <SelectItem value="hod">HOD</SelectItem>
                              <SelectItem value="staff">Staff</SelectItem>
                              <SelectItem value="doctor">Doctor</SelectItem>
                            </>
                          )}
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
                {userRoleFilter === 'audit' ? (
                  // Audit mode: only show audit-related roles
                  <SelectItem value="auditadmin">Audit Admin</SelectItem>
                ) : (
                  // Regular mode: show all roles (database format values)
                  <>
                    <SelectItem value="auditadmin">Audit Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="cfo">CFO</SelectItem>
                    <SelectItem value="hod">HOD</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                  </>
                )}
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
                    <TableCell>{getUserName(user)}</TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell className="text-gray-600">{getHospitalName(user)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-[#E8F0FF] text-[#0F67FF] border-[#0F67FF]/20">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{user.parentUser?.name || user.parentUserId || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={user.status?.toLowerCase() === "active" ? "default" : "secondary"} 
                             className={user.status?.toLowerCase() === "active" ? "bg-[#0EB57D] hover:bg-[#0EB57D]" : ""}>
                        {user.status || (user.isOnline ? 'Active' : 'Inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewUser(user)}
                          title="View User"
                        >
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
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
                  {departments.length === 0 ? (
                    <SelectItem value="no-departments" disabled>
                      No departments available
                    </SelectItem>
                  ) : (
                    departments.map((department) => (
                      <SelectItem key={department._id} value={department._id}>
                        {department.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {departments.length === 0 && (
                <p className="text-xs text-gray-500">No departments found for this hospital.</p>
              )}
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

      {/* View User Dialog */}
      <Dialog open={isViewUserOpen} onOpenChange={(open: boolean) => { setIsViewUserOpen(open); if (!open) setViewingUser(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>View user credentials and information</DialogDescription>
          </DialogHeader>
          
          {viewingUser && (
            <div className="py-4 space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500 text-sm">Full Name</Label>
                    <p className="font-medium">{getUserName(viewingUser)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-sm">Email Address</Label>
                    <p className="font-medium">{viewingUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-sm">Username</Label>
                    <p className="font-medium">{viewingUser.username || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-sm">Contact Number</Label>
                    <p className="font-medium">{viewingUser.contactNumber || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Role & Organization */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Role & Organization</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500 text-sm">Role</Label>
                    <p className="font-medium">
                      <Badge variant="outline" className="bg-[#E8F0FF] text-[#0F67FF] border-[#0F67FF]/20 mt-1">
                        {viewingUser.role}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-sm">Panel</Label>
                    <p className="font-medium">{viewingUser.panel || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-sm">Organization ID</Label>
                    <p className="font-medium">{viewingUser.organizationId || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-sm">Hospital</Label>
                    <p className="font-medium">{getHospitalName(viewingUser) || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Department & Ward */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Department & Location</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500 text-sm">Department</Label>
                    <p className="font-medium">
                      {typeof viewingUser.department === 'string' 
                        ? viewingUser.department 
                        : viewingUser.department?.name || '-'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-sm">Ward</Label>
                    <p className="font-medium">{viewingUser.ward || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Status & Activity */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Status & Activity</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500 text-sm">Status</Label>
                    <p className="font-medium">
                      <Badge 
                        variant={viewingUser.status?.toLowerCase() === "active" ? "default" : "secondary"} 
                        className={viewingUser.status?.toLowerCase() === "active" ? "bg-[#0EB57D] hover:bg-[#0EB57D] mt-1" : "mt-1"}
                      >
                        {viewingUser.status || (viewingUser.isOnline ? 'Active' : 'Inactive')}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-sm">Online Status</Label>
                    <p className="font-medium">{viewingUser.isOnline ? '🟢 Online' : '⚪ Offline'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-sm">Joined Date</Label>
                    <p className="font-medium">{viewingUser.joinedDate || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-sm">Last Active</Label>
                    <p className="font-medium">
                      {viewingUser.lastActive 
                        ? new Date(viewingUser.lastActive).toLocaleString() 
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Parent User */}
              {viewingUser.parentUser && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Parent User</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500 text-sm">Name</Label>
                      <p className="font-medium">{viewingUser.parentUser.name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 text-sm">Role</Label>
                      <p className="font-medium">{viewingUser.parentUser.role}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Permissions */}
              {viewingUser.permissions && Object.keys(viewingUser.permissions).length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Permissions</h3>
                  <div className="space-y-2">
                    {Object.entries(viewingUser.permissions).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{key}</span>
                        <Badge variant={value ? "default" : "secondary"} className={value ? "bg-green-500" : ""}>
                          {value ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsViewUserOpen(false); setViewingUser(null); }}>Close</Button>
            <Button 
              onClick={() => { 
                setIsViewUserOpen(false); 
                if (viewingUser) handleEditUser(viewingUser); 
              }} 
              className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]"
            >
              Edit User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
