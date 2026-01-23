import { useState, useEffect } from "react";
import { getAllAudits } from "./auditService";
import { verifyAuditAsset } from "./auditService";
import { submitAudit } from "./auditService";
import { closeAudit } from "./auditService";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  User,
  Building,
  Calendar,
  FileText,
  Save,
  Send,
  Eye,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";

interface AuditAsset {
  _id: string;
  assetKey: string;
  assetName: string;
  assetCode: string;
  category: string;
  location: string;
  expectedQuantity: number;
  actualQuantity?: number;
  verifiedAt?: string;
  discrepancy: boolean;
  discrepancyReason?: string;
  notes?: string;
}

interface Audit {
  _id: string;
  auditCode: string;
  auditType: string;
  status: 'pending' | 'in_progress' | 'completed' | 'closed';
  hospitalId: {
    _id: string;
    name: string;
    hospitalId: string;
  };
  initiatedBy: {
    _id: string;
    name: string;
    email: string;
  };
  assignedAuditors: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  createdAt: string;
  stats: {
    totalAssets: number;
    verifiedAssets: number;
    discrepancyAssets: number;
    verificationRate: string;
  };
}

interface AuditActionProps {
  onNavigate: (screen: string, auditId?: string) => void;
  auditId: string;
}

export default function AuditAction({ onNavigate, auditId }: AuditActionProps) {
  const [audit, setAudit] = useState<Audit | null>(null);
  const [assets, setAssets] = useState<AuditAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending' | 'discrepancy'>('all');

  const fetchAuditDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching audit details for ID:', auditId);
      
      // First try to get all audits and find the specific one
      const response = await getAllAudits({ 
        limit: 100,
        status: 'all' // Get all statuses to find the audit
      });
      
      console.log('All audits response:', response.data);
      console.log('Available audit IDs:', response.data.audits.map((a: any) => a._id));
      
      const foundAudit = response.data.audits.find((a: Audit) => {
        console.log('Comparing with audit:', a._id, '===', auditId, 'result:', a._id === auditId);
        return a._id === auditId;
      });
      
      if (foundAudit) {
        console.log('Found audit:', foundAudit);
        setAudit(foundAudit);
        fetchAuditAssets(foundAudit);
      } else {
        console.log('Audit not found in list, available audits:', response.data.audits.map(a => a._id));
        toast.error("Audit not found");
        onNavigate('audit-list');
      }
    } catch (err: any) {
      console.error('Error fetching audit details:', err);
      const errorMsg = err.response?.data?.message || "Failed to fetch audit details";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditAssets = (auditData: Audit) => {
    // Mock data for audit assets - replace with actual API call
    const mockAssets: AuditAsset[] = [
      {
        _id: '1',
        assetKey: 'AST001',
        assetName: 'Ventilator Machine',
        assetCode: 'VNT-001',
        category: 'Medical Equipment',
        location: 'ICU Ward A',
        expectedQuantity: 5,
        actualQuantity: 5,
        verifiedAt: '2024-01-15T10:30:00Z',
        discrepancy: false
      },
      {
        _id: '2',
        assetKey: 'AST002',
        assetName: 'Patient Monitor',
        assetCode: 'PM-002',
        category: 'Medical Equipment',
        location: 'Emergency Room',
        expectedQuantity: 10,
        actualQuantity: 8,
        verifiedAt: '2024-01-15T11:00:00Z',
        discrepancy: true,
        discrepancyReason: '2 units missing from inventory'
      },
      {
        _id: '3',
        assetKey: 'AST003',
        assetName: 'X-Ray Machine',
        assetCode: 'XRM-003',
        category: 'Medical Equipment',
        location: 'Radiology Department',
        expectedQuantity: 3,
        actualQuantity: undefined, // Not verified yet
        verifiedAt: undefined,
        discrepancy: false
      }
    ];
    setAssets(mockAssets);
  };

  useEffect(() => {
    fetchAuditDetails();
  }, [auditId]);

  const handleAssetVerification = async (assetKey: string, verificationData: any) => {
    try {
      await verifyAuditAsset(auditId, assetKey, verificationData);
      toast.success("Asset verified successfully");
      fetchAuditAssets(); // Refresh assets
      fetchAuditDetails(); // Refresh audit stats
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to verify asset";
      toast.error(errorMsg);
    }
  };

  const handleSubmitAudit = async () => {
    try {
      setSubmitting(true);
      await submitAudit(auditId);
      toast.success("Audit submitted successfully");
      onNavigate('audit-details', auditId);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to submit audit";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseAudit = async () => {
    try {
      setSubmitting(true);
      await closeAudit(auditId);
      toast.success("Audit closed successfully");
      onNavigate('audit-list');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to close audit";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'verified' && asset.verifiedAt) ||
                         (filterStatus === 'pending' && !asset.verifiedAt) ||
                         (filterStatus === 'discrepancy' && asset.discrepancy);
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Audit not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Action</h1>
          <p className="text-gray-600 mt-1">Continue and manage audit progress</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onNavigate('audit-list')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Button>
          <Button 
            onClick={handleSubmitAudit}
            disabled={submitting || assets.some(a => !a.verifiedAt)}
          >
            <Send className="w-4 h-4 mr-2" />
            {submitting ? 'Submitting...' : 'Submit Audit'}
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleCloseAudit}
            disabled={submitting}
          >
            <XCircle className="w-4 h-4 mr-2" />
            {submitting ? 'Closing...' : 'Close Audit'}
          </Button>
        </div>
      </div>

      {/* Audit Info */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Audit Code</label>
              <div className="mt-1 p-2 bg-gray-50 rounded">{audit.auditCode}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  <Eye className="w-4 h-4 mr-1" />
                  {audit.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Type</label>
              <div className="mt-1 p-2 bg-gray-50 rounded">{audit.auditType}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Hospital</label>
              <div className="mt-1 p-2 bg-gray-50 rounded flex items-center gap-2">
                <Building className="w-4 h-4" />
                {audit.hospitalId?.name || 'Unknown'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Initiated By</label>
              <div className="mt-1 p-2 bg-gray-50 rounded flex items-center gap-2">
                <User className="w-4 h-4" />
                {audit.initiatedBy?.name || 'Unknown'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Created Date</label>
              <div className="mt-1 p-2 bg-gray-50 rounded flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(audit.createdAt)}
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{audit.stats.totalAssets}</div>
              <div className="text-sm text-blue-700">Total Assets</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{audit.stats.verifiedAssets}</div>
              <div className="text-sm text-green-700">Verified</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{audit.stats.discrepancyAssets}</div>
              <div className="text-sm text-red-700">Discrepancies</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{audit.stats.verificationRate}%</div>
              <div className="text-sm text-purple-700">Verification Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Audit Assets ({filteredAssets.length})</span>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterStatus} onValueChange={(value: string) => setFilterStatus(value as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assets</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="discrepancy">Discrepancy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAssets.map((asset) => (
              <AssetVerificationCard
                key={asset._id}
                asset={asset}
                onVerify={(data) => handleAssetVerification(asset.assetKey, data)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Asset Verification Card Component
function AssetVerificationCard({ 
  asset, 
  onVerify 
}: { 
  asset: AuditAsset; 
  onVerify: (data: any) => void; 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [verificationData, setVerificationData] = useState({
    actualQuantity: asset.actualQuantity || asset.expectedQuantity,
    discrepancy: asset.discrepancy,
    discrepancyReason: asset.discrepancyReason || '',
    notes: asset.notes || ''
  });

  const handleSave = () => {
    onVerify(verificationData);
    setIsEditing(false);
  };

  const handleDiscrepancyToggle = (hasDiscrepancy: boolean) => {
    setVerificationData(prev => ({
      ...prev,
      discrepancy: hasDiscrepancy,
      discrepancyReason: hasDiscrepancy ? prev.discrepancyReason : ''
    }));
  };

  return (
    <div className={`border rounded-lg p-4 ${
      asset.verifiedAt ? 'border-green-200 bg-green-50' : 'border-gray-200'
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="font-semibold text-lg">{asset.assetName}</h3>
            <Badge variant="outline">{asset.assetCode}</Badge>
            <Badge variant="secondary">{asset.category}</Badge>
            {asset.verifiedAt && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="w-4 h-4 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <label className="font-medium text-gray-700">Expected Qty</label>
              <div className="mt-1 font-semibold">{asset.expectedQuantity}</div>
            </div>
            <div>
              <label className="font-medium text-gray-700">Actual Qty</label>
              {isEditing ? (
                <Input
                  type="number"
                  value={verificationData.actualQuantity}
                  onChange={(e) => setVerificationData(prev => ({ 
                    ...prev, 
                    actualQuantity: parseInt(e.target.value) || 0 
                  }))}
                  className="mt-1 w-24"
                />
              ) : (
                <div className="mt-1 font-semibold">{verificationData.actualQuantity}</div>
              )}
            </div>
            <div>
              <label className="font-medium text-gray-700">Location</label>
              <div className="mt-1">{asset.location}</div>
            </div>
            <div>
              <label className="font-medium text-gray-700">Discrepancy</label>
              {isEditing ? (
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={verificationData.discrepancy}
                    onChange={(e) => handleDiscrepancyToggle(e.target.checked)}
                    className="rounded"
                  />
                  <span>{verificationData.discrepancy ? 'Yes' : 'No'}</span>
                </div>
              ) : (
                <div className="mt-1">
                  {asset.discrepancy ? (
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Yes
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      No
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {verificationData.discrepancy && (
            <div className="mt-3">
              <label className="font-medium text-gray-700">Discrepancy Reason</label>
              {isEditing ? (
                <Textarea
                  value={verificationData.discrepancyReason}
                  onChange={(e) => setVerificationData(prev => ({ 
                    ...prev, 
                    discrepancyReason: e.target.value 
                  }))}
                  placeholder="Explain discrepancy..."
                  className="mt-1"
                  rows={2}
                />
              ) : (
                <div className="mt-1 p-2 bg-yellow-50 rounded text-yellow-800">
                  {asset.discrepancyReason || 'No reason provided'}
                </div>
              )}
            </div>
          )}

          <div className="mt-3">
            <label className="font-medium text-gray-700">Notes</label>
            {isEditing ? (
              <Textarea
                value={verificationData.notes}
                onChange={(e) => setVerificationData(prev => ({ 
                  ...prev, 
                  notes: e.target.value 
                }))}
                placeholder="Additional notes..."
                className="mt-1"
                rows={2}
              />
            ) : (
              <div className="mt-1 text-sm text-gray-600">
                {asset.notes || 'No notes'}
              </div>
            )}
          </div>
        </div>

        <div className="ml-4">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <Button onClick={handleSave} size="sm">
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)}
              disabled={asset.verifiedAt}
              variant="outline"
              size="sm"
            >
              <FileText className="w-4 h-4 mr-1" />
              Verify
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
