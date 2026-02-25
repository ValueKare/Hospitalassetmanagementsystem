import { useState, useEffect } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { AdminNavigationSidebar } from "./components/AdminNavigationSidebar";
import { UserNavigationSidebar } from "./components/UserNavigationSidebar";

// Admin Panel Components
import { SuperAdminDashboard } from "./components/admin/SuperAdminDashboard";
import { UserManagement } from "./components/admin/UserManagement";
import { EntitySetup } from "./components/admin/EntitySetup";
import { AuditManagement } from "./components/admin/AuditManagement";
import { UserRightsManagement } from "./components/admin/UserRightsManagement";
import { AdminAssetManagement } from "./components/admin/AdminAssetManagement";
import { AuditController } from "./components/admin/AuditController";

// Audit Admin Components
import AuditDashboard from "./components/audit_admin/AuditDashboard";
import AuditSummary from "./components/audit_admin/AuditSummary";
import InitiateAudit from "./components/audit_admin/InitiateAudit";
import VerifyAuditAsset from "./components/audit_admin/VerifyAuditAsset";
import AuditList from "./components/audit_admin/AuditList";
import AuditAction from "./components/audit_admin/AuditAction";

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
import { Level1UserDashboard } from "./components/dashboards/Level1UserDashboard";
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
import { AssetRequestForm } from "./components/AssetRequestForm";

import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { initializeSession, clearSessionStores } from './services/sessionService';

// const import.meta.env.VITE_API_URL = "http://localhost:5001";

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
  | "settings"
  // Audit Admin Screens
  | "audit-dashboard"
  | "audit-initiate"
  | "audit-verify"
  | "audit-summary"
  | "audit-list"
  | "audit-action"
  | "audit-details"
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
  | "cfo-dashboard"
  | "viewer"
  | "doctor"
  | "nurse"
  | "department-head"
  | "biomedical"
  | "store-manager"
  | "level-1-approver"
  | "level-2-approver"
  | "level-3-approver"
  | "level1_user";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [userRole, setUserRole] = useState<string>("");
  const [userPanel, setUserPanel] = useState<string>(""); // "admin" or "user"
  const [selectedAssetId, setSelectedAssetId] = useState<number | undefined>();
  const [selectedAuditId, setSelectedAuditId] = useState<string | undefined>();
  const [selectedEntity, setSelectedEntity] = useState<any>(() => {
    // Restore selected entity from localStorage on initial load
    const savedEntity = localStorage.getItem('selectedEntity');
    return savedEntity ? JSON.parse(savedEntity) : null;
  });
  const [entityLoading, setEntityLoading] = useState(true);

