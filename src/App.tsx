import { useState, useEffect } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { AdminNavigationSidebar } from "./components/AdminNavigationSidebar";
import { UserNavigationSidebar } from "./components/UserNavigationSidebar";

// Admin Panel Components
import { SuperAdminDashboard } from "./components/admin/SuperAdminDashboard";
import { AuditAdminDashboard } from "./components/admin/AuditAdminDashboard";
import { UserManagement } from "./components/admin/UserManagement";
import { EntitySetup } from "./components/admin/EntitySetup";
import { AuditManagement } from "./components/admin/AuditManagement";
import { UserRightsManagement } from "./components/admin/UserRightsManagement";
import { AdminAssetManagement } from "./components/admin/AdminAssetManagement";
import { AuditController } from "./components/admin/AuditController";

// User Panel Dashboards
import { AdminDashboard } from "./components/dashboards/AdminDashboard";
import { DepartmentHeadDashboard } from "./components/dashboards/DepartmentHeadDashboard";
import { BiomedicalDashboard } from "./components/dashboards/BiomedicalDashboard";
import { StoreManagerDashboard } from "./components/dashboards/StoreManagerDashboard";
import { ViewerDashboard } from "./components/dashboards/ViewerDashboard";
import { ClinicalDashboard } from "./components/dashboards/ClinicalDashboard";

// Workflow Dashboards
import { HODDashboard } from "./components/dashboards/HODDashboard";
import { InventoryDashboard } from "./components/dashboards/InventoryDashboard";
import { PurchaseDashboard } from "./components/dashboards/PurchaseDashboard";
import { BudgetCommitteeDashboard } from "./components/dashboards/BudgetCommitteeDashboard";
import { CFODashboard } from "./components/dashboards/CFODashboard";

// Inventory Components
import { RequestorDashboard } from "./components/inventory/RequestorDashboard";
import { ApproverDashboard } from "./components/inventory/ApproverDashboard";

// Shared/User Panel Components
import { AssetManagement } from "./components/AssetManagement";
import { AssetDetail } from "./components/AssetDetail";
import { MaintenanceCalendar } from "./components/MaintenanceCalendar";
import { InventoryManagement } from "./components/InventoryManagement";
import { Reports } from "./components/Reports";
import { Settings } from "./components/Settings";
import { AssetCategoryManagement } from "./components/user/AssetCategoryManagement";
import { UserAuditManagement } from "./components/user/UserAuditManagement";
import { BuildingFloorManagement } from "./components/user/BuildingFloorManagement";
import { Dashboard } from "./components/Dashboard";
import { Level1UserDashboard } from "./components/dashboards/Level1UserDashboard";
import { AssetRequestForm } from "./components/AssetRequestForm";

import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

type Screen = 
  | "login" 
  | "dashboard" 
  | "create-request"
  // Admin Panel Screens
  | "user-management"
  | "audit-users"
  | "user-rights"
  | "entity-setup"
  | "admin-assets"
  | "audit-management"
  | "audit-controller"
  | "admin-reports"
  // User Panel Screens
  | "assets"
  | "user-assets"
  | "add-asset" 
  | "asset-detail" 
  | "asset-categories"
  | "building-floor"
  | "maintenance" 
  | "inventory" 
  | "user-audits"
  | "reports" 
  | "settings"
  // Workflow Screens
  | "requestor"
  | "approver-l1"
  | "approver-l2"
  | "approver-l3"
  | "hod-dashboard"
  | "inventory-dashboard"
  | "purchase-dashboard"
  | "budget-dashboard"
  | "cfo-dashboard";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [userRole, setUserRole] = useState<string>("");
  const [userPanel, setUserPanel] = useState<string>(""); // "admin" or "user"
  const [selectedAssetId, setSelectedAssetId] = useState<number | undefined>();
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [entityLoading, setEntityLoading] = useState(true);

