import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
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
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";

interface AdminNavigationSidebarProps {
  currentScreen: string;
  userRole: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
  onEntityChange?: (entity: Entity | null) => void;
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

// API function to fetch entities
const fetchEntities = async () => {
  try {
    const response = await fetch('http://localhost:5001/api/entity');
    if (!response.ok) {
      throw new Error('Failed to fetch entities');
    }
    const data = await response.json();
    return data.entities || [];
  } catch (error) {
    console.error('Error fetching entities:', error);
    return [];
  }
};

export function AdminNavigationSidebar({ currentScreen, userRole, onNavigate, onLogout, onEntityChange }: AdminNavigationSidebarProps) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(true);
  const menuItems = userRole === "superadmin" ? superAdminMenu : auditAdminMenu;

  // Fetch entities on component mount
  useEffect(() => {
    const loadEntities = async () => {
      try {
        const entityList = await fetchEntities();
        setEntities(entityList);
        // Auto-select first entity if available and no entity is selected
        if (entityList.length > 0 && !selectedEntity) {
          const firstEntity = entityList[0];
          setSelectedEntity(firstEntity);
          onEntityChange?.(firstEntity);
        }
      } catch (error) {
        console.error('Failed to load entities:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEntities();
  }, []);

  const handleEntityChange = (entityId: string) => {
    const entity = entities.find(e => e._id === entityId);
    if (entity) {
      setSelectedEntity(entity);
      onEntityChange?.(entity);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col shadow-lg">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Shield className="h-5 w-5 text-[#0F67FF]" />
          </div>
          <div>
            <h2 className="text-white">ValueKare FAMS</h2>
            <p className="text-white/80">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Entity Selector - Only for Super Admin */}
      {userRole === "superadmin" && (
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Select Entity</label>
            <Select
              value={selectedEntity?._id || ""}
              onValueChange={handleEntityChange}
              disabled={loading || entities.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loading ? "Loading entities..." : "Select an entity"}>
                  {selectedEntity ? (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-[#0F67FF]" />
                      <span className="truncate">{selectedEntity.name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">{loading ? "Loading..." : "Select entity"}</span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {entities.map((entity) => (
                  <SelectItem key={entity._id} value={entity._id}>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <div className="font-medium">{entity.name}</div>
                        <div className="text-sm text-gray-500">{entity.code}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedEntity && (
              <div className="text-xs text-gray-500 mt-1">
                {selectedEntity.meta.totalAssets} assets • {selectedEntity.meta.totalBuildings} buildings
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-4 bg-[#E8F0FF] border-b border-gray-200">
        <p className="text-gray-700">
          {userRole === "superadmin" ? "Super Administrator" : "Audit Administrator"}
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