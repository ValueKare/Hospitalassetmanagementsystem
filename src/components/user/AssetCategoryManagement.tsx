import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Tags, Plus, Edit2, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

interface AssetCategoryManagementProps {
  onNavigate: (screen: string) => void;
}

const mockCategories = [
  { id: 1, name: "Medical Equipment", code: "MED", description: "All medical devices and equipment", assetCount: 450, subcategories: 8 },
  { id: 2, name: "Furniture", code: "FUR", description: "Hospital furniture and fixtures", assetCount: 280, subcategories: 5 },
  { id: 3, name: "IT Equipment", code: "IT", description: "Computers, servers, and IT infrastructure", assetCount: 320, subcategories: 6 },
  { id: 4, name: "Lab Equipment", code: "LAB", description: "Laboratory instruments and tools", assetCount: 195, subcategories: 4 },
  { id: 5, name: "Surgical Instruments", code: "SURG", description: "Surgical tools and instruments", assetCount: 567, subcategories: 12 },
];

export function AssetCategoryManagement({ onNavigate }: AssetCategoryManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  const filteredCategories = mockCategories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = () => {
    toast.success("Category added successfully!");
    setIsAddCategoryOpen(false);
  };

  return (
    <div className="flex-1 p-8 bg-[#F9FAFB] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Asset Category Management</h1>
        <p className="text-gray-600">Manage asset categories for your department</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-600">Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">18</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-600">Active Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#0EB57D]">16</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-600">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#0F67FF]">1,812</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-600">Subcategories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">35</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-gray-900">Asset Categories</CardTitle>
              <CardDescription>Organize and manage your asset taxonomy</CardDescription>
            </div>
            <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                  <DialogDescription>Create a new asset category</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="category-name">Category Name</Label>
                    <Input id="category-name" placeholder="e.g., Medical Equipment" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-code">Category Code</Label>
                    <Input id="category-code" placeholder="e.g., MED" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" placeholder="Brief description of the category" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddCategory} className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]">
                    Add Category
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Categories Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Assets</TableHead>
                  <TableHead>Subcategories</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tags className="h-4 w-4 text-[#0F67FF]" />
                        {category.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-[#E8F0FF] text-[#0F67FF] border-[#0F67FF]/20">
                        {category.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 max-w-xs truncate">{category.description}</TableCell>
                    <TableCell>{category.assetCount}</TableCell>
                    <TableCell>{category.subcategories}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900">Top Categories by Asset Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockCategories.slice(0, 5).map((category, index) => (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#E8F0FF] rounded-full flex items-center justify-center">
                      <span className="text-[#0F67FF]">{index + 1}</span>
                    </div>
                    <span className="text-gray-900">{category.name}</span>
                  </div>
                  <span className="text-gray-600">{category.assetCount} assets</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-600">
              <p>• Category "Surgical Instruments" updated - 2 hours ago</p>
              <p>• New subcategory added to "IT Equipment" - 1 day ago</p>
              <p>• Category "Lab Equipment" assets count updated - 2 days ago</p>
              <p>• "Medical Equipment" description modified - 3 days ago</p>
              <p>• New category "Diagnostic Tools" created - 5 days ago</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
