import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Building2, Plus, Edit2, Trash2, MapPin, Layers, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface EntitySetupProps {
  onNavigate: (screen: string) => void;
}

// Entity creation interface
interface EntityFormData {
  name: string;
  code: string;
  state: string;
  city: string;
  address: string;
  meta?: {
    contactPerson?: string;
    email?: string;
    phone?: string;
    totalBuildings?: number;
    totalAssets?: number;
  };
}

// Entity creation response interface
interface CreateEntityResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    name: string;
    code: string;
    state: string;
    city: string;
    address: string;
    meta?: {
      contactPerson?: string;
      email?: string;
      phone?: string;
      totalBuildings?: number;
      totalAssets?: number;
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

// Hospital creation interface
interface HospitalFormData {
  name: string;
  entityCode: string;
  location: string;
  contactEmail: string;
  phone: string;
}

// API response interface
interface CreateHospitalResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    name: string;
    entityId: string;
    location: string;
    contactEmail: string;
    phone: string;
    createdAt: string;
  };
}

// Hospital data interface from API
interface HospitalData {
  hospitalName: string;
  code: string;
  location: string;
  buildings: number;
  totalAssets: number;
  _id: string | number;
  hospitalId: string;
}

// Backend API response interface
interface BackendHospitalResponse {
  _id: string;
  hospitalId: string;
  name: string;
  entityId: string;
  location: string;
  contactEmail: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  buildingsCount: number;
  totalAssets: number;
}

// GET hospitals response interface
interface GetHospitalsResponse {
  success: boolean;
  data: BackendHospitalResponse[];
}

// Hospital update interface
interface UpdateHospitalData {
  name?: string;
  location?: string;
  contactEmail?: string;
  phone?: string;
}

// Update hospital response interface
interface UpdateHospitalResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    name: string;
    location: string;
    contactEmail: string;
    phone: string;
    hospitalId: string;
    createdAt: string;
    updatedAt: string;
  };
}

const mockHospitals = [
  { id: 1, name: "City General Hospital", code: "CGH-001", location: "New York, NY", buildings: 5, totalAssets: 12450 },
  { id: 2, name: "Metro Medical Center", code: "MMC-002", location: "Los Angeles, CA", buildings: 3, totalAssets: 9800 },
  { id: 3, name: "Regional Health Center", code: "RHC-003", location: "Chicago, IL", buildings: 6, totalAssets: 15600 },
  { id: 4, name: "Community Hospital", code: "CH-004", location: "Houston, TX", buildings: 2, totalAssets: 7560 },
];

const mockBuildings = [
  { id: 1, name: "Main Building", hospital: "City General Hospital", floors: 8, departments: 12 },
  { id: 2, name: "Emergency Wing", hospital: "City General Hospital", floors: 3, departments: 5 },
  { id: 3, name: "Research Center", hospital: "Metro Medical Center", floors: 5, departments: 8 },
];

const mockDepartments = [
  { id: 1, name: "Cardiology", building: "Main Building", floor: "3rd Floor", costCenter: "CC-001", assets: 245 },
  { id: 2, name: "Emergency", building: "Emergency Wing", floor: "Ground Floor", costCenter: "CC-002", assets: 156 },
  { id: 3, name: "Radiology", building: "Main Building", floor: "2nd Floor", costCenter: "CC-003", assets: 189 },
  { id: 4, name: "ICU", building: "Main Building", floor: "5th Floor", costCenter: "CC-004", assets: 312 },
];

