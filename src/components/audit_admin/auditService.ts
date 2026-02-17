const BASE_URL = `${import.meta.env.VITE_API_URL}/api/audit`;


const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: any = new Error(errorData.message || "Request failed");
    error.response = { data: errorData, status: response.status };
    throw error;
  }
  return { data: await response.json() };
};

export const initiateAudit = async (data: any) => {
  const response = await fetch(`${BASE_URL}/initiate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const verifyAuditAsset = async (
  auditId: string,
  assetKey: string,
  data: any
) => {
  const response = await fetch(`${BASE_URL}/verify/${auditId}/${assetKey}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const submitAudit = async (auditId: string) => {
  const response = await fetch(`${BASE_URL}/submit/${auditId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getAllAudits = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  auditType?: string;
  hospitalId?: string;
  search?: string;
}) => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
  if (params?.auditType && params.auditType !== 'all') queryParams.append('auditType', params.auditType);
  if (params?.hospitalId) queryParams.append('hospitalId', params.hospitalId);
  if (params?.search) queryParams.append('search', params.search);

  const response = await fetch(`${BASE_URL}?${queryParams.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const closeAudit = async (auditId: string) => {
  const response = await fetch(`${BASE_URL}/close/${auditId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getAuditSummary = async (auditId: string) => {
  const response = await fetch(`${BASE_URL}/summary/${auditId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Get all audit assets with pagination and filters
export const getAuditAssets = async (
  auditId: string,
  params?: { page?: number; limit?: number; status?: string; search?: string; departmentId?: string }
) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.status) queryParams.append("status", params.status);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.departmentId) queryParams.append("departmentId", params.departmentId);

  const url = `${BASE_URL}/${auditId}/assets${queryParams.toString() ? `?${queryParams}` : ""}`;
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Get hospital departments
export const getHospitalDepartments = async (hospitalId: string) => {
  const response = await fetch(`${BASE_URL.replace('/api/audit', '')}/api/v1/hospitals/${hospitalId}/departments`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Get single audit asset for verification
export const getAuditAssetForVerification = async (
  auditId: string,
  assetKey: string
) => {
  const response = await fetch(`${BASE_URL}/${auditId}/assets/${assetKey}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};
