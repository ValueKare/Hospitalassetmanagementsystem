import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Building2, Mail, Lock, Shield, UserCog } from "lucide-react";

interface LoginScreenProps {
  onLogin: (role: string, panel: string, userData?: any) => void;
}

interface DeviceInfo {
  userAgent: string;
  ipAddress: string;
  deviceType: string;
}

interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: any;
    hospital: any;
  };
}

const getDeviceInfo = (): DeviceInfo => {
  return {
    userAgent: navigator.userAgent,
    ipAddress: "192.168.1.1", // You might want to get this from a service
    deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? "mobile" : "desktop"
  };
};

const storeAuthData = (response: any) => {
  localStorage.setItem('accessToken', response.data.accessToken);
  localStorage.setItem('refreshToken', response.data.refreshToken);
  localStorage.setItem('user', JSON.stringify(response.data.user));
  localStorage.setItem('hospital', JSON.stringify(response.data.hospital));
  localStorage.setItem('expiresIn', response.data.expiresIn.toString());
  localStorage.setItem('loginTime', Date.now().toString());
};

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [organizationId, setOrganizationId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_API_URL || ''}/api/auth/login`;

      const requestBody: any = {
        organizationId,
        email,
        password,
        rememberMe,
        // deviceInfo: getDeviceInfo()
      }
      // Add device info only for user login
      // if (!isAdminLogin) {
      //   requestBody.deviceInfo = getDeviceInfo();
      // }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data: LoginResponse = await response.json();
      console.log("LOGIN RESPONSE:", JSON.stringify(data, null, 2));

      if (data.success) {
        
        // Store authentication data
        storeAuthData(data);
        
        // Call onLogin with user data
        onLogin(data.data.user.role, data.data.user.panel, data.data);
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#E8F0FF] via-white to-[#F0F9FF]">
      {/* Left Panel - Brand Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0F67FF] to-[#0B4FCC] p-12 flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <Shield className="h-7 w-7 text-[#0F67FF]" />
            </div>
            <div>
              <h2 className="text-white">ValueKare FAMS</h2>
              <p className="text-white/80">Fixed Asset Management System</p>
            </div>
          </div>
          <div className="space-y-6 text-white/90">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-white mb-1">Multi-Entity Management</h3>
                <p className="text-white/70">Manage multiple hospitals and healthcare facilities from one platform</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserCog className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-white mb-1">Role-Based Access</h3>
                <p className="text-white/70">Secure access control with 15+ specialized user roles</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-white mb-1">Complete Asset Lifecycle</h3>
                <p className="text-white/70">Track assets from procurement to disposal with full audit trails</p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-white/60">
          <p>© 2024 ValueKare Fixed Asset Management System</p>
          <p className="mt-2">Trusted by leading healthcare institutions</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#0F67FF] to-[#0B4FCC] rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-gray-900">ValueKare Fixed Asset Management</CardTitle>
            <CardDescription className="mt-2">Secure access to ValueKare FAMS platform</CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}
            
            <div className="p-4 bg-[#E8F0FF] rounded-lg border border-[#0F67FF]/20 max-h-72 overflow-y-auto">
              <p className="text-[#0F67FF] mb-2">Demo Credentials:</p>
              <div className="space-y-1">
                <p className="text-gray-700">Organization ID: HOSP-2024-001</p>
                <hr className="my-2 border-[#0F67FF]/20" />
                <p className="text-gray-500">Admin Panel:</p>
                <p className="text-gray-600">• Super Admin: superadmin@valuekare.com / super123</p>
                <p className="text-gray-600">• Audit Admin: audit@valuekare.com / audit123</p>
                <hr className="my-2 border-[#0F67FF]/20" />
                <p className="text-gray-500">Requestors:</p>
                <p className="text-gray-600">• Doctor: doctor@valuekare.com / doctor123</p>
                <p className="text-gray-600">• Nurse: nurse@valuekare.com / nurse123</p>
                <hr className="my-2 border-[#0F67FF]/20" />
                <p className="text-gray-500">Approval Workflow:</p>
                <p className="text-gray-600">• Level 1: level1@valuekare.com / level1</p>
                <p className="text-gray-600">• Level 2: level2@valuekare.com / level2</p>
                <p className="text-gray-600">• Level 3: level3@valuekare.com / level3</p>
                <p className="text-gray-600">• HOD: hod@valuekare.com / hod123</p>
                <p className="text-gray-600">• Inventory: inventory@valuekare.com / inv123</p>
                <p className="text-gray-600">• Purchase: purchase@valuekare.com / pur123</p>
                <p className="text-gray-600">• Budget: budget@valuekare.com / bud123</p>
                <p className="text-gray-600">• CFO: cfo@valuekare.com / cfo123</p>
                <hr className="my-2 border-[#0F67FF]/20" />
                <p className="text-gray-500">Other Roles:</p>
                <p className="text-gray-600">• Dept Head: dept@valuekare.com / dept123</p>
                <p className="text-gray-600">• Biomedical: bio@valuekare.com / bio123</p>
                <p className="text-gray-600">• Store: store@valuekare.com / store123</p>
                <p className="text-gray-600">• Viewer: viewer@valuekare.com / viewer123</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization-id">Organization ID</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="organization-id"
                  placeholder="HOSP-2024-001"
                  value={organizationId}
                  onChange={(e) => setOrganizationId(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Login As (Optional)</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-detect from email" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  <SelectItem value="admin">Admin Panel</SelectItem>
                  <SelectItem value="user">User Panel</SelectItem>
                  <SelectItem value="audit">Audit User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  // @ts-ignore
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-gray-600 cursor-pointer">
                  Remember me
                </Label>
              </div>
              <a href="#" className="text-[#0F67FF] hover:underline">
                Forgot Password?
              </a>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC] hover:from-[#0B4FCC] hover:to-[#0F67FF] shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In Securely"}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-gray-500">Or</span>
              </div>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setEmail("audit@valuekare.com");
                setPassword("audit123");
              }}
            >
              <UserCog className="h-4 w-4 mr-2" />
              Sign In as Audit User
            </Button>
            <div className="text-center">
              Need access?{" "}
              <a href="#" className="text-[#0F67FF] hover:underline">
                Request Account
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
      </div>
    </div>
  );
}