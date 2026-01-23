import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  ClipboardCheck,
  QrCode,
  AlertTriangle,
  CheckCircle,
  FileText,
  Lock,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { getAuditAssets } from "../audit_admin/auditService";

interface AuditAsset {
  _id: string;
  assetKey: string;
  physicalStatus: string;
  locationMatched: boolean;
  assetDetails?: {
    assetName: string;
    assetCode: string;
    departmentId?: { name: string };
    buildingId?: { name: string };
  };
}

interface OverallStats {
  totalAssets: number;
  verifiedAssets: number;
  discrepancyAssets: number;
  pendingAssets: number;
  verificationRate: string;
}

interface DepartmentGroup {
  departmentId: string;
  departmentName: string;
  stats: {
    total: number;
    verified: number;
    discrepancies: number;
    pending: number;
  };
}

export function AuditController() {
  const [assets, setAssets] = useState<AuditAsset[]>([]);
  const [auditCycle, setAuditCycle] = useState("quarterly");
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [auditId, setAuditId] = useState("");
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [departmentStats, setDepartmentStats] = useState<DepartmentGroup[]>([]);

  const fetchAssets = async () => {
    if (!auditId.trim()) {
      toast.error("Please enter an Audit ID");
      return;
    }
    try {
      setLoading(true);
      const res = await getAuditAssets(auditId);
      setAssets(res.data.auditAssets || []);
      setOverallStats(res.data.overallStats || null);
      setDepartmentStats(res.data.assetsByDepartment || []);
      toast.success(`Loaded ${res.data.auditAssets?.length || 0} assets`);
    } catch (err: any) {
      console.error("Error fetching audit assets:", err);
      toast.error(err.response?.data?.message || "Failed to load audit assets");
      setAssets([]);
      setOverallStats(null);
      setDepartmentStats([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLockAssets = () => {
    setLocked(true);
    toast.success("Assets locked for audit. No modifications allowed.");
  };

  const handleVerify = (assetKey: string, status: string) => {
    toast.success(`Asset ${assetKey} marked as ${status}`);
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      found: "bg-green-100 text-green-800",
      not_found: "bg-red-100 text-red-800",
      damaged: "bg-orange-100 text-orange-800",
      excess: "bg-blue-100 text-blue-800",
      pending: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-[#0F67FF]" />
          Audit Controller
        </h1>
        <p className="text-gray-600">
          Physical verification and compliance audit of assets
        </p>
      </div>

      {/* Audit ID Input */}
      <Card>
        <CardHeader>
          <CardTitle>Load Audit Assets</CardTitle>
          <CardDescription>Enter an Audit ID to load assets for verification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter Audit ID (e.g., AUD-2025-001 or MongoDB ObjectId)"
                value={auditId}
                onChange={(e) => setAuditId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchAssets()}
              />
            </div>
            <Button onClick={fetchAssets} disabled={loading} className="bg-[#0F67FF]">
              <Search className="h-4 w-4 mr-2" />
              {loading ? "Loading..." : "Load Assets"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overall Stats */}
      {overallStats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.totalAssets}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">Verified</p>
              <p className="text-2xl font-bold text-green-600">{overallStats.verifiedAssets}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-orange-500">{overallStats.pendingAssets}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">Discrepancies</p>
              <p className="text-2xl font-bold text-red-600">{overallStats.discrepancyAssets}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">Verification Rate</p>
              <p className="text-2xl font-bold text-[#0F67FF]">{overallStats.verificationRate}%</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Department Stats */}
      {departmentStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Department-wise Progress</CardTitle>
            <CardDescription>Verification status by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departmentStats.map((dept) => (
                <div key={dept.departmentId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">{dept.departmentName}</p>
                    <Badge variant="secondary">{dept.stats.total} assets</Badge>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <Badge className="bg-green-100 text-green-800">{dept.stats.verified} verified</Badge>
                    <Badge className="bg-orange-100 text-orange-800">{dept.stats.pending} pending</Badge>
                    {dept.stats.discrepancies > 0 && (
                      <Badge className="bg-red-100 text-red-800">{dept.stats.discrepancies} issues</Badge>
                    )}
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#0F67FF] h-2 rounded-full transition-all"
                      style={{ width: `${dept.stats.total > 0 ? (dept.stats.verified / dept.stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Controls */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Select value={auditCycle} onValueChange={setAuditCycle}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Audit Cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>

            <Badge variant="outline">
              Cycle: {auditCycle.toUpperCase()}
            </Badge>
            
            {assets.length > 0 && (
              <Badge variant="secondary">{assets.length} assets loaded</Badge>
            )}
          </div>

          <Button
            onClick={handleLockAssets}
            disabled={locked || assets.length === 0}
            className="bg-red-600 hover:bg-red-700"
          >
            <Lock className="h-4 w-4 mr-2" />
            {locked ? "Assets Locked" : "Lock Assets"}
          </Button>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="verify">
        <TabsList>
          <TabsTrigger value="verify">Physical Verification</TabsTrigger>
          <TabsTrigger value="observations">Observations</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Physical Verification */}
        <TabsContent value="verify">
          <Card>
            <CardHeader>
              <CardTitle>Asset Verification</CardTitle>
              <CardDescription>
                {assets.length === 0 
                  ? "Enter an Audit ID above to load assets" 
                  : `${assets.length} assets loaded for verification`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F67FF]"></div>
                </div>
              ) : assets.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No assets loaded. Enter an Audit ID and click "Load Assets" to begin.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset Key</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Building</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location Match</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map((asset) => (
                      <TableRow key={asset._id}>
                        <TableCell className="font-mono text-sm">{asset.assetKey}</TableCell>
                        <TableCell>{asset.assetDetails?.assetName || "N/A"}</TableCell>
                        <TableCell>{asset.assetDetails?.buildingId?.name || "N/A"}</TableCell>
                        <TableCell>{asset.assetDetails?.departmentId?.name || "N/A"}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(asset.physicalStatus)}>
                            {asset.physicalStatus || "pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {asset.locationMatched ? (
                            <Badge className="bg-green-100 text-green-800">Yes</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">No</Badge>
                          )}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerify(asset.assetKey, "Verified")}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerify(asset.assetKey, "Mismatch")}
                          >
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <QrCode className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Observations */}
        <TabsContent value="observations">
          <Card>
            <CardHeader>
              <CardTitle>Audit Observations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Record discrepancies, missing assets, damage, or utilization issues..."
                rows={6}
              />
              <Button className="bg-[#0F67FF]">Save Observations</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Audit Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Asset-wise Audit Report
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Department Compliance Report
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Exception & Scrap Recommendation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
