import { useState, useEffect } from "react";
import { verifyAuditAsset, getAuditAssets, getAuditAssetForVerification } from "./auditService";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { ArrowLeft, CheckCircle, Search, MapPin, Package, History, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface VerifyAuditAssetProps {
  onNavigate: (screen: string, auditId?: string) => void;
  auditId: string;
}

interface AuditAssetItem {
  _id: string;
  assetKey: string;
  physicalStatus: string;
  locationMatched: boolean;
  discrepancy: boolean;
  verifiedAt?: string;
  assetDetails?: {
    assetName: string;
    assetCode: string;
    category: string;
    purchaseCost: number;
    departmentId?: { _id: string; name: string };
    hospitalId?: { name: string };
    buildingId?: { name: string };
    floorId?: { name: string };
  };
}

interface AssetDetails {
  asset: any;
  auditAsset: any;
  verificationHistory: any[];
  verificationStatus: any;
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
  assets: AuditAssetItem[];
  stats: {
    total: number;
    verified: number;
    discrepancies: number;
    pending: number;
  };
}

export default function VerifyAuditAsset({ onNavigate, auditId }: VerifyAuditAssetProps) {
  const [assetKey, setAssetKey] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [physicalStatus, setPhysicalStatus] = useState("found");
  const [locationMatched, setLocationMatched] = useState(true);
  const [auditorRemark, setAuditorRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [allAuditAssets, setAllAuditAssets] = useState<AuditAssetItem[]>([]); // Store all assets
  const [assetsByDepartment, setAssetsByDepartment] = useState<DepartmentGroup[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
  const [viewMode, setViewMode] = useState<"list" | "department">("list");

  // Client-side filtered assets
  const filteredAssets = allAuditAssets.filter((item) => {
    // Department filter
    if (departmentFilter !== "all") {
      const itemDeptId = item.assetDetails?.departmentId?._id || "unassigned";
      if (itemDeptId !== departmentFilter) return false;
    }
    return true;
  });

  // Filtered departments for department view
  const filteredDepartments = departmentFilter === "all" 
    ? assetsByDepartment 
    : assetsByDepartment.filter(dept => dept.departmentId === departmentFilter);

  // Fetch audit assets
  const fetchAuditAssets = async (page = 1) => {
    try {
      setAssetsLoading(true);
      const res = await getAuditAssets(auditId, {
        page,
        limit: 20, // 20 assets per page
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery || undefined,
      });
      setAllAuditAssets(res.data.auditAssets || []);
      setAssetsByDepartment(res.data.assetsByDepartment || []);
      // Use overallStats from API which contains totals for all assets in audit
      setOverallStats(res.data.overallStats || null);
      setPagination(res.data.pagination || { currentPage: 1, totalPages: 1, totalCount: 0 });
    } catch (err: any) {
      console.error("Error fetching audit assets:", err);
      toast.error("Failed to load audit assets");
    } finally {
      setAssetsLoading(false);
    }
  };

  useEffect(() => {
    if (auditId) {
      fetchAuditAssets();
    }
  }, [auditId, statusFilter]); // Remove departmentFilter from deps - it's client-side now

  // Fetch asset details for verification
  const fetchAssetDetails = async (key: string) => {
    try {
      setDetailsLoading(true);
      const res = await getAuditAssetForVerification(auditId, key);
      setSelectedAsset(res.data);
      setAssetKey(key);
      // Pre-fill with existing status if available
      if (res.data.verificationStatus) {
        setPhysicalStatus(res.data.verificationStatus.physicalStatus || "found");
        setLocationMatched(res.data.verificationStatus.locationMatched ?? true);
        setAuditorRemark(res.data.verificationStatus.auditorRemark || "");
      }
    } catch (err: any) {
      console.error("Error fetching asset details:", err);
      toast.error("Failed to load asset details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchAuditAssets(1);
  };

  const verify = async () => {
    if (!assetKey.trim()) {
      toast.error("Please select an asset to verify");
      return;
    }

    try {
      setLoading(true);
      await verifyAuditAsset(auditId, assetKey, {
        physicalStatus,
        locationMatched,
        auditorRemark,
      });

      toast.success("Asset verified successfully");
      setSelectedAsset(null);
      setAssetKey("");
      setAuditorRemark("");
      fetchAuditAssets(pagination.currentPage);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to verify asset";
      toast.error(errorMsg);
      console.error("Error verifying asset:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      found: "bg-green-100 text-green-800",
      not_found: "bg-red-100 text-red-800",
      damaged: "bg-orange-100 text-orange-800",
      excess: "bg-blue-100 text-blue-800",
      pending: "bg-gray-100 text-gray-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => onNavigate("audit-dashboard", auditId)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">Verify Assets</h2>
        <Badge variant="outline">Audit: {auditId}</Badge>
      </div>

      {/* Overall Stats */}
      {overallStats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Audit Assets</CardTitle>
                <CardDescription>Select an asset to verify</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={viewMode === "list" ? "default" : "outline"}
                  onClick={() => setViewMode("list")}
                >
                  List
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "department" ? "default" : "outline"}
                  onClick={() => setViewMode("department")}
                >
                  By Dept
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Input
                placeholder="Search by asset key..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 min-w-[150px]"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="found">Found</SelectItem>
                  <SelectItem value="not_found">Not Found</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
              {assetsByDepartment.length > 0 && (
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Depts</SelectItem>
                    {assetsByDepartment.map((dept) => (
                      <SelectItem key={dept.departmentId} value={dept.departmentId}>
                        {dept.departmentName} ({dept.stats.total})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button onClick={handleSearch} variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Asset List */}
            {assetsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F67FF]"></div>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {departmentFilter !== "all" ? "No assets in this department" : "No assets found"}
              </div>
            ) : viewMode === "department" ? (
              // Department-wise view
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {filteredDepartments.map((dept) => (
                  <div key={dept.departmentId} className="border rounded-lg">
                    <div className="bg-gray-50 p-3 border-b flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{dept.departmentName}</p>
                        <p className="text-xs text-gray-500">
                          {dept.stats.verified}/{dept.stats.total} verified • {dept.stats.discrepancies} discrepancies
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Badge className="bg-green-100 text-green-800">{dept.stats.verified}</Badge>
                        <Badge className="bg-orange-100 text-orange-800">{dept.stats.pending}</Badge>
                        {dept.stats.discrepancies > 0 && (
                          <Badge className="bg-red-100 text-red-800">{dept.stats.discrepancies}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="divide-y">
                      {dept.assets.slice(0, 5).map((item) => (
                        <div
                          key={item._id}
                          className={`p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                            assetKey === item.assetKey ? "bg-[#E8F0FF]" : ""
                          }`}
                          onClick={() => fetchAssetDetails(item.assetKey)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{item.assetDetails?.assetName || item.assetKey}</p>
                              <p className="text-xs text-gray-500">{item.assetKey}</p>
                            </div>
                            <Badge className={getStatusBadge(item.physicalStatus)} >
                              {item.physicalStatus || "pending"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {dept.assets.length > 5 && (
                        <div className="p-2 text-center text-sm text-gray-500">
                          +{dept.assets.length - 5} more assets
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List view
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredAssets.map((item) => (
                  <div
                    key={item._id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      assetKey === item.assetKey ? "border-[#0F67FF] bg-[#E8F0FF]" : ""
                    }`}
                    onClick={() => fetchAssetDetails(item.assetKey)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.assetDetails?.assetName || item.assetKey}</p>
                        <p className="text-sm text-gray-500">{item.assetKey}</p>
                      </div>
                      <Badge className={getStatusBadge(item.physicalStatus)}>
                        {item.physicalStatus || "pending"}
                      </Badge>
                    </div>
                    {item.assetDetails && (
                      <p className="text-xs text-gray-400 mt-1">
                        {item.assetDetails.departmentId?.name} • {item.assetDetails.buildingId?.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Asset count and pagination info */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <span className="text-sm text-gray-500">
                {departmentFilter !== "all" 
                  ? `Showing ${filteredAssets.length} assets in selected department`
                  : `Showing ${filteredAssets.length} of ${allAuditAssets.length} assets`
                }
              </span>
              {pagination.totalPages > 1 && departmentFilter === "all" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pagination.currentPage <= 1}
                    onClick={() => fetchAuditAssets(pagination.currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pagination.currentPage >= pagination.totalPages}
                    onClick={() => fetchAuditAssets(pagination.currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Verification Form */}
        <div className="space-y-6">
          {/* Asset Details */}
          {detailsLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F67FF]"></div>
              </CardContent>
            </Card>
          ) : selectedAsset ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#0F67FF]" />
                    {selectedAsset.asset?.assetName || "Asset Details"}
                  </CardTitle>
                  <CardDescription>{selectedAsset.asset?.assetCode}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <p className="font-medium">{selectedAsset.asset?.category || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Purchase Cost:</span>
                      <p className="font-medium">₹{selectedAsset.asset?.purchaseCost?.toLocaleString() || "N/A"}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Location</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Hospital:</span>
                        <p>{selectedAsset.asset?.hospitalId?.name || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Building:</span>
                        <p>{selectedAsset.asset?.buildingId?.name || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Floor:</span>
                        <p>{selectedAsset.asset?.floorId?.name || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Department:</span>
                        <p>{selectedAsset.asset?.departmentId?.name || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Verification History */}
                  {selectedAsset.verificationHistory?.length > 0 && (
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <History className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Previous Verifications</span>
                      </div>
                      <div className="space-y-2">
                        {selectedAsset.verificationHistory.slice(0, 3).map((history: any, idx: number) => (
                          <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                            <span className={`inline-block px-2 py-0.5 rounded ${getStatusBadge(history.physicalStatus)}`}>
                              {history.physicalStatus}
                            </span>
                            <span className="ml-2 text-gray-500">
                              {history.auditId?.auditCode} • {new Date(history.verifiedAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Verification Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Verification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Physical Status</Label>
                    <Select value={physicalStatus} onValueChange={setPhysicalStatus} disabled={loading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="found">Found</SelectItem>
                        <SelectItem value="not_found">Not Found</SelectItem>
                        <SelectItem value="damaged">Damaged</SelectItem>
                        <SelectItem value="excess">Excess</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Location Matched?</Label>
                    <Select
                      value={locationMatched ? "yes" : "no"}
                      onValueChange={(v: string) => setLocationMatched(v === "yes")}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes - Location matches records</SelectItem>
                        <SelectItem value="no">No - Location mismatch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Auditor Remarks</Label>
                    <Textarea
                      placeholder="Enter any observations or remarks..."
                      value={auditorRemark}
                      onChange={(e) => setAuditorRemark(e.target.value)}
                      disabled={loading}
                      rows={3}
                    />
                  </div>

                  <Button onClick={verify} disabled={loading} className="w-full bg-[#0F67FF]">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {loading ? "Verifying..." : "Submit Verification"}
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
                <AlertTriangle className="h-12 w-12 mb-4 text-gray-300" />
                <p>Select an asset from the list to verify</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
