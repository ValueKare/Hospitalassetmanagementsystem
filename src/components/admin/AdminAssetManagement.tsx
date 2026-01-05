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

export function AdminAssetManagement({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isBarcodeDialogOpen, setIsBarcodeDialogOpen] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ================= FETCH ASSETS ================= */

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:5001/api/sql/assets/all");
      const json: ApiResponse = await res.json();

      const mapped: Asset[] = json.data.map((a) => ({
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

      setAssets(mapped);
    } catch (err) {
      toast.error("Failed to load assets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  /* ================= BARCODE ================= */

  const generateBarcodeForAsset = async (assetId: number) => {
    try {
      const res = await fetch(`http://localhost:5001/api/barcode/${assetId}`);
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

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("http://localhost:5001/api/upload/universal", {
        method: "POST",
        body: form,
      });
      const result = await res.json();
      toast.success(`Uploaded ${result.inserted} assets`);
      fetchAssets();
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsImportOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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

  /* ================= UI ================= */

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen">
      <h1 className="text-gray-900 mb-2">Asset Management (Admin)</h1>
      <p className="text-gray-600 mb-6">Industry-agnostic asset control & barcode management</p>

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
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Import Asset Data</DialogTitle>
                    </DialogHeader>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx"
                      onChange={handleImport}
                    />
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