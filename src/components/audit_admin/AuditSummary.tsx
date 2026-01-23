import { useEffect, useState } from "react";
import { getAuditSummary } from "./auditService";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

interface AuditSummaryProps {
  onNavigate: (screen: string, auditId?: string) => void;
  auditId: string;
}

export default function AuditSummary({ onNavigate, auditId }: AuditSummaryProps) {
  const [summary, setSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getAuditSummary(auditId);
        setSummary(res.data.summary || []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load audit summary");
        console.error("Error fetching summary:", err);
      } finally {
        setLoading(false);
      }
    };

    if (auditId) {
      fetchSummary();
    }
  }, [auditId]);

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => onNavigate("audit-list")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Audit List
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">Audit Summary</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary for Audit: {auditId}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F67FF]"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 py-4">{error}</div>
          ) : summary.length === 0 ? (
            <p className="text-gray-500 py-4">No summary data available</p>
          ) : (
            <div className="space-y-2">
              {summary.map((item) => (
                <div key={item._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{item._id}</span>
                  <span className="text-[#0F67FF] font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