// Session validation function
const validateSession = async (accessToken: string) => {
  try {
    const response = await fetch('http://localhost:5001/api/auth/validate-session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status === 401) {
      // Session invalidated by another login
      console.log('Session invalidated by new login');
      return false;
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
};

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');
      const expiresIn = localStorage.getItem('expiresIn');
      const loginTime = localStorage.getItem('loginTime');
      
      if (accessToken && user && expiresIn) {
        try {
          const userData = JSON.parse(user);
          const expirationDuration = parseInt(expiresIn) * 1000; // Convert to milliseconds
          const loginTimestamp = loginTime ? parseInt(loginTime) : Date.now();
          const expirationTime = loginTimestamp + expirationDuration;
          const currentTime = Date.now();
          
          console.log('Token expiration check:', {
            loginTimestamp,
            expirationDuration,
            expirationTime,
            currentTime,
            isExpired: currentTime >= expirationTime,
            timeRemaining: expirationTime - currentTime
          });
          
          // Check if token is still valid (with 5-minute buffer)
          if (currentTime < (expirationTime - 300000)) { // 5 minutes buffer
            // Validate session with backend
            const isSessionValid = await validateSession(accessToken);
            
            if (isSessionValid) {
              setUserRole(userData.role);
              setUserPanel(userData.panel);
              // Set screen based on user role
              if (userData.role === 'level1_user') {
                setCurrentScreen('level1_user');
              } else {
                setCurrentScreen('dashboard');
              }
              console.log('User session restored successfully');
            } else {
              // Session invalidated, clear localStorage and show message
              console.log('Session invalidated, clearing session');
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              localStorage.removeItem('hospital');
              localStorage.removeItem('expiresIn');
              localStorage.removeItem('loginTime');
              
              // Show toast about session termination
              toast.error('Your session has been terminated because you logged in from another device.');
            }
          } else {
            // Token expired, clear localStorage
            console.log('Token expired, clearing session');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('hospital');
            localStorage.removeItem('expiresIn');
            localStorage.removeItem('loginTime');
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          // Clear corrupted data
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('hospital');
          localStorage.removeItem('expiresIn');
          localStorage.removeItem('loginTime');
        }
      }
    };
    
    checkAuth();
  }, []);

  const handleLogin = (role: string, panel: string) => {
    setUserRole(role);
    setUserPanel(panel);
    // Set screen based on user role
    if (role === 'level1_user') {
      setCurrentScreen('level1_user');
    } else {
      setCurrentScreen('dashboard');
    }
  };

  const handleNavigate = (screen: string, assetId?: number) => {
    setCurrentScreen(screen as Screen);
    if (assetId !== undefined) {
      setSelectedAssetId(assetId);
    }
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('hospital');
    localStorage.removeItem('expiresIn');
    localStorage.removeItem('loginTime');
    
    // Reset state
    setCurrentScreen("login");
    setUserRole("");
    setUserPanel("");
    setSelectedAssetId(undefined);
    setSelectedEntity(null);
    setEntityLoading(true);
  };

  const handleEntityChange = (entity: any) => {
    setSelectedEntity(entity);
    setEntityLoading(false);
  };

  // Fetch entities early in the app lifecycle
  useEffect(() => {
    const fetchEntitiesEarly = async () => {
      if (userRole === "superadmin") {
        try {
          const response = await fetch('http://localhost:5001/api/entity');
          if (response.ok) {
            const data = await response.json();
            const entityList = data.entities || [];
            if (entityList.length > 0) {
              const firstEntity = entityList[0];
              setSelectedEntity(firstEntity);
              setEntityLoading(false);
            }
          }
        } catch (error) {
          console.error('Failed to fetch entities early:', error);
        } finally {
          setEntityLoading(false);
        }
      } else {
        setEntityLoading(false);
      }
    };

    if (userRole) {
      fetchEntitiesEarly();
    }
  }, [userRole]);

  // Periodic session validation
  useEffect(() => {
    if (currentScreen !== "login" && userRole) {
      const interval = setInterval(async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          const isSessionValid = await validateSession(accessToken);
          if (!isSessionValid) {
            console.log('Session invalidated during periodic check');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('hospital');
            localStorage.removeItem('expiresIn');
            localStorage.removeItem('loginTime');
            
            // Reset state and redirect to login
            setCurrentScreen("login");
            setUserRole("");
            setUserPanel("");
            setSelectedAssetId(undefined);
            setSelectedEntity(null);
            setEntityLoading(true);
            
            // Show toast about session termination
            toast.error('Your session has been terminated because you logged in from another device.');
          }
        }
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [currentScreen, userRole]);

  const renderAdminDashboard = () => {
    if (userRole === "superadmin") {
      return <SuperAdminDashboard onNavigate={handleNavigate} selectedEntity={selectedEntity} />;
    } else if (userRole === "audit-admin") {
      return <AuditAdminDashboard onNavigate={handleNavigate} />;
    } else if (userRole === "admin") {
      return <AdminDashboard onNavigate={handleNavigate} />;
    }
    return <SuperAdminDashboard onNavigate={handleNavigate} selectedEntity={selectedEntity} />;
  };

  const renderUserDashboard = () => {
    switch (userRole) {
      case "department-head":
        return <DepartmentHeadDashboard onNavigate={handleNavigate} />;
      case "hod":
        return <HODDashboard onNavigate={handleNavigate} hodName="Dr. Michael Chen" department="Cardiology" />;
      case "biomedical":
        return <BiomedicalDashboard onNavigate={handleNavigate} />;
      case "store-manager":
        return <StoreManagerDashboard onNavigate={handleNavigate} />;
      case "inventory-manager":
        return <InventoryDashboard onNavigate={handleNavigate} managerName="John Smith" />;
      case "purchase-manager":
        return <PurchaseDashboard onNavigate={handleNavigate} managerName="Emily Davis" />;
      case "budget-committee":
        return <BudgetCommitteeDashboard onNavigate={handleNavigate} committeeMember="Robert Wilson" />;
      case "cfo":
        return <CFODashboard onNavigate={handleNavigate} cfoName="Lisa Anderson" />;
      case "viewer":
        return <ViewerDashboard onNavigate={handleNavigate} />;
      case "doctor":
        return <RequestorDashboard onNavigate={handleNavigate} userRole="doctor" userName="Dr. Sarah Johnson" userDepartment="Cardiology" />;
      case "nurse":
        return <RequestorDashboard onNavigate={handleNavigate} userRole="nurse" userName="Emily Davis" userDepartment="ICU" />;
      case "level-1-approver":
      case "level-2-approver":
      case "level-3-approver":
        return <ApproverDashboard onNavigate={handleNavigate} approverLevel={userRole.replace("-approver", "")} approverName="Dr. Raj Kumar" />;
      default:
        return <DepartmentHeadDashboard onNavigate={handleNavigate} />;
    }
  };

  const renderAdminContent = () => {
    switch (currentScreen) {
      case "dashboard":
        return renderAdminDashboard();
      case "user-management":
        return <UserManagement onNavigate={handleNavigate} selectedEntity={selectedEntity} />;
      case "audit-users":
        return <UserManagement onNavigate={handleNavigate} selectedEntity={selectedEntity} />; // Can create separate AuditUserManagement if needed
      case "user-rights":
        return <UserRightsManagement onNavigate={handleNavigate} />;
      case "entity-setup":
        return <EntitySetup onNavigate={handleNavigate} />;
      case "admin-assets":
        return <AdminAssetManagement onNavigate={handleNavigate} selectedEntity={selectedEntity} />;
      case "audit-management":
        return <AuditManagement onNavigate={handleNavigate} />;
      case "audit-controller":
        return <AuditController />;
      case "admin-reports":
        return <Reports onNavigate={handleNavigate} />;
      case "settings":
        return <Settings onNavigate={handleNavigate} userRole={userRole} />;
      default:
        return renderAdminDashboard();
    }
  };

  const renderUserContent = () => {
    console.log('Debug - currentScreen:', currentScreen);
    console.log('Debug - userRole:', userRole);
    switch (currentScreen) {
      case "dashboard":
        console.log('Debug - dashboard case triggered');
        // Show the same dashboard that appears after login
        if (userRole === 'level1_user') {
          console.log('Debug - level1_user condition met');
          // Get actual user data from localStorage
          console.log('Debug - localStorage keys:', Object.keys(localStorage));
          console.log('Debug - localStorage user:', localStorage.getItem('user'));
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          console.log('Debug - userData from localStorage:', userData);
          console.log('Debug - userData keys:', Object.keys(userData));
          console.log('Debug - userData.department:', userData.department);
          console.log('Debug - userData.departmentName:', userData.departmentName);
          return <Level1UserDashboard 
            onNavigate={handleNavigate} 
            userName={userData.name || "User"} 
            userDepartment={userData.department || userData.departmentName || "Department"} 
            userHospital={userData.hospital || "Hospital"} 
          />;
        }
        return <Dashboard onNavigate={handleNavigate} userRole={userRole} />;
      case "assets":
      case "user-assets":
      case "add-asset":
        return <AssetManagement onNavigate={handleNavigate} />;
      case "asset-detail":
        return <AssetDetail assetId={selectedAssetId} onNavigate={handleNavigate} />;
      case "asset-categories":
        return <AssetCategoryManagement onNavigate={handleNavigate} />;
      case "building-floor":
        return <BuildingFloorManagement onNavigate={handleNavigate} />;
      case "maintenance":
        return <MaintenanceCalendar onNavigate={handleNavigate} />;
      case "inventory":
        return <InventoryManagement onNavigate={handleNavigate} />;
      case "user-audits":
        return <UserAuditManagement onNavigate={handleNavigate} />;
      case "reports":
        return <Reports onNavigate={handleNavigate} />;
      case "settings":
        return <Settings onNavigate={handleNavigate} userRole={userRole} />;
      case "create-request":
        return <AssetRequestForm onNavigate={handleNavigate} userDepartment="Department" userHospital="Hospital" />;
      // Workflow Screens
      case "level1_user":
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        return <Level1UserDashboard 
          onNavigate={handleNavigate} 
          userName={userData.name || "User"} 
          userDepartment={userData.department || userData.departmentName || "Department"} 
          userHospital={userData.hospital || "Hospital"} 
        />;
      case "approver-l1":
      case "approver-l2":
      case "approver-l3":
        return <ApproverDashboard onNavigate={handleNavigate} approverLevel={currentScreen.replace("approver-", "")} approverName="Approver" />;
      case "hod-dashboard":
        return <HODDashboard onNavigate={handleNavigate} hodName="Dr. Michael Chen" department="Cardiology" />;
      case "inventory-dashboard":
        return <InventoryDashboard onNavigate={handleNavigate} managerName="John Smith" />;
      case "purchase-dashboard":
        return <PurchaseDashboard onNavigate={handleNavigate} managerName="Emily Davis" />;
      case "budget-dashboard":
        return <BudgetCommitteeDashboard onNavigate={handleNavigate} committeeMember="Robert Wilson" />;
      case "cfo-dashboard":
        return <CFODashboard onNavigate={handleNavigate} cfoName="Lisa Anderson" />;
      default:
        return <Dashboard onNavigate={handleNavigate} userRole={userRole} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {currentScreen === "login" ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <div className="flex">
          {userPanel === "admin" ? (
            <AdminNavigationSidebar
              currentScreen={currentScreen}
              userRole={userRole}
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              onEntityChange={handleEntityChange}
              selectedEntity={selectedEntity}
            />
          ) : (
            <UserNavigationSidebar
              currentScreen={currentScreen}
              userRole={userRole}
              onNavigate={handleNavigate}
              onLogout={handleLogout}
            />
          )}
          <div className="flex-1 ml-64">
            {/* Show loading state for superadmin while entities are being fetched */}
            {userPanel === "admin" && userRole === "superadmin" && entityLoading ? (
              <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F67FF] mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading entities...</p>
                </div>
              </div>
            ) : (
              userPanel === "admin" ? renderAdminContent() : renderUserContent()
            )}
          </div>
        </div>
      )}
      
      <Toaster />
    </div>
  );
}
