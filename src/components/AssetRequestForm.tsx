import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { ArrowLeft, Plus, Search, Package } from 'lucide-react';

interface Asset {
  _id: string;
  assetId: string;
  name: string;
  category: string;
  status: string;
  department: string;
}

interface Department {
  _id: string;
  name: string;
  departmentId: string;
}

interface AssetRequestFormProps {
  onNavigate: (screen: string) => void;
  userDepartment?: string;
  userHospital?: string;
}

export function AssetRequestForm({ 
  onNavigate, 
  userDepartment = "Department",
  userHospital = "Hospital"
}: AssetRequestFormProps) {
  const [requestMode, setRequestMode] = useState<'count' | 'specific'>('count');
  const [formData, setFormData] = useState({
    assetCategory: '',
    assetName: '',
    quantity: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    justification: '',
    selectedAssets: [] as string[]
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch departments and assets
  useEffect(() => {
    fetchDepartmentsWithAssets();
    fetchAvailableAssets();
  }, []);

  const fetchDepartmentsWithAssets = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/departments-with-assets`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchAvailableAssets = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/departments-with-assets`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Extract assets from departments data
        const allAssets = data.data?.flatMap((dept: any) => dept.assets || []) || [];
        setAvailableAssets(allAssets);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      
      let requestData;
      let endpoint;

      if (requestMode === 'count') {
        // Count-based request
        requestData = {
          requestType: 'asset_transfer',
          assetCategory: formData.assetCategory,
          assetName: formData.assetName,
          requestedCount: formData.quantity,
          priority: formData.priority,
          justification: formData.justification,
          department: userDepartment
        };
        endpoint = `${import.meta.env.VITE_API_URL}/api/requests`;
      } else {
        // Specific asset request
        requestData = {
          requestType: 'asset_transfer',
          assetCategory: formData.assetCategory,
          assetName: formData.assetName,
          requestedAssets: formData.selectedAssets,
          justification: formData.justification,
          priority: formData.priority,
          department: userDepartment
        };
        endpoint = `${import.meta.env.VITE_API_URL}/api/requests/specific-assets`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        onNavigate('dashboard'); // Go back to dashboard
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create request');
      }
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = availableAssets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAssetSelection = (assetId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAssets: prev.selectedAssets.includes(assetId)
        ? prev.selectedAssets.filter(id => id !== assetId)
        : [...prev.selectedAssets, assetId]
    }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Asset Request</h1>
            <p className="text-gray-600">{userDepartment} • {userHospital}</p>
          </div>
        </div>
      </div>

      {/* Request Mode Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Request Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button
              variant={requestMode === 'count' ? 'default' : 'outline'}
              onClick={() => setRequestMode('count')}
              className="flex-1"
            >
              <Package className="h-4 w-4 mr-2" />
              Count-Based Request
            </Button>
            <Button
              variant={requestMode === 'specific' ? 'default' : 'outline'}
              onClick={() => setRequestMode('specific')}
              className="flex-1"
            >
              <Search className="h-4 w-4 mr-2" />
              Specific Asset Request
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Request Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {requestMode === 'count' ? (
          // Count-Based Request Form
          <Card>
            <CardHeader>
              <CardTitle>Count-Based Request</CardTitle>
              <p className="text-sm text-gray-600">
                Use when you don't know the exact asset details
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assetCategory">Asset Category *</Label>
                  <Select 
                    value={formData.assetCategory} 
                    // @ts-ignore
                    onValueChange={(value) => setFormData(prev => ({ ...prev, assetCategory: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="biomedical">Biomedical</SelectItem>
                      <SelectItem value="plant-machine">Plant & Machine</SelectItem>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="it">IT Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="assetName">Asset Name (Optional)</Label>
                  <Input
                    id="assetName"
                    value={formData.assetName}
                    onChange={(e) => setFormData(prev => ({ ...prev, assetName: e.target.value }))}
                    placeholder="e.g., Ventilator, ICU Bed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity Required *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="Enter quantity"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority *</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setFormData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="justification">Justification *</Label>
                <Textarea
                  id="justification"
                  value={formData.justification}
                  onChange={(e) => setFormData(prev => ({ ...prev, justification: e.target.value }))}
                  placeholder="Explain why you need these assets..."
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          // Specific Asset Request Form
          <Card>
            <CardHeader>
              <CardTitle>Specific Asset Request</CardTitle>
              <p className="text-sm text-gray-600">
                Browse and select specific assets from available inventory
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search assets by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Available Assets List */}
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                {filteredAssets.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No available assets found
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredAssets.map((asset) => (
                      <div 
                        key={asset._id}
                        className="p-3 hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                        onClick={() => toggleAssetSelection(asset._id)}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={formData.selectedAssets.includes(asset._id)}
                            onChange={() => {}}
                            className="rounded"
                          />
                          <div>
                            <div className="font-medium">{asset.name}</div>
                            <div className="text-sm text-gray-500">{asset.category} • {asset.department}</div>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {asset.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  Selected: {formData.selectedAssets.length} assets
                </p>
              </div>

              <div>
                <Label htmlFor="priority">Priority *</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="justification">Justification *</Label>
                <Textarea
                  id="justification"
                  value={formData.justification}
                  onChange={(e) => setFormData(prev => ({ ...prev, justification: e.target.value }))}
                  placeholder="Explain why you need these assets..."
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={loading || (requestMode === 'specific' && formData.selectedAssets.length === 0)}
            className="bg-[#0F67FF] hover:bg-[#0E5FE6]"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Submit Request
          </Button>
        </div>
      </form>
    </div>
  );
}
