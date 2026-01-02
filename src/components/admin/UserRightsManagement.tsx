import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Shield, Search, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface UserRightsManagementProps {
  onNavigate: (screen: string) => void;
}

// API Response Types
interface ApiPermission {
  [key: string]: boolean;
}

interface ApiRolePermissions {
  asset: ApiPermission;
  audit: ApiPermission;
  maintenance: ApiPermission;
  user: ApiPermission;
  approval: ApiPermission;
  reports: ApiPermission;
  system: ApiPermission;
}

interface ApiRole {
  permissions: ApiRolePermissions;
  _id: string;
  name: string;
  description: string;
  roleType: string;
  isSystemRole: boolean;
}

interface RolesApiResponse {
  success: boolean;
  data: ApiRole[];
}

interface UpdateRoleResponse {
  success: boolean;
  message: string;
  data: ApiRole & {
    createdAt: string;
    updatedAt: string;
  };
}

// Permission categories for UI organization
const permissionCategories = [
  {
    key: "asset",
    label: "Asset Management",
    permissions: [
      { key: "view", label: "View Assets" },
      { key: "create", label: "Add Assets" },
      { key: "update", label: "Edit Assets" },
      { key: "transfer", label: "Transfer Assets" },
      { key: "scrap_request", label: "Request Scrap" },
      { key: "scrap_approve", label: "Approve Scrap" }
    ]
  },
  {
    key: "audit",
    label: "Audit Management",
    permissions: [
      { key: "initiate", label: "Initiate Audit" },
      { key: "assign", label: "Assign Audits" },
      { key: "verify", label: "Verify Audits" },
      { key: "submit", label: "Submit Audit" },
      { key: "close", label: "Close Audit" },
      { key: "view_reports", label: "View Audit Reports" }
    ]
  },
  {
    key: "maintenance",
    label: "Maintenance",
    permissions: [
      { key: "log", label: "Log Maintenance" },
      { key: "view", label: "View Maintenance" },
      { key: "approve", label: "Approve Maintenance" }
    ]
  },
  {
    key: "user",
    label: "User Management",
    permissions: [
      { key: "create", label: "Add Users" },
      { key: "update", label: "Edit Users" },
      { key: "suspend", label: "Suspend Users" },
      { key: "assign_role", label: "Assign Roles" }
    ]
  },
  {
    key: "approval",
    label: "Approval Workflow",
    permissions: [
      { key: "asset_transfer", label: "Approve Transfers" },
      { key: "procurement", label: "Approve Procurement" },
      { key: "scrap", label: "Approve Scrap" }
    ]
  },
  {
    key: "reports",
    label: "Reports",
    permissions: [
      { key: "asset_utilization", label: "Asset Utilization" },
      { key: "maintenance", label: "Maintenance Reports" },
      { key: "audit", label: "Audit Reports" }
    ]
  },
  {
    key: "system",
    label: "System Administration",
    permissions: [
      { key: "manage_organizations", label: "Manage Organizations" },
      { key: "manage_hospitals", label: "Manage Hospitals" },
      { key: "view_all_data", label: "View All Data" }
    ]
  }
];

