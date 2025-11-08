import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Building2, Mail, Lock, Shield } from "lucide-react";

interface LoginScreenProps {
  onLogin: (role: string, panel: string) => void;
}

// Simulated user database for demo purposes
const DEMO_USERS = {
  "superadmin@hfams.com": { password: "super123", role: "super-admin", name: "John Administrator", panel: "admin" },
  "audit@hfams.com": { password: "audit123", role: "audit-admin", name: "Jane Auditor", panel: "admin" },
  "dept@hospital.com": { password: "dept123", role: "department-head", name: "Sarah Johnson", panel: "user" },
  "bio@hospital.com": { password: "bio123", role: "biomedical", name: "Dr. Michael Chen", panel: "user" },
  "store@hospital.com": { password: "store123", role: "store-manager", name: "Emily Davis", panel: "user" },
  "viewer@hospital.com": { password: "viewer123", role: "viewer", name: "Robert Wilson", panel: "user" },
  "doctor@hospital.com": { password: "doctor123", role: "doctor", name: "Dr. Sarah Johnson", panel: "user" },
  "nurse@hospital.com": { password: "nurse123", role: "nurse", name: "Emily Chen", panel: "user" },
  // Workflow Approvers
  "level1@hospital.com": { password: "level1", role: "level-1-approver", name: "Dr. Raj Kumar", panel: "user" },
  "level2@hospital.com": { password: "level2", role: "level-2-approver", name: "Dr. Priya Sharma", panel: "user" },
  "level3@hospital.com": { password: "level3", role: "level-3-approver", name: "Dr. Amit Patel", panel: "user" },
  "hod@hospital.com": { password: "hod123", role: "hod", name: "Dr. Michael Chen", panel: "user" },
  "inventory@hospital.com": { password: "inv123", role: "inventory-manager", name: "John Smith", panel: "user" },
  "purchase@hospital.com": { password: "pur123", role: "purchase-manager", name: "Emily Davis", panel: "user" },
  "budget@hospital.com": { password: "bud123", role: "budget-committee", name: "Robert Wilson", panel: "user" },
  "cfo@hospital.com": { password: "cfo123", role: "cfo", name: "Lisa Anderson", panel: "user" },
};

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [hospitalId, setHospitalId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Simulate authentication
    const user = DEMO_USERS[email as keyof typeof DEMO_USERS];
    
    if (user && user.password === password && hospitalId) {
      // Successful login - redirect to panel-based dashboard
      onLogin(user.role, user.panel);
    } else {
      setError("Invalid credentials or missing Hospital ID. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E8F0FF] via-white to-[#F0F9FF] p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#0F67FF] to-[#0B4FCC] rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-gray-900">Hospital Asset Management</CardTitle>
            <CardDescription className="mt-2">Secure access to HFAMS platform</CardDescription>
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
                <p className="text-gray-700">Hospital ID: HOSP-2024-001</p>
                <hr className="my-2 border-[#0F67FF]/20" />
                <p className="text-gray-500">Admin Panel:</p>
                <p className="text-gray-600">• Super Admin: superadmin@hfams.com / super123</p>
                <p className="text-gray-600">• Audit Admin: audit@hfams.com / audit123</p>
                <hr className="my-2 border-[#0F67FF]/20" />
                <p className="text-gray-500">Requestors:</p>
                <p className="text-gray-600">• Doctor: doctor@hospital.com / doctor123</p>
                <p className="text-gray-600">• Nurse: nurse@hospital.com / nurse123</p>
                <hr className="my-2 border-[#0F67FF]/20" />
                <p className="text-gray-500">Approval Workflow:</p>
                <p className="text-gray-600">• Level 1: level1@hospital.com / level1</p>
                <p className="text-gray-600">• Level 2: level2@hospital.com / level2</p>
                <p className="text-gray-600">• Level 3: level3@hospital.com / level3</p>
                <p className="text-gray-600">• HOD: hod@hospital.com / hod123</p>
                <p className="text-gray-600">• Inventory: inventory@hospital.com / inv123</p>
                <p className="text-gray-600">• Purchase: purchase@hospital.com / pur123</p>
                <p className="text-gray-600">• Budget: budget@hospital.com / bud123</p>
                <p className="text-gray-600">• CFO: cfo@hospital.com / cfo123</p>
                <hr className="my-2 border-[#0F67FF]/20" />
                <p className="text-gray-500">Other Roles:</p>
                <p className="text-gray-600">• Dept Head: dept@hospital.com / dept123</p>
                <p className="text-gray-600">• Biomedical: bio@hospital.com / bio123</p>
                <p className="text-gray-600">• Store: store@hospital.com / store123</p>
                <p className="text-gray-600">• Viewer: viewer@hospital.com / viewer123</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospital-id">Hospital ID</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="hospital-id"
                  placeholder="HOSP-2024-001"
                  value={hospitalId}
                  onChange={(e) => setHospitalId(e.target.value)}
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
            <div className="flex items-center justify-between">
              <a href="#" className="text-[#0F67FF] hover:underline">
                Forgot Password?
              </a>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC] hover:from-[#0B4FCC] hover:to-[#0F67FF] shadow-lg">
              Sign In Securely
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
  );
}
