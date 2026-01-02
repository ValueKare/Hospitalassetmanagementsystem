import { useState, useRef, ChangeEvent, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// API Response Types
interface ApiAsset {
  id: number;
  asset: string;
  asset_description: string;
  barcode: string;
  asset_key: string;
  business_area: string;
  dc_start: string;
  class: string;
  cost_centre: string;
  quantity: number;
  status?: string;
  CoCd?: string;
  CostOrder?: string;
  amount?: string;
  asset_main_no_text?: string;
  bus_A?: string;
  depky?: string;
  description?: string;
  planned_dep?: string;
  sno?: string | null;
  use_percentage?: string;
  createdAt?: string;
}

interface ApiResponse {
  total: number;
  data: ApiAsset[];
}

// Frontend Asset Type - Consistent with API structure
interface Asset {
  // Required fields matching API
  id: number;
  asset_id: string; // maps to API 'asset'
  asset_description: string;
  serial_number: string; // maps to API 'barcode'
  model_number: string; // maps to API 'asset_key'
  location: string; // maps to API 'business_area'
  status: string;
  last_maintenance: string; // maps to API 'dc_start'
  class: string;
  cost_centre: string;
  quantity: number;
  
  // Optional fields matching API naming
  co_cd: string | null; // maps to API 'CoCd'
  cost_order: string | null; // maps to API 'CostOrder'
  amount: string | null;
  asset_main_no: string | null; // maps to API 'asset_main_no_text'
  bus_area: string | null; // maps to API 'bus_A'
  department_key: string | null; // maps to API 'depky'
  description: string | null;
  planned_depreciation: string | null; // maps to API 'planned_dep'
  serial_no: string | null; // maps to API 'sno'
  use_percentage: string | null;
  created_at: string | null; // maps to API 'createdAt'
}
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Search,
  Download,
  Upload,
  Plus,
  QrCode,
  Printer,
  Eye,
  Edit,
  Trash2,
  FileSpreadsheet,
  Package,
  Building2,
  Layers,
  DollarSign,
  Calendar,
  Pencil,
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface AdminAssetManagementProps {
  onNavigate: (screen: string) => void;
}

const mockAssets = [
  {
    id: 1,
    assetId: "AST-2024-001",
    name: "MRI Scanner",
    category: "Medical Equipment",
    entity: "City General Hospital",
    building: "Main Building",
    floor: "2nd Floor",
    department: "Radiology",
    costCenter: "CC-001",
    quantity: 1,
    make: "Siemens",
    model: "MAGNETOM Vida 3T",
    serialNo: "SN-2024-MRI-001",
    assetClass: "Class A",
    purchaseDate: "2024-01-15",
    cost: 2500000,
    status: "Active",
    hasBarcode: true,
  },
  {
    id: 2,
    assetId: "AST-2024-002",
    name: "CT Scanner",
    category: "Diagnostic Equipment",
    entity: "City General Hospital",
    building: "Main Building",
    floor: "2nd Floor",
    department: "Radiology",
    costCenter: "CC-001",
    quantity: 1,
    make: "GE Healthcare",
    model: "Revolution HD",
    serialNo: "SN-2024-CT-001",
    assetClass: "Class A",
    purchaseDate: "2024-02-20",
    cost: 1800000,
    status: "Under Maintenance",
    hasBarcode: true,
  },
  {
    id: 3,
    assetId: "AST-2024-003",
    name: "Ventilator",
    category: "Medical Equipment",
    entity: "City General Hospital",
    building: "Main Building",
    floor: "5th Floor",
    department: "ICU",
    costCenter: "CC-004",
    quantity: 10,
    make: "Dräger",
    model: "Evita V800",
    serialNo: "SN-2024-VENT-001",
    assetClass: "Class B",
    purchaseDate: "2024-03-10",
    cost: 850000,
    status: "Active",
    hasBarcode: false,
  },
];

export function AdminAssetManagement({ onNavigate }: AdminAssetManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEntity, setFilterEntity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isBarcodeDialogOpen, setIsBarcodeDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedAssets, setSelectedAssets] = useState<number[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

  // Fetch assets from API with proper typing
  const fetchAssets = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5001/api/sql/assets/all');
      if (!response.ok) {
        throw new Error(`Failed to fetch assets: ${response.status} ${response.statusText}`);
      }
      
      const responseData: ApiResponse = await response.json();
      console.log('API Response:', responseData);
      
      // Validate response structure
      if (!responseData.data || !Array.isArray(responseData.data)) {
        throw new Error('Invalid data format received from server: missing or invalid data array');
      }
      
      // Transform and validate each asset
      const formattedAssets = responseData.data
        .filter(asset => asset.asset && asset.asset_description) // Filter out invalid assets
        .map(asset => ({
          // Required fields with defaults
          id: asset.id,
          asset_id: asset.asset,
          asset_description: asset.asset_description,
          serial_number: asset.barcode || '',
          model_number: asset.asset_key || '',
          location: asset.business_area || 'Unknown',
          status: asset.status || 'Active',
          last_maintenance: asset.dc_start || '',
          class: asset.class || '',
          cost_centre: asset.cost_centre || '',
          quantity: asset.quantity || 1,
          
          // Optional fields with null defaults
          co_cd: asset.CoCd || null,
          cost_order: asset.CostOrder || null,
          amount: asset.amount || null,
          asset_main_no: asset.asset_main_no_text || null,
          bus_area: asset.bus_A || null,
          department_key: asset.depky || null,
          description: asset.description || null,
          planned_depreciation: asset.planned_dep || null,
          serial_no: asset.sno || null,
          use_percentage: asset.use_percentage || null,
          created_at: asset.createdAt || null
        } as Asset));
      
      console.log('Formatted Assets:', formattedAssets);
      setAssets(formattedAssets);
    } catch (err) {
      console.error('Error fetching assets:', err);
      setError('Failed to load assets. Please try again.');
      toast.error('Failed to load assets');
    } finally {
      setIsLoading(false);
    }
  };

  // Load assets on component mount
  useEffect(() => {
    fetchAssets();
  }, []);

  // Helper functions for API consistency
  const assetToApiFormat = (asset: Asset): Partial<ApiAsset> => {
    return {
      asset: asset.asset_id,
      asset_description: asset.asset_description,
      barcode: asset.serial_number,
      asset_key: asset.model_number,
      business_area: asset.location,
      status: asset.status,
      dc_start: asset.last_maintenance,
      class: asset.class,
      cost_centre: asset.cost_centre,
      quantity: asset.quantity,
      CoCd: asset.co_cd || undefined,
      CostOrder: asset.cost_order || undefined,
      amount: asset.amount || undefined,
      asset_main_no_text: asset.asset_main_no || undefined,
      bus_A: asset.bus_area || undefined,
      depky: asset.department_key || undefined,
      description: asset.description || undefined,
      planned_dep: asset.planned_depreciation || undefined,
      sno: asset.serial_no || undefined,
      use_percentage: asset.use_percentage || undefined,
    };
  };

  // Form interface for adding new assets
  interface AssetFormData {
    asset_id: string;
    asset_description: string;
    serial_number: string;
    model_number: string;
    location: string;
    status: string;
    last_maintenance: string;
    class: string;
    cost_centre: string;
    quantity: number;
    co_cd: string;
    cost_order: string;
    amount: string;
    asset_main_no: string;
    bus_area: string;
    department_key: string;
    description: string;
    planned_depreciation: string;
    serial_no: string;
    use_percentage: string;
  }

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new asset object from form data
    const newAsset: Asset = {
      id: 0, // Will be set by backend
      asset_id: '', // Will be populated from form
      asset_description: '',
      serial_number: '',
      model_number: '',
      location: '',
      status: 'Active',
      last_maintenance: '',
      class: '',
      cost_centre: '',
      quantity: 1,
      co_cd: null,
      cost_order: null,
      amount: null,
      asset_main_no: null,
      bus_area: null,
      department_key: null,
      description: null,
      planned_depreciation: null,
      serial_no: null,
      use_percentage: null,
      created_at: null,
    };

    try {
      const apiData = assetToApiFormat(newAsset);
      
      // TODO: Implement actual API call to create asset
      // const response = await fetch('http://localhost:5001/api/assets', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(apiData)
      // });
      
      toast.success("Asset added successfully!");
      setIsAddAssetOpen(false);
      await fetchAssets(); // Refresh the list
    } catch (error) {
      console.error('Error adding asset:', error);
      toast.error('Failed to add asset');
    }
  };

  const handleImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    
    try {
      const response = await fetch('http://localhost:5001/api/upload/universal', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success(`Successfully uploaded ${result.inserted} assets`, {
          description: result.errors ? `${result.errors.length} errors occurred` : '',
        });
        // Refresh the assets list after successful import
        await fetchAssets();
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setIsUploading(false);
      setIsImportOpen(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleGenerateBarcodes = () => {
    if (selectedAssets.length === 0) {
      toast.error("Please select assets to generate barcodes");
      return;
    }
    toast.success(`Generating barcodes for ${selectedAssets.length} assets`);
    setIsBarcodeDialogOpen(false);
    setSelectedAssets([]);
  };

  const handleExport = () => {
    // Export logic here
    toast.success("Exporting asset data...");
  };

  const toggleAssetSelection = (assetId: number) => {
    setSelectedAssets((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId]
    );
  };

  // Update the table body to use the API data
  const renderTableBody = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={11} className="text-center py-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={11} className="text-center py-8 text-red-500">
            {error}
          </TableCell>
        </TableRow>
      );
    }

    if (filteredAssets.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={11} className="text-center py-8 text-gray-500">
            No assets found
          </TableCell>
        </TableRow>
      );
    }

    return filteredAssets.map((asset) => (
      <TableRow key={asset.id}>
        <TableCell>
          <input
            type="checkbox"
            checked={selectedAssets.includes(asset.id)}
            onChange={() => toggleAssetSelection(asset.id)}
          />
        </TableCell>
        <TableCell>{asset.asset}</TableCell>
        <TableCell className="font-medium">{asset.asset_description}</TableCell>
        <TableCell>{asset.class}</TableCell>
        <TableCell>{asset.cost_centre}</TableCell>
        <TableCell>{asset.business_area}</TableCell>
        <TableCell>{asset.quantity}</TableCell>
        <TableCell>₹{parseFloat(asset.amount || '0').toLocaleString()}</TableCell>
        <TableCell>
          <Badge variant="outline">
            {asset.depky} ({asset.use_percentage}%)
          </Badge>
        </TableCell>
        <TableCell>{asset.barcode || 'N/A'}</TableCell>
        <TableCell>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "Under Maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>;
      case "Retired":
        return <Badge className="bg-gray-100 text-gray-800">Retired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.asset_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.asset_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEntity = filterEntity === "all" || asset.entity === filterEntity;
    const matchesStatus = filterStatus === "all" || asset.status === filterStatus;
    return matchesSearch && matchesEntity && matchesStatus;
  });

  return (
    <div className="flex-1 p-8 bg-[#F9FAFB] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Asset Management (Admin)</h1>
        <p className="text-gray-600">
          Add, import, and manage assets across all hospital entities
        </p>
      </div>

      <Tabs defaultValue="asset-list" className="space-y-6">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="asset-list">Asset List</TabsTrigger>
          <TabsTrigger value="add-asset">Add New Asset</TabsTrigger>
          <TabsTrigger value="barcode">Generate Barcode</TabsTrigger>
        </TabsList>

        {/* Asset List Tab */}
        <TabsContent value="asset-list" className="space-y-6">
          {/* Action Bar */}
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search assets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterEntity} onValueChange={setFilterEntity}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Entities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Entities</SelectItem>
                      <SelectItem value="City General Hospital">
                        City General Hospital
                      </SelectItem>
                      <SelectItem value="Metro Medical">Metro Medical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Under Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-3">
                  <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Import CSV
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Import Asset Data</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-gray-700 mb-2">
                            Download the CSV template first:
                          </p>
                          <Button variant="outline" size="sm">
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Download Template
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="csv-upload">Upload CSV File</Label>
                          <div className="space-y-2">
                            <input
                              type="file"
                              ref={fileInputRef}
                              accept=".csv,.xlsx,.xls"
                              className="hidden"
                              onChange={handleImport}
                              disabled={isUploading}
                              id="csv-upload"
                            />
                            <div 
                              onClick={() => fileInputRef.current?.click()}
                              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0F67FF] transition-colors cursor-pointer"
                            >
                              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                              <p className="text-gray-600">Click to upload asset data file</p>
                              <p className="text-gray-400 mt-1">CSV or Excel files (Max 10MB)</p>
                            </div>
                            {isUploading && (
                              <p className="text-sm text-blue-600">Uploading file, please wait...</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assets Table */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Assets ({filteredAssets.length})</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBarcodeDialogOpen(true)}
                  disabled={selectedAssets.length === 0}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate Barcodes ({selectedAssets.length})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          onChange={(e) =>
                            setSelectedAssets(
                              e.target.checked ? filteredAssets.map((a) => a.id) : []
                            )
                          }
                        />
                      </TableHead>
                      <TableHead>Asset ID</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Cost Centre</TableHead>
                      <TableHead>Business Area</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Depreciation</TableHead>
                      <TableHead>Barcode</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-8">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-8 text-red-500">
                          {error}
                        </TableCell>
                      </TableRow>
                    ) : assets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                          No assets found
                        </TableCell>
                      </TableRow>
                    ) : (
                      assets.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell className="font-medium">{asset.asset_id}</TableCell>
                          <TableCell>{asset.asset_description}</TableCell>
                          <TableCell>{asset.serial_number || '-'}</TableCell>
                          <TableCell>{asset.model_number || '-'}</TableCell>
                          <TableCell>{asset.location || '-'}</TableCell>
                          <TableCell>{asset.status ? getStatusBadge(asset.status) : '-'}</TableCell>
                          <TableCell>{asset.last_maintenance || '-'}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Edit</span>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add Asset Tab */}
        <TabsContent value="add-asset" className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Add New Asset</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddAsset} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Entity *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select entity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="city-general">
                          City General Hospital
                        </SelectItem>
                        <SelectItem value="metro">Metro Medical Center</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Department *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="radiology">Radiology</SelectItem>
                        <SelectItem value="icu">ICU</SelectItem>
                        <SelectItem value="surgery">Surgery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Cost Centre *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cost centre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cc-001">CC-001</SelectItem>
                        <SelectItem value="cc-002">CC-002</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Building *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select building" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Main Building</SelectItem>
                        <SelectItem value="emergency">Emergency Wing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Floor *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select floor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ground">Ground Floor</SelectItem>
                        <SelectItem value="1st">1st Floor</SelectItem>
                        <SelectItem value="2nd">2nd Floor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Asset Category *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medical">Medical Equipment</SelectItem>
                        <SelectItem value="diagnostic">Diagnostic Equipment</SelectItem>
                        <SelectItem value="surgical">Surgical Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Asset Name *</Label>
                    <Input placeholder="e.g., MRI Scanner" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Asset Number</Label>
                    <Input placeholder="Auto-generated if blank" />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input type="number" placeholder="1" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Make</Label>
                    <Input placeholder="e.g., Siemens" />
                  </div>
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Input placeholder="e.g., MAGNETOM Vida 3T" />
                  </div>
                  <div className="space-y-2">
                    <Label>Serial Number</Label>
                    <Input placeholder="e.g., SN-2024-001" />
                  </div>
                  <div className="space-y-2">
                    <Label>Asset Class *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="class-a">Class A</SelectItem>
                        <SelectItem value="class-b">Class B</SelectItem>
                        <SelectItem value="class-c">Class C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Purchase Cost (₹)</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Purchase Date</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Asset description and additional details..." rows={3} />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Asset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Barcode Generation Tab */}
        <TabsContent value="barcode" className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Generate Barcodes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-gray-700">
                    Filter assets by entity, building, floor, department, or cost centre to
                    generate barcodes for multiple assets at once.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Entity</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select entity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Entities</SelectItem>
                        <SelectItem value="city-general">
                          City General Hospital
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Building</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select building" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Buildings</SelectItem>
                        <SelectItem value="main">Main Building</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Floor</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select floor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Floors</SelectItem>
                        <SelectItem value="2nd">2nd Floor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="radiology">Radiology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Cost Centre</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cost centre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cost Centres</SelectItem>
                        <SelectItem value="cc-001">CC-001</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    onClick={() => {
                      toast.success("Generating barcodes for filtered assets...");
                    }}
                    className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate Barcodes
                  </Button>
                  <Button variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    Print Preview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Barcode Generation Dialog */}
      <Dialog open={isBarcodeDialogOpen} onOpenChange={setIsBarcodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Barcodes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-gray-700">
              Generate barcodes for {selectedAssets.length} selected asset(s)?
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsBarcodeDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]"
                onClick={handleGenerateBarcodes}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Generate & Print
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
