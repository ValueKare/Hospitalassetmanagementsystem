import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
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
} from "lucide-react";
import { toast } from "sonner";

interface AuditAsset {
  id: number;
  asset_code: string;
  asset_name: string;
  location: string;
  department: string;
  system_status: string;
}

export function AuditController() {
  const [assets, setAssets] = useState<AuditAsset[]>([]);
  const [auditCycle, setAuditCycle] = useState("quarterly");
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    // Fetch assets under audit
    fetch("http://localhost:5001/api/audit/assets")
      .then((res) => res.json())
      .then((data) => setAssets(data))
      .catch(() => toast.error("Failed to load audit assets"));
  }, []);

  const handleLockAssets = () => {
    setLocked(true);
    toast.success("Assets locked for audit. No modifications allowed.");
  };

  const handleVerify = (id: number, status: string) => {
    toast.success(`Asset ${id} marked as ${status}`);
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
          </div>

          <Button
            onClick={handleLockAssets}
            disabled={locked}
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
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verify</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>{asset.asset_code}</TableCell>
                      <TableCell>{asset.asset_name}</TableCell>
                      <TableCell>{asset.location}</TableCell>
                      <TableCell>{asset.department}</TableCell>
                      <TableCell>
                        <Badge>{asset.system_status}</Badge>
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerify(asset.id, "Verified")}
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerify(asset.id, "Mismatch")}
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
