import { useState } from "react";
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

const permissions = [
  { category: "Asset Management", permissions: ["View Assets", "Add Assets", "Edit Assets", "Delete Assets", "Transfer Assets"] },
  { category: "Maintenance", permissions: ["View Maintenance", "Create Tickets", "Update Status", "Close Tickets", "View History"] },
  { category: "Inventory", permissions: ["View Inventory", "Add Items", "Update Stock", "Reorder Items", "View Analytics"] },
  { category: "Reports", permissions: ["View Reports", "Generate Reports", "Export Reports", "Schedule Reports", "Share Reports"] },
  { category: "Audit", permissions: ["View Audits", "Request Audit", "Scan Barcodes", "Submit Audit", "View Audit History"] },
  { category: "User Management", permissions: ["View Users", "Add Users", "Edit Users", "Delete Users", "Assign Roles"] },
];

const rolePermissions = {
  "super-admin": {
    "View Assets": true, "Add Assets": true, "Edit Assets": true, "Delete Assets": true, "Transfer Assets": true,
    "View Maintenance": true, "Create Tickets": true, "Update Status": true, "Close Tickets": true, "View History": true,
    "View Inventory": true, "Add Items": true, "Update Stock": true, "Reorder Items": true, "View Analytics": true,
    "View Reports": true, "Generate Reports": true, "Export Reports": true, "Schedule Reports": true, "Share Reports": true,
    "View Audits": true, "Request Audit": true, "Scan Barcodes": true, "Submit Audit": true, "View Audit History": true,
    "View Users": true, "Add Users": true, "Edit Users": true, "Delete Users": true, "Assign Roles": true,
  },
  "department-head": {
    "View Assets": true, "Add Assets": true, "Edit Assets": true, "Delete Assets": false, "Transfer Assets": true,
    "View Maintenance": true, "Create Tickets": true, "Update Status": false, "Close Tickets": false, "View History": true,
    "View Inventory": true, "Add Items": false, "Update Stock": false, "Reorder Items": false, "View Analytics": true,
    "View Reports": true, "Generate Reports": true, "Export Reports": true, "Schedule Reports": false, "Share Reports": true,
    "View Audits": true, "Request Audit": true, "Scan Barcodes": false, "Submit Audit": false, "View Audit History": true,
    "View Users": true, "Add Users": false, "Edit Users": false, "Delete Users": false, "Assign Roles": false,
  },
  "biomedical": {
    "View Assets": true, "Add Assets": false, "Edit Assets": false, "Delete Assets": false, "Transfer Assets": false,
    "View Maintenance": true, "Create Tickets": true, "Update Status": true, "Close Tickets": true, "View History": true,
    "View Inventory": true, "Add Items": false, "Update Stock": true, "Reorder Items": false, "View Analytics": false,
    "View Reports": true, "Generate Reports": true, "Export Reports": true, "Schedule Reports": false, "Share Reports": false,
    "View Audits": false, "Request Audit": false, "Scan Barcodes": false, "Submit Audit": false, "View Audit History": false,
    "View Users": false, "Add Users": false, "Edit Users": false, "Delete Users": false, "Assign Roles": false,
  },
  "store-manager": {
    "View Assets": true, "Add Assets": false, "Edit Assets": false, "Delete Assets": false, "Transfer Assets": false,
    "View Maintenance": false, "Create Tickets": false, "Update Status": false, "Close Tickets": false, "View History": false,
    "View Inventory": true, "Add Items": true, "Update Stock": true, "Reorder Items": true, "View Analytics": true,
    "View Reports": true, "Generate Reports": true, "Export Reports": true, "Schedule Reports": false, "Share Reports": false,
    "View Audits": false, "Request Audit": false, "Scan Barcodes": false, "Submit Audit": false, "View Audit History": false,
    "View Users": false, "Add Users": false, "Edit Users": false, "Delete Users": false, "Assign Roles": false,
  },
  "viewer": {
    "View Assets": true, "Add Assets": false, "Edit Assets": false, "Delete Assets": false, "Transfer Assets": false,
    "View Maintenance": true, "Create Tickets": false, "Update Status": false, "Close Tickets": false, "View History": true,
    "View Inventory": true, "Add Items": false, "Update Stock": false, "Reorder Items": false, "View Analytics": false,
    "View Reports": true, "Generate Reports": false, "Export Reports": false, "Schedule Reports": false, "Share Reports": false,
    "View Audits": true, "Request Audit": false, "Scan Barcodes": false, "Submit Audit": false, "View Audit History": true,
    "View Users": false, "Add Users": false, "Edit Users": false, "Delete Users": false, "Assign Roles": false,
  },
};

export function UserRightsManagement({ onNavigate }: UserRightsManagementProps) {
  const [selectedRole, setSelectedRole] = useState("department-head");
  const [currentPermissions, setCurrentPermissions] = useState(rolePermissions[selectedRole as keyof typeof rolePermissions]);

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setCurrentPermissions(rolePermissions[role as keyof typeof rolePermissions]);
  };

  const handlePermissionToggle = (permission: string) => {
    setCurrentPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission as keyof typeof prev]
    }));
  };

  const handleSavePermissions = () => {
    toast.success("Permissions updated successfully!");
  };

  const handleResetPermissions = () => {
    setCurrentPermissions(rolePermissions[selectedRole as keyof typeof rolePermissions]);
    toast.info("Permissions reset to default");
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
            <Select value={selectedRole} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-full md:w-96">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super-admin">Super Administrator</SelectItem>
                <SelectItem value="department-head">Department Head</SelectItem>
                <SelectItem value="biomedical">Biomedical Manager</SelectItem>
                <SelectItem value="store-manager">Store Manager</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Grid */}
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
            {permissions.map((category) => (
              <div key={category.category} className="border rounded-lg p-6">
                <h3 className="text-gray-900 mb-4">{category.category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.permissions.map((permission) => {
                    const isAllowed = currentPermissions[permission as keyof typeof currentPermissions];
                    return (
                      <div
                        key={permission}
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
                          <span className="text-gray-900">{permission}</span>
                        </div>
                        <Switch
                          checked={isAllowed}
                          onCheckedChange={() => handlePermissionToggle(permission)}
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

      {/* Permission Summary */}
      <Card className="border-0 shadow-md mt-6">
        <CardHeader>
          <CardTitle className="text-gray-900">Permission Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-gray-600">Allowed</p>
              <p className="text-green-600">
                {Object.values(currentPermissions).filter(v => v).length}
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-gray-600">Restricted</p>
              <p className="text-red-600">
                {Object.values(currentPermissions).filter(v => !v).length}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-600">Total Permissions</p>
              <p className="text-[#0F67FF]">
                {Object.keys(currentPermissions).length}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Access Level</p>
              <p className="text-gray-900">
                {Math.round((Object.values(currentPermissions).filter(v => v).length / Object.keys(currentPermissions).length) * 100)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
