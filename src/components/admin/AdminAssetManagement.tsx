import { useState, useRef, ChangeEvent, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
  Pencil,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

/* ================= TYPES ================= */

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
  bus_A?: string;
  amount?: string;
}

interface ApiResponse {
  total: number;
  data: ApiAsset[];
}

interface Asset {
  id: number;
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
  bus_area: string | null;
  amount: string | null;
}

/* ================= COMPONENT ================= */

export function AdminAssetManagement({ onNavigate, selectedEntity }: { onNavigate: (screen: string) => void; selectedEntity?: any }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isBarcodeDialogOpen, setIsBarcodeDialogOpen] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<number[]>([]);
  const [entityHospitals, setEntityHospitals] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAssets, setTotalAssets] = useState(0);
  const [pageSize] = useState(50); // Load 50 assets per page
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ================= FETCH ENTITIES ================= */

  const fetchEntityHospitals = async () => {
    try {
      // Use selectedEntity prop instead of localStorage
      if (selectedEntity && selectedEntity.code) {
        console.log('Fetching hospitals for entity:', selectedEntity.code);
        
        // Get authentication token from localStorage
        const token = localStorage.getItem('accessToken');
        if (!token) {
          toast.error("Authentication token missing. Please log in again.");
          return;
        }
        
        const res = await fetch(`${API_BASE_URL}/api/dashboard/hospitals?entityCode=${selectedEntity.code}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const json = await res.json();
        console.log('Entity hospitals response:', json);
        if (json.success && json.hospitals) {
          setEntityHospitals(json.hospitals);
          // Auto-select first hospital if none selected
          if (json.hospitals.length > 0 && !selectedHospital) {
            setSelectedHospital(json.hospitals[0]);
          }
        }
      } else {
        console.log('No selected entity available');
      }
    } catch (err) {
      console.error('Failed to load entity hospitals:', err);
      toast.error("Failed to load entity hospitals");
    }
  };

  const handleHospitalChange = (hospitalId: string) => {
    const hospital = entityHospitals.find(h => (h.hospitalId || h._id) === hospitalId);
    if (hospital) {
      setSelectedHospital(hospital);
    }
  };

  /* ================= FETCH ASSETS ================= */

  const fetchAssets = async (page: number = 1) => {
    try {
      setIsLoading(true);
      console.log('fetchAssets called with page:', page);
      
      // Get authentication token from localStorage
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error("Authentication token missing. Please log in again.");
        return;
      }
      
      // Build query parameters for pagination, search, and filters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        search: searchQuery,
        status: filterStatus === 'all' ? '' : filterStatus
      });

      console.log('Fetching from:', `${API_BASE_URL}/api/sql/assets/paginated?${params}`);
      const res = await fetch(`${API_BASE_URL}/api/sql/assets/paginated?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();

      console.log('API response:', json);

      if (json.success) {
        const mapped: Asset[] = json.data.map((a: any) => ({
          id: a.id,
          asset_id: a.asset,
          asset_description: a.asset_description,
          serial_number: a.barcode || "",
          model_number: a.asset_key || "",
          location: a.business_area || "",
          status: a.status || "Active",
          last_maintenance: a.dc_start || "",
          class: a.class || "",
          cost_centre: a.cost_centre || "",
          quantity: a.quantity || 1,
          bus_area: a.bus_A || null,
          amount: a.amount || null,
        }));

        console.log('Setting state - totalPages:', json.pagination.totalPages, 'totalAssets:', json.pagination.totalItems, 'currentPage:', page);
        setAssets(mapped);
        setTotalPages(json.pagination.totalPages);
        setTotalAssets(json.pagination.totalItems);
        setCurrentPage(page);
      } else {
        console.log('Using fallback endpoint');
        // Fallback to non-paginated endpoint if paginated endpoint doesn't exist
        const fallbackRes = await fetch(`${API_BASE_URL}/api/sql/assets/all`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const fallbackJson: ApiResponse = await fallbackRes.json();

        const mapped: Asset[] = fallbackJson.data.map((a) => ({
          id: a.id,
          asset_id: a.asset,
          asset_description: a.asset_description,
          serial_number: a.barcode || "",
          model_number: a.asset_key || "",
          location: a.business_area || "",
          status: a.status || "Active",
          last_maintenance: a.dc_start || "",
          class: a.class || "",
          cost_centre: a.cost_centre || "",
          quantity: a.quantity || 1,
          bus_area: a.bus_A || null,
          amount: a.amount || null,
        }));

        // Client-side pagination for fallback
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedAssets = mapped.slice(startIndex, endIndex);
        
        const calculatedTotalPages = Math.ceil(mapped.length / pageSize);
        console.log('Fallback - totalPages:', calculatedTotalPages, 'totalAssets:', mapped.length, 'currentPage:', page);
        
        setAssets(paginatedAssets);
        setTotalPages(calculatedTotalPages);
        setTotalAssets(mapped.length);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error("Failed to load assets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
    fetchEntityHospitals();
  }, []);

  // Refetch hospitals when selectedEntity changes
  useEffect(() => {
    fetchEntityHospitals();
  }, [selectedEntity]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
      fetchAssets(1);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, filterStatus]); // Include filterStatus in dependencies

  // Page change effect
  const handlePageChange = (page: number) => {
    console.log('handlePageChange called with:', page, 'totalPages:', totalPages);
    if (page >= 1 && page <= totalPages) {
      fetchAssets(page);
    } else {
      console.log('Page change blocked - invalid page number');
    }
  };

  /* ================= BARCODE ================= */

  const generateBarcodeForAsset = async (assetId: number) => {
    try {
      // Get authentication token from localStorage
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error("Authentication token missing. Please log in again.");
        return;
      }
      
      const res = await fetch(`${API_BASE_URL}/api/barcode/${assetId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Barcode failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      toast.error("Barcode generation failed");
    }
  };

  const handleGenerateBarcodes = async () => {
    if (selectedAssets.length === 0) {
      toast.error("Select at least one asset");
      return;
    }

    for (const id of selectedAssets) {
      await generateBarcodeForAsset(id);
    }

    setSelectedAssets([]);
    setIsBarcodeDialogOpen(false);
  };

  /* ================= IMPORT ================= */

  const handleImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate hospital selection
    if (!selectedHospital) {
      toast.error("Please select a hospital before importing assets");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    // Validate file type
    const allowedTypes = ['.csv', '.xlsx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      toast.error("Only CSV and Excel files are allowed");
      return;
    }

    const form = new FormData();
    form.append("file", file);
    
    // Add hospitalCode with proper validation
    const hospitalCode = selectedHospital.hospitalId || selectedHospital._id;
    if (hospitalCode) {
      form.append("hospitalCode", hospitalCode);
      console.log('Uploading assets to hospital:', selectedHospital.name, 'Code:', hospitalCode);
    } else {
      toast.error("Invalid hospital selection");
      return;
    }

    try {
      // Get authentication token from localStorage first
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error("Authentication token missing. Please log in again.");
        return;
      }
      
      const loadingToast = toast.loading(`Uploading ${file.name} to ${selectedHospital.name}...`);
      
      const res = await fetch(`${API_BASE_URL}/api/upload/universal`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: form,
      });
      
      const result = await res.json();
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (!res.ok) {
        throw new Error(result.message || 'Upload failed');
      }

      // Show detailed success message
      const hospitalName = selectedHospital.name;
      if (result.errors && result.errors.length > 0) {
        toast.success(`Successfully uploaded ${result.inserted} assets to ${hospitalName}. ${result.errors.length} items had errors.`, {
          duration: 5000
        });
      } else {
        toast.success(`Successfully uploaded ${result.inserted} assets to ${hospitalName}`, {
          duration: 3000
        });
      }
      
      // Reset and refresh
      setIsImportOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchAssets(); // Refresh the assets list
      
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.message || "Upload failed. Please try again.", {
        duration: 5000
      });
    }
  };

  /* ================= FILTER ================= */

  const filteredAssets = assets.filter((a) => {
    const matchSearch =
      a.asset_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.asset_description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Note: With server-side pagination, filtering is done on the server
  // This client-side filtering is only for the current page data

  /* ================= UI ================= */

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen">
      <h1 className="text-gray-900 mb-2">Asset Management (Admin)</h1>
      <p className="text-gray-600 mb-6">Industry-agnostic asset control & barcode management</p>

      {/* Hospital Selection */}
      {entityHospitals.length > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="hospital-select">Select Hospital:</Label>
                <Select
                  value={selectedHospital?.hospitalId || selectedHospital?._id || ''}
                  onValueChange={handleHospitalChange}
                  disabled={entityHospitals.length === 0}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select a hospital">
                      {selectedHospital ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-[#0F67FF]" />
                          <span className="truncate">{selectedHospital.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">Select hospital</span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {entityHospitals.map((hospital) => (
                      <SelectItem key={hospital.hospitalId || hospital._id} value={hospital.hospitalId || hospital._id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <div className="flex-1">
                            <div className="font-medium">{hospital.name}</div>
                            <div className="text-sm text-gray-500">{hospital.location}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="assets">
        <TabsList>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="barcode">Barcode & Labels</TabsTrigger>
        </TabsList>

        {/* ================= ASSET LIST ================= */}

        <TabsContent value="assets">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 mb-4">
                <Input
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Under Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
                <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Import CSV
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Import Asset Data</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Hospital Selection Display */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-900">Target Hospital</span>
                        </div>
                        {selectedHospital ? (
                          <div>
                            <p className="font-semibold text-blue-900">{selectedHospital.name}</p>
                            <p className="text-sm text-blue-700">{selectedHospital.location}</p>
                            <p className="text-xs text-blue-600 mt-1">
                              Hospital ID: {selectedHospital.hospitalId || selectedHospital._id}
                            </p>
                          </div>
                        ) : (
                          <p className="text-amber-600 text-sm">
                            ⚠️ No hospital selected. Please select a hospital first.
                          </p>
                        )}
                      </div>

                      {/* File Upload */}
                      <div className="space-y-2">
                        <Label htmlFor="file-upload" className="text-sm font-medium">
                          Choose File (.csv or .xlsx)
                        </Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                          <input
                            ref={fileInputRef}
                            id="file-upload"
                            type="file"
                            accept=".csv,.xlsx"
                            onChange={handleImport}
                            className="hidden"
                          />
                          <label 
                            htmlFor="file-upload" 
                            className="cursor-pointer flex flex-col items-center gap-2"
                          >
                            <Upload className="h-8 w-8 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Click to upload or drag and drop
                            </span>
                            <span className="text-xs text-gray-500">
                              CSV or Excel files only
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 font-medium mb-2">📋 Import Instructions:</p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li>• Ensure CSV has required columns: asset, asset_description, etc.</li>
                          <li>• Maximum file size: 10MB</li>
                          <li>• Assets will be assigned to selected hospital</li>
                          <li>• Duplicate assets will be skipped</li>
                        </ul>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 pt-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsImportOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={!selectedHospital}
                          className="bg-[#0F67FF]"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Select File
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead />
                    <TableHead>Asset ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Cost Centre</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8}>Loading…</TableCell>
                    </TableRow>
                  ) : (
                    filteredAssets.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedAssets.includes(a.id)}
                            onChange={() =>
                              setSelectedAssets((p) =>
                                p.includes(a.id)
                                  ? p.filter((x) => x !== a.id)
                                  : [...p, a.id]
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>{a.asset_id}</TableCell>
                        <TableCell>{a.asset_description}</TableCell>
                        <TableCell>{a.class}</TableCell>
                        <TableCell>{a.cost_centre}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{a.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateBarcodeForAsset(a.id)}
                          >
                            <QrCode className="h-4 w-4 mr-1" />
                            Generate
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalAssets)} of {totalAssets} assets
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= BARCODE ================= */}

        <TabsContent value="barcode">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Barcode Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                disabled={selectedAssets.length === 0}
                onClick={() => setIsBarcodeDialogOpen(true)}
                className="bg-[#0F67FF]"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Generate Barcodes ({selectedAssets.length})
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ================= CONFIRM DIALOG ================= */}

      <Dialog open={isBarcodeDialogOpen} onOpenChange={setIsBarcodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Barcodes</DialogTitle>
          </DialogHeader>
          <p>Generate barcode PDFs for selected assets?</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsBarcodeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateBarcodes} className="bg-[#0F67FF]">
              Generate
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
