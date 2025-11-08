import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download, FileText, Calendar, TrendingUp, DollarSign } from "lucide-react";

interface ReportsProps {
  onNavigate: (screen: string) => void;
}

const utilizationData = [
  { month: "Apr", utilization: 78 },
  { month: "May", utilization: 82 },
  { month: "Jun", utilization: 85 },
  { month: "Jul", utilization: 81 },
  { month: "Aug", utilization: 86 },
  { month: "Sep", utilization: 83 },
];

const costTrendData = [
  { month: "Apr", procurement: 45000, maintenance: 12000, total: 57000 },
  { month: "May", procurement: 52000, maintenance: 15000, total: 67000 },
  { month: "Jun", procurement: 48000, maintenance: 11000, total: 59000 },
  { month: "Jul", procurement: 61000, maintenance: 18000, total: 79000 },
  { month: "Aug", procurement: 55000, maintenance: 14000, total: 69000 },
  { month: "Sep", procurement: 67000, maintenance: 19000, total: 86000 },
];

const downtimeData = [
  { department: "Radiology", hours: 24 },
  { department: "ICU", hours: 12 },
  { department: "Surgery", hours: 18 },
  { department: "Laboratory", hours: 8 },
  { department: "Emergency", hours: 6 },
];

const assetStatusData = [
  { name: "Active", value: 1280, color: "#10B981" },
  { name: "Maintenance", value: 47, color: "#F59E0B" },
  { name: "Calibration Due", value: 30, color: "#EF4444" },
  { name: "Retired", value: 23, color: "#6B7280" },
];

export function Reports({ onNavigate }: ReportsProps) {
  const [reportType, setReportType] = useState("utilization");
  const [dateFrom, setDateFrom] = useState("2024-04-01");
  const [dateTo, setDateTo] = useState("2024-09-30");
  const [department, setDepartment] = useState("all");

  const handleExport = (format: string) => {
    console.log(`Exporting report as ${format}`);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-500">Generate comprehensive reports and analyze trends</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => handleExport("excel")}>
                <Download className="h-5 w-5 mr-2" />
                Export Excel
              </Button>
              <Button variant="outline" onClick={() => handleExport("pdf")}>
                <Download className="h-5 w-5 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utilization">Asset Utilization</SelectItem>
                    <SelectItem value="cost">Cost Analysis</SelectItem>
                    <SelectItem value="downtime">Downtime Analysis</SelectItem>
                    <SelectItem value="status">Asset Status Overview</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="radiology">Radiology</SelectItem>
                    <SelectItem value="icu">ICU</SelectItem>
                    <SelectItem value="surgery">Surgery</SelectItem>
                    <SelectItem value="laboratory">Laboratory</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateFrom">Date From</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo">Date To</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Avg. Utilization</p>
                  <h2 className="mt-2 text-gray-900">83%</h2>
                  <p className="text-green-600 mt-1">
                    <TrendingUp className="inline h-4 w-4 mr-1" />
                    +5% vs last period
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Total Cost</p>
                  <h2 className="mt-2 text-gray-900">$416K</h2>
                  <p className="text-gray-600 mt-1">6-month period</p>
                </div>
                <div className="w-12 h-12 bg-[#E8F0FF] rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-[#0F67FF]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Total Downtime</p>
                  <h2 className="mt-2 text-gray-900">68 hrs</h2>
                  <p className="text-orange-600 mt-1">Across all departments</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Reports Generated</p>
                  <h2 className="mt-2 text-gray-900">247</h2>
                  <p className="text-gray-600 mt-1">This quarter</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Based on Report Type */}
        {reportType === "utilization" && (
          <div className="grid grid-cols-1 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Asset Utilization Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={utilizationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="utilization"
                      stroke="#0F67FF"
                      strokeWidth={3}
                      name="Utilization %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {reportType === "cost" && (
          <div className="grid grid-cols-1 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Cost Trends Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={costTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="procurement" fill="#0F67FF" name="Procurement Cost" />
                    <Bar dataKey="maintenance" fill="#10B981" name="Maintenance Cost" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Monthly Total Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={costTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      name="Total Cost"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {reportType === "downtime" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Downtime by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={downtimeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" stroke="#6B7280" />
                    <YAxis dataKey="department" type="category" stroke="#6B7280" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hours" fill="#EF4444" name="Downtime Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Downtime Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {downtimeData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="text-gray-900">{item.department}</p>
                        <p className="text-gray-500">Department downtime</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-900">{item.hours} hours</p>
                        <p className="text-gray-500">{((item.hours / 68) * 100).toFixed(1)}% of total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {reportType === "status" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Asset Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={assetStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {assetStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assetStatusData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <div>
                          <p className="text-gray-900">{item.name}</p>
                          <p className="text-gray-500">Asset status</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-900">{item.value}</p>
                        <p className="text-gray-500">
                          {((item.value / assetStatusData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Report Summary */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Report Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none text-gray-700">
              <p>
                This report covers the period from <strong>{dateFrom}</strong> to <strong>{dateTo}</strong>
                {department !== "all" && ` for the ${department} department`}.
              </p>
              <h4 className="text-gray-900 mt-4">Key Findings:</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>Overall asset utilization maintained at 83%, showing consistent performance</li>
                <li>Total expenditure of $416,000 with procurement representing 68% of costs</li>
                <li>Radiology department experienced highest downtime (24 hours) due to MRI maintenance</li>
                <li>92.7% of assets are in active status, indicating good asset health</li>
                <li>30 assets require calibration, representing 2.2% of total inventory</li>
              </ul>
              <h4 className="text-gray-900 mt-4">Recommendations:</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>Schedule preventive maintenance for calibration-due assets to avoid compliance issues</li>
                <li>Review procurement strategy to optimize costs in high-spend departments</li>
                <li>Implement predictive maintenance for critical assets to reduce downtime</li>
                <li>Consider asset replacement for retired equipment to improve efficiency</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
