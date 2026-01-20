import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
    Search,
    Plus,
    Filter,
    Eye,
    CheckCircle,
    Clock,
    AlertCircle,
    Package,
    Wrench,
    ChevronDown
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { NotificationSystem } from '../NotificationSystem';

interface Asset {
    _id: string;
    assetName: string;
    assetCode: string;
    category: string;
    status: 'active' | 'not_in_use' | 'under_maintenance';
    utilizationStatus: string;
    lifecycleStatus: string;
    departmentId: string;
    currentDepartmentId: string;
    hospitalId: string;
    buildingId: string;
    floorId: string;
    vendor: string;
    assetType: string;
    purchaseCost: number;
    maintenanceCost: number;
    warrantyExpiring?: boolean;
    reservation?: {
        requestId: string;
        reservedByDepartmentId: string;
        reservedAt: string;
        isReserved: boolean;
    };
    maintenanceCount: number;
    barcode: string;
    createdAt: string;
}

interface Request {
    _id: string;
    requestType: string;
    assetName: string;
    assetCategory: string;
    requestedAssets: string[];
    requestedBy: {
        _id: string;
        name: string;
        role: string;
    };
    priority: 'low' | 'medium' | 'high' | 'urgent';
    justification: string;
    finalStatus: 'pending' | 'fulfilled' | 'rejected' | 'escalated';
    fulfillment: {
        fulfilledCount: number;
        fulfilledAssets: Array<{
            assetId: string;
            fromDepartmentId: string;
            fulfilledAt: string;
            fulfilledBy: string;
        }>;
    };
    createdAt: string;
    updatedAt: string;
    currentLevel: string;
    scope: {
        level: string;
        departmentId: any;
        hospitalId: string;
        organizationId: string;
    };
    escalation: {
        enabled: boolean;
        escalateAfterHours: number;
        lastActionAt: string;
    };
}

interface Department {
    _id?: string;
    id?: string;
    departmentId?: string;
    name: string;
    code: string;
    availableAssets: number;
}

interface Level1UserDashboardProps {
    onNavigate: (screen: string) => void;
    userName?: string;
    userDepartment?: string;
    userHospital?: string;
}

