import { useState, useRef, ChangeEvent, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
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
  Upload,
  QrCode,
  Eye,
  Edit,
  Trash2,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

/* ================= TYPES ================= */

interface ApiAsset {
  _id?: string;
  id?: number;
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
  id: number | string;
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
  const [selectedAssets, setSelectedAssets] = useState<(number | string)[]>([]);
  const [entityHospitals, setEntityHospitals] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAssets, setTotalAssets] = useState(0);
  const [pageSize] = useState(50); // Load 50 assets per page
  const fileInputRef = useRef<HTMLInputElement>(null);

  // View/Edit/Delete dialog states
  const [viewAsset, setViewAsset] = useState<Asset | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteAsset, setDeleteAsset] = useState<Asset | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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
        
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/hospitals?entityCode=${selectedEntity.code}`, {
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

  // Helper to convert MongoDB Decimal128 to string/number
  const convertDecimal128 = (value: any): string | null => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (value.$numberDecimal) return value.$numberDecimal;
    return null;
  };

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

      console.log('Fetching from:', `${import.meta.env.VITE_API_URL}/api/mongo/assets/paginated?${params}`);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/mongo/assets/paginated?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();

      console.log('API response:', json);

      if (json.success) {
        const mapped: Asset[] = json.data.map((a: any) => ({
          id: a._id || a.id || '',
          asset_id: a.asset || '',
          asset_description: a.asset_description || '',
          serial_number: a.barcode || a.sno || "",
          model_number: a.asset_key || a.asset || "",
          location: a.business_area || "",
          status: a.status || "Active",
          last_maintenance: a.dc_start || "",
          class: a.class || "",
          cost_centre: a.cost_centre || "",
          quantity: a.quantity || 1,
          bus_area: a.bus_A || null,
          amount: convertDecimal128(a.amount),
        }));

        console.log('Setting state - totalPages:', json.pagination.totalPages, 'totalAssets:', json.pagination.totalItems, 'currentPage:', page);
        setAssets(mapped);
        setTotalPages(json.pagination.totalPages);
        setTotalAssets(json.pagination.totalItems);
        setCurrentPage(page);
      } else {
        console.log('Using fallback endpoint');
        // Fallback to non-paginated endpoint if paginated endpoint doesn't exist
        const fallbackRes = await fetch(`${import.meta.env.VITE_API_URL}/api/mongo/assets/all`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const fallbackJson: ApiResponse = await fallbackRes.json();

        const mapped: Asset[] = fallbackJson.data.map((a) => ({
          id: a._id || a.id || '',
          asset_id: a.asset || '',
          asset_description: a.asset_description || '',
          serial_number: a.barcode || a.sno || "",
          model_number: a.asset_key || a.asset || "",
          location: a.business_area || "",
          status: a.status || "Active",
          last_maintenance: a.dc_start || "",
          class: a.class || "",
          cost_centre: a.cost_centre || "",
          quantity: a.quantity || 1,
          bus_area: a.bus_A || null,
          amount: convertDecimal128(a.amount),
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

  /* ================= VIEW / EDIT / DELETE HANDLERS ================= */

  const handleViewAsset = (asset: Asset) => {
    setViewAsset(asset);
    setIsViewOpen(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditAsset(asset);
    setIsEditOpen(true);
  };

  const handleDeleteAsset = (asset: Asset) => {
    setDeleteAsset(asset);
    setIsDeleteOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editAsset) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error("Authentication token missing. Please log in again.");
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/mongo/assets/update/${editAsset.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          asset_description: editAsset.asset_description,
          class: editAsset.class,
          cost_centre: editAsset.cost_centre,
          quantity: editAsset.quantity,
          amount: editAsset.amount,
          sno: editAsset.serial_number,
          status: editAsset.status
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.message || 'Update failed');
      }

      toast.success(`Asset ${editAsset.asset_id} updated successfully`);
      setIsEditOpen(false);
      setEditAsset(null);
      fetchAssets(currentPage); // Refresh the list
    } catch (err: any) {
      toast.error(`Failed to update asset: ${err.message}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteAsset) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error("Authentication token missing. Please log in again.");
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/mongo/assets/delete/${deleteAsset.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.message || 'Delete failed');
      }

      toast.success(`Asset ${deleteAsset.asset_id} deleted successfully`);
      setIsDeleteOpen(false);
      setDeleteAsset(null);
      fetchAssets(currentPage); // Refresh the list
    } catch (err: any) {
      toast.error(`Failed to delete asset: ${err.message}`);
    }
  };

  /* ================= BARCODE ================= */

  const generateBarcodeForAsset = async (assetKey: string) => {
    try {
      // Get authentication token from localStorage
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error("Authentication token missing. Please log in again.");
        return;
      }
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/barcode/${encodeURIComponent(assetKey)}`, {
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

    // Get selected asset objects and generate barcodes using asset_key (model_number)
    const selectedAssetObjects = assets.filter(a => selectedAssets.includes(a.id));
    for (const asset of selectedAssetObjects) {
      if (asset.model_number) {
        await generateBarcodeForAsset(asset.model_number);
      }
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
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/mongo/nbc/upload-excel`, {
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
      
      // Handle case when no assets were inserted
      if (result.inserted === 0) {
        if (result.errors && result.errors.length > 0) {
          // Show first few errors in the toast
          const errorSummary = result.errors.slice(0, 3).map((e: any) => `Row ${e.row}: ${e.error}`).join('\n');
          const moreErrors = result.errors.length > 3 ? `\n...and ${result.errors.length - 3} more errors` : '';
          toast.error(`No assets were uploaded. ${result.errors.length} rows failed:\n${errorSummary}${moreErrors}`, {
            duration: 8000
          });
          console.error('Upload errors:', result.errors);
        } else {
          toast.error('No assets were uploaded. Please check your CSV file format.', {
            duration: 5000
          });
        }
      } else if (result.errors && result.errors.length > 0) {
        toast.success(`Successfully uploaded ${result.inserted} assets to ${hospitalName}. ${result.errors.length} items had errors.`, {
          duration: 5000
        });
        // Reset and refresh
        setIsImportOpen(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchAssets(); // Refresh the assets list
      } else {
        toast.success(`Successfully uploaded ${result.inserted} assets to ${hospitalName}`, {
          duration: 3000
        });
        // Reset and refresh
        setIsImportOpen(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchAssets(); // Refresh the assets list
      }
      
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
      (a.asset_id?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (a.asset_description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
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
                          <li>• Required columns: asset, asset_description, depky (department code), block (building code)</li>
                          <li>• depky must match an existing department code in the system</li>
                          <li>• block must match an existing building code for the selected hospital</li>
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
                          <Badge 
                            variant="outline" 
                            className={
                              a.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' :
                              a.status === 'Under Maintenance' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              a.status === 'Retired' ? 'bg-red-100 text-red-800 border-red-200' :
                              'bg-gray-100 text-gray-800 border-gray-200'
                            }
                          >
                            {a.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateBarcodeForAsset(a.model_number)}
                            disabled={!a.model_number}
                          >
                            <QrCode className="h-4 w-4 mr-1" />
                            Generate
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleViewAsset(a)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEditAsset(a)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteAsset(a)}
                          >
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

      {/* ================= VIEW ASSET DIALOG ================= */}

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Asset Details</DialogTitle>
          </DialogHeader>
          {viewAsset && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Asset ID</Label>
                  <p className="font-medium">{viewAsset.asset_id}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <p className="font-medium">{viewAsset.status}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-500">Description</Label>
                  <p className="font-medium">{viewAsset.asset_description}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Class</Label>
                  <p className="font-medium">{viewAsset.class}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Cost Centre</Label>
                  <p className="font-medium">{viewAsset.cost_centre}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Quantity</Label>
                  <p className="font-medium">{viewAsset.quantity}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Amount</Label>
                  <p className="font-medium">{viewAsset.amount || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Asset Key</Label>
                  <p className="font-medium text-xs">{viewAsset.model_number}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Barcode</Label>
                  <p className="font-medium text-xs">{viewAsset.serial_number || '-'}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ================= EDIT ASSET DIALOG ================= */}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
          </DialogHeader>
          {editAsset && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-asset-id">Asset ID</Label>
                <Input id="edit-asset-id" value={editAsset.asset_id} disabled />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input 
                  id="edit-description" 
                  value={editAsset.asset_description}
                  onChange={(e) => setEditAsset({...editAsset, asset_description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-class">Class</Label>
                  <Input 
                    id="edit-class" 
                    value={editAsset.class}
                    onChange={(e) => setEditAsset({...editAsset, class: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-cost-centre">Cost Centre</Label>
                  <Input 
                    id="edit-cost-centre" 
                    value={editAsset.cost_centre}
                    onChange={(e) => setEditAsset({...editAsset, cost_centre: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-quantity">Quantity</Label>
                  <Input 
                    id="edit-quantity" 
                    type="number"
                    value={editAsset.quantity}
                    onChange={(e) => setEditAsset({...editAsset, quantity: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-amount">Amount</Label>
                  <Input 
                    id="edit-amount" 
                    type="number"
                    value={editAsset.amount || ''}
                    onChange={(e) => setEditAsset({...editAsset, amount: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-barcode">Barcode (S/N)</Label>
                <Input 
                  id="edit-barcode" 
                  value={editAsset.serial_number}
                  onChange={(e) => setEditAsset({...editAsset, serial_number: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={editAsset.status} 
                  onValueChange={(value: "Active" | "Under Maintenance" | "Retired") => setEditAsset({...editAsset, status: value})}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                    <SelectItem value="Retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} className="bg-[#0F67FF]">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ================= DELETE ASSET DIALOG ================= */}

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Asset</DialogTitle>
          </DialogHeader>
          {deleteAsset && (
            <div className="space-y-4">
              <p>Are you sure you want to delete this asset?</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Asset ID:</strong> {deleteAsset.asset_id}</p>
                <p><strong>Description:</strong> {deleteAsset.asset_description}</p>
              </div>
              <p className="text-red-600 text-sm">This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmDelete} variant="destructive">
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
