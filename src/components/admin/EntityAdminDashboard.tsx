import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
  BarChart3,
  Building2,
  Repeat,
  Wrench,
  ClipboardCheck,
  Users,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

interface EntityAdminDashboardProps {
  onNavigate: (screen: string) => void;
}

export function EntityAdminDashboard({ onNavigate }: EntityAdminDashboardProps) {
  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-1">Entity Admin Dashboard</h1>
        <p className="text-gray-600">
          Organization-level asset governance, analytics & approvals
        </p>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KpiCard title="Total Assets" value="12,480" icon={Building2} />
        <KpiCard title="Underutilized Assets" value="1,140" icon={TrendingUp} />
        <KpiCard title="High Maintenance Assets" value="320" icon={Wrench} />
        <KpiCard title="Audit Issues" value="48" icon={AlertTriangle} />
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transfers">Inter-Hospital Transfers</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Oversight</TabsTrigger>
          <TabsTrigger value="audits">Audit & Compliance</TabsTrigger>
          <TabsTrigger value="users">User Oversight</TabsTrigger>
          <TabsTrigger value="analytics">Strategic Analytics</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Organization Asset Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <Info label="Hospitals Covered" value="8" />
              <Info label="Movable Assets" value="62%" />
              <Info label="Non-Movable Assets" value="38%" />
              <Info label="Assets In Use" value="81%" />
              <Info label="Idle / Underutilized" value="19%" />
              <Info label="Scrap Candidates" value="96" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transfers */}
        <TabsContent value="transfers">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Inter-Hospital Transfer Requests</CardTitle>
              <Button onClick={() => onNavigate("entity-transfer-approvals")}>
                <Repeat className="h-4 w-4 mr-2" />
                View Requests
              </Button>
            </CardHeader>
            <CardContent>
              <TransferRow
                asset="MRI Scanner"
                from="Hospital A"
                to="Hospital C"
                status="Pending Approval"
              />
              <TransferRow
                asset="Ventilator"
                from="Hospital B"
                to="Hospital A"
                status="Approved"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance */}
        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Oversight</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge variant="outline">AMC vs CMC Cost Comparison</Badge>
              <Badge variant="outline">Assets Near End-of-Life</Badge>
              <Badge variant="outline">High-Frequency Breakdown Assets</Badge>

              <Button
                variant="outline"
                onClick={() => onNavigate("entity-maintenance-analytics")}
              >
                <Wrench className="h-4 w-4 mr-2" />
                Open Maintenance Analytics
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audits */}
        <TabsContent value="audits">
          <Card>
            <CardHeader>
              <CardTitle>Audit Visibility & Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AuditRow hospital="Hospital A" status="Pending" />
              <AuditRow hospital="Hospital B" status="Completed" />
              <AuditRow hospital="Hospital C" status="Escalated" />

              <Button
                variant="outline"
                onClick={() => onNavigate("entity-audit-reports")}
              >
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Download Audit Reports
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User & Access Oversight</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Info label="Hospital Admins" value="14" />
              <Info label="HODs" value="62" />
              <Info label="Employees" value="1,240" />

              <Button
                variant="outline"
                onClick={() => onNavigate("entity-user-management")}
              >
                <Users className="h-4 w-4 mr-2" />
                View Users
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Executive Analytics & Strategic Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge>Utilization vs Procurement Gap</Badge>
              <Badge>Asset Aging & Depreciation</Badge>
              <Badge>Capital Expenditure Forecast</Badge>

              <Button
                variant="outline"
                onClick={() => onNavigate("entity-executive-analytics")}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Open Analytics Dashboard
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function KpiCard({ title, value, icon: Icon }: any) {
  return (
    <Card>
      <CardContent className="pt-6 flex items-center space-x-4">
        <div className="w-10 h-10 bg-[#E8F0FF] rounded-lg flex items-center justify-center">
          <Icon className="h-5 w-5 text-[#0F67FF]" />
        </div>
        <div>
          <p className="text-gray-500">{title}</p>
          <p className="text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: any) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="text-gray-900">{value}</p>
    </div>
  );
}

function TransferRow({ asset, from, to, status }: any) {
  return (
    <div className="flex justify-between border p-3 rounded-lg">
      <div>
        <p className="text-gray-900">{asset}</p>
        <p className="text-gray-500">
          {from} → {to}
        </p>
      </div>
      <Badge variant="outline">{status}</Badge>
    </div>
  );
}

function AuditRow({ hospital, status }: any) {
  return (
    <div className="flex justify-between border p-3 rounded-lg">
      <p>{hospital}</p>
      <Badge variant="outline">{status}</Badge>
    </div>
  );
}