export function UserRightsManagement({ onNavigate }: UserRightsManagementProps) {
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<ApiRole | null>(null);
  const [currentPermissions, setCurrentPermissions] = useState<ApiRolePermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('accessToken');
  };

  // Fetch roles from API
  const fetchRoles = async () => {
    setIsLoading(true);
    setError(null);
    
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

      const data: RolesApiResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.data ? 'API returned unsuccessful response' : 'Invalid response format');
      }

      setRoles(data.data);
      
      // Select first role by default
      if (data.data.length > 0) {
        setSelectedRole(data.data[0]);
        setCurrentPermissions(data.data[0].permissions);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError(err instanceof Error ? err.message : 'Failed to load roles');
      toast.error('Failed to load roles');
    } finally {
      setIsLoading(false);
    }
  };

  // Load roles on component mount
  useEffect(() => {
    fetchRoles();
  }, []);

  const handleRoleChange = (roleId: string) => {
    const role = roles.find(r => r._id === roleId);
    if (role) {
      setSelectedRole(role);
      setCurrentPermissions(role.permissions);
    }
  };

  const handlePermissionToggle = (category: string, permission: string) => {
    if (!currentPermissions || !selectedRole) return;

    const updatedPermissions = {
      ...currentPermissions,
      [category]: {
        ...currentPermissions[category as keyof ApiRolePermissions],
        [permission]: !currentPermissions[category as keyof ApiRolePermissions][permission]
      }
    };

    setCurrentPermissions(updatedPermissions);
  };

  const handleSavePermissions = async () => {
    if (!selectedRole || !currentPermissions) return;

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5001/api/roles/${selectedRole._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: selectedRole.name,
          description: selectedRole.description,
          roleType: selectedRole.roleType,
          permissions: currentPermissions
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update role: ${response.status} ${response.statusText}`);
      }

      const result: UpdateRoleResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update role permissions');
      }

      // Update the role in the local state with the updated data
      setRoles(prevRoles => 
        prevRoles.map(role => 
          role._id === selectedRole._id 
            ? { ...role, permissions: result.data.permissions }
            : role
        )
      );

      // Update selected role with new permissions
      setSelectedRole(prev => prev ? { ...prev, permissions: result.data.permissions } : null);

      toast.success("Permissions updated successfully!", {
        description: `Role "${result.data.name}" has been updated`
      });
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('Failed to save permissions', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  };

  const handleResetPermissions = () => {
    if (selectedRole) {
      setCurrentPermissions(selectedRole.permissions);
      toast.info("Permissions reset to default");
    }
  };

  return (
    <div className="flex-1 p-8 bg-[#F9FAFB] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">User Rights Management</h1>
        <p className="text-gray-600">Configure role-based permissions and access control</p>
      </div>

      {/* Role Selector Card */}
      <Card className="border-0 shadow-md mb-6">
        <CardHeader>
          <CardTitle className="text-gray-900">Select Role to Configure</CardTitle>
          <CardDescription>Choose a role to view and modify its permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Shield className="h-8 w-8 text-[#0F67FF]" />
            {isLoading ? (
              <div className="text-gray-600">Loading roles...</div>
            ) : error ? (
              <div className="text-red-600">Error: {error}</div>
            ) : (
              <Select 
                value={selectedRole?._id || ""} 
                onValueChange={handleRoleChange}
                disabled={roles.length === 0}
              >
                <SelectTrigger className="w-full md:w-96">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role._id} value={role._id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{role.name}</span>
                        <span className="text-sm text-gray-500">{role.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          {selectedRole && (
            <div className="mt-4 flex items-center gap-2">
              <Badge variant={selectedRole.isSystemRole ? "default" : "secondary"}>
                {selectedRole.isSystemRole ? "System Role" : "Custom Role"}
              </Badge>
              <Badge variant="outline">{selectedRole.roleType}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permissions Grid */}
      {currentPermissions && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900">Permissions Matrix</CardTitle>
                <CardDescription>Green = Allowed, Red = Restricted</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleResetPermissions}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={handleSavePermissions} className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {permissionCategories.map((category) => (
                <div key={category.key} className="border rounded-lg p-6">
                  <h3 className="text-gray-900 mb-4">{category.label}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.permissions.map((permission) => {
                      const isAllowed = currentPermissions[category.key as keyof ApiRolePermissions]?.[permission.key] || false;
                      return (
                        <div
                          key={`${category.key}-${permission.key}`}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                            isAllowed
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              isAllowed ? "bg-green-500" : "bg-red-500"
                            }`} />
                            <span className="text-gray-900">{permission.label}</span>
                          </div>
                          <Switch
                            checked={isAllowed}
                            onCheckedChange={() => handlePermissionToggle(category.key, permission.key)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Permission Summary */}
      {currentPermissions && (
        <Card className="border-0 shadow-md mt-6">
          <CardHeader>
            <CardTitle className="text-gray-900">Permission Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-gray-600">Allowed</p>
                <p className="text-green-600">
                  {Object.values(currentPermissions).reduce((acc, category) => 
                    acc + Object.values(category).filter(v => v).length, 0
                  )}
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-gray-600">Restricted</p>
                <p className="text-red-600">
                  {Object.values(currentPermissions).reduce((acc, category) => 
                    acc + Object.values(category).filter(v => !v).length, 0
                  )}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-600">Categories</p>
                <p className="text-blue-600">{Object.keys(currentPermissions).length}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-gray-600">Total Permissions</p>
                <p className="text-purple-600">
                  {Object.values(currentPermissions).reduce((acc, category) => 
                    acc + Object.keys(category).length, 0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