export function Level1UserDashboard({
    onNavigate,
    userName,
    userDepartment,
    userHospital
}: Level1UserDashboardProps) {
    // Get organization data from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const organizationName = userData.organizationId || 'Unknown Organization';
    
    const [assets, setAssets] = useState<Asset[]>([]);
    const [requests, setRequests] = useState<Request[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [departmentAssets, setDepartmentAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'assets' | 'requests' | 'history' | 'departments'>('assets');
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectRemarks, setRejectRemarks] = useState('');
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

    // Fetch departments with available assets
    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            console.log('Fetching departments from: http://localhost:5001/api/requests/departments-with-assets');
            const response = await fetch('http://localhost:5001/api/requests/departments-with-assets', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (response.ok) {
                const data = await response.json();
                console.log('Departments data received:', data);
                console.log('Departments array:', data.data);
                console.log('First department object:', data.data?.[0]);
                console.log('First department keys:', data.data?.[0] ? Object.keys(data.data[0]) : 'No departments');
                
                if (data.data && data.data.length > 0) {
                    // Check if departments have _id field, if not, use a different field
                    const departmentsWithIds = data.data.map((dept: any) => ({
                        ...dept,
                        _id: dept._id || dept.id || dept.departmentId || `dept-${dept.code}`
                    }));
                    console.log('Departments with IDs:', departmentsWithIds);
                    setDepartments(departmentsWithIds);
                } else {
                    setDepartments([]);
                }
            } else {
                const errorText = await response.text();
                console.log('Error response:', errorText);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch department ideal assets
    const fetchDepartmentAssets = async (departmentId: string) => {
        console.log('fetchDepartmentAssets called with:', departmentId);
        console.log('departmentId type:', typeof departmentId);
        
        if (!departmentId) {
            console.error('departmentId is undefined or null');
            return;
        }
        
        try {
            const token = localStorage.getItem('accessToken');
            const url = `http://localhost:5001/api/requests/departments/${departmentId}/assets`;
            console.log(`Fetching assets for department ${departmentId} from: ${url}`);
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Department assets response status:', response.status);
            console.log('Department assets response ok:', response.ok);

            if (response.ok) {
                const data = await response.json();
                console.log('Department assets data received:', data);
                console.log('Department assets array:', data.data);
                setDepartmentAssets(data.data || []);
            } else {
                const errorText = await response.text();
                console.log('Error response:', errorText);
            }
        } catch (error) {
            console.error('Error fetching department assets:', error);
        }
    };

    // Handle department selection
    const handleDepartmentClick = (department: Department) => {
        console.log('Department clicked:', department);
        console.log('Department keys:', Object.keys(department));
        console.log('Department ID:', department._id);
        console.log('Department id:', department.id);
        console.log('Department departmentId:', department.departmentId);
        console.log('Full department object:', JSON.stringify(department, null, 2));
        console.log('Department ID type:', typeof department._id);
        
        // Try different possible ID fields
        const deptId = department._id || department.id || department.departmentId;
        console.log('Resolved department ID:', deptId);
        
        if (!deptId) {
            console.error('Department ID is undefined or null');
            return;
        }
        
        setSelectedDepartment(department);
        fetchDepartmentAssets(deptId.toString());
    };

    // Handle specific asset request
    const requestSpecificAsset = async (asset: Asset) => {
        // Check if asset belongs to user's own department
        if (selectedDepartment && (
            selectedDepartment.departmentId === userDepartment || 
            selectedDepartment._id === userDepartment ||
            selectedDepartment.name === userDepartment ||
            selectedDepartment.code === userDepartment
        )) {
            alert('You cannot request assets from your own department. Please select a different department.');
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:5001/api/requests/specific-assets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    requestType: 'asset_transfer',
                    assetCategory: asset.category,
                    assetName: asset.assetName,
                    requestedAssets: [asset._id],
                    justification: 'Direct asset request from department view',
                    priority: 'medium'
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Specific asset request created:', data);
                setSuccessMessage('Asset request created successfully!');
                setShowSuccessDialog(true);
                // Refresh assets to update reservation status
                if (selectedDepartment && selectedDepartment._id) {
                    fetchDepartmentAssets(selectedDepartment._id.toString());
                }
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to create asset request');
            }
        } catch (error) {
            console.error('Error creating specific asset request:', error);
            alert('Failed to create asset request');
        }
    };

    // Handle back to departments
    const handleBackToDepartments = () => {
        setSelectedDepartment(null);
        setDepartmentAssets([]);
    };

    // Fetch department assets
    const fetchAssets = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            console.log('Fetching assets from: http://localhost:5001/api/requests/assets/department');
            const response = await fetch('http://localhost:5001/api/requests/assets/department', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (response.ok) {
                const data = await response.json();
                console.log('Assets data received:', data);
                console.log('Assets array:', data.data);
                setAssets(data.data || []);
            } else {
                const errorText = await response.text();
                console.log('Error response:', errorText);
            }
        } catch (error) {
            console.error('Error fetching assets:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch user requests
    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            console.log('Fetching open requests from: http://localhost:5001/api/requests/open');
            const response = await fetch('http://localhost:5001/api/requests/open', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Requests response status:', response.status);
            console.log('Requests response ok:', response.ok);

            if (response.ok) {
                const data = await response.json();
                console.log('Requests data received:', data);
                console.log('Requests array:', data.data);
                console.log('Requests count:', data.data?.length || 0);
                
                if (data.data && data.data.length > 0) {
                    console.log('First request object:', data.data[0]);
                    console.log('First request keys:', Object.keys(data.data[0]));
                }
                
                setRequests(data.data || []);
            } else {
                const errorText = await response.text();
                console.log('Requests error response:', errorText);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    };

    const fulfillRequest = async (requestId: string, assetIds: string[]) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:5001/api/requests/${requestId}/fulfill`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ assetIds })
            });

            if (response.ok) {
                // Refresh requests and assets
                fetchRequests();
                fetchAssets();
                setSuccessMessage('Request fulfilled successfully!');
                setShowSuccessDialog(true);
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to fulfill request');
            }
        } catch (error) {
            console.error('Error fulfilling request:', error);
            alert('Failed to fulfill request');
        }
    };

    const rejectRequest = async (requestId: string, assetIds: string[], remarks?: string) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:5001/api/requests/${requestId}/reject-assets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    assetIds,
                    remarks: remarks || 'Assets rejected by approver'
                })
            });

            if (response.ok) {
                const result = await response.json();
                // Refresh requests
                fetchRequests();
                setSuccessMessage(`Successfully rejected ${result.rejectedAssets} asset(s)!`);
                setShowSuccessDialog(true);
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to reject request');
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
            alert('Failed to reject request');
        }
    };

    const updateAssetStatus = async (assetId: string, utilizationStatus: string) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:5001/api/requests/assets/${assetId}/utilization`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ utilizationStatus })
            });

            if (response.ok) {
                // Refresh assets
                fetchAssets();
                setSuccessMessage('Asset status updated successfully!');
                setShowSuccessDialog(true);
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to update asset status');
            }
        } catch (error) {
            console.error('Error updating asset status:', error);
            alert('Failed to update asset status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'in_use': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'not_in_use': return 'bg-green-100 text-green-800 border-green-200';
            case 'under_maintenance': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'in_use':
                return <Package className="h-4 w-4" />;
            case 'not_in_use':
                return <CheckCircle className="h-4 w-4" />;
            case 'under_maintenance':
                return <Wrench className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'low': return 'bg-gray-100 text-gray-800';
            case 'medium': return 'bg-blue-100 text-blue-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'urgent': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Get department name from ID
    const getDepartmentName = (deptId: string) => {
        const dept = departments.find(d => d.departmentId === deptId || d._id === deptId);
        return dept?.name || 'Unknown Department';
    };

    const getDepartmentCode = (deptId: string) => {
        const dept = departments.find(d => d.departmentId === deptId || d._id === deptId);
        return dept?.code || 'Unknown';
    };

    // Separate departments into user's department and other departments
    const userDepartments = departments.filter(dept => 
        dept.name?.toLowerCase().trim() === userDepartment?.toLowerCase().trim() || 
        dept.code?.toLowerCase().trim() === userDepartment?.toLowerCase().trim() ||
        dept.departmentId?.toLowerCase().trim() === userDepartment?.toLowerCase().trim() ||
        dept._id?.toLowerCase().trim() === userDepartment?.toLowerCase().trim()
    );
    const otherDepartments = departments.filter(dept => 
        dept.name?.toLowerCase().trim() !== userDepartment?.toLowerCase().trim() && 
        dept.code?.toLowerCase().trim() !== userDepartment?.toLowerCase().trim() &&
        dept.departmentId?.toLowerCase().trim() !== userDepartment?.toLowerCase().trim() &&
        dept._id?.toLowerCase().trim() !== userDepartment?.toLowerCase().trim()
    );

    const filteredAssets = assets.filter(asset =>
        asset.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.assetCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingRequests = requests.filter(req =>
        req.finalStatus === 'pending' || req.finalStatus === 'escalated'
    );

    useEffect(() => {
        if (activeTab === 'departments' && !selectedDepartment) {
            fetchDepartments();
        } else if (activeTab === 'assets') {
            fetchAssets();
        }
        fetchRequests();
    }, [activeTab, selectedDepartment]);

    return (
        <>
            <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Department Asset Dashboard</h1>
                    <p className="text-gray-600">
                        {userDepartment ? getDepartmentName(userDepartment) : 'Unknown Department'} • {userHospital || 'Unknown Hospital'}
                        {userDepartment && (
                            <span className="ml-2 text-sm text-blue-600">
                                ({getDepartmentCode(userDepartment)})
                            </span>
                        )}
                        {organizationName && (
                            <span className="ml-2 text-sm text-green-600">
                                • {organizationName}
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <NotificationSystem userName={userName} userDepartment={userDepartment} />
                    <Button
                    onClick={() => {
                        // Check if currently viewing user's own department
                        if (selectedDepartment && (
                            selectedDepartment.departmentId === userDepartment || 
                            selectedDepartment._id === userDepartment ||
                            selectedDepartment.name === userDepartment ||
                            selectedDepartment.code === userDepartment
                        )) {
                            alert('You cannot create requests for your own department. Please select a different department to request assets from.');
                            return;
                        }
                        onNavigate('create-request');
                    }}
                    className="bg-[#0F67FF] hover:bg-[#0E5FE6]"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Request
                </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                    onClick={() => setActiveTab('departments')}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'departments'
                            ? 'bg-white text-[#0F67FF] shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Departments ({departments.length})
                </button>
                <button
                    onClick={() => setActiveTab('assets')}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'assets'
                            ? 'bg-white text-[#0F67FF] shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Assets ({filteredAssets.length})
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'requests'
                            ? 'bg-white text-[#0F67FF] shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Open Requests ({pendingRequests.length})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'history'
                            ? 'bg-white text-[#0F67FF] shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Request History
                </button>
            </div>

            {/* Search Bar */}
            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search assets by name or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                </Button>
            </div>

            {/* Departments Tab */}
            {activeTab === 'departments' && !selectedDepartment && (
                <>
                    {/* Your Department Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-gray-900">Your Department</h3>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {userDepartment}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            This is your own department. You can view assets but cannot request from your own department.
                        </p>
                        {userDepartments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {userDepartments.map((department) => (
                                    <Card 
                                        key={department._id} 
                                        className="cursor-pointer hover:shadow-lg transition-shadow border-green-200"
                                        onClick={() => handleDepartmentClick(department)}
                                    >
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between">
                                                <span>{department.name}</span>
                                                <Badge className="bg-green-100 text-green-800">
                                                    {department.availableAssets} Assets
                                                </Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Department Code:</span>
                                                    <span className="font-medium">{department.code}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Available Assets:</span>
                                                    <span className="font-medium text-green-600">{department.availableAssets}</span>
                                                </div>
                                                <div className="pt-2">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        className="w-full border-green-200 text-green-700 hover:bg-green-50"
                                                        onClick={(e: React.MouseEvent) => {
                                                            e.stopPropagation();
                                                            handleDepartmentClick(department);
                                                        }}
                                                    >
                                                        View Assets
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <p className="text-gray-600">No department data found for your department.</p>
                            </div>
                        )}
                    </div>

                    {/* Other Departments Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-gray-900">Other Departments</h3>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Requestable
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            You can request assets from these departments. Click on any department to view and request their available assets.
                        </p>
                        {otherDepartments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {otherDepartments.map((department) => (
                                    <Card 
                                        key={department._id} 
                                        className="cursor-pointer hover:shadow-lg transition-shadow"
                                        onClick={() => handleDepartmentClick(department)}
                                    >
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between">
                                                <span>{department.name}</span>
                                                <Badge className="bg-[#0F67FF] text-white">
                                                    {department.availableAssets} Assets
                                                </Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Department Code:</span>
                                                    <span className="font-medium">{department.code}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Available Assets:</span>
                                                    <span className="font-medium text-green-600">{department.availableAssets}</span>
                                                </div>
                                                <div className="pt-2">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={(e: React.MouseEvent) => {
                                                            e.stopPropagation();
                                                            handleDepartmentClick(department);
                                                        }}
                                                    >
                                                        View & Request Assets
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <p className="text-gray-600">No other departments available for requests.</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Department Assets View */}
            {activeTab === 'departments' && selectedDepartment && (
                <>
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button 
                                variant="outline" 
                                onClick={handleBackToDepartments}
                            >
                                ← Back to Departments
                            </Button>
                            <div>
                                <h2 className="text-xl font-semibold">{selectedDepartment.name}</h2>
                                <p className="text-gray-600">{selectedDepartment.code} • {departmentAssets.length} Ideal Assets</p>
                                {(selectedDepartment.name === userDepartment || selectedDepartment.code === userDepartment) && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mt-1">
                                        Your Department
                                    </Badge>
                                )}
                            </div>
                        </div>
                        {/* Show request button only for other departments */}
                        {(selectedDepartment.name !== userDepartment && selectedDepartment.code !== userDepartment) && (
                            <Button 
                                onClick={() => onNavigate('create-request')}
                                className="bg-[#0F67FF] hover:bg-[#0E5FE6]"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Specific Request
                            </Button>
                        )}
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {(selectedDepartment.name === userDepartment || selectedDepartment.code === userDepartment) 
                                    ? "Your Department Assets" 
                                    : "Available Assets for Request"
                                }
                            </CardTitle>
                            {(selectedDepartment.name === userDepartment || selectedDepartment.code === userDepartment) && (
                                <p className="text-sm text-gray-600">
                                    You can view these assets but cannot request from your own department.
                                </p>
                            )}
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F67FF]" />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-3 font-medium">Asset Name</th>
                                                <th className="text-left p-3 font-medium">Asset Code</th>
                                                <th className="text-left p-3 font-medium">Barcode</th>
                                                <th className="text-left p-3 font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {departmentAssets.map((asset) => (
                                                <tr key={asset._id} className="border-b hover:bg-gray-50">
                                                    <td className="p-3 font-medium">{asset.assetName}</td>
                                                    <td className="p-3">{asset.assetCode}</td>
                                                    <td className="p-3">{asset.barcode}</td>
                                                    <td className="p-3">
                                                        {(selectedDepartment.name === userDepartment || selectedDepartment.code === userDepartment) ? (
                                                            <Button 
                                                                size="sm"
                                                                variant="outline"
                                                                disabled
                                                                className="cursor-not-allowed opacity-50"
                                                                title="You cannot request from your own department"
                                                            >
                                                                View Only
                                                            </Button>
                                                        ) : (
                                                            <Button 
                                                                size="sm"
                                                                onClick={() => requestSpecificAsset(asset)}
                                                            >
                                                                Request This Asset
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Assets Tab */}
            {activeTab === 'assets' && (
                <>
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800 font-medium">Debug: Assets Tab Active</p>
                        <p>Assets count: {assets.length}</p>
                        <p>Loading: {loading ? 'Yes' : 'No'}</p>
                    </div>
                    <Card>
                    <CardHeader>
                        <CardTitle>Department Assets</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F67FF]" />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-3 font-medium">Asset Name</th>
                                            <th className="text-left p-3 font-medium">Category</th>
                                            <th className="text-left p-3 font-medium">Status</th>
                                            <th className="text-left p-3 font-medium">Reservation</th>
                                            <th className="text-left p-3 font-medium">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredAssets.map(asset => (
                                            <tr key={asset._id} className="border-b hover:bg-gray-50">
                                                <td className="p-3 font-medium">{asset.assetName}</td>
                                                <td className="p-3">{asset.category}</td>

                                                <td className="p-3">
                                                    <Badge className={`${getStatusColor(asset.utilizationStatus)} border`}>
                                                        <div className="flex items-center gap-1">
                                                            {getStatusIcon(asset.utilizationStatus)}
                                                            <span className="capitalize">
                                                                {asset.utilizationStatus.replace("_", " ")}
                                                            </span>
                                                        </div>
                                                    </Badge>
                                                </td>

                                                <td className="p-3">
                                                    {asset.reservation?.isReserved ? (
                                                        <Badge variant="outline">Reserved</Badge>
                                                    ) : (
                                                        <span className="text-gray-500">Available</span>
                                                    )}
                                                </td>

                                                <td className="p-3">
                                                    <div className="flex gap-2">
                                                        <Select onValueChange={(value) => updateAssetStatus(asset._id, value)}>
                                                            <SelectTrigger className="w-32">
                                                                <SelectValue placeholder="Mark Status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="in_use">In Use</SelectItem>
                                                                <SelectItem value="not_in_use">Not In Use</SelectItem>
                                                                <SelectItem value="under_maintenance">Under Maintenance</SelectItem>
                                                            </SelectContent>
                                                        </Select>

                                                        {asset.reservation?.isReserved && (
                                                            <Button size="sm">
                                                                Fulfill Request
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
                </>
            )}


            {/* Open Requests Tab */}
            {activeTab === 'requests' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Open Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3 font-medium">Request ID</th>
                                        <th className="text-left p-3 font-medium">Assets</th>
                                        <th className="text-left p-3 font-medium">Priority</th>
                                        <th className="text-left p-3 font-medium">Fulfillment</th>
                                        <th className="text-left p-3 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingRequests.map((request) => (
                                        <tr key={request._id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 font-medium">{request._id}</td>
                                            <td className="p-3">
                                                <div className="space-y-1">
                                                    <div className="text-sm font-medium">{request.assetName}</div>
                                                    <div className="text-xs text-gray-500">{request.assetCategory}</div>
                                                    <div className="text-xs text-gray-500">{request.requestedAssets?.length || 0} asset(s) requested</div>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <Badge className={getPriorityColor(request.priority)}>
                                                    {request.priority.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm">
                                                    {request.fulfillment?.fulfilledCount || 0} / {request.requestedAssets?.length || 0}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => fulfillRequest(request._id, request.requestedAssets || [])}
                                                        disabled={(request.fulfillment?.fulfilledCount || 0) > 0}
                                                    >
                                                        Fulfill
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => {
                                                            setSelectedRequestId(request._id);
                                                            setSelectedAssetIds(request.requestedAssets || []);
                                                            setShowRejectDialog(true);
                                                        }}
                                                        disabled={(request.fulfillment?.fulfilledCount || 0) > 0}
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Request History Tab */}
            {activeTab === 'history' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Request History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-gray-500">
                            Request history will be displayed here
                        </div>
                    </CardContent>
                </Card>
            )}
            </div>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Success
                    </DialogTitle>
                    <DialogDescription>
                        {successMessage}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end mt-4">
                    <Button onClick={() => setShowSuccessDialog(false)}>
                        OK
                    </Button>
                </div>
            </DialogContent>
        </Dialog>

        {/* Rejection Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        Reject Assets
                    </DialogTitle>
                    <DialogDescription>
                        Please provide a reason for rejecting these assets.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Remarks</label>
                        <textarea
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md resize-none"
                            rows={3}
                            placeholder="Enter reason for rejection..."
                            value={rejectRemarks}
                            onChange={(e) => setRejectRemarks(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setShowRejectDialog(false);
                            setRejectRemarks('');
                            setSelectedRequestId(null);
                            setSelectedAssetIds([]);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            if (selectedRequestId && selectedAssetIds.length > 0) {
                                rejectRequest(selectedRequestId, selectedAssetIds, rejectRemarks);
                                setShowRejectDialog(false);
                                setRejectRemarks('');
                                setSelectedRequestId(null);
                                setSelectedAssetIds([]);
                            }
                        }}
                    >
                        Reject Assets
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    </>
    );
}
