import { Button } from "./ui/button";
import {
  LayoutDashboard,
  Package,
  Wrench,
  Archive,
  BarChart3,
  Settings,
  LogOut,
  Users,
  Building,
  Activity,
  FileText,
} from "lucide-react";

interface NavigationSidebarProps {
  currentScreen: string;
  userRole: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

const roleMenus = {
  admin: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "assets", label: "Assets", icon: Package },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
    { id: "inventory", label: "Inventory", icon: Archive },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "settings", label: "Users & Settings", icon: Settings },
  ],
  "department-head": [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "assets", label: "Department Assets", icon: Package },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
    { id: "reports", label: "Reports", icon: BarChart3 },
  ],
  biomedical: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "maintenance", label: "Maintenance Tickets", icon: Wrench },
    { id: "assets", label: "Asset Lookup", icon: Package },
    { id: "reports", label: "Service Logs", icon: FileText },
  ],
  "store-manager": [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "inventory", label: "Inventory", icon: Archive },
    { id: "reports", label: "Analytics", icon: BarChart3 },
  ],
  viewer: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "reports", label: "Reports", icon: BarChart3 },
  ],
};

export function NavigationSidebar({ currentScreen, userRole, onNavigate, onLogout }: NavigationSidebarProps) {
  const menuItems = roleMenus[userRole as keyof typeof roleMenus] || roleMenus.viewer;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-[#0F67FF] rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-gray-900">ValueKare FAMS</h2>
            <p className="text-gray-500">Asset Manager</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full justify-start ${
                isActive
                  ? "bg-[#E8F0FF] text-[#0F67FF] hover:bg-[#E8F0FF] hover:text-[#0F67FF]"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}