import { useState, useEffect } from "react";
import { getAllAudits } from "./auditService";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText,
  Calendar,
  User,
  Building,
  Play
} from "lucide-react";
import { toast } from "sonner";

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

interface AuditListProps {
  onNavigate: (screen: string, auditId?: string) => void;
}

export default function AuditList({ onNavigate }: AuditListProps) {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20
  });
  const [filters, setFilters] = useState({
    status: 'in_progress', // Default to in_progress
    auditType: 'all',
    hospitalId: '',
    search: ''
  });

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const response = await getAllAudits({
        page: pagination.currentPage,
        limit: pagination.limit,
        ...filters
      });
      
      setAudits(response.data.audits);
      setPagination(response.data.pagination);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to fetch audits";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, [pagination.currentPage, filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in_progress':
        return <Eye className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'closed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAuditClick = (audit: Audit) => {
    console.log('Audit clicked:', audit);
    console.log('Audit status:', audit.status);
    console.log('Navigating to:', audit.status === 'in_progress' ? 'audit-dashboard' : 'audit-summary');
    
    if (audit.status === 'in_progress') {
      onNavigate('audit-dashboard', audit._id);
    } else {
      // For closed, submitted, or completed audits - only show summary
      onNavigate('audit-summary', audit._id);
    }
  };

  const getInProgressAudits = () => {
    setFilters(prev => ({ ...prev, status: 'in_progress' }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const getAllAuditsFiltered = () => {
    setFilters(prev => ({ ...prev, status: 'all' }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">In-Progress Audits</h1>
          <p className="text-gray-600 mt-1">Continue audit progress (same page as Start Audit)</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={getAllAuditsFiltered} variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            View All Audits
          </Button>
          <Button onClick={() => onNavigate('initiate-audit')}>
            <Play className="w-4 h-4 mr-2" />
            Initiate New Audit
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search audits..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <Select 
              value={filters.status} 
              onValueChange={(value: string) => {
                setFilters(prev => ({ ...prev, status: value }));
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.auditType} 
              onValueChange={(value: string) => {
                setFilters(prev => ({ ...prev, auditType: value }));
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Audit Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="statutory">statutory</SelectItem>
                <SelectItem value="internal">internal</SelectItem>
                <SelectItem value="physical">physical</SelectItem>
                <SelectItem value="surprise">surprise</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Hospital ID"
              value={filters.hospitalId}
              onChange={(e) => setFilters(prev => ({ ...prev, hospitalId: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* In-Progress Audits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Audits ({pagination.totalCount})</span>
            <div className="text-sm text-gray-500">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : audits.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {filters.status === 'in_progress' ? 'No in-progress audits found' : 'No audits found'}
            </div>
          ) : (
            <div className="space-y-4">
              {audits.map((audit) => (
                <div
                  key={audit._id}
                  className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                    audit.status === 'in_progress' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => handleAuditClick(audit)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{audit.auditCode}</h3>
                        <Badge className={getStatusColor(audit.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(audit.status)}
                            <span className="capitalize">
                              {audit.status.replace('_', ' ')}
                            </span>
                          </div>
                        </Badge>
                        <Badge variant="outline">
                          {audit.auditType}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          <span>{audit.hospitalId?.name || 'Unknown Hospital'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{audit.initiatedBy?.name || 'Unknown User'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(audit.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          <span>{audit.assignedAuditors?.length || 0} auditor(s)</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="text-right ml-4">
                      <div className="text-sm text-gray-600 mb-1">
                        Verification Rate
                      </div>
                      <div className={`text-lg font-semibold ${
                        parseFloat(audit.stats.verificationRate) >= 90 
                          ? 'text-green-600' 
                          : parseFloat(audit.stats.verificationRate) >= 70 
                          ? 'text-yellow-600' 
                          : 'text-red-600'
                      }`}>
                        {audit.stats.verificationRate}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {audit.stats.verifiedAssets}/{audit.stats.totalAssets} assets
                      </div>
                      {audit.stats.discrepancyAssets > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          {audit.stats.discrepancyAssets} discrepancies
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {audit.status === 'in_progress' && (
                    <div className="mt-3 p-2 bg-blue-100 rounded text-blue-700 text-sm">
                      <Eye className="w-4 h-4 inline mr-2" />
                      Click to continue (same page as Start Audit)
                    </div>
                  )}
                  {(audit.status === 'completed' || audit.status === 'closed') && (
                    <div className="mt-3 p-2 bg-gray-100 rounded text-gray-700 text-sm">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Click to view summary (read-only)
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
            disabled={pagination.currentPage === 1}
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(prev.totalPages, prev.currentPage + 1) }))}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
