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

// interface EntitySetupProps {
//   onNavigate: (screen: string) => void;
// }

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
  message: string;
  entity: {
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

// Entity update response interface
interface UpdateEntityResponse {
  message: string;
  entity: {
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
  entityCode: string; // Backend expects entity code, not MongoDB ID
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
  entityCode?: string;
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

// Building data interface
interface BuildingData {
  _id: string;
  id: string;
  name: string;
  code?: string;
  totalFloors: number;
  totalDepartments?: number;
  totalAssets?: number;
  address?: string;
  organizationId: string;
  entityName?: string;
  hospitalId?: string;
  hospitalName?: string;
}

// Building form data interface
interface BuildingFormData {
  name: string;
  organizationId: string;
  totalFloors: number;
}

// Building API response interface
interface BuildingApiResponse {
  success: boolean;
  data: {
    buildings: BuildingData[];
  };
}

// Department data interface
interface DepartmentData {
  _id: string;
  departmentId: string;
  name: string;
  code?: string;
  organizationId: string;
  hospitalId: string;
  buildingId?: string;
  floorId?: string;
  headOfDepartment?: string;
  totalAssets?: number;
  totalStaff?: number;
  costCenters?: string[];
  buildingName?: string;
  floorName?: string;
  hospitalName?: string;
}

// Department form data interface
interface DepartmentFormData {
  name: string;
  code?: string;
  organizationId: string;
  hospitalId: string;
  buildingId?: string;
  floorId?: string;
  headOfDepartment?: string;
  costCenter?: string;
}

export function EntitySetup() {
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

  // Entity edit states
  const [isEditEntityOpen, setIsEditEntityOpen] = useState(false);
  const [isUpdatingEntity, setIsUpdatingEntity] = useState(false);
  const [editingEntity, setEditingEntity] = useState<any | null>(null);
  const [editEntityForm, setEditEntityForm] = useState<EntityFormData>({
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

  // Building states
  const [buildings, setBuildings] = useState<BuildingData[]>([]);
  const [isLoadingBuildings, setIsLoadingBuildings] = useState(true);
  const [buildingsError, setBuildingsError] = useState<string | null>(null);
  const [isCreatingBuilding, setIsCreatingBuilding] = useState(false);
  const [isEditBuildingOpen, setIsEditBuildingOpen] = useState(false);
  const [isUpdatingBuilding, setIsUpdatingBuilding] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<BuildingData | null>(null);
  const [buildingForm, setBuildingForm] = useState<BuildingFormData>({
    name: "",
    organizationId: "",
    totalFloors: 1
  });
  const [editBuildingForm, setEditBuildingForm] = useState<BuildingFormData>({
    name: "",
    organizationId: "",
    totalFloors: 1
  });

  // Department states
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [departmentsError, setDepartmentsError] = useState<string | null>(null);
  const [isCreatingDepartment, setIsCreatingDepartment] = useState(false);
  const [isEditDepartmentOpen, setIsEditDepartmentOpen] = useState(false);
  const [isUpdatingDepartment, setIsUpdatingDepartment] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentData | null>(null);
  const [departmentForm, setDepartmentForm] = useState<DepartmentFormData>({
    name: "",
    organizationId: "",
    hospitalId: "",
    buildingId: "",
    floorId: "",
    headOfDepartment: "",
    costCenter: ""
  });
  const [editDepartmentForm, setEditDepartmentForm] = useState<DepartmentFormData>({
    name: "",
    organizationId: "",
    hospitalId: "",
    buildingId: "",
    floorId: "",
    headOfDepartment: "",
    costCenter: ""
  });

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

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/entity`, {
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
      const allEntities = result.entities || result.data || [];
      // Filter out inactive (soft-deleted) entities
      const activeEntities = allEntities.filter((entity: any) => entity.isActive !== false);
      setEntities(activeEntities);
      console.log('Entities set successfully:', activeEntities);
    } catch (error) {
      console.error('Error fetching entities:', error);
      setEntitiesError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoadingEntities(false);
    }
  };

  // Handle entity form changes
  const handleEntityFormChange = (field: keyof EntityFormData | `meta.${string}`, value: string | number) => {
    setEntityForm(prev => {
      if (field.startsWith('meta.')) {
        const metaField = field.replace('meta.', '') as keyof NonNullable<EntityFormData['meta']>;
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

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/entity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(entityForm)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 409) {
          throw new Error(errorData.message || 'An entity with this code already exists');
        }
        throw new Error(errorData.message || `Failed to create entity: ${response.status} ${response.statusText}`);
      }

      const result: CreateEntityResponse = await response.json();
      console.log('Create Entity API response:', result);

      // Check if entity was created successfully
      if (!result.entity) {
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
        description: `${result.entity.name} (${result.entity.code}) has been added to the system`
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

  // Handle edit entity form changes
  const handleEditEntityFormChange = (field: keyof EntityFormData | `meta.${string}`, value: string | number) => {
    setEditEntityForm(prev => {
      if (field.startsWith('meta.')) {
        const metaField = field.replace('meta.', '') as keyof NonNullable<EntityFormData['meta']>;
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

  // Open edit dialog with entity data
  const handleEditEntity = (entity: any) => {
    console.log('Editing entity:', entity);
    setEditingEntity(entity);
    setEditEntityForm({
      name: entity.name || "",
      code: entity.code || "",
      state: entity.state || "",
      city: entity.city || "",
      address: entity.address || "",
      meta: {
        contactPerson: entity.meta?.contactPerson || "",
        email: entity.meta?.email || "",
        phone: entity.meta?.phone || "",
        totalBuildings: entity.meta?.totalBuildings || 0,
        totalAssets: entity.meta?.totalAssets || 0
      }
    });
    setIsEditEntityOpen(true);
  };

  // Handle entity update
  const handleUpdateEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntity || !editingEntity._id) {
      toast.error('Invalid entity data');
      return;
    }

    setIsUpdatingEntity(true);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/entity/${editingEntity._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editEntityForm)
      });

      if (!response.ok) {
        throw new Error(`Failed to update entity: ${response.status} ${response.statusText}`);
      }

      const result: UpdateEntityResponse = await response.json();
      console.log('Update entity response:', result);

      if (!result.entity) {
        throw new Error(result.message || 'Failed to update entity');
      }

      // Close dialog and reset form
      setIsEditEntityOpen(false);
      setEditingEntity(null);
      setEditEntityForm({
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

      toast.success("Entity updated successfully!", {
        description: `${result.entity.name} has been updated`
      });

      // Refresh entities list
      fetchEntities();
    } catch (error) {
      console.error('Error updating entity:', error);
      toast.error('Failed to update entity', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setIsUpdatingEntity(false);
    }
  };

  // Handle entity delete
  const handleDeleteEntity = async (entity: any) => {
    if (!entity || !entity._id) {
      toast.error('Invalid entity data');
      return;
    }

    if (!confirm(`Are you sure you want to delete entity "${entity.name}"?`)) {
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/entity/${entity._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete entity: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Delete entity response:', result);

      toast.success("Entity deleted successfully!", {
        description: `${entity.name} has been removed from the system`
      });

      // Refresh entities list
      fetchEntities();
    } catch (error) {
      console.error('Error deleting entity:', error);
      toast.error('Failed to delete entity', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  };

  // Fetch hospitals from API
  const fetchHospitals = async () => {
    setIsLoadingHospitals(true);
    setHospitalsError(null);

    console.log('=== Fetching Hospitals ===');

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const url = `${import.meta.env.VITE_API_URL}/api/hospital`;
      console.log('GET URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });


      console.log('Fetch hospitals response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch hospitals error body:', errorText);
        throw new Error(`Failed to fetch hospitals: ${response.status} ${response.statusText}`);
      }

      const result: GetHospitalsResponse = await response.json();
      console.log('Fetch hospitals response:', result);
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
        hospitalId: hospital.hospitalId,
        entityCode: hospital.entityId
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

    console.log('=== Creating Hospital ===');
    console.log('Form data:', hospitalForm);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const url = `${import.meta.env.VITE_API_URL}/api/hospital`;
      console.log('POST URL:', url);
      
      // Build request body - backend expects entityCode, not entityId
      const requestBody = {
        name: hospitalForm.name,
        entityCode: hospitalForm.entityCode,
        location: hospitalForm.location,
        contactEmail: hospitalForm.contactEmail,
        phone: hospitalForm.phone
      };
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status, response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`Failed to create hospital: ${response.status} ${response.statusText}`);
      }

      const result: CreateHospitalResponse = await response.json();
      console.log('Create hospital response:', result);

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

    console.log('=== Updating Hospital ===');
    console.log('Editing hospital ID:', editingHospital._id);
    console.log('Update form data:', editForm);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const url = `${import.meta.env.VITE_API_URL}/api/hospital/${editingHospital._id}`;
      console.log('PUT URL:', url);
      console.log('PUT request body:', JSON.stringify(editForm, null, 2));

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      console.log('PUT response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('PUT error response body:', errorText);
        throw new Error(`Failed to update hospital: ${response.status} ${response.statusText}`);
      }

      const result: UpdateHospitalResponse = await response.json();
      console.log('Update hospital response:', result);

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
    // Store entityCode in editingHospital for display in edit form
    if (hospital.entityCode) {
      setEditingHospital({
        ...hospital,
        entityCode: hospital.entityCode
      });
    }
    setIsEditHospitalOpen(true);
  };

  // Handle hospital delete
  const handleDeleteHospital = async (hospital: HospitalData) => {
    if (!hospital || !hospital._id) {
      toast.error('Invalid hospital data');
      return;
    }

    if (!confirm(`Are you sure you want to delete hospital "${hospital.hospitalName}"?`)) {
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hospital/${hospital._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete hospital: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Delete hospital response:', result);

      toast.success("Hospital deleted successfully!", {
        description: `${hospital.hospitalName} has been removed from the system`
      });

      // Refresh hospitals list
      fetchHospitals();
    } catch (error) {
      console.error('Error deleting hospital:', error);
      toast.error('Failed to delete hospital', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  };

  // Fetch all buildings from all hospitals
  const fetchBuildings = async () => {
    setIsLoadingBuildings(true);
    setBuildingsError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // First fetch hospitals to get hospitalId list
      const hospitalsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/hospital`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!hospitalsRes.ok) {
        throw new Error(`Failed to fetch hospitals: ${hospitalsRes.status}`);
      }

      const hospitalsResult = await hospitalsRes.json();
      const allHospitals = hospitalsResult.data || [];

      // Create a map of hospitalId to hospital info
      const hospitalsMap: Record<string, { hospitalId: string; hospitalName: string }> = {};
      allHospitals.forEach((h: any) => {
        hospitalsMap[h.hospitalId] = { hospitalId: h.hospitalId, hospitalName: h.name };
      });

      // Fetch buildings for each hospital using hospitalId (HOSP-XXXX)
      const allBuildings: BuildingData[] = [];
      for (const hospital of allHospitals) {
        const hospitalId = hospital.hospitalId;
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/entity/api/v1/organizations/${hospitalId}/buildings`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data && result.data.buildings) {
              // Add hospital info to each building
              const buildingsWithHospital = result.data.buildings.map((b: BuildingData) => ({
                ...b,
                organizationId: hospitalId,
                hospitalId: hospitalId,
                hospitalName: hospital.name
              }));
              allBuildings.push(...buildingsWithHospital);
            }
          }
        } catch (err) {
          console.error(`Error fetching buildings for hospital ${hospitalId}:`, err);
        }
      }

      setBuildings(allBuildings);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      setBuildingsError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoadingBuildings(false);
    }
  };

  // Handle building form changes
  const handleBuildingFormChange = (field: keyof BuildingFormData, value: string | number) => {
    setBuildingForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle edit building form changes
  const handleEditBuildingFormChange = (field: keyof BuildingFormData, value: string | number) => {
    setEditBuildingForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Check if building name is unique for the selected hospital
  const isBuildingNameUnique = (name: string, organizationId: string, excludeBuildingId?: string) => {
    return !buildings.some(b => 
      b.name.toLowerCase() === name.toLowerCase() && 
      b.organizationId === organizationId &&
      b.id !== excludeBuildingId
    );
  };

  // Handle building creation
  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingBuilding(true);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Validate building name uniqueness
      if (!isBuildingNameUnique(buildingForm.name, buildingForm.organizationId)) {
        throw new Error('A building with this name already exists for the selected hospital');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/entity/api/v1/organizations/${buildingForm.organizationId}/buildings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: buildingForm.name,
          totalFloors: buildingForm.totalFloors
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create building: ${response.status}`);
      }

      const result = await response.json();
      console.log('Create Building API response:', result);

      if (!result.success) {
        throw new Error(result.message || 'Failed to create building');
      }

      // Reset form and close dialog
      setBuildingForm({
        name: "",
        organizationId: "",
        totalFloors: 1
      });
      setIsAddBuildingOpen(false);

      toast.success("Building created successfully!");

      // Refresh buildings list
      fetchBuildings();
    } catch (error) {
      console.error('Error creating building:', error);
      toast.error('Failed to create building', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setIsCreatingBuilding(false);
    }
  };

  // Open edit dialog with building data
  const handleEditBuilding = (building: BuildingData) => {
    console.log('Editing building:', building);
    setEditingBuilding(building);
    setEditBuildingForm({
      name: building.name,
      organizationId: building.hospitalId || building.organizationId,
      totalFloors: building.totalFloors
    });
    setIsEditBuildingOpen(true);
  };

  // Handle building update
  const handleUpdateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBuilding) return;

    setIsUpdatingBuilding(true);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Validate building name uniqueness (excluding current building)
      if (!isBuildingNameUnique(editBuildingForm.name, editBuildingForm.organizationId, editingBuilding.id)) {
        throw new Error('A building with this name already exists for the selected hospital');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/entity/api/v1/buildings/${editingBuilding.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editBuildingForm.name,
          totalFloors: editBuildingForm.totalFloors
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update building: ${response.status}`);
      }

      const result = await response.json();
      console.log('Update Building API response:', result);

      if (!result.success) {
        throw new Error(result.message || 'Failed to update building');
      }

      toast.success("Building updated successfully!");

      // Close dialog and refresh
      setIsEditBuildingOpen(false);
      setEditingBuilding(null);
      fetchBuildings();
    } catch (error) {
      console.error('Error updating building:', error);
      toast.error('Failed to update building', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setIsUpdatingBuilding(false);
    }
  };

  // Handle building delete
  const handleDeleteBuilding = async (building: BuildingData) => {
    if (!building || !building.id) {
      toast.error('Invalid building data');
      return;
    }

    if (!confirm(`Are you sure you want to delete building "${building.name}"?`)) {
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/entity/api/v1/buildings/${building.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete building: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Delete building response:', result);

      toast.success("Building deleted successfully!");

      // Refresh buildings list
      fetchBuildings();
    } catch (error) {
      console.error('Error deleting building:', error);
      toast.error('Failed to delete building', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  };

  // Fetch all departments from all entities
  const fetchDepartments = async () => {
    setIsLoadingDepartments(true);
    setDepartmentsError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // First fetch buildings to get building name mapping
      const buildingsMap: Record<string, { name: string; hospitalId: string; hospitalName: string }> = {};
      buildings.forEach(b => {
        buildingsMap[b.id] = { 
          name: b.name, 
          hospitalId: b.hospitalId || b.organizationId,
          hospitalName: b.hospitalName || b.organizationId
        };
      });

      // First fetch entities to get their codes
      const entitiesRes = await fetch(`${import.meta.env.VITE_API_URL}/api/entity`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!entitiesRes.ok) {
        throw new Error(`Failed to fetch entities: ${entitiesRes.status}`);
      }

      const entitiesResult = await entitiesRes.json();
      const allEntities = entitiesResult.entities || entitiesResult.data || [];
      const activeEntities = allEntities.filter((entity: any) => entity.isActive !== false);

      // Fetch departments for each entity
      const allDepartments: DepartmentData[] = [];
      for (const entity of activeEntities) {
        const entityCode = entity.code;
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/entity/api/v1/organizations/${entityCode}/departments`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data && result.data.departments) {
              // Add entity and building info to each department
              const departmentsWithEntity = result.data.departments.map((d: DepartmentData) => {
                const buildingInfo = d.buildingId ? buildingsMap[d.buildingId] : null;
                return {
                  ...d,
                  organizationId: entityCode,
                  entityName: entity.name,
                  buildingName: buildingInfo?.name || d.buildingId,
                  hospitalName: buildingInfo?.hospitalName || entity.name
                };
              });
              allDepartments.push(...departmentsWithEntity);
            }
          }
        } catch (err) {
          console.error(`Error fetching departments for entity ${entityCode}:`, err);
        }
      }

      setDepartments(allDepartments);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartmentsError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  // Handle department form changes
  const handleDepartmentFormChange = (field: keyof DepartmentFormData, value: string) => {
    setDepartmentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle edit department form changes
  const handleEditDepartmentFormChange = (field: keyof DepartmentFormData, value: string) => {
    setEditDepartmentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Check if department name is unique for the selected entity
  const isDepartmentNameUnique = (name: string, organizationId: string, excludeDepartmentId?: string) => {
    return !departments.some(d => 
      d.name.toLowerCase() === name.toLowerCase() && 
      d.organizationId === organizationId &&
      d.departmentId !== excludeDepartmentId
    );
  };

  // Handle department creation
  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingDepartment(true);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Validate department name uniqueness
      if (!isDepartmentNameUnique(departmentForm.name, departmentForm.organizationId)) {
        throw new Error('A department with this name already exists for the selected hospital');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/entity/api/v1/organizations/${departmentForm.organizationId}/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: departmentForm.name,
          code: departmentForm.code,
          buildingId: departmentForm.buildingId,
          floorId: departmentForm.floorId,
          headOfDepartment: departmentForm.headOfDepartment,
          costCenters: departmentForm.costCenter ? [departmentForm.costCenter] : []
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create department: ${response.status}`);
      }

      const result = await response.json();
      console.log('Create Department API response:', result);

      if (!result.success) {
        throw new Error(result.message || 'Failed to create department');
      }

      // Reset form and close dialog
      setDepartmentForm({
        name: "",
        organizationId: "",
        hospitalId: "",
        buildingId: "",
        floorId: "",
        headOfDepartment: "",
        costCenter: ""
      });
      setIsAddDepartmentOpen(false);

      toast.success("Department created successfully!");

      // Refresh departments list
      fetchDepartments();
    } catch (error) {
      console.error('Error creating department:', error);
      toast.error('Failed to create department', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setIsCreatingDepartment(false);
    }
  };

  // Open edit dialog with department data
  const handleEditDepartment = (department: DepartmentData) => {
    console.log('Editing department:', department);
    setEditingDepartment(department);
    setEditDepartmentForm({
      name: department.name,
      code: department.code || "",
      organizationId: department.organizationId,
      hospitalId: department.hospitalId,
      buildingId: department.buildingId || "",
      floorId: department.floorId || "",
      headOfDepartment: department.headOfDepartment || "",
      costCenter: department.costCenters?.[0] || ""
    });
    setIsEditDepartmentOpen(true);
  };

  // Handle department update
  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDepartment) return;

    setIsUpdatingDepartment(true);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Validate department name uniqueness (excluding current department)
      if (!isDepartmentNameUnique(editDepartmentForm.name, editDepartmentForm.organizationId, editingDepartment.departmentId)) {
        throw new Error('A department with this name already exists for the selected hospital');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/entity/api/v1/departments/${editingDepartment.departmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editDepartmentForm.name,
          code: editDepartmentForm.code,
          buildingId: editDepartmentForm.buildingId,
          floorId: editDepartmentForm.floorId,
          headOfDepartment: editDepartmentForm.headOfDepartment,
          costCenters: editDepartmentForm.costCenter ? [editDepartmentForm.costCenter] : []
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update department: ${response.status}`);
      }

      const result = await response.json();
      console.log('Update Department API response:', result);

      if (!result.success) {
        throw new Error(result.message || 'Failed to update department');
      }

      toast.success("Department updated successfully!");

      // Close dialog and refresh
      setIsEditDepartmentOpen(false);
      setEditingDepartment(null);
      fetchDepartments();
    } catch (error) {
      console.error('Error updating department:', error);
      toast.error('Failed to update department', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setIsUpdatingDepartment(false);
    }
  };

  // Handle department delete
  const handleDeleteDepartment = async (department: DepartmentData) => {
    if (!department || !department.departmentId) {
      toast.error('Invalid department data');
      return;
    }

    if (!confirm(`Are you sure you want to delete department "${department.name}"?`)) {
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/entity/api/v1/departments/${department.departmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete department: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Delete department response:', result);

      toast.success("Department deleted successfully!");
      fetchDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('Failed to delete department', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  };

  // Load buildings and departments when component mounts
  useEffect(() => {
    const loadData = async () => {
      await fetchBuildings();
      // Fetch departments after buildings are loaded
      fetchDepartments();
    };
    loadData();
  }, []);

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
                            placeholder="ENTY-001"
                            value={entityForm.code}
                            onChange={(e) => handleEntityFormChange('code', e.target.value)}
                            required
                            pattern="^ENTY-\d+$"
                            title="Entity code must be in format ENTY-XXX (e.g., ENTY-001, ENTY-002)"
                          />
                          <p className="text-xs text-gray-500">Format: ENTY-001, ENTY-002, etc.</p>
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
                          <Label htmlFor="contact-person">Contact Person *</Label>
                          <Input
                            id="contact-person"
                            placeholder="Enter contact person name"
                            value={entityForm.meta?.contactPerson || ''}
                            onChange={(e) => handleEntityFormChange('meta.contactPerson', e.target.value)}
                            required
                            minLength={2}
                            pattern="^[a-zA-Z\s]+$"
                            title="Contact person name should only contain letters and spaces"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-email">Contact Email *</Label>
                          <Input
                            id="contact-email"
                            type="email"
                            placeholder="Enter contact email"
                            value={entityForm.meta?.email || ''}
                            onChange={(e) => handleEntityFormChange('meta.email', e.target.value)}
                            required
                            pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                            title="Please enter a valid email address"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contact-phone">Contact Phone *</Label>
                          <Input
                            id="contact-phone"
                            type="tel"
                            placeholder="Enter 10-digit phone number"
                            value={entityForm.meta?.phone || ''}
                            onChange={(e) => handleEntityFormChange('meta.phone', e.target.value)}
                            required
                            pattern="^\d{10}$"
                            title="Phone number must be exactly 10 digits"
                            maxLength={10}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="total-buildings">Total Buildings *</Label>
                          <Input
                            id="total-buildings"
                            type="number"
                            placeholder="Enter total buildings"
                            value={entityForm.meta?.totalBuildings || ''}
                            onChange={(e) => {
                              const value = e.target.value === '' ? '' : parseInt(e.target.value);
                              handleEntityFormChange('meta.totalBuildings', value);
                            }}
                            required
                            min={1}
                            title="At least 1 building is required"
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
                              handleEntityFormChange('meta.totalAssets', value);
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

                {/* Edit Entity Dialog */}
                <Dialog open={isEditEntityOpen} onOpenChange={setIsEditEntityOpen}>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Edit Entity</DialogTitle>
                      <DialogDescription>Update entity information</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateEntity} className="space-y-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-entity-name">Entity Name</Label>
                          <Input
                            id="edit-entity-name"
                            placeholder="Enter entity name"
                            value={editEntityForm.name}
                            onChange={(e) => handleEditEntityFormChange('name', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-entity-code">Entity Code</Label>
                          <Input
                            id="edit-entity-code"
                            placeholder="ENTY-001"
                            value={editEntityForm.code}
                            onChange={(e) => handleEditEntityFormChange('code', e.target.value)}
                            required
                            pattern="^ENTY-\d+$"
                            title="Entity code must be in format ENTY-XXX (e.g., ENTY-001, ENTY-002)"
                          />
                          <p className="text-xs text-gray-500">Format: ENTY-001, ENTY-002, etc.</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-entity-state">State</Label>
                          <Input
                            id="edit-entity-state"
                            placeholder="Enter state"
                            value={editEntityForm.state}
                            onChange={(e) => handleEditEntityFormChange('state', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-entity-city">City</Label>
                          <Input
                            id="edit-entity-city"
                            placeholder="Enter city"
                            value={editEntityForm.city}
                            onChange={(e) => handleEditEntityFormChange('city', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-entity-address">Address</Label>
                        <Input
                          id="edit-entity-address"
                          placeholder="Enter full address"
                          value={editEntityForm.address}
                          onChange={(e) => handleEditEntityFormChange('address', e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-contact-person">Contact Person *</Label>
                          <Input
                            id="edit-contact-person"
                            placeholder="Enter contact person name"
                            value={editEntityForm.meta?.contactPerson || ''}
                            onChange={(e) => handleEditEntityFormChange('meta.contactPerson', e.target.value)}
                            required
                            minLength={2}
                            pattern="^[a-zA-Z\s]+$"
                            title="Contact person name should only contain letters and spaces"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-contact-email">Contact Email *</Label>
                          <Input
                            id="edit-contact-email"
                            type="email"
                            placeholder="Enter contact email"
                            value={editEntityForm.meta?.email || ''}
                            onChange={(e) => handleEditEntityFormChange('meta.email', e.target.value)}
                            required
                            pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                            title="Please enter a valid email address"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-contact-phone">Contact Phone *</Label>
                          <Input
                            id="edit-contact-phone"
                            type="tel"
                            placeholder="Enter 10-digit phone number"
                            value={editEntityForm.meta?.phone || ''}
                            onChange={(e) => handleEditEntityFormChange('meta.phone', e.target.value)}
                            required
                            pattern="^\d{10}$"
                            title="Phone number must be exactly 10 digits"
                            maxLength={10}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-total-buildings">Total Buildings *</Label>
                          <Input
                            id="edit-total-buildings"
                            type="number"
                            placeholder="Enter total buildings"
                            value={editEntityForm.meta?.totalBuildings || ''}
                            onChange={(e) => {
                              const value = e.target.value === '' ? '' : parseInt(e.target.value);
                              handleEditEntityFormChange('meta.totalBuildings', value);
                            }}
                            required
                            min={1}
                            title="At least 1 building is required"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-total-assets">Total Assets</Label>
                          <Input
                            id="edit-total-assets"
                            type="number"
                            placeholder="Enter total assets"
                            value={editEntityForm.meta?.totalAssets || 0}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              handleEditEntityFormChange('meta.totalAssets', value);
                            }}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditEntityOpen(false)}
                          disabled={isUpdatingEntity}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]"
                          disabled={isUpdatingEntity}
                        >
                          {isUpdatingEntity ? "Updating..." : "Update Entity"}
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
                    <TableHead>Address</TableHead>
                    <TableHead>Buildings</TableHead>
                    <TableHead>Assets</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingEntities ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="text-gray-500">Loading entities...</div>
                      </TableCell>
                    </TableRow>
                  ) : entitiesError ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="text-red-500">Error: {entitiesError}</div>
                      </TableCell>
                    </TableRow>
                  ) : entities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
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
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            {entity.code}
                          </Badge>
                        </TableCell>
                        <TableCell>{entity.state}</TableCell>
                        <TableCell>{entity.city}</TableCell>
                        <TableCell>
                          <span title={entity.address}>
                            {entity.address && entity.address.length > 25 
                              ? entity.address.substring(0, 25) + '...' 
                              : entity.address}
                          </span>
                        </TableCell>
                        <TableCell>{entity.meta?.totalBuildings || 0}</TableCell>
                        <TableCell>{entity.meta?.totalAssets || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditEntity(entity)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteEntity(entity)}
                            >
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
                        <Label htmlFor="entity-select">Associate with Entity *</Label>
                        <select
                          id="entity-select"
                          value={hospitalForm.entityCode}
                          onChange={(e) => handleHospitalFormChange('entityCode', e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select an entity code</option>
                          {entities.map((entity) => (
                            <option key={entity._id} value={entity.code}>
                              {entity.code} - {entity.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500">Select the entity code to associate this hospital with</p>
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
                        <Label htmlFor="contact-email">Contact Email *</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          placeholder="Enter contact email"
                          value={hospitalForm.contactEmail}
                          onChange={(e) => handleHospitalFormChange('contactEmail', e.target.value)}
                          required
                          pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                          title="Please enter a valid email address"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter 10-digit phone number"
                          value={hospitalForm.phone}
                          onChange={(e) => handleHospitalFormChange('phone', e.target.value)}
                          required
                          pattern="^\d{10}$"
                          title="Phone number must be exactly 10 digits"
                          maxLength={10}
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
                      <Label htmlFor="edit-hospital-id">Hospital ID</Label>
                      <Input
                        id="edit-hospital-id"
                        value={editingHospital?.hospitalId || ''}
                        disabled
                        className="bg-gray-100 text-gray-500"
                      />
                      <p className="text-xs text-gray-500">Hospital ID cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-entity-code">Associated Entity Code</Label>
                      <Input
                        id="edit-entity-code"
                        value={(editingHospital as any)?.entityCode || 'N/A'}
                        disabled
                        className="bg-gray-100 text-gray-500"
                      />
                      <p className="text-xs text-gray-500">Entity association cannot be changed after creation</p>
                    </div>
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
                      <Label htmlFor="edit-contact-email">Contact Email *</Label>
                      <Input
                        id="edit-contact-email"
                        type="email"
                        placeholder="Enter contact email"
                        value={editForm.contactEmail}
                        onChange={(e) => handleEditFormChange('contactEmail', e.target.value)}
                        required
                        pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                        title="Please enter a valid email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">Phone Number *</Label>
                      <Input
                        id="edit-phone"
                        type="tel"
                        placeholder="Enter 10-digit phone number"
                        value={editForm.phone}
                        onChange={(e) => handleEditFormChange('phone', e.target.value)}
                        required
                        pattern="^\d{10}$"
                        title="Phone number must be exactly 10 digits"
                        maxLength={10}
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
                    <TableHead>Hospital ID</TableHead>
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
                            {hospital.hospitalId}
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
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteHospital(hospital)}
                            >
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
                    <form onSubmit={handleCreateBuilding} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="building-name">Building Name *</Label>
                        <Input
                          id="building-name"
                          placeholder="e.g., Main Building"
                          value={buildingForm.name}
                          onChange={(e) => handleBuildingFormChange('name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="building-hospital">Select Hospital *</Label>
                        <select
                          id="building-hospital"
                          value={buildingForm.organizationId}
                          onChange={(e) => handleBuildingFormChange('organizationId', e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F67FF] focus:border-transparent"
                        >
                          <option value="">Select a hospital...</option>
                          {hospitals.map((hospital) => (
                            <option key={hospital._id} value={hospital.hospitalId}>
                              {hospital.hospitalName} ({hospital.hospitalId})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="floors">Number of Floors *</Label>
                        <Input
                          id="floors"
                          type="number"
                          min={1}
                          placeholder="e.g., 8"
                          value={buildingForm.totalFloors}
                          onChange={(e) => handleBuildingFormChange('totalFloors', parseInt(e.target.value) || 1)}
                          required
                        />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsAddBuildingOpen(false)}>Cancel</Button>
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]"
                          disabled={isCreatingBuilding}
                        >
                          {isCreatingBuilding ? "Adding..." : "Add Building"}
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
                    <TableHead>Building Name</TableHead>
                    <TableHead>Hospital ID</TableHead>
                    <TableHead>Floors</TableHead>
                    <TableHead>Departments</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingBuildings ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="text-gray-500">Loading buildings...</div>
                      </TableCell>
                    </TableRow>
                  ) : buildingsError ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="text-red-500">Error: {buildingsError}</div>
                      </TableCell>
                    </TableRow>
                  ) : buildings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="text-gray-500">No buildings found</div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    buildings.map((building) => (
                      <TableRow key={building.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-[#10B981]" />
                            {building.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-[#E8F0FF] text-[#0F67FF]">
                            {building.hospitalId || building.organizationId}
                          </Badge>
                        </TableCell>
                        <TableCell>{building.totalFloors}</TableCell>
                        <TableCell>{building.totalDepartments || 0}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditBuilding(building)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteBuilding(building)}
                            >
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

        {/* Edit Building Dialog */}
        <Dialog open={isEditBuildingOpen} onOpenChange={setIsEditBuildingOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Building</DialogTitle>
              <DialogDescription>Update building details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateBuilding} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-building-name">Building Name *</Label>
                <Input
                  id="edit-building-name"
                  placeholder="e.g., Main Building"
                  value={editBuildingForm.name}
                  onChange={(e) => handleEditBuildingFormChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-building-hospital-id">Hospital ID</Label>
                <Input
                  id="edit-building-hospital-id"
                  value={editingBuilding?.hospitalId || editingBuilding?.organizationId || ''}
                  disabled
                  className="bg-gray-100 text-gray-500"
                />
                <p className="text-xs text-gray-500">Hospital ID cannot be changed</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-building-hospital-name">Hospital Name</Label>
                <Input
                  id="edit-building-hospital-name"
                  value={editingBuilding?.hospitalName || ''}
                  disabled
                  className="bg-gray-100 text-gray-500"
                />
                <p className="text-xs text-gray-500">Hospital association cannot be changed after creation</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-floors">Number of Floors *</Label>
                <Input
                  id="edit-floors"
                  type="number"
                  min={1}
                  placeholder="e.g., 8"
                  value={editBuildingForm.totalFloors}
                  onChange={(e) => handleEditBuildingFormChange('totalFloors', parseInt(e.target.value) || 1)}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditBuildingOpen(false)}>Cancel</Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]"
                  disabled={isUpdatingBuilding}
                >
                  {isUpdatingBuilding ? "Updating..." : "Update Building"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

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
                    <form onSubmit={handleCreateDepartment} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="dept-name">Department Name *</Label>
                        <Input
                          id="dept-name"
                          placeholder="e.g., Cardiology"
                          value={departmentForm.name}
                          onChange={(e) => handleDepartmentFormChange('name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dept-building">Select Building *</Label>
                        <select
                          id="dept-building"
                          value={departmentForm.buildingId}
                          onChange={(e) => {
                            const selectedBuilding = buildings.find(b => b.id === e.target.value);
                            handleDepartmentFormChange('buildingId', e.target.value);
                            if (selectedBuilding) {
                              handleDepartmentFormChange('organizationId', selectedBuilding.organizationId);
                              handleDepartmentFormChange('hospitalId', selectedBuilding.hospitalId || selectedBuilding.organizationId);
                            }
                          }}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F67FF] focus:border-transparent"
                        >
                          <option value="">Select a building...</option>
                          {buildings.map((building) => (
                            <option key={building.id} value={building.id}>
                              {building.name} ({building.hospitalName || building.organizationId})
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500">Building shows associated hospital in parentheses</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dept-floor">Floor</Label>
                        <Input
                          id="dept-floor"
                          placeholder="e.g., 3rd Floor"
                          value={departmentForm.floorId}
                          onChange={(e) => handleDepartmentFormChange('floorId', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dept-cost-center">Cost Center Code</Label>
                        <Input
                          id="dept-cost-center"
                          placeholder="e.g., CC-001"
                          value={departmentForm.costCenter}
                          onChange={(e) => handleDepartmentFormChange('costCenter', e.target.value)}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsAddDepartmentOpen(false)}>Cancel</Button>
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]"
                          disabled={isCreatingDepartment}
                        >
                          {isCreatingDepartment ? "Adding..." : "Add Department"}
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
                    <TableHead>Department Name</TableHead>
                    <TableHead>Building</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Cost Center</TableHead>
                    <TableHead>Assets</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingDepartments ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-gray-500">Loading departments...</div>
                      </TableCell>
                    </TableRow>
                  ) : departmentsError ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-red-500">Error: {departmentsError}</div>
                      </TableCell>
                    </TableRow>
                  ) : departments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-gray-500">No departments found</div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    departments.map((dept) => (
                      <TableRow key={dept.departmentId}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#F59E0B]" />
                            {dept.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">{dept.buildingName || dept.buildingId || 'N/A'}</TableCell>
                        <TableCell className="text-gray-600">{dept.floorName || dept.floorId || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-[#FEF3C7] text-[#F59E0B]">
                            {dept.costCenters?.[0] || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>{dept.totalAssets || 0}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditDepartment(dept)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteDepartment(dept)}
                            >
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

        {/* Edit Department Dialog */}
        <Dialog open={isEditDepartmentOpen} onOpenChange={setIsEditDepartmentOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
              <DialogDescription>Update department details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateDepartment} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-dept-name">Department Name *</Label>
                <Input
                  id="edit-dept-name"
                  placeholder="e.g., Cardiology"
                  value={editDepartmentForm.name}
                  onChange={(e) => handleEditDepartmentFormChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dept-hospital">Hospital</Label>
                <Input
                  id="edit-dept-hospital"
                  value={editingDepartment?.hospitalName || editingDepartment?.organizationId || 'N/A'}
                  disabled
                  className="bg-gray-100 text-gray-500"
                />
                <p className="text-xs text-gray-500">Hospital cannot be changed after creation</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dept-building">Building</Label>
                <Input
                  id="edit-dept-building"
                  value={editingDepartment?.buildingName || editingDepartment?.buildingId || 'N/A'}
                  disabled
                  className="bg-gray-100 text-gray-500"
                />
                <p className="text-xs text-gray-500">Building cannot be changed after creation</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dept-floor">Floor</Label>
                <Input
                  id="edit-dept-floor"
                  placeholder="e.g., 3rd Floor"
                  value={editDepartmentForm.floorId}
                  onChange={(e) => handleEditDepartmentFormChange('floorId', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dept-cost-center">Cost Center Code</Label>
                <Input
                  id="edit-dept-cost-center"
                  placeholder="e.g., CC-001"
                  value={editDepartmentForm.costCenter}
                  onChange={(e) => handleEditDepartmentFormChange('costCenter', e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDepartmentOpen(false)}>Cancel</Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-[#0F67FF] to-[#0B4FCC]"
                  disabled={isUpdatingDepartment}
                >
                  {isUpdatingDepartment ? "Updating..." : "Update Department"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

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
