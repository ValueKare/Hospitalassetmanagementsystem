import { useState, useEffect } from "react";
import { submitAudit, closeAudit, getAllAudits } from "./auditService";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ClipboardCheck, FileText, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface AuditDashboardProps {
  onNavigate: (screen: string, auditId?: string) => void;
  auditId: string;
}

export default function AuditDashboard({ onNavigate, auditId }: AuditDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [auditStatus, setAuditStatus] = useState<string>('pending');
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    const fetchAuditStatus = async () => {
      try {
        const response = await getAllAudits({ limit: 100, status: 'all' });
        const audit = response.data.audits.find((a: any) => a._id === auditId);
        if (audit) {
          setAuditStatus(audit.status);
        }
      } catch (err) {
        console.error('Error fetching audit status:', err);
      } finally {
        setStatusLoading(false);
      }
    };

    fetchAuditStatus();
  }, [auditId]);

  const handleSubmit = async () => {
    if (auditStatus !== 'in_progress') {
      toast.error("Only in-progress audits can be submitted");
      return;
    }
    
    try {
      setLoading(true);
      await submitAudit(auditId);
      toast.success("Audit submitted successfully");
      setAuditStatus('completed');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to submit audit";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    if (auditStatus !== 'in_progress' && auditStatus !== 'completed') {
      toast.error("Only in-progress or completed audits can be closed");
      return;
    }
    
    try {
      setLoading(true);
      await closeAudit(auditId);
      toast.success("Audit closed successfully");
      setAuditStatus('closed');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to close audit";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Audit Dashboard</h2>
      
      {/* Status Display */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Audit Status: 
            <span className={`px-2 py-1 rounded text-sm font-medium ${
              auditStatus === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              auditStatus === 'completed' ? 'bg-green-100 text-green-800' :
              auditStatus === 'closed' ? 'bg-gray-100 text-gray-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {auditStatus.replace('_', ' ').toUpperCase()}
            </span>
          </CardTitle>
        </CardHeader>
        {auditStatus !== 'in_progress' && (
          <CardContent>
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <span>This audit is {auditStatus.replace('_', ' ')} and cannot be modified.</span>
            </div>
          </CardContent>
        )}
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Audit Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button 
            onClick={() => onNavigate("audit-verify-asset", auditId)} 
            disabled={loading || auditStatus !== 'in_progress'}
            className="flex items-center gap-2"
          >
            <ClipboardCheck className="h-4 w-4" />
            Verify Assets
          </Button>

          <Button 
            onClick={handleSubmit} 
            disabled={loading || auditStatus !== 'in_progress'} 
            variant="default"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {loading ? "Submitting..." : "Submit Audit"}
          </Button>

          <Button 
            onClick={handleClose} 
            disabled={loading || (auditStatus !== 'in_progress' && auditStatus !== 'completed')} 
            variant="destructive"
          >
            <XCircle className="h-4 w-4 mr-2" />
            {loading ? "Closing..." : "Close Audit"}
          </Button>

          <Button 
            onClick={() => onNavigate("audit-summary", auditId)} 
            disabled={loading}
            variant="outline"
          >
            <FileText className="h-4 w-4 mr-2" />
            View Summary
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
