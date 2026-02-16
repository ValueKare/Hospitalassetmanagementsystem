import { useState } from "react";
import { initiateAudit } from "./auditService";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ArrowLeft, PlayCircle } from "lucide-react";
import { toast } from "sonner";

interface InitiateAuditProps {
  onNavigate: (screen: string, auditId?: string) => void;
}

export default function InitiateAudit({ onNavigate }: InitiateAuditProps) {
  const [auditCode, setAuditCode] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [auditType, setAuditType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    console.log('InitiateAudit: Submit called with:', { auditCode, hospitalId, auditType });
    
    if (!auditCode || !hospitalId || !auditType) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);
      console.log('InitiateAudit: Calling API...');
      const res = await initiateAudit({
        auditCode,
        hospitalId,
        auditType
      });

      console.log('InitiateAudit: API response:', res);
      toast.success("Audit initiated successfully");
      // Navigate to audit dashboard with the new audit ID
      const newAuditId = res.data?.auditId || auditCode;
      console.log('InitiateAudit: Navigating to audit-dashboard with ID:', newAuditId);
      onNavigate("audit-dashboard", newAuditId);
    } catch (err: any) {
      console.error('InitiateAudit: Error occurred:', err);
      const errorMsg = err.response?.data?.message || "Failed to initiate audit";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => onNavigate("dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">Initiate New Audit</h2>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Audit Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="auditCode">Audit Code</Label>
            <Input
              id="auditCode"
              placeholder="Enter audit code"
              value={auditCode}
              onChange={(e) => setAuditCode(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hospitalId">Hospital ID</Label>
            <Input
              id="hospitalId"
              placeholder="Enter hospital ID"
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Audit Type</Label>
            <Select value={auditType} onValueChange={setAuditType} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select audit type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="statutory">Statutory</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="physical">Physical</SelectItem>
                <SelectItem value="surprise">Surprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            <PlayCircle className="h-4 w-4 mr-2" />
            {loading ? "Starting Audit..." : "Start Audit"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