export function EntitySetup({ onNavigate }: EntitySetupProps) {
  const [isAddHospitalOpen, setIsAddHospitalOpen] = useState(false);
  const [isAddBuildingOpen, setIsAddBuildingOpen] = useState(false);
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);
  const [isCreatingHospital, setIsCreatingHospital] = useState(false);
  const [hospitalForm, setHospitalForm] = useState<HospitalFormData>({
    name: "",
    entityCode: "",
    location: "",
    contactEmail: "",
    phone: ""
  });
  const [hospitals, setHospitals] = useState<HospitalData[]>([]);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(true);
  const [hospitalsError, setHospitalsError] = useState<string | null>(null);
  const [isEditHospitalOpen, setIsEditHospitalOpen] = useState(false);
  const [isUpdatingHospital, setIsUpdatingHospital] = useState(false);
  const [editingHospital, setEditingHospital] = useState<HospitalData | null>(null);
  const [editForm, setEditForm] = useState<UpdateHospitalData>({
    name: "",
    location: "",
    contactEmail: "",
    phone: ""
  });

  // Entity creation states
  const [isAddEntityOpen, setIsAddEntityOpen] = useState(false);
  const [isCreatingEntity, setIsCreatingEntity] = useState(false);
  const [entityForm, setEntityForm] = useState<EntityFormData>({
    name: "",
    code: "",
    state: "",
    city: "",
    address: "",
    meta: {
      contactPerson: "",
      email: "",
      phone: "",
      totalBuildings: 0,
      totalAssets: 0
    }
  });
  const [entities, setEntities] = useState<any[]>([]);
  const [isLoadingEntities, setIsLoadingEntities] = useState(true);
  const [entitiesError, setEntitiesError] = useState<string | null>(null);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('accessToken');
  };

  // Fetch entities from API
  const fetchEntities = async () => {
    setIsLoadingEntities(true);
    setEntitiesError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://65.0.100.196:5001/api/entity', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch entities: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Entities API response:', result);
      console.log('result.success value:', result.success);
      console.log('result.success type:', typeof result.success);

      // Handle missing success field - assume success if entities array exists
      const isSuccess = result.success === true || result.success === 'true' || Array.isArray(result.entities);
      console.log('isSuccess calculated:', isSuccess);

      if (!isSuccess) {
        console.log('API returned success=false, throwing error');
        throw new Error(result.message || 'Failed to fetch entities');
      }

      console.log('Setting entities from:', result.entities);
      setEntities(result.entities || result.data || []);
      console.log('Entities set successfully');
    } catch (error) {
      console.error('Error fetching entities:', error);
      setEntitiesError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoadingEntities(false);
    }
  };

  // Handle entity form changes
  const handleEntityFormChange = (field: keyof EntityFormData, value: string | number) => {
    setEntityForm(prev => {
      if (field.startsWith('meta.')) {
        const metaField = field.replace('meta.', '') as keyof Exclude<EntityFormData['meta'], keyof EntityFormData>;
        return {
          ...prev,
          meta: {
            ...prev.meta,
            [metaField]: value
          }
        };
      } else {
        return {
          ...prev,
          [field]: value
        };
      }
    });
  };

  // Handle entity creation
  const handleCreateEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingEntity(true);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://65.0.100.196:5001/api/entity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(entityForm)
      });

      if (!response.ok) {
        throw new Error(`Failed to create entity: ${response.status} ${response.statusText}`);
      }

      const result: CreateEntityResponse = await response.json();
      console.log('Create Entity API response:', result);

      // Handle different response structures
      const isSuccess = result.success === true || result.entity || result.message;
      console.log('Create entity isSuccess:', isSuccess);

      if (!isSuccess) {
        throw new Error(result.message || 'Failed to create entity');
      }

      // Reset form and close dialog
      setEntityForm({
        name: "",
        code: "",
        state: "",
        city: "",
        address: "",
        meta: {
          contactPerson: "",
          email: "",
          phone: "",
          totalBuildings: 0,
          totalAssets: 0
        }
      });
      setIsAddEntityOpen(false);

      toast.success("Entity created successfully!", {
        description: `${result.data.name} (${result.data.code}) has been added to the system`
      });

      // Refresh entities list
      fetchEntities();
    } catch (error) {
      console.error('Error creating entity:', error);
      toast.error('Failed to create entity', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setIsCreatingEntity(false);
    }
  };

  // Fetch hospitals from API
  const fetchHospitals = async () => {
    setIsLoadingHospitals(true);
    setHospitalsError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://65.0.100.196:5001/api/hospital', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });


      if (!response.ok) {
        throw new Error(`Failed to fetch hospitals: ${response.status} ${response.statusText}`);
      }

      const result: GetHospitalsResponse = await response.json();
      console.log('GET request response:', result);

      if (!result.success) {
        throw new Error('Failed to load hospitals');
      }

      // Map backend response to frontend interface
      const mappedHospitals: HospitalData[] = result.data.map((hospital: BackendHospitalResponse) => ({
        hospitalName: hospital.name,
        code: hospital.hospitalId,
        location: hospital.location,
        buildings: hospital.buildingsCount,
        totalAssets: hospital.totalAssets,
        _id: hospital._id,
        hospitalId: hospital.hospitalId
      }));

      setHospitals(mappedHospitals);
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      setHospitalsError(err instanceof Error ? err.message : 'Failed to load hospitals');
      toast.error('Failed to load hospitals', {
        description: err instanceof Error ? err.message : 'An unknown error occurred'
      });
    } finally {
      setIsLoadingHospitals(false);
    }
  };

  // Load hospitals and entities on component mount
  useEffect(() => {
    fetchHospitals();
    fetchEntities();
  }, []);

  // Handle hospital creation
  const handleCreateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingHospital(true);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://65.0.100.196:5001/api/hospital', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(hospitalForm)
      });

      if (!response.ok) {
        throw new Error(`Failed to create hospital: ${response.status} ${response.statusText}`);
      }

      const result: CreateHospitalResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to create hospital');
      }

      // Reset form and close dialog
      setHospitalForm({
        name: "",
        entityCode: "",
        location: "",
        contactEmail: "",
        phone: ""
      });
      setIsAddHospitalOpen(false);

      toast.success("Hospital created successfully!", {
        description: `${result.data.name} has been added to the system`
      });

      // Refresh hospitals list
      fetchHospitals();
    } catch (error) {
      console.error('Error creating hospital:', error);
      toast.error('Failed to create hospital', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setIsCreatingHospital(false);
    }
  };

  // Handle form input changes
  const handleHospitalFormChange = (field: keyof HospitalFormData, value: string) => {
    setHospitalForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle edit form input changes
  const handleEditFormChange = (field: keyof UpdateHospitalData, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle hospital update
  const handleUpdateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHospital || !editingHospital._id) {
      console.error('Invalid hospital data for editing:', editingHospital);
      toast.error('Invalid hospital data');
      return;
    }

    setIsUpdatingHospital(true);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://65.0.100.196:5001/api/entity/api/hospital/${editingHospital._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      console.log('PUT request URL:', `http://65.0.100.196:5001/api/entity/api/hospital/${editingHospital._id}`);
      console.log('PUT request body:', editForm);
      console.log('editingHospital._id type:', typeof editingHospital._id, editingHospital._id);

      if (!response.ok) {
        throw new Error(`Failed to update hospital: ${response.status} ${response.statusText}`);
      }

      const result: UpdateHospitalResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to update hospital');
      }

      // Close dialog and reset form
      setIsEditHospitalOpen(false);
      setEditingHospital(null);
      setEditForm({
        name: "",
        location: "",
        contactEmail: "",
        phone: ""
      });

      toast.success("Hospital updated successfully!", {
        description: `${result.data.name} has been updated`
      });

      // Refresh hospitals list
      fetchHospitals();
    } catch (error) {
      console.error('Error updating hospital:', error);
      toast.error('Failed to update hospital', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setIsUpdatingHospital(false);
    }
  };

  // Open edit dialog with hospital data
  const handleEditHospital = (hospital: HospitalData) => {
    console.log('Editing hospital data:', hospital); // Debug log
    setEditingHospital(hospital);
    setEditForm({
      name: hospital.hospitalName,
      location: hospital.location,
      contactEmail: "", // This would need to be fetched from a detailed API
      phone: ""
    });
    setIsEditHospitalOpen(true);
  };

  return (
    <div className="flex-1 p-8 bg-[#F9FAFB] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Entity Setup</h1>
        <p className="text-gray-600">Manage hospitals, buildings, floors, and organizational structure</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="hospitals" className="space-y-6">
        <TabsList className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto">
          <TabsTrigger value="entities">Entities</TabsTrigger>
          <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
          <TabsTrigger value="buildings">Buildings</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="cost-centers">Cost Centers</TabsTrigger>
        </TabsList>


        {/* Entities Tab */}
        <TabsContent value="entities">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-900">Entity Management</CardTitle>
                  <CardDescription>Create and manage entities</CardDescription>
                </div>
                <Dialog open={isAddEntityOpen} onOpenChange={setIsAddEntityOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Entity
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Entity</DialogTitle>
                      <DialogDescription>Set up a new entity with hospitals and facilities</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateEntity} className="space-y-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="entity-name">Entity Name</Label>
                          <Input
                            id="entity-name"
                            placeholder="Enter entity name"
                            value={entityForm.name}
                            onChange={(e) => handleEntityFormChange('name', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="entity-code">Entity Code</Label>
                          <Input
                            id="entity-code"
                            placeholder="Enter entity code"
                            value={entityForm.code}
                            onChange={(e) => handleEntityFormChange('code', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="entity-state">State</Label>
                          <Input
                            id="entity-state"
                            placeholder="Enter state"
                            value={entityForm.state}
                            onChange={(e) => handleEntityFormChange('state', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="entity-city">City</Label>
                          <Input
                            id="entity-city"
                            placeholder="Enter city"
                            value={entityForm.city}
                            onChange={(e) => handleEntityFormChange('city', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="entity-address">Address</Label>
                        <Input
                          id="entity-address"
                          placeholder="Enter full address"
                          value={entityForm.address}
                          onChange={(e) => handleEntityFormChange('address', e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contact-person">Contact Person</Label>
                          <Input
                            id="contact-person"
                            placeholder="Enter contact person name"
                            value={entityForm.meta?.contactPerson || ''}
                            onChange={(e) => handleEntityFormChange('meta', {
                              ...entityForm.meta,
                              contactPerson: e.target.value
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-email">Contact Email</Label>
                          <Input
                            id="contact-email"
                            type="email"
                            placeholder="Enter contact email"
                            value={entityForm.meta?.email || ''}
                            onChange={(e) => handleEntityFormChange('meta', {
                              ...entityForm.meta,
                              email: e.target.value
                            })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contact-phone">Contact Phone</Label>
                          <Input
                            id="contact-phone"
                            placeholder="Enter contact phone"
                            value={entityForm.meta?.phone || ''}
                            onChange={(e) => handleEntityFormChange('meta', {
                              ...entityForm.meta,
                              phone: e.target.value
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="total-buildings">Total Buildings</Label>
                          <Input
                            id="total-buildings"
                            type="number"
                            placeholder="Enter total buildings"
                            value={entityForm.meta?.totalBuildings || 0}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              handleEntityFormChange('meta', {
                                ...entityForm.meta,
                                totalBuildings: value
                              });
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="total-assets">Total Assets</Label>
                          <Input
                            id="total-assets"
                            type="number"
                            placeholder="Enter total assets"
                            value={entityForm.meta?.totalAssets || 0}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              handleEntityFormChange('meta', {
                                ...entityForm.meta,
                                totalAssets: value
                              });
                            }}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddEntityOpen(false)}
                          disabled={isCreatingEntity}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]"
                          disabled={isCreatingEntity}
                        >
                          {isCreatingEntity ? "Creating..." : "Create Entity"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Buildings</TableHead>
                    <TableHead>Assets</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingEntities ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-gray-500">Loading entities...</div>
                      </TableCell>
                    </TableRow>
                  ) : entitiesError ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-red-500">Error: {entitiesError}</div>
                      </TableCell>
                    </TableRow>
                  ) : entities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-gray-500">No entities found</div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    entities.map((entity, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-[#10B981]" />
                            {entity.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-[#E8F0FF] text-[#0F67FF]">
                            {entity.code}
                          </Badge>
                        </TableCell>
                        <TableCell>{entity.state}</TableCell>
                        <TableCell>{entity.city}</TableCell>
                        <TableCell>{entity.address}</TableCell>
                        <TableCell>{entity.meta?.totalBuildings || 0}</TableCell>
                        <TableCell>{entity.meta?.totalAssets || 0}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hospitals Tab */}
        <TabsContent value="hospitals">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-900">Hospital Entities</CardTitle>
                  <CardDescription>Manage hospital organizations</CardDescription>
                </div>
                <Dialog open={isAddHospitalOpen} onOpenChange={setIsAddHospitalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Hospital
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Hospital</DialogTitle>
                      <DialogDescription>Register a new hospital entity in the system</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateHospital} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="hospital-name">Hospital Name</Label>
                        <Input
                          id="hospital-name"
                          placeholder="Enter hospital name"
                          value={hospitalForm.name}
                          onChange={(e) => handleHospitalFormChange('name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="entity-code">Entity Code</Label>
                        <Input
                          id="entity-code"
                          placeholder="Enter entity code"
                          value={hospitalForm.entityCode}
                          onChange={(e) => handleHospitalFormChange('entityCode', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          placeholder="City, State"
                          value={hospitalForm.location}
                          onChange={(e) => handleHospitalFormChange('location', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-email">Contact Email</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          placeholder="Enter contact email"
                          value={hospitalForm.contactEmail}
                          onChange={(e) => handleHospitalFormChange('contactEmail', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="Enter phone number"
                          value={hospitalForm.phone}
                          onChange={(e) => handleHospitalFormChange('phone', e.target.value)}
                          required
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddHospitalOpen(false)}
                          disabled={isCreatingHospital}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]"
                          disabled={isCreatingHospital}
                        >
                          {isCreatingHospital ? "Creating..." : "Add Hospital"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>

              {/* Edit Hospital Dialog */}
              <Dialog open={isEditHospitalOpen} onOpenChange={setIsEditHospitalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Edit Hospital</DialogTitle>
                    <DialogDescription>Update hospital information</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpdateHospital} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-hospital-name">Hospital Name</Label>
                      <Input
                        id="edit-hospital-name"
                        placeholder="Enter hospital name"
                        value={editForm.name}
                        onChange={(e) => handleEditFormChange('name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-location">Location</Label>
                      <Input
                        id="edit-location"
                        placeholder="City, State"
                        value={editForm.location}
                        onChange={(e) => handleEditFormChange('location', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-contact-email">Contact Email</Label>
                      <Input
                        id="edit-contact-email"
                        type="email"
                        placeholder="Enter contact email"
                        value={editForm.contactEmail}
                        onChange={(e) => handleEditFormChange('contactEmail', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">Phone Number</Label>
                      <Input
                        id="edit-phone"
                        placeholder="Enter phone number"
                        value={editForm.phone}
                        onChange={(e) => handleEditFormChange('phone', e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditHospitalOpen(false)}
                        disabled={isUpdatingHospital}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]"
                        disabled={isUpdatingHospital}
                      >
                        {isUpdatingHospital ? "Updating..." : "Update Hospital"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hospital Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Buildings</TableHead>
                    <TableHead>Total Assets</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingHospitals ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-gray-500">Loading hospitals...</div>
                      </TableCell>
                    </TableRow>
                  ) : hospitalsError ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-red-500">Error: {hospitalsError}</div>
                      </TableCell>
                    </TableRow>
                  ) : hospitals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-gray-500">No hospitals found</div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    hospitals.map((hospital, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-[#0F67FF]" />
                            {hospital.hospitalName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-[#E8F0FF] text-[#0F67FF]">
                            {hospital.code}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">{hospital.location}</TableCell>
                        <TableCell>{hospital.buildings}</TableCell>
                        <TableCell>{hospital.totalAssets.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditHospital(hospital)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Buildings Tab */}
        <TabsContent value="buildings">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-900">Building Management</CardTitle>
                  <CardDescription>Manage hospital buildings and facilities</CardDescription>
                </div>
                <Dialog open={isAddBuildingOpen} onOpenChange={setIsAddBuildingOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Building
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Building</DialogTitle>
                      <DialogDescription>Add a building to a hospital</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="building-name">Building Name</Label>
                        <Input id="building-name" placeholder="e.g., Main Building" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="building-hospital">Select Hospital</Label>
                        <Input id="building-hospital" placeholder="Search hospital..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="floors">Number of Floors</Label>
                        <Input id="floors" type="number" placeholder="e.g., 8" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddBuildingOpen(false)}>Cancel</Button>
                      <Button
                        className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]"
                        onClick={() => {
                          toast.success("Building added successfully!");
                          setIsAddBuildingOpen(false);
                        }}
                      >
                        Add Building
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Building Name</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Floors</TableHead>
                    <TableHead>Departments</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBuildings.map((building) => (
                    <TableRow key={building.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-[#10B981]" />
                          {building.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{building.hospital}</TableCell>
                      <TableCell>{building.floors}</TableCell>
                      <TableCell>{building.departments}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-900">Department Management</CardTitle>
                  <CardDescription>Manage hospital departments and units</CardDescription>
                </div>
                <Dialog open={isAddDepartmentOpen} onOpenChange={setIsAddDepartmentOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Department
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Department</DialogTitle>
                      <DialogDescription>Create a new department or unit</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="dept-name">Department Name</Label>
                        <Input id="dept-name" placeholder="e.g., Cardiology" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dept-building">Building</Label>
                        <Input id="dept-building" placeholder="Select building..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dept-floor">Floor</Label>
                        <Input id="dept-floor" placeholder="e.g., 3rd Floor" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dept-cost-center">Cost Center Code</Label>
                        <Input id="dept-cost-center" placeholder="e.g., CC-001" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDepartmentOpen(false)}>Cancel</Button>
                      <Button
                        className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]"
                        onClick={() => {
                          toast.success("Department added successfully!");
                          setIsAddDepartmentOpen(false);
                        }}
                      >
                        Add Department
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department Name</TableHead>
                    <TableHead>Building</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Cost Center</TableHead>
                    <TableHead>Assets</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockDepartments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#F59E0B]" />
                          {dept.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{dept.building}</TableCell>
                      <TableCell className="text-gray-600">{dept.floor}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-[#FEF3C7] text-[#F59E0B]">
                          {dept.costCenter}
                        </Badge>
                      </TableCell>
                      <TableCell>{dept.assets}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cost Centers Tab */}
        <TabsContent value="cost-centers">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-gray-900">Cost Center Management</CardTitle>
              <CardDescription>Manage financial cost centers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Cost center management interface</p>
                <Button className="mt-4 bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Cost Center
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
