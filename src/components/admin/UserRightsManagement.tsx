import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { 
  Shield, 
  Search, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Lock,
  Unlock,
  Users,
  Crown,
  ChevronRight,
  Key,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface UserRightsManagementProps {
  onNavigate: (screen: string) => void;
}

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
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const getAuthToken = () => {
    return localStorage.getItem('accessToken');
  };

  const fetchRoles = async () => {
    setIsLoading(true);
    setError(null);
    
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

      const data: RolesApiResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.data ? 'API returned unsuccessful response' : 'Invalid response format');
      }

      setRoles(data.data);
      
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

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleRoleChange = (roleId: string) => {
    const role = roles.find(r => r._id === roleId);
    if (role) {
      setSelectedRole(role);
      setCurrentPermissions(role.permissions);
      setHasChanges(false);
      setExpandedCategories([]);
    }
  };

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryKey) 
        ? prev.filter(k => k !== categoryKey)
        : [...prev, categoryKey]
    );
  };

  const expandAllCategories = () => {
    setExpandedCategories(permissionCategories.map(c => c.key));
  };

  const collapseAllCategories = () => {
    setExpandedCategories([]);
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
    setHasChanges(true);
  };

  const enableAllPermissions = () => {
    if (!currentPermissions) return;
    const allEnabled = Object.keys(currentPermissions).reduce((acc, category) => {
      acc[category as keyof ApiRolePermissions] = Object.keys(currentPermissions[category as keyof ApiRolePermissions]).reduce(
        (permAcc, perm) => ({ ...permAcc, [perm]: true }), {}
      );
      return acc;
    }, {} as ApiRolePermissions);
    setCurrentPermissions(allEnabled);
    setHasChanges(true);
    toast.success("All permissions enabled!");
  };

  const disableAllPermissions = () => {
    if (!currentPermissions) return;
    const allDisabled = Object.keys(currentPermissions).reduce((acc, category) => {
      acc[category as keyof ApiRolePermissions] = Object.keys(currentPermissions[category as keyof ApiRolePermissions]).reduce(
        (permAcc, perm) => ({ ...permAcc, [perm]: false }), {}
      );
      return acc;
    }, {} as ApiRolePermissions);
    setCurrentPermissions(allDisabled);
    setHasChanges(true);
    toast.info("All permissions disabled");
  };

  const handleSavePermissions = async () => {
    if (!selectedRole || !currentPermissions) return;

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/roles/${selectedRole._id}`, {
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

      setRoles(prevRoles => 
        prevRoles.map(role => 
          role._id === selectedRole._id 
            ? { ...role, permissions: result.data.permissions }
            : role
        )
      );

      setSelectedRole(prev => prev ? { ...prev, permissions: result.data.permissions } : null);
      setHasChanges(false);

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
      setHasChanges(false);
      toast.info("Permissions reset to default");
    }
  };

  const filteredCategories = permissionCategories.filter(category => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return category.label.toLowerCase().includes(searchLower) ||
      category.permissions.some(p => p.label.toLowerCase().includes(searchLower));
  });

  const getCategoryIcon = (categoryKey: string) => {
    const icons: Record<string, React.ReactNode> = {
      asset: <Key className="w-5 h-5" />,
      audit: <Shield className="w-5 h-5" />,
      maintenance: <Lock className="w-5 h-5" />,
      user: <Users className="w-5 h-5" />,
      approval: <CheckCircle2 className="w-5 h-5" />,
      reports: <Search className="w-5 h-5" />,
      system: <Crown className="w-5 h-5" />
    };
    return icons[categoryKey] || <Shield className="w-5 h-5" />;
  };

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <motion.div 
            className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Shield className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Rights Management</h1>
            <p className="text-gray-500">Configure role-based permissions and access control</p>
          </div>
        </div>
      </motion.div>

      {/* Role Selector Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Select Role to Configure
              </CardTitle>
              <CardDescription>Choose a role to view and modify its permissions</CardDescription>
            </div>
            {hasChanges && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                <span className="text-sm text-amber-700 font-medium">Unsaved Changes</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            {isLoading ? (
              <div className="text-gray-600">Loading roles...</div>
            ) : error ? (
              <div className="text-red-600 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Error: {error}
              </div>
            ) : (
              <Select 
                value={selectedRole?._id || ""} 
                onValueChange={handleRoleChange}
                disabled={roles.length === 0}
              >
                <SelectTrigger className="w-full md:w-96">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="w-96">
                  {roles.map((role) => (
                    <SelectItem key={role._id} value={role._id}>
                      <div className="flex items-center gap-3 py-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          role.isSystemRole ? "bg-amber-500" : "bg-blue-500"
                        }`}>
                          {role.isSystemRole ? (
                            <Crown className="w-4 h-4 text-white" />
                          ) : (
                            <Users className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{role.name}</span>
                          <span className="text-sm text-gray-500">{role.description}</span>
                        </div>
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
              <div className="flex items-center gap-1 text-sm text-gray-500 ml-2">
                <Key className="w-4 h-4" />
                <span>
                  {Object.values(currentPermissions || {}).reduce((acc, cat) => 
                    acc + Object.values(cat).filter(Boolean).length, 0
                  )} permissions enabled
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search & Bulk Actions */}
      {currentPermissions && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search permissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={expandAllCategories}>
                  <Eye className="h-4 w-4 mr-2" />
                  Expand All
                </Button>
                <Button variant="outline" size="sm" onClick={collapseAllCategories}>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Collapse All
                </Button>
                <Button variant="outline" size="sm" onClick={enableAllPermissions} className="text-green-600">
                  <Unlock className="h-4 w-4 mr-2" />
                  Enable All
                </Button>
                <Button variant="outline" size="sm" onClick={disableAllPermissions} className="text-red-600">
                  <Lock className="h-4 w-4 mr-2" />
                  Disable All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Permissions Grid */}
      {currentPermissions && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Permissions Matrix</CardTitle>
                <CardDescription>Toggle permissions to grant or restrict access</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleResetPermissions}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={handleSavePermissions}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCategories.map((category, index) => {
                const isExpanded = expandedCategories.includes(category.key);
                const enabledCount = category.permissions.filter(
                  p => currentPermissions[category.key as keyof ApiRolePermissions]?.[p.key]
                ).length;
                const totalCount = category.permissions.length;
                
                return (
                  <div 
                    key={category.key} 
                    className="border rounded-lg overflow-hidden bg-white"
                  >
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                      onClick={() => toggleCategory(category.key)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                          {getCategoryIcon(category.key)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{category.label}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{enabledCount}/{totalCount} permissions</span>
                            {enabledCount === totalCount && (
                              <span className="text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                Complete
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={enabledCount === totalCount ? "default" : "secondary"}>
                          {enabledCount === 0 ? "No Access" : enabledCount === totalCount ? "Full Access" : "Partial"}
                        </Badge>
                        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {category.permissions.map((permission) => {
                            const isAllowed = currentPermissions[category.key as keyof ApiRolePermissions]?.[permission.key] || false;
                            
                            return (
                              <div
                                key={`${category.key}-${permission.key}`}
                                onClick={() => handlePermissionToggle(category.key, permission.key)}
                                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm ${
                                  isAllowed
                                    ? "bg-green-50 border-green-200 hover:bg-green-100"
                                    : "bg-red-50 border-red-200 hover:bg-red-100"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    isAllowed ? "bg-green-500" : "bg-red-500"
                                  }`}>
                                    {isAllowed ? (
                                      <Unlock className="w-4 h-4 text-white" />
                                    ) : (
                                      <Lock className="w-4 h-4 text-white" />
                                    )}
                                  </div>
                                  <span className={`font-medium ${isAllowed ? "text-green-900" : "text-red-900"}`}>
                                    {permission.label}
                                  </span>
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
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Permission Summary */}
      {currentPermissions && (
        <div>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Permission Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <p className="text-gray-600 text-sm">Allowed</p>
                <p className="text-2xl font-bold text-green-600">
                  {Object.values(currentPermissions).reduce((acc, category) => 
                    acc + Object.values(category).filter(v => v).length, 0
                  )}
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <p className="text-gray-600 text-sm">Restricted</p>
                <p className="text-2xl font-bold text-red-600">
                  {Object.values(currentPermissions).reduce((acc, category) => 
                    acc + Object.values(category).filter(v => !v).length, 0
                  )}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <p className="text-gray-600 text-sm">Categories</p>
                <p className="text-2xl font-bold text-blue-600">{Object.keys(currentPermissions).length}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <p className="text-gray-600 text-sm">Total Permissions</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Object.values(currentPermissions).reduce((acc, category) => 
                    acc + Object.keys(category).length, 0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      )}
    </div>
  );
}