// Session validation function
const validateSession = async (accessToken: string) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/validate-session`, {
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
              
              // Initialize session and populate store
              console.log('🚀 Restoring session for role:', userData.role);
              const sessionInitialized = await initializeSession(
                accessToken,
                userData.role
              );
              
              if (sessionInitialized) {
                console.log('✅ Session and store restored successfully');
              } else {
                console.warn('⚠️ Session restore failed, but authentication valid');
              }
              
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
              localStorage.removeItem('selectedEntity');
                          
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

  const handleNavigate = (screen: string, id?: number | string) => {
    setCurrentScreen(screen as Screen);
    // Handle both assetId (number) and auditId (string)
    if (id !== undefined) {
      if (typeof id === 'number') {
        setSelectedAssetId(id);
      } else if (typeof id === 'string') {
        setSelectedAuditId(id);
      }
    }
  };

  const handleLogout = () => {
    // Clear all stores
    clearSessionStores();
    
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('hospital');
    localStorage.removeItem('expiresIn');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('selectedEntity');
    
    // Reset state
    setCurrentScreen("login");
    setUserRole("");
    setUserPanel("");
    setSelectedAssetId(undefined);
    setSelectedAuditId(undefined);
    setSelectedEntity(null);
    setEntityLoading(true);
  };

  const handleEntityChange = (entity: any) => {
    setSelectedEntity(entity);
    setEntityLoading(false);
    // Persist selected entity to localStorage
    if (entity) {
      localStorage.setItem('selectedEntity', JSON.stringify(entity));
    } else {
      localStorage.removeItem('selectedEntity');
    }
  };

  // Fetch entities early in the app lifecycle
  // Note: We no longer auto-select the first entity - user must manually select
  useEffect(() => {
    const fetchEntitiesEarly = async () => {
      if (userRole === "superadmin") {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/entity`);
          if (response.ok) {
            const data = await response.json();
            const entityList = data.entities || [];
            // Don't auto-select - just log the available entities
            console.log('Available entities:', entityList.length);
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
        const expiresIn = localStorage.getItem('expiresIn');
        const loginTime = localStorage.getItem('loginTime');
        
        if (accessToken && expiresIn && loginTime) {
          // Check if token is about to expire (within 10 minutes)
          const expirationDuration = parseInt(expiresIn) * 1000;
          const expirationTime = parseInt(loginTime) + expirationDuration;
          const currentTime = Date.now();
          const timeRemaining = expirationTime - currentTime;
          
          // Skip validation if token is about to expire (let it expire naturally)
          // or if it's already expired
          if (timeRemaining < 600000) { // 10 minutes
            console.log('Token expiring soon or expired, skipping periodic validation');
            return;
          }
          
          const isSessionValid = await validateSession(accessToken);
          if (!isSessionValid) {
            console.log('Session invalidated during periodic check');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('hospital');
            localStorage.removeItem('expiresIn');
            localStorage.removeItem('loginTime');
            localStorage.removeItem('selectedEntity');
                      
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
    } else if (userRole === "audit-admin" || userRole === "audit_admin") {
      return <InitiateAudit onNavigate={handleNavigate} />;
    } else if (userRole === "admin") {
      return <AdminDashboard onNavigate={handleNavigate} />;
    }
    return <SuperAdminDashboard onNavigate={handleNavigate} selectedEntity={selectedEntity} />;
  };

  const renderAdminContent = () => {
    switch (currentScreen) {
      case "dashboard":
        return renderAdminDashboard();
      case "user-management":
        return <UserManagement onNavigate={handleNavigate} selectedEntity={selectedEntity} />;
      case "audit-users":
        return <UserManagement onNavigate={handleNavigate} selectedEntity={selectedEntity} userRoleFilter="audit" />;
      case "user-rights":
        return <UserRightsManagement onNavigate={handleNavigate} />;
      case "entity-setup":
        return <EntitySetup onNavigate={handleNavigate} />;
      case "admin-assets":
        return <AdminAssetManagement onNavigate={handleNavigate} selectedEntity={selectedEntity} />;
      case "audit-management":
        return <AuditManagement onNavigate={handleNavigate} selectedEntity={selectedEntity} />;
      case "audit-controller":
        return <AuditController onNavigate={handleNavigate} />;
      case "admin-reports":
        return <Reports onNavigate={handleNavigate} />;
      case "settings":
        return <Settings onNavigate={handleNavigate} userRole={userRole} />;
      // Audit Admin Screens
      case "audit-initiate":
        return <InitiateAudit onNavigate={handleNavigate} />;
      case "audit-summary":
        return selectedAuditId ? (
          <AuditSummary onNavigate={handleNavigate} auditId={selectedAuditId} />
        ) : (
          <InitiateAudit onNavigate={handleNavigate} />
        );
      case "audit-verify":
        return selectedAuditId ? (
          <VerifyAuditAsset onNavigate={handleNavigate} auditId={selectedAuditId} />
        ) : (
          <AuditList onNavigate={handleNavigate} />
        );
      case "audit-details":
        return selectedAuditId ? (
          <AuditDashboard onNavigate={handleNavigate} auditId={selectedAuditId} />
        ) : (
          <AuditList onNavigate={handleNavigate} />
        );
      case "audit-dashboard":
        return selectedAuditId ? (
          <AuditDashboard onNavigate={handleNavigate} auditId={selectedAuditId} />
        ) : (
          <InitiateAudit onNavigate={handleNavigate} />
        );
      case "audit-list":
        return <AuditList onNavigate={handleNavigate} />;
      case "audit-action":
        return selectedAuditId ? (
          <AuditAction onNavigate={handleNavigate} auditId={selectedAuditId} />
        ) : (
          <AuditList onNavigate={handleNavigate} />
        );
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
        if (userRole === 'staff') {
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
        const requestUserData = JSON.parse(localStorage.getItem('user') || '{}');
        return <AssetRequestForm 
          onNavigate={handleNavigate} 
          userDepartment={requestUserData.department || requestUserData.departmentName || "Department"} 
          userHospital={requestUserData.hospitalName || requestUserData.hospital || "Hospital"} 
        />;
      // Workflow Screens
      case "level1_user":
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        return <Level1UserDashboard 
          onNavigate={handleNavigate} 
          userName={userData.name || "User"} 
          userDepartment={userData.department || userData.departmentName || "Department"} 
          userHospital={userData.hospital || "Hospital"} 
        />;
      case "hod-dashboard":
        return <HODDashboard onNavigate={handleNavigate} hodName="Dr. Michael Chen" department="Cardiology" />;
      case "cfo-dashboard":
        return <CFODashboard onNavigate={handleNavigate} cfoName="Lisa Anderson" />;
      case "doctor":
        return <ClinicalDashboard onNavigate={handleNavigate} userRole="doctor" />;
      case "nurse":
        return <ClinicalDashboard onNavigate={handleNavigate} userRole="nurse" />;
      case "department-head":
        return <DepartmentHeadDashboard onNavigate={handleNavigate} />;
      case "biomedical":
        return <BiomedicalDashboard onNavigate={handleNavigate} />;
      case "store-manager":
        return <StoreManagerDashboard onNavigate={handleNavigate} />;
      case "viewer":
        return <ViewerDashboard onNavigate={handleNavigate} />;
      case "requestor":
        return <RequestorDashboard onNavigate={handleNavigate} userRole="requestor" userName="Requestor" userDepartment="Department" />;
      case "approver-l1":
      case "approver-l2":
      case "approver-l3":
        return <ApproverDashboard onNavigate={handleNavigate} approverLevel={currentScreen.replace("approver-", "")} approverName="Approver" />;
      case "inventory-dashboard":
        return <InventoryDashboard onNavigate={handleNavigate} managerName="Inventory Manager" />;
      case "purchase-dashboard":
        return <PurchaseDashboard onNavigate={handleNavigate} managerName="Purchase Manager" />;
      case "budget-dashboard":
        return <BudgetCommitteeDashboard onNavigate={handleNavigate} committeeMember="Committee Member" />;
      default:
        // Default to dashboard for any other role
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
