import { Button } from "./ui/button";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Shield,
  Building,
  Package,
  ClipboardCheck,
  BarChart3,
  LogOut,
  Settings,
} from "lucide-react";

interface AdminNavigationSidebarProps {
  currentScreen: string;
  userRole: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

const superAdminMenu = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "user-management", label: "User Management", icon: Users },
  { id: "audit-users", label: "Audit Users", icon: UserCheck },
  { id: "user-rights", label: "User Rights", icon: Shield },
  { id: "entity-setup", label: "Entity Setup", icon: Building },
  { id: "admin-assets", label: "Asset Management", icon: Package },
  { id: "audit-management", label: "Audit Management", icon: ClipboardCheck },
  { id: "admin-reports", label: "Reports", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

const auditAdminMenu = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "audit-users", label: "Audit Users", icon: UserCheck },
  { id: "audit-management", label: "Audit Management", icon: ClipboardCheck },
  { id: "admin-reports", label: "Reports", icon: BarChart3 },
];

export function AdminNavigationSidebar({ currentScreen, userRole, onNavigate, onLogout }: AdminNavigationSidebarProps) {
  const menuItems = userRole === "super-admin" ? superAdminMenu : auditAdminMenu;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col shadow-lg">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Shield className="h-5 w-5 text-[#0F67FF]" />
          </div>
          <div>
            <h2 className="text-white">HFAMS Admin</h2>
            <p className="text-white/80">Control Panel</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-[#E8F0FF] border-b border-gray-200">
        <p className="text-gray-700">
          {userRole === "super-admin" ? "Super Administrator" : "Audit Administrator"}
        </p>
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
