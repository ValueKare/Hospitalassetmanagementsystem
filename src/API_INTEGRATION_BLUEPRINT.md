# ValueKare FAMS – UI-to-API Integration Blueprint

**Document Version:** 1.0  
**Last Updated:** December 23, 2024  
**Audience:** Backend Developers, API Architects, DevOps Engineers

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Authentication & Session Management](#2-authentication--session-management)
3. [Role-Based Dashboard Loading](#3-role-based-dashboard-loading)
4. [Request & Approval Workflow (8-Stage)](#4-request--approval-workflow-8-stage)
5. [Asset Management](#5-asset-management)
6. [Inventory & Procurement](#6-inventory--procurement)
7. [Maintenance & Biomedical](#7-maintenance--biomedical)
8. [Audit & Compliance](#8-audit--compliance)
9. [Finance & CFO Module](#9-finance--cfo-module)
10. [User & Entity Management](#10-user--entity-management)
11. [Notifications & Real-Time](#11-notifications--real-time)
12. [Reports & Analytics](#12-reports--analytics)
13. [File Management](#13-file-management)
14. [Integration Rules & Best Practices](#14-integration-rules--best-practices)
15. [API Priority Roadmap](#15-api-priority-roadmap)
16. [Error Handling & Validation](#16-error-handling--validation)
17. [Security & Authorization](#17-security--authorization)

---

## 1. System Architecture Overview

### High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
│  React Components → State Management → API Client              │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS + JWT
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                             │
│  Authentication → Rate Limiting → Request Validation           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVICES                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Auth Service │  │ Asset Service│  │Workflow Svc  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Inventory    │  │ Finance Svc  │  │ Notification │         │
│  │ Service      │  │              │  │ Service      │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                              │
│  PostgreSQL / MySQL → Redis Cache → File Storage (S3)          │
└─────────────────────────────────────────────────────────────────┘
```

### Base API Configuration

```typescript
// Frontend API Client Configuration
const API_CONFIG = {
  baseURL: process.env.VITE_API_BASE_URL, // e.g., https://api.valuekare.com/v1
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Version': '1.0.0'
  }
};

// All requests include:
// - Authorization: Bearer {JWT_TOKEN}
// - X-Organization-ID: {ORG_ID}
// - X-Request-ID: {UUID} (for tracing)
```

---

## 2. Authentication & Session Management

### 2.1 Login Screen → `/components/LoginScreen.tsx`

#### Frontend UI Elements

```typescript
interface LoginFormData {
  organizationId: string;  // Hospital ID (e.g., "HOSP-2024-001")
  email: string;          // User email
  password: string;       // User password
  rememberMe: boolean;    // Session persistence
}
```

#### API Integration

**Endpoint:** `POST /api/v1/auth/login`

**Request:**
```json
{
  "organizationId": "HOSP-2024-001",
  "email": "doctor@valuekare.com",
  "password": "encrypted_password_hash",
  "rememberMe": true,
  "deviceInfo": {
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "192.168.1.100",
    "deviceType": "desktop"
  }
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "id": "user_12345",
      "email": "doctor@valuekare.com",
      "name": "Dr. Sarah Johnson",
      "role": "doctor",
      "panel": "user",
      "organizationId": "HOSP-2024-001",
      "organizationName": "ValueKare Medical Center",
      "department": "Cardiology",
      "ward": "Ward-3A",
      "permissions": [
        "view_equipment",
        "report_issues",
        "request_replacement"
      ]
    },
    "organization": {
      "id": "HOSP-2024-001",
      "name": "ValueKare Medical Center",
      "logo": "https://cdn.valuekare.com/logos/hosp-001.png",
      "timezone": "Asia/Kolkata",
      "currency": "INR"
    }
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": null
  }
}
```

#### Frontend Actions Post-Login

```typescript
// 1. Store tokens securely
localStorage.setItem('accessToken', response.data.accessToken);
localStorage.setItem('refreshToken', response.data.refreshToken);

// 2. Store user context
sessionStorage.setItem('user', JSON.stringify(response.data.user));
sessionStorage.setItem('organization', JSON.stringify(response.data.organization));

// 3. Initialize API client with token
apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
apiClient.defaults.headers.common['X-Organization-ID'] = organizationId;

// 4. Route to role-based dashboard
const dashboardRoute = ROLE_DASHBOARD_MAP[user.role]; // e.g., "/dashboard/doctor"
navigate(dashboardRoute);
```

---

### 2.2 Token Refresh Flow

**Endpoint:** `POST /api/v1/auth/refresh`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token...",
    "expiresIn": 3600
  }
}
```

**Frontend Implementation:**
```typescript
// Intercept 401 responses and auto-refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const newToken = await refreshAccessToken();
      error.config.headers['Authorization'] = `Bearer ${newToken}`;
      return apiClient.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

---

### 2.3 Logout

**Endpoint:** `POST /api/v1/auth/logout`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 3. Role-Based Dashboard Loading

### 3.1 Dashboard Data Requirements by Role

Each role has a unique dashboard with specific data requirements.

#### Doctor Dashboard → `/components/dashboards/ClinicalDashboard.tsx`

**Endpoint:** `GET /api/v1/dashboard/clinical`

**Query Parameters:**
```
?role=doctor&userId={userId}&wardId={wardId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "assignedEquipment": 42,
      "activeIssues": 3,
      "pendingRequests": 5,
      "maintenanceScheduled": 2
    },
    "equipment": [
      {
        "id": "asset_123",
        "assetId": "VNT-2024-001",
        "name": "Ventilator",
        "category": "Critical Care",
        "location": "Ward-3A-Bed-05",
        "status": "Active",
        "lastMaintenance": "2024-11-15T10:30:00Z",
        "nextMaintenance": "2025-01-15T10:30:00Z",
        "assignedTo": ["Dr. Sarah Johnson"],
        "maintenanceHistory": [
          {
            "date": "2024-11-15",
            "type": "Preventive",
            "technician": "John Doe",
            "status": "Completed"
          }
        ]
      }
    ],
    "recentRequests": [
      {
        "id": "req_456",
        "assetName": "Infusion Pump",
        "type": "Replacement",
        "status": "In Review",
        "currentStage": "Level 2 Approval",
        "submittedAt": "2024-12-20T14:30:00Z",
        "urgency": "High"
      }
    ],
    "notifications": [
      {
        "id": "notif_789",
        "type": "maintenance_complete",
        "message": "Ventilator VNT-2024-001 maintenance completed",
        "timestamp": "2024-12-23T09:15:00Z",
        "read": false,
        "priority": "info"
      }
    ],
    "maintenanceUpdates": [
      {
        "ticketId": "maint_101",
        "equipmentName": "ECG Machine",
        "status": "In Progress",
        "assignedTech": "Mike Wilson",
        "eta": "2024-12-24T16:00:00Z"
      }
    ]
  }
}
```

---

#### HOD Dashboard → `/components/dashboards/HODDashboard.tsx`

**Endpoint:** `GET /api/v1/dashboard/hod`

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalAssets": 348,
      "totalValue": 125000000,
      "pendingApprovals": 12,
      "budgetUtilization": 80.6,
      "budgetAllocated": 4800000000,
      "budgetUsed": 3870000000
    },
    "budgetDistribution": [
      { "category": "Medical Equipment", "value": 65000000, "percentage": 52 },
      { "category": "IT Assets", "value": 35000000, "percentage": 28 },
      { "category": "Furniture", "value": 25000000, "percentage": 20 }
    ],
    "assetsByCategory": [
      { "category": "Ventilators", "count": 15 },
      { "category": "Monitors", "count": 45 },
      { "category": "Infusion Pumps", "count": 38 }
    ],
    "monthlyRequestTrends": [
      { "month": "Aug", "requests": 45 },
      { "month": "Sep", "requests": 52 },
      { "month": "Oct", "requests": 48 },
      { "month": "Nov", "requests": 61 },
      { "month": "Dec", "requests": 55 }
    ],
    "pendingApprovals": [
      {
        "id": "req_789",
        "requestedBy": "Dr. Sarah Johnson",
        "assetName": "Defibrillator",
        "type": "New",
        "department": "Emergency",
        "estimatedCost": 350000,
        "urgency": "High",
        "submittedAt": "2024-12-22T10:00:00Z",
        "currentStage": "HOD Approval",
        "previousApprovals": [
          {
            "stage": "Level 3 Approver",
            "approver": "Dr. Amit Patel",
            "status": "Approved",
            "comment": "Critical equipment for emergency dept",
            "timestamp": "2024-12-22T15:30:00Z"
          }
        ]
      }
    ],
    "teamPerformance": [
      {
        "memberName": "Dr. Sarah Johnson",
        "requestsSubmitted": 12,
        "requestsApproved": 10,
        "approvalRate": 83.3
      }
    ],
    "analytics": {
      "approvalRate": 87,
      "avgApprovalTime": 2.4,
      "costApprovedThisMonth": 2850000
    }
  }
}
```

---

#### Inventory Dashboard → `/components/dashboards/InventoryDashboard.tsx`

**Endpoint:** `GET /api/v1/dashboard/inventory`

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalSKUs": 1245,
      "lowStockItems": 34,
      "outOfStock": 8,
      "inventoryValue": 850000000,
      "pendingRequests": 18
    },
    "pendingRequests": [
      {
        "id": "req_890",
        "assetName": "Surgical Table",
        "requestedBy": "Dr. Michael Chen",
        "department": "Surgery",
        "quantity": 1,
        "estimatedCost": 450000,
        "approvedBy": "HOD - Surgery",
        "receivedAt": "2024-12-23T08:00:00Z",
        "stockStatus": "Not Available"
      }
    ],
    "stockLevels": [
      {
        "id": "stock_101",
        "itemName": "Infusion Pump",
        "category": "Medical Equipment",
        "currentStock": 15,
        "minStock": 10,
        "maxStock": 30,
        "status": "Optimal",
        "location": "Main Warehouse - A12",
        "lastUpdated": "2024-12-23T07:00:00Z"
      },
      {
        "id": "stock_102",
        "itemName": "ECG Electrodes",
        "category": "Consumables",
        "currentStock": 150,
        "minStock": 200,
        "maxStock": 500,
        "status": "Low",
        "location": "Store Room - B5",
        "lastUpdated": "2024-12-22T18:30:00Z"
      }
    ],
    "stockMovement": [
      { "date": "2024-12-18", "inbound": 45, "outbound": 32 },
      { "date": "2024-12-19", "inbound": 38, "outbound": 41 },
      { "date": "2024-12-20", "inbound": 52, "outbound": 35 },
      { "date": "2024-12-21", "inbound": 41, "outbound": 39 },
      { "date": "2024-12-22", "inbound": 48, "outbound": 44 }
    ]
  }
}
```

---

#### CFO Dashboard → `/components/dashboards/CFODashboard.tsx`

**Endpoint:** `GET /api/v1/dashboard/cfo`

**Response:**
```json
{
  "success": true,
  "data": {
    "financialKPIs": {
      "totalAssetsValue": 8500000000,
      "valueGrowth": 12.5,
      "annualCapexBudget": 4800000000,
      "budgetUtilized": 3870000000,
      "utilizationPercentage": 80.6,
      "pendingApprovals": 925000,
      "pendingApprovalsCount": 4
    },
    "monthlyPerformance": [
      { "month": "Jul", "budget": 380000000, "actual": 365000000 },
      { "month": "Aug", "budget": 390000000, "actual": 398000000 },
      { "month": "Sep", "budget": 375000000, "actual": 371000000 },
      { "month": "Oct", "budget": 410000000, "actual": 425000000 },
      { "month": "Nov", "budget": 395000000, "actual": 389000000 },
      { "month": "Dec", "budget": 420000000, "actual": 405000000 }
    ],
    "assetDistribution": [
      { "category": "Medical Equipment", "value": 5500000000, "percentage": 64.7 },
      { "category": "IT Infrastructure", "value": 1800000000, "percentage": 21.2 },
      { "category": "Furniture & Fixtures", "value": 1200000000, "percentage": 14.1 }
    ],
    "pendingApprovals": [
      {
        "id": "req_991",
        "assetName": "MRI Machine",
        "requestedBy": "Dr. Sarah Johnson",
        "department": "Radiology",
        "poAmount": 15000000,
        "vendor": "Siemens Healthcare",
        "budgetHead": "Capital Equipment",
        "expectedROI": 18.5,
        "paybackPeriod": 4.2,
        "strategicImportance": "High",
        "approvalJourney": [
          { "stage": "Requestor", "status": "Approved" },
          { "stage": "Level 1", "status": "Approved" },
          { "stage": "Level 2", "status": "Approved" },
          { "stage": "Level 3", "status": "Approved" },
          { "stage": "HOD", "status": "Approved" },
          { "stage": "Inventory", "status": "Forwarded" },
          { "stage": "Purchase", "status": "Approved" },
          { "stage": "Budget Committee", "status": "Approved" },
          { "stage": "CFO", "status": "Pending" }
        ]
      }
    ],
    "floorMapping": [
      {
        "buildingId": "bldg_01",
        "buildingName": "Main Building",
        "floors": [
          {
            "floorId": "floor_01",
            "floorName": "Ground Floor",
            "departments": ["Emergency", "Outpatient"],
            "assetCount": 145,
            "totalValue": 125000000
          },
          {
            "floorId": "floor_02",
            "floorName": "First Floor",
            "departments": ["ICU", "CCU"],
            "assetCount": 98,
            "totalValue": 285000000
          }
        ]
      }
    ],
    "analytics": {
      "approvalRate": 94,
      "avgProcessingTime": 4.8,
      "costSavings": 1240000000,
      "budgetOptimization": 15.2
    }
  }
}
```

---

### 3.2 Unified Dashboard Endpoint (Alternative Approach)

**Endpoint:** `GET /api/v1/dashboard`

**Query Parameters:**
```
?role={role}&userId={userId}&organizationId={orgId}
```

Backend returns role-specific data based on the role parameter. Frontend uses the same endpoint but renders different components.

---

## 4. Request & Approval Workflow (8-Stage)

### 4.1 Request Submission (Requestor Dashboard)

**Screen:** `/components/inventory/RequestorDashboard.tsx`

#### Create New Request

**Endpoint:** `POST /api/v1/requests`

**Request:**
```json
{
  "assetName": "Defibrillator",
  "assetType": "Medical Equipment",
  "category": "Critical Care",
  "department": "Emergency",
  "requestType": "New",
  "issueDescription": "Current defibrillator showing battery issues. New unit required for emergency readiness.",
  "urgencyLevel": "High",
  "amcDueDate": "2025-12-31",
  "estimatedCost": 350000,
  "quantity": 1,
  "justification": "Essential for emergency cardiac arrest response",
  "attachments": [
    {
      "fileName": "equipment_spec.pdf",
      "fileUrl": "https://storage.valuekare.com/uploads/spec_12345.pdf",
      "fileSize": 245678,
      "fileType": "application/pdf"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "requestId": "REQ-2024-1001",
    "status": "Submitted",
    "currentStage": "Level 1 Approval",
    "submittedAt": "2024-12-23T10:30:00Z",
    "trackingUrl": "/requests/REQ-2024-1001",
    "estimatedCompletionDate": "2024-12-30T17:00:00Z"
  },
  "message": "Request submitted successfully. Tracking ID: REQ-2024-1001"
}
```

---

#### Get All Requests (for Requestor)

**Endpoint:** `GET /api/v1/requests`

**Query Parameters:**
```
?userId={userId}&status={status}&page=1&limit=20&sortBy=createdAt&order=desc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "req_1001",
        "requestId": "REQ-2024-1001",
        "assetName": "Defibrillator",
        "type": "New",
        "status": "In Review",
        "currentStage": "Level 2 Approval",
        "urgency": "High",
        "estimatedCost": 350000,
        "submittedAt": "2024-12-23T10:30:00Z",
        "lastUpdated": "2024-12-23T14:15:00Z",
        "canEdit": false,
        "canDelete": false
      },
      {
        "id": "req_1002",
        "requestId": "REQ-2024-1002",
        "assetName": "Surgical Table",
        "type": "Replacement",
        "status": "Pending",
        "currentStage": "Requestor",
        "urgency": "Medium",
        "estimatedCost": 450000,
        "submittedAt": "2024-12-22T09:00:00Z",
        "lastUpdated": "2024-12-22T09:00:00Z",
        "canEdit": true,
        "canDelete": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalRecords": 45,
      "limit": 20
    },
    "summary": {
      "totalRequests": 45,
      "pending": 5,
      "approved": 32,
      "rejected": 8
    }
  }
}
```

---

#### Get Request Details with Timeline

**Endpoint:** `GET /api/v1/requests/{requestId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "request": {
      "id": "req_1001",
      "requestId": "REQ-2024-1001",
      "assetName": "Defibrillator",
      "assetType": "Medical Equipment",
      "category": "Critical Care",
      "department": "Emergency",
      "requestType": "New",
      "issueDescription": "Current defibrillator showing battery issues...",
      "urgencyLevel": "High",
      "estimatedCost": 350000,
      "quantity": 1,
      "requestedBy": {
        "id": "user_123",
        "name": "Dr. Sarah Johnson",
        "email": "doctor@valuekare.com",
        "role": "Doctor",
        "department": "Emergency"
      },
      "submittedAt": "2024-12-23T10:30:00Z",
      "status": "In Review",
      "currentStage": "Level 2 Approval"
    },
    "timeline": [
      {
        "stage": "Requestor",
        "stageName": "Request Submitted",
        "status": "Approved",
        "approver": {
          "id": "user_123",
          "name": "Dr. Sarah Johnson",
          "role": "Doctor",
          "avatar": "https://cdn.valuekare.com/avatars/user_123.jpg"
        },
        "comment": "Request submitted",
        "timestamp": "2024-12-23T10:30:00Z"
      },
      {
        "stage": "Level 1 Approver",
        "stageName": "Level 1 Review",
        "status": "Approved",
        "approver": {
          "id": "user_456",
          "name": "Dr. Raj Kumar",
          "role": "Level 1 Approver",
          "avatar": "https://cdn.valuekare.com/avatars/user_456.jpg"
        },
        "comment": "Approved. Critical equipment for emergency dept.",
        "timestamp": "2024-12-23T11:45:00Z"
      },
      {
        "stage": "Level 2 Approver",
        "stageName": "Level 2 Review",
        "status": "Pending",
        "approver": {
          "id": "user_789",
          "name": "Dr. Priya Sharma",
          "role": "Level 2 Approver",
          "avatar": "https://cdn.valuekare.com/avatars/user_789.jpg"
        },
        "comment": null,
        "timestamp": null
      },
      {
        "stage": "Level 3 Approver",
        "status": "Not Reached",
        "approver": null,
        "comment": null,
        "timestamp": null
      },
      {
        "stage": "HOD",
        "status": "Not Reached",
        "approver": null,
        "comment": null,
        "timestamp": null
      },
      {
        "stage": "Inventory",
        "status": "Not Reached",
        "approver": null,
        "comment": null,
        "timestamp": null
      },
      {
        "stage": "Purchase",
        "status": "Not Reached",
        "approver": null,
        "comment": null,
        "timestamp": null
      },
      {
        "stage": "Budget Committee",
        "status": "Not Reached",
        "approver": null,
        "comment": null,
        "timestamp": null
      },
      {
        "stage": "CFO",
        "status": "Not Reached",
        "approver": null,
        "comment": null,
        "timestamp": null
      }
    ],
    "attachments": [
      {
        "id": "attach_001",
        "fileName": "equipment_spec.pdf",
        "fileUrl": "https://storage.valuekare.com/uploads/spec_12345.pdf",
        "fileSize": 245678,
        "uploadedAt": "2024-12-23T10:30:00Z"
      }
    ]
  }
}
```

---

### 4.2 Approval Actions (All Approver Dashboards)

**Screens:**
- `/components/inventory/ApproverDashboard.tsx` (L1, L2, L3)
- `/components/dashboards/HODDashboard.tsx`
- `/components/dashboards/InventoryDashboard.tsx`
- `/components/dashboards/PurchaseDashboard.tsx`
- `/components/dashboards/BudgetCommitteeDashboard.tsx`
- `/components/dashboards/CFODashboard.tsx`

#### Get Pending Approvals

**Endpoint:** `GET /api/v1/approvals/pending`

**Query Parameters:**
```
?role={role}&userId={userId}&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "approvals": [
      {
        "id": "req_1001",
        "requestId": "REQ-2024-1001",
        "assetName": "Defibrillator",
        "requestType": "New",
        "requestedBy": "Dr. Sarah Johnson",
        "department": "Emergency",
        "urgency": "High",
        "estimatedCost": 350000,
        "submittedAt": "2024-12-23T10:30:00Z",
        "receivedAt": "2024-12-23T11:45:00Z",
        "daysWaiting": 0.5,
        "previousApprovals": [
          {
            "stage": "Level 1 Approver",
            "approver": "Dr. Raj Kumar",
            "status": "Approved",
            "comment": "Approved. Critical equipment.",
            "timestamp": "2024-12-23T11:45:00Z"
          }
        ]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalRecords": 12,
      "limit": 20
    }
  }
}
```

---

#### Approve/Reject Request

**Endpoint:** `POST /api/v1/approvals/{requestId}/action`

**Request:**
```json
{
  "action": "approve",
  "comment": "Approved. Critical equipment for emergency department. Meets all requirements.",
  "conditions": null,
  "metadata": {
    "reviewedDocuments": true,
    "budgetVerified": true,
    "complianceChecked": true
  }
}
```

**Possible Actions:**
- `approve` - Approve and forward to next stage
- `reject` - Reject the request
- `request_info` - Request more information from requestor
- `escalate` - Escalate to higher authority

**Response:**
```json
{
  "success": true,
  "data": {
    "requestId": "REQ-2024-1001",
    "action": "approve",
    "currentStage": "Level 3 Approval",
    "previousStage": "Level 2 Approval",
    "nextApprover": {
      "name": "Dr. Amit Patel",
      "role": "Level 3 Approver",
      "email": "level3@valuekare.com"
    },
    "timestamp": "2024-12-23T14:15:00Z"
  },
  "message": "Request approved and forwarded to Level 3 Approver"
}
```

---

### 4.3 Stage-Specific Actions

#### Inventory Stage: Stock Check & Allocation

**Endpoint:** `POST /api/v1/inventory/allocate`

**Request:**
```json
{
  "requestId": "REQ-2024-1001",
  "action": "allocate",
  "stockItemId": "stock_456",
  "quantity": 1,
  "location": "Main Warehouse - A12",
  "allocationNotes": "Stock allocated from existing inventory"
}
```

**OR if stock not available:**

```json
{
  "requestId": "REQ-2024-1001",
  "action": "forward_to_purchase",
  "reason": "Stock not available. Requires procurement.",
  "recommendedVendor": "vendor_789"
}
```

---

#### Purchase Stage: Create PO

**Endpoint:** `POST /api/v1/purchase/orders`

**Request:**
```json
{
  "requestId": "REQ-2024-1001",
  "vendorId": "vendor_789",
  "poNumber": "PO-2024-5678",
  "poAmount": 350000,
  "expectedDeliveryDate": "2025-01-15",
  "paymentTerms": "30 days net",
  "items": [
    {
      "itemName": "Defibrillator",
      "quantity": 1,
      "unitPrice": 350000,
      "totalPrice": 350000,
      "specifications": "Philips HeartStart MRx"
    }
  ],
  "termsAndConditions": "Standard procurement T&C apply",
  "attachments": ["po_doc_12345.pdf"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "poId": "po_12345",
    "poNumber": "PO-2024-5678",
    "status": "Created",
    "forwardedTo": "Budget Committee",
    "createdAt": "2024-12-23T15:00:00Z"
  }
}
```

---

#### Budget Committee: Budget Compliance Check

**Endpoint:** `GET /api/v1/finance/budget/check`

**Query Parameters:**
```
?requestId={requestId}&budgetHead={budgetHead}&amount={amount}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "budgetHead": "Capital Equipment",
    "allocatedBudget": 2500000000,
    "utilizedBudget": 2015000000,
    "remainingBudget": 485000000,
    "requestedAmount": 350000,
    "projectedBalance": 484650000,
    "complianceStatus": "Within Budget",
    "utilizationPercentage": 80.6,
    "recommendations": "Approved for budget allocation"
  }
}
```

---

#### CFO: Final Approval with Financial Analysis

**Endpoint:** `GET /api/v1/finance/roi-analysis/{requestId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "assetName": "Defibrillator",
    "investmentAmount": 350000,
    "expectedROI": 18.5,
    "paybackPeriod": 4.2,
    "strategicImportance": "High",
    "financialMetrics": {
      "annualRevenue": 125000,
      "annualCost": 25000,
      "netAnnualBenefit": 100000,
      "npv": 385000,
      "irr": 22.3
    },
    "riskAssessment": "Low",
    "recommendation": "Approve"
  }
}
```

---

## 5. Asset Management

### 5.1 Asset List Screen

**Screen:** `/components/admin/AdminAssetManagement.tsx` (Admin)  
**Screen:** `/components/AssetManagement.tsx` (User Panel)

#### Get All Assets

**Endpoint:** `GET /api/v1/assets`

**Query Parameters:**
```
?organizationId={orgId}
&department={dept}
&building={buildingId}
&floor={floorId}
&status={status}
&category={category}
&search={searchTerm}
&page=1
&limit=50
&sortBy=createdAt
&order=desc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assets": [
      {
        "id": "asset_123",
        "assetId": "VNT-2024-001",
        "assetNumber": "A-2024-001",
        "name": "Ventilator",
        "category": "Medical Equipment",
        "subcategory": "Critical Care",
        "make": "Philips",
        "model": "Respironics V60",
        "serialNumber": "SN123456789",
        "assetClass": "Medical",
        "purchaseCost": 1250000,
        "purchaseDate": "2024-01-15",
        "currentValue": 1125000,
        "depreciation": 10,
        "status": "Active",
        "condition": "Good",
        "location": {
          "organizationId": "HOSP-2024-001",
          "organizationName": "ValueKare Medical Center",
          "buildingId": "bldg_01",
          "buildingName": "Main Building",
          "floorId": "floor_02",
          "floorName": "Second Floor",
          "department": "ICU",
          "costCenter": "CC-ICU-001",
          "room": "ICU-05"
        },
        "assignedTo": ["Dr. Sarah Johnson", "Nurse Emily Chen"],
        "warranty": {
          "startDate": "2024-01-15",
          "endDate": "2027-01-15",
          "status": "Active",
          "provider": "Philips Healthcare"
        },
        "amc": {
          "provider": "Philips Service",
          "startDate": "2024-01-15",
          "endDate": "2025-01-15",
          "status": "Active",
          "annualCost": 125000
        },
        "barcode": "https://cdn.valuekare.com/barcodes/VNT-2024-001.png",
        "qrCode": "https://cdn.valuekare.com/qrcodes/VNT-2024-001.png",
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-12-20T14:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 15,
      "totalRecords": 742,
      "limit": 50
    },
    "summary": {
      "totalAssets": 742,
      "totalValue": 8500000000,
      "activeAssets": 698,
      "inMaintenanceAssets": 32,
      "retiredAssets": 12
    }
  }
}
```

---

### 5.2 Add New Asset

**Endpoint:** `POST /api/v1/assets`

**Request:**
```json
{
  "organizationId": "HOSP-2024-001",
  "assetName": "Ventilator",
  "assetNumber": "A-2024-742",
  "category": "Medical Equipment",
  "subcategory": "Critical Care",
  "make": "Philips",
  "model": "Respironics V60",
  "serialNumber": "SN987654321",
  "assetClass": "Medical",
  "purchaseCost": 1250000,
  "purchaseDate": "2024-12-23",
  "quantity": 1,
  "department": "ICU",
  "costCenter": "CC-ICU-001",
  "buildingId": "bldg_01",
  "floorId": "floor_02",
  "room": "ICU-07",
  "description": "High-end ventilator for critical care patients",
  "warranty": {
    "startDate": "2024-12-23",
    "endDate": "2027-12-23",
    "provider": "Philips Healthcare"
  },
  "amc": {
    "required": true,
    "provider": "Philips Service",
    "startDate": "2024-12-23",
    "endDate": "2025-12-23",
    "annualCost": 125000
  },
  "assignedTo": ["user_123", "user_456"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assetId": "VNT-2024-742",
    "id": "asset_742",
    "barcode": "https://cdn.valuekare.com/barcodes/VNT-2024-742.png",
    "qrCode": "https://cdn.valuekare.com/qrcodes/VNT-2024-742.png",
    "createdAt": "2024-12-23T10:30:00Z"
  },
  "message": "Asset created successfully"
}
```

---

### 5.3 Bulk Import Assets

**Endpoint:** `POST /api/v1/assets/import`

**Request (Multipart Form Data):**
```
Content-Type: multipart/form-data

file: assets_import.csv
organizationId: HOSP-2024-001
```

**CSV Format:**
```csv
Asset Name,Category,Make,Model,Serial Number,Purchase Cost,Purchase Date,Department,Building,Floor
Ventilator,Medical Equipment,Philips,V60,SN001,1250000,2024-01-15,ICU,Main Building,Floor 2
ECG Machine,Medical Equipment,GE,MAC 2000,SN002,450000,2024-02-20,Cardiology,Main Building,Floor 3
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRecords": 150,
    "successfulImports": 148,
    "failedImports": 2,
    "errors": [
      {
        "row": 45,
        "error": "Invalid department: 'XYZ' does not exist"
      },
      {
        "row": 89,
        "error": "Duplicate serial number: 'SN123456'"
      }
    ],
    "importId": "import_12345",
    "createdAssets": [
      {
        "assetId": "VNT-2024-743",
        "name": "Ventilator",
        "status": "Created"
      }
    ]
  },
  "message": "Import completed with 148 successes and 2 failures"
}
```

---

### 5.4 Generate Barcodes

**Endpoint:** `POST /api/v1/assets/barcode/generate`

**Request:**
```json
{
  "assetIds": ["asset_123", "asset_456", "asset_789"],
  "format": "Code128",
  "size": "medium",
  "includeQR": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "barcodes": [
      {
        "assetId": "VNT-2024-001",
        "barcodeUrl": "https://cdn.valuekare.com/barcodes/VNT-2024-001.png",
        "qrCodeUrl": "https://cdn.valuekare.com/qrcodes/VNT-2024-001.png"
      }
    ],
    "batchPrintUrl": "https://cdn.valuekare.com/batch/barcode_batch_12345.pdf"
  }
}
```

---

### 5.5 Export Assets to CSV

**Endpoint:** `GET /api/v1/assets/export`

**Query Parameters:**
```
?organizationId={orgId}&department={dept}&format=csv
```

**Response:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="assets_export_2024-12-23.csv"

Asset ID,Name,Category,Make,Model,Serial Number,Purchase Cost,Status,Location
VNT-2024-001,Ventilator,Medical Equipment,Philips,V60,SN123,1250000,Active,"ICU, Floor 2"
```

---

### 5.6 Asset Details

**Endpoint:** `GET /api/v1/assets/{assetId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "asset": {
      "id": "asset_123",
      "assetId": "VNT-2024-001",
      "name": "Ventilator",
      "category": "Medical Equipment",
      "make": "Philips",
      "model": "Respironics V60",
      "serialNumber": "SN123456789",
      "purchaseCost": 1250000,
      "currentValue": 1125000,
      "status": "Active",
      "location": {
        "building": "Main Building",
        "floor": "Second Floor",
        "department": "ICU",
        "room": "ICU-05"
      },
      "assignedTo": ["Dr. Sarah Johnson", "Nurse Emily Chen"],
      "barcode": "https://cdn.valuekare.com/barcodes/VNT-2024-001.png",
      "qrCode": "https://cdn.valuekare.com/qrcodes/VNT-2024-001.png"
    },
    "maintenanceHistory": [
      {
        "id": "maint_101",
        "type": "Preventive",
        "date": "2024-11-15",
        "technician": "John Doe",
        "description": "Routine maintenance and calibration",
        "cost": 15000,
        "status": "Completed"
      }
    ],
    "transferHistory": [
      {
        "id": "transfer_201",
        "fromLocation": "ICU-03",
        "toLocation": "ICU-05",
        "transferredBy": "Dr. Michael Chen",
        "date": "2024-10-05",
        "reason": "Department reorganization"
      }
    ],
    "auditHistory": [
      {
        "id": "audit_301",
        "auditDate": "2024-09-15",
        "auditor": "Audit Team A",
        "status": "Verified",
        "condition": "Good",
        "remarks": "Asset in good condition, properly maintained"
      }
    ]
  }
}
```

---

### 5.7 Update Asset

**Endpoint:** `PUT /api/v1/assets/{assetId}`

**Request:**
```json
{
  "status": "Under Maintenance",
  "location": {
    "room": "ICU-08"
  },
  "assignedTo": ["user_789"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assetId": "VNT-2024-001",
    "updatedFields": ["status", "location", "assignedTo"],
    "updatedAt": "2024-12-23T15:30:00Z"
  },
  "message": "Asset updated successfully"
}
```

---

### 5.8 Transfer Asset

**Endpoint:** `POST /api/v1/assets/{assetId}/transfer`

**Request:**
```json
{
  "fromDepartment": "ICU",
  "toDepartment": "Emergency",
  "fromBuilding": "bldg_01",
  "toBuilding": "bldg_02",
  "fromFloor": "floor_02",
  "toFloor": "floor_01",
  "fromRoom": "ICU-05",
  "toRoom": "ER-12",
  "transferredBy": "user_123",
  "reason": "Emergency department requirement",
  "approvedBy": "user_456",
  "effectiveDate": "2024-12-24"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transferId": "transfer_401",
    "assetId": "VNT-2024-001",
    "status": "Completed",
    "effectiveDate": "2024-12-24T00:00:00Z"
  },
  "message": "Asset transfer completed successfully"
}
```

---

## 6. Inventory & Procurement

### 6.1 Inventory Dashboard

**Screen:** `/components/dashboards/InventoryDashboard.tsx`

#### Get Stock Levels

**Endpoint:** `GET /api/v1/inventory/stock`

**Query Parameters:**
```
?organizationId={orgId}&status={status}&category={category}&page=1&limit=50
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stockItems": [
      {
        "id": "stock_101",
        "itemName": "Infusion Pump",
        "category": "Medical Equipment",
        "currentStock": 15,
        "minStock": 10,
        "maxStock": 30,
        "reorderPoint": 12,
        "status": "Optimal",
        "location": "Main Warehouse - A12",
        "lastRestocked": "2024-12-15T10:00:00Z",
        "lastUpdated": "2024-12-23T07:00:00Z",
        "unitCost": 85000,
        "totalValue": 1275000
      },
      {
        "id": "stock_102",
        "itemName": "ECG Electrodes",
        "category": "Consumables",
        "currentStock": 150,
        "minStock": 200,
        "maxStock": 500,
        "reorderPoint": 250,
        "status": "Low",
        "location": "Store Room - B5",
        "lastRestocked": "2024-11-30T14:00:00Z",
        "lastUpdated": "2024-12-22T18:30:00Z",
        "unitCost": 25,
        "totalValue": 3750
      }
    ],
    "summary": {
      "totalSKUs": 1245,
      "lowStockItems": 34,
      "outOfStock": 8,
      "totalInventoryValue": 850000000
    }
  }
}
```

---

#### Stock Movement Tracking

**Endpoint:** `GET /api/v1/inventory/movements`

**Query Parameters:**
```
?startDate=2024-12-01&endDate=2024-12-23&type={inbound|outbound}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "movements": [
      {
        "date": "2024-12-23",
        "inbound": 48,
        "outbound": 35,
        "net": 13
      },
      {
        "date": "2024-12-22",
        "inbound": 52,
        "outbound": 41,
        "net": 11
      }
    ],
    "summary": {
      "totalInbound": 485,
      "totalOutbound": 412,
      "netMovement": 73
    }
  }
}
```

---

#### Allocate Stock

**Endpoint:** `POST /api/v1/inventory/allocate`

**Request:**
```json
{
  "requestId": "REQ-2024-1001",
  "stockItemId": "stock_101",
  "quantity": 1,
  "allocatedTo": {
    "department": "ICU",
    "userId": "user_123",
    "userName": "Dr. Sarah Johnson"
  },
  "location": "Main Warehouse - A12",
  "notes": "Stock allocated for approved request"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "allocationId": "alloc_501",
    "stockItemId": "stock_101",
    "quantityAllocated": 1,
    "remainingStock": 14,
    "status": "Allocated",
    "requestId": "REQ-2024-1001",
    "requestStatus": "Fulfilled",
    "timestamp": "2024-12-23T10:00:00Z"
  },
  "message": "Stock allocated successfully. Request marked as Fulfilled."
}
```

---

### 6.2 Purchase Management

**Screen:** `/components/dashboards/PurchaseDashboard.tsx`

#### Get Vendors

**Endpoint:** `GET /api/v1/vendors`

**Response:**
```json
{
  "success": true,
  "data": {
    "vendors": [
      {
        "id": "vendor_789",
        "vendorCode": "VEN-001",
        "name": "Siemens Healthcare Pvt Ltd",
        "category": "Medical Equipment",
        "rating": 4.5,
        "totalPOs": 245,
        "activeContracts": 12,
        "complianceStatus": "Compliant",
        "onTimeDeliveryRate": 87,
        "contactPerson": "Rajesh Kumar",
        "email": "rajesh@siemens.com",
        "phone": "+91-9876543210",
        "address": "Mumbai, Maharashtra",
        "gstNumber": "27AABCS1429B1ZT",
        "panNumber": "AABCS1429B"
      }
    ]
  }
}
```

---

#### Create Purchase Order

**Endpoint:** `POST /api/v1/purchase/orders`

**Request:**
```json
{
  "requestId": "REQ-2024-1001",
  "vendorId": "vendor_789",
  "poNumber": "PO-2024-5678",
  "poAmount": 350000,
  "currency": "INR",
  "expectedDeliveryDate": "2025-01-15",
  "paymentTerms": "30 days net",
  "deliveryAddress": {
    "building": "Main Building",
    "floor": "Ground Floor",
    "department": "Stores",
    "address": "ValueKare Medical Center, Mumbai, MH 400001"
  },
  "items": [
    {
      "itemName": "Defibrillator",
      "description": "Philips HeartStart MRx",
      "quantity": 1,
      "unitPrice": 350000,
      "totalPrice": 350000,
      "specifications": "As per attached technical spec",
      "hsnCode": "9018"
    }
  ],
  "taxes": {
    "cgst": 9,
    "sgst": 9,
    "totalTax": 63000
  },
  "totalAmount": 413000,
  "termsAndConditions": "Standard procurement T&C apply as per ValueKare policy",
  "attachments": ["po_doc_12345.pdf", "tech_spec_67890.pdf"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "poId": "po_12345",
    "poNumber": "PO-2024-5678",
    "status": "Created",
    "vendorName": "Siemens Healthcare Pvt Ltd",
    "totalAmount": 413000,
    "forwardedTo": "Budget Committee",
    "createdAt": "2024-12-23T15:00:00Z",
    "poDocument": "https://cdn.valuekare.com/pos/PO-2024-5678.pdf"
  },
  "message": "Purchase Order created and forwarded to Budget Committee"
}
```

---

#### Get Purchase Orders

**Endpoint:** `GET /api/v1/purchase/orders`

**Query Parameters:**
```
?status={pending|active|completed}&vendorId={vendorId}&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "purchaseOrders": [
      {
        "id": "po_12345",
        "poNumber": "PO-2024-5678",
        "vendorName": "Siemens Healthcare Pvt Ltd",
        "poAmount": 413000,
        "status": "Active",
        "createdDate": "2024-12-23",
        "expectedDelivery": "2025-01-15",
        "approvalStatus": "Budget Approved",
        "deliveryStatus": "Pending",
        "paymentStatus": "Pending"
      }
    ],
    "summary": {
      "pendingPOs": 18,
      "activePOs": 45,
      "completedPOs": 230,
      "totalPOValue": 125000000
    }
  }
}
```

---

## 7. Maintenance & Biomedical

### 7.1 Report Issue (Clinical Staff)

**Screen:** `/components/dashboards/ClinicalDashboard.tsx`

**Endpoint:** `POST /api/v1/maintenance/tickets`

**Request:**
```json
{
  "assetId": "asset_123",
  "reportedBy": "user_123",
  "urgency": "High",
  "issueType": "Breakdown",
  "description": "Ventilator showing error code E-45. Unable to operate.",
  "location": "ICU-05",
  "impact": "Critical - Patient care affected",
  "attachments": [
    {
      "fileName": "error_screen.jpg",
      "fileUrl": "https://storage.valuekare.com/tickets/error_12345.jpg"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ticketId": "MAINT-2024-8901",
    "ticketNumber": "MAINT-2024-8901",
    "assetId": "VNT-2024-001",
    "status": "Open",
    "priority": "High",
    "assignedTo": null,
    "createdAt": "2024-12-23T11:00:00Z",
    "estimatedResolution": "2024-12-23T17:00:00Z"
  },
  "message": "Maintenance ticket created. Biomedical team notified."
}
```

---

### 7.2 Get Maintenance Tickets

**Screen:** `/components/dashboards/BiomedicalDashboard.tsx`

**Endpoint:** `GET /api/v1/maintenance/tickets`

**Query Parameters:**
```
?status={open|in_progress|completed}&priority={critical|high|medium|low}&assignedTo={userId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": "ticket_8901",
        "ticketNumber": "MAINT-2024-8901",
        "assetId": "VNT-2024-001",
        "assetName": "Ventilator",
        "location": "ICU-05",
        "reportedBy": {
          "id": "user_123",
          "name": "Dr. Sarah Johnson",
          "role": "Doctor"
        },
        "urgency": "High",
        "issueType": "Breakdown",
        "description": "Ventilator showing error code E-45",
        "status": "Open",
        "assignedTo": null,
        "createdAt": "2024-12-23T11:00:00Z",
        "daysOpen": 0.5
      }
    ],
    "summary": {
      "openTickets": 12,
      "inProgressTickets": 8,
      "completedToday": 5,
      "avgResolutionTime": 4.2
    }
  }
}
```

---

### 7.3 Assign Technician & Update Status

**Endpoint:** `PUT /api/v1/maintenance/tickets/{ticketId}`

**Request:**
```json
{
  "status": "In Progress",
  "assignedTo": "user_789",
  "assignedTechnicianName": "Mike Wilson",
  "estimatedCompletionTime": "2024-12-23T16:00:00Z",
  "workNotes": "Technician assigned. Diagnostics in progress."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ticketId": "MAINT-2024-8901",
    "status": "In Progress",
    "assignedTo": "Mike Wilson",
    "updatedAt": "2024-12-23T11:30:00Z"
  },
  "message": "Ticket updated. Notification sent to Dr. Sarah Johnson."
}
```

---

### 7.4 Close Ticket

**Endpoint:** `PUT /api/v1/maintenance/tickets/{ticketId}/close`

**Request:**
```json
{
  "resolution": "Replaced faulty circuit board. System tested and operational.",
  "partsUsed": [
    {
      "partName": "Circuit Board Model XYZ",
      "quantity": 1,
      "cost": 25000
    }
  ],
  "totalCost": 25000,
  "workHours": 3.5,
  "completedBy": "user_789",
  "completionNotes": "Equipment tested for 30 minutes. All parameters normal.",
  "assetStatus": "Active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ticketId": "MAINT-2024-8901",
    "status": "Completed",
    "completedAt": "2024-12-23T15:30:00Z",
    "resolutionTime": 4.5,
    "totalCost": 25000
  },
  "message": "Ticket closed. Equipment marked as Active. Notification sent to requestor."
}
```

---

### 7.5 Maintenance Calendar

**Screen:** `/components/MaintenanceCalendar.tsx`

**Endpoint:** `GET /api/v1/maintenance/calendar`

**Query Parameters:**
```
?startDate=2024-12-01&endDate=2024-12-31&type={preventive|calibration|repair}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "cal_101",
        "assetId": "VNT-2024-001",
        "assetName": "Ventilator",
        "eventType": "Preventive Maintenance",
        "scheduledDate": "2024-12-28",
        "assignedTechnician": "John Doe",
        "status": "Scheduled",
        "duration": 2,
        "notes": "Quarterly preventive maintenance"
      },
      {
        "id": "cal_102",
        "assetId": "ECG-2024-045",
        "assetName": "ECG Machine",
        "eventType": "Calibration",
        "scheduledDate": "2024-12-25",
        "assignedTechnician": "Mike Wilson",
        "status": "Scheduled",
        "duration": 1,
        "notes": "Annual calibration due"
      }
    ]
  }
}
```

---

## 8. Audit & Compliance

### 8.1 Generate Audit

**Screen:** `/components/admin/AuditManagement.tsx`

**Endpoint:** `POST /api/v1/audits`

**Request:**
```json
{
  "auditType": "Physical Verification",
  "organizationId": "HOSP-2024-001",
  "scope": {
    "buildings": ["bldg_01", "bldg_02"],
    "floors": ["floor_01", "floor_02"],
    "departments": ["ICU", "Emergency"],
    "costCenters": ["CC-ICU-001"]
  },
  "auditPeriod": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-15"
  },
  "auditTeam": [
    {
      "userId": "user_audit_01",
      "name": "Audit Team Lead",
      "role": "Lead Auditor"
    }
  ],
  "objectives": "Verify physical existence and condition of all medical equipment"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "auditId": "audit_2025_001",
    "auditNumber": "AUD-2025-001",
    "status": "Scheduled",
    "totalAssetsInScope": 348,
    "createdAt": "2024-12-23T10:00:00Z",
    "auditTeam": ["Audit Team Lead"]
  },
  "message": "Audit created successfully. Audit team notified."
}
```

---

### 8.2 Get Audits

**Endpoint:** `GET /api/v1/audits`

**Query Parameters:**
```
?status={scheduled|in_progress|completed}&organizationId={orgId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "audits": [
      {
        "id": "audit_2025_001",
        "auditNumber": "AUD-2025-001",
        "auditType": "Physical Verification",
        "status": "In Progress",
        "totalAssets": 348,
        "verifiedAssets": 125,
        "progressPercentage": 35.9,
        "startDate": "2025-01-01",
        "endDate": "2025-01-15",
        "auditTeam": ["Audit Team Lead"],
        "createdAt": "2024-12-23T10:00:00Z"
      }
    ],
    "summary": {
      "totalAudits": 45,
      "scheduledAudits": 5,
      "inProgressAudits": 2,
      "completedAudits": 38
    }
  }
}
```

---

### 8.3 Verify Asset (Barcode Scan)

**Screen:** `/components/user/UserAuditManagement.tsx`

**Endpoint:** `POST /api/v1/audits/{auditId}/verify`

**Request:**
```json
{
  "assetId": "VNT-2024-001",
  "scannedBy": "user_audit_01",
  "scanMethod": "QR Code",
  "verificationData": {
    "physicalCondition": "Good",
    "location": "ICU-05",
    "operational": true,
    "remarks": "Asset in good condition, location verified",
    "photos": [
      "https://storage.valuekare.com/audits/photo_12345.jpg"
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "verificationId": "verify_12345",
    "assetId": "VNT-2024-001",
    "status": "Verified",
    "condition": "Good",
    "variance": "None",
    "timestamp": "2025-01-05T14:30:00Z",
    "auditProgress": {
      "verified": 126,
      "total": 348,
      "percentage": 36.2
    }
  },
  "message": "Asset verified successfully"
}
```

---

### 8.4 Complete Audit

**Endpoint:** `PUT /api/v1/audits/{auditId}/complete`

**Request:**
```json
{
  "completedBy": "user_audit_01",
  "summary": {
    "totalAssets": 348,
    "verifiedAssets": 345,
    "missingAssets": 2,
    "damagedAssets": 1,
    "variance": 3
  },
  "findings": "2 assets missing from ICU, 1 asset damaged in Emergency dept",
  "recommendations": "Immediate investigation required for missing assets",
  "reportAttachment": "https://storage.valuekare.com/reports/audit_2025_001.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "auditId": "AUD-2025-001",
    "status": "Completed",
    "completedAt": "2025-01-15T17:00:00Z",
    "reportUrl": "https://storage.valuekare.com/reports/audit_2025_001.pdf"
  },
  "message": "Audit completed successfully"
}
```

---

## 9. Finance & CFO Module

### 9.1 Budget Overview

**Screen:** `/components/dashboards/BudgetCommitteeDashboard.tsx`  
**Screen:** `/components/dashboards/CFODashboard.tsx`

**Endpoint:** `GET /api/v1/finance/budgets`

**Query Parameters:**
```
?fiscalYear=2024-25&organizationId={orgId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalAllocated": 4800000000,
      "totalUtilized": 3870000000,
      "utilizationPercentage": 80.6,
      "remaining": 930000000,
      "committedButNotSpent": 125000000
    },
    "budgetHeads": [
      {
        "id": "budget_head_01",
        "name": "Capital Equipment",
        "allocated": 2500000000,
        "utilized": 2015000000,
        "utilizationPercentage": 80.6,
        "remaining": 485000000,
        "status": "Within Budget"
      },
      {
        "id": "budget_head_02",
        "name": "IT Infrastructure",
        "allocated": 800000000,
        "utilized": 720000000,
        "utilizationPercentage": 90.0,
        "remaining": 80000000,
        "status": "Near Limit"
      },
      {
        "id": "budget_head_03",
        "name": "Furniture & Fixtures",
        "allocated": 500000000,
        "utilized": 385000000,
        "utilizationPercentage": 77.0,
        "remaining": 115000000,
        "status": "Within Budget"
      }
    ],
    "monthlySpend": [
      { "month": "Apr", "planned": 380000000, "actual": 365000000 },
      { "month": "May", "planned": 390000000, "actual": 398000000 },
      { "month": "Jun", "planned": 375000000, "actual": 371000000 }
    ],
    "departmentWise": [
      { "department": "ICU", "allocated": 650000000, "utilized": 520000000, "percentage": 80.0 },
      { "department": "Emergency", "allocated": 450000000, "utilized": 385000000, "percentage": 85.6 }
    ]
  }
}
```

---

### 9.2 ROI Analysis

**Endpoint:** `GET /api/v1/finance/roi-analysis/{requestId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "requestId": "REQ-2024-1001",
    "assetName": "Defibrillator",
    "investmentAmount": 350000,
    "financialMetrics": {
      "expectedROI": 18.5,
      "paybackPeriod": 4.2,
      "npv": 385000,
      "irr": 22.3,
      "annualRevenue": 125000,
      "annualCost": 25000,
      "netAnnualBenefit": 100000
    },
    "strategicImportance": "High",
    "riskAssessment": "Low",
    "qualitativeFactors": [
      "Critical for emergency response",
      "Patient safety improvement",
      "Regulatory compliance"
    ],
    "recommendation": "Approve",
    "competitiveAnalysis": {
      "marketPrice": 350000,
      "proposedPrice": 350000,
      "variance": 0
    }
  }
}
```

---

### 9.3 Floor Mapping

**Endpoint:** `GET /api/v1/assets/floor-mapping`

**Query Parameters:**
```
?organizationId={orgId}&buildingId={buildingId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "building": {
      "id": "bldg_01",
      "name": "Main Building",
      "totalFloors": 5,
      "totalAssets": 542,
      "totalValue": 3850000000
    },
    "floors": [
      {
        "id": "floor_01",
        "name": "Ground Floor",
        "level": 0,
        "departments": [
          {
            "id": "dept_emergency",
            "name": "Emergency",
            "assetCount": 85,
            "totalValue": 425000000,
            "categories": [
              { "name": "Ventilators", "count": 5 },
              { "name": "Monitors", "count": 15 },
              { "name": "Defibrillators", "count": 8 }
            ]
          },
          {
            "id": "dept_outpatient",
            "name": "Outpatient",
            "assetCount": 60,
            "totalValue": 185000000
          }
        ],
        "totalAssets": 145,
        "totalValue": 610000000
      },
      {
        "id": "floor_02",
        "name": "First Floor",
        "level": 1,
        "departments": [
          {
            "id": "dept_icu",
            "name": "ICU",
            "assetCount": 68,
            "totalValue": 425000000
          },
          {
            "id": "dept_ccu",
            "name": "CCU",
            "assetCount": 30,
            "totalValue": 285000000
          }
        ],
        "totalAssets": 98,
        "totalValue": 710000000
      }
    ]
  }
}
```

---

### 9.4 Cost Savings Tracking

**Endpoint:** `GET /api/v1/finance/cost-savings`

**Query Parameters:**
```
?fiscalYear=2024-25&category={procurement|maintenance|energy}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCostSavings": 1240000000,
    "savingsByCategory": [
      {
        "category": "Procurement Optimization",
        "savings": 850000000,
        "percentage": 68.5,
        "details": "Bulk purchasing and vendor negotiations"
      },
      {
        "category": "Preventive Maintenance",
        "savings": 290000000,
        "percentage": 23.4,
        "details": "Reduced breakdown costs through preventive care"
      },
      {
        "category": "Energy Efficiency",
        "savings": 100000000,
        "percentage": 8.1,
        "details": "Energy-efficient equipment replacements"
      }
    ],
    "monthlyTrend": [
      { "month": "Apr", "savings": 95000000 },
      { "month": "May", "savings": 105000000 },
      { "month": "Jun", "savings": 98000000 }
    ]
  }
}
```

---

## 10. User & Entity Management

### 10.1 User Management (Admin)

**Screen:** `/components/admin/UserManagement.tsx`

#### Get All Users

**Endpoint:** `GET /api/v1/users`

**Query Parameters:**
```
?organizationId={orgId}&role={role}&status={active|inactive}&page=1&limit=50
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "employeeId": "EMP-2024-001",
        "name": "Dr. Sarah Johnson",
        "email": "doctor@valuekare.com",
        "role": "doctor",
        "department": "Cardiology",
        "ward": "Ward-3A",
        "status": "Active",
        "joinedDate": "2024-01-15",
        "lastLogin": "2024-12-23T09:30:00Z",
        "permissions": ["view_equipment", "report_issues", "request_replacement"],
        "parentUser": {
          "id": "user_456",
          "name": "Dr. Michael Chen",
          "role": "HOD"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 8,
      "totalRecords": 385
    },
    "summary": {
      "totalUsers": 385,
      "activeUsers": 362,
      "inactiveUsers": 23
    }
  }
}
```

---

#### Create User

**Endpoint:** `POST /api/v1/users`

**Request:**
```json
{
  "organizationId": "HOSP-2024-001",
  "employeeId": "EMP-2024-386",
  "name": "Dr. Amit Patel",
  "email": "amit.patel@valuekare.com",
  "password": "SecurePass123!",
  "role": "doctor",
  "department": "Neurology",
  "ward": "Ward-5B",
  "contactNumber": "+91-9876543210",
  "parentUserId": "user_789",
  "permissions": ["view_equipment", "report_issues", "request_replacement"],
  "joinedDate": "2024-12-24"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_386",
    "employeeId": "EMP-2024-386",
    "email": "amit.patel@valuekare.com",
    "temporaryPassword": "TempPass123!",
    "resetPasswordRequired": true,
    "createdAt": "2024-12-23T15:00:00Z"
  },
  "message": "User created successfully. Temporary password sent to email."
}
```

---

#### Update User

**Endpoint:** `PUT /api/v1/users/{userId}`

**Request:**
```json
{
  "department": "Emergency",
  "ward": "ER-1A",
  "status": "Active",
  "permissions": ["view_equipment", "report_issues", "request_replacement", "approve_requests"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "updatedFields": ["department", "ward", "permissions"],
    "updatedAt": "2024-12-23T16:00:00Z"
  },
  "message": "User updated successfully"
}
```

---

### 10.2 User Rights Management

**Screen:** `/components/admin/UserRightsManagement.tsx`

**Endpoint:** `GET /api/v1/users/{userId}/permissions`

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "role": "doctor",
    "permissions": {
      "dashboard": {
        "view": true,
        "edit": false
      },
      "assets": {
        "view": true,
        "add": false,
        "edit": false,
        "delete": false,
        "transfer": false
      },
      "maintenance": {
        "view": true,
        "create_ticket": true,
        "update_ticket": false,
        "close_ticket": false
      },
      "requests": {
        "view": true,
        "create": true,
        "edit": true,
        "delete": true,
        "approve": false
      },
      "reports": {
        "view": true,
        "export": false
      },
      "inventory": {
        "view": false,
        "manage": false
      },
      "finance": {
        "view": false,
        "approve": false
      }
    }
  }
}
```

---

#### Update Permissions

**Endpoint:** `PUT /api/v1/users/{userId}/permissions`

**Request:**
```json
{
  "permissions": {
    "requests": {
      "approve": true
    },
    "reports": {
      "export": true
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "updatedPermissions": ["requests.approve", "reports.export"],
    "updatedAt": "2024-12-23T16:30:00Z"
  },
  "message": "Permissions updated successfully"
}
```

---

### 10.3 Entity Setup

**Screen:** `/components/admin/EntitySetup.tsx`

#### Get Organizations

**Endpoint:** `GET /api/v1/organizations`

**Response:**
```json
{
  "success": true,
  "data": {
    "organizations": [
      {
        "id": "HOSP-2024-001",
        "name": "ValueKare Medical Center",
        "type": "Hospital",
        "address": "Mumbai, Maharashtra 400001",
        "contactPerson": "Dr. Rajesh Kumar",
        "email": "admin@valuekare.com",
        "phone": "+91-22-12345678",
        "totalBuildings": 3,
        "totalAssets": 1245,
        "status": "Active",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

#### Get Buildings

**Endpoint:** `GET /api/v1/organizations/{orgId}/buildings`

**Response:**
```json
{
  "success": true,
  "data": {
    "buildings": [
      {
        "id": "bldg_01",
        "name": "Main Building",
        "code": "MB-01",
        "totalFloors": 5,
        "totalDepartments": 12,
        "totalAssets": 542,
        "address": "Main Campus, ValueKare Medical Center"
      },
      {
        "id": "bldg_02",
        "name": "Research Block",
        "code": "RB-01",
        "totalFloors": 3,
        "totalDepartments": 5,
        "totalAssets": 185
      }
    ]
  }
}
```

---

#### Get Floors

**Endpoint:** `GET /api/v1/buildings/{buildingId}/floors`

**Response:**
```json
{
  "success": true,
  "data": {
    "floors": [
      {
        "id": "floor_01",
        "name": "Ground Floor",
        "level": 0,
        "departments": ["Emergency", "Outpatient", "Radiology"],
        "totalAssets": 145
      },
      {
        "id": "floor_02",
        "name": "First Floor",
        "level": 1,
        "departments": ["ICU", "CCU"],
        "totalAssets": 98
      }
    ]
  }
}
```

---

#### Get Departments

**Endpoint:** `GET /api/v1/organizations/{orgId}/departments`

**Response:**
```json
{
  "success": true,
  "data": {
    "departments": [
      {
        "id": "dept_icu",
        "name": "ICU",
        "code": "ICU-01",
        "building": "Main Building",
        "floor": "First Floor",
        "headOfDepartment": "Dr. Michael Chen",
        "totalAssets": 68,
        "totalStaff": 25,
        "costCenters": ["CC-ICU-001", "CC-ICU-002"]
      }
    ]
  }
}
```

---

#### Get Cost Centers

**Endpoint:** `GET /api/v1/organizations/{orgId}/cost-centers`

**Response:**
```json
{
  "success": true,
  "data": {
    "costCenters": [
      {
        "id": "cc_001",
        "code": "CC-ICU-001",
        "name": "ICU - Critical Care Equipment",
        "department": "ICU",
        "budgetAllocated": 650000000,
        "budgetUtilized": 520000000,
        "totalAssets": 45
      }
    ]
  }
}
```

---

## 11. Notifications & Real-Time

### 11.1 Get Notifications

**Endpoint:** `GET /api/v1/notifications`

**Query Parameters:**
```
?userId={userId}&unreadOnly=true&limit=50
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_789",
        "type": "maintenance_complete",
        "priority": "info",
        "title": "Maintenance Completed",
        "message": "Ventilator VNT-2024-001 maintenance completed and ready for use",
        "from": {
          "id": "user_bio_01",
          "name": "Biomedical Team",
          "role": "Biomedical Manager"
        },
        "metadata": {
          "assetId": "VNT-2024-001",
          "ticketId": "MAINT-2024-8901",
          "actionUrl": "/assets/VNT-2024-001"
        },
        "read": false,
        "timestamp": "2024-12-23T09:15:00Z"
      },
      {
        "id": "notif_790",
        "type": "request_approved",
        "priority": "success",
        "title": "Request Approved",
        "message": "Your replacement request for Defibrillator has been approved by Level 2 Approver",
        "from": {
          "id": "user_789",
          "name": "Dr. Priya Sharma",
          "role": "Level 2 Approver"
        },
        "metadata": {
          "requestId": "REQ-2024-1001",
          "currentStage": "Level 3 Approval",
          "actionUrl": "/requests/REQ-2024-1001"
        },
        "read": false,
        "timestamp": "2024-12-23T08:45:00Z"
      },
      {
        "id": "notif_791",
        "type": "low_stock_alert",
        "priority": "warning",
        "title": "Low Stock Alert",
        "message": "ECG Electrodes stock is below minimum level (150/200)",
        "from": {
          "id": "system",
          "name": "Inventory System",
          "role": "System"
        },
        "metadata": {
          "stockItemId": "stock_102",
          "currentStock": 150,
          "minStock": 200,
          "actionUrl": "/inventory/stock/stock_102"
        },
        "read": true,
        "timestamp": "2024-12-22T18:30:00Z"
      }
    ],
    "summary": {
      "totalNotifications": 45,
      "unreadCount": 12,
      "byPriority": {
        "critical": 2,
        "warning": 5,
        "info": 5
      }
    }
  }
}
```

---

### 11.2 Mark Notification as Read

**Endpoint:** `PUT /api/v1/notifications/{notificationId}/read`

**Response:**
```json
{
  "success": true,
  "data": {
    "notificationId": "notif_789",
    "read": true,
    "readAt": "2024-12-23T10:00:00Z"
  }
}
```

---

### 11.3 WebSocket/Real-Time Integration

**WebSocket Connection:**
```
wss://api.valuekare.com/v1/ws?token={JWT_TOKEN}
```

**Client-Side Implementation:**
```typescript
const ws = new WebSocket(`wss://api.valuekare.com/v1/ws?token=${accessToken}`);

ws.onopen = () => {
  console.log('WebSocket connected');
  // Subscribe to channels
  ws.send(JSON.stringify({
    type: 'subscribe',
    channels: ['notifications', 'approvals', 'maintenance']
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'notification':
      // Show toast notification
      toast(data.message, { type: data.priority });
      // Update notification badge count
      updateNotificationBadge(data.unreadCount);
      break;
      
    case 'approval_update':
      // Refresh approval dashboard
      refreshApprovalData();
      break;
      
    case 'maintenance_update':
      // Update maintenance ticket status
      updateMaintenanceTicket(data.ticketId, data.status);
      break;
  }
};
```

**Server Push Events:**
```json
{
  "type": "notification",
  "data": {
    "id": "notif_792",
    "type": "request_approved",
    "message": "Your request has been approved",
    "priority": "success",
    "unreadCount": 13
  }
}
```

---

## 12. Reports & Analytics

### 12.1 Generate Report

**Screen:** `/components/Reports.tsx`

**Endpoint:** `POST /api/v1/reports/generate`

**Request:**
```json
{
  "reportType": "asset_utilization",
  "organizationId": "HOSP-2024-001",
  "filters": {
    "department": "ICU",
    "dateRange": {
      "startDate": "2024-01-01",
      "endDate": "2024-12-31"
    },
    "assetCategory": "Medical Equipment"
  },
  "format": "pdf",
  "includeCharts": true,
  "groupBy": "category"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reportId": "report_12345",
    "reportName": "Asset Utilization Report - ICU - 2024",
    "format": "pdf",
    "downloadUrl": "https://cdn.valuekare.com/reports/asset_utilization_12345.pdf",
    "generatedAt": "2024-12-23T16:00:00Z",
    "expiresAt": "2024-12-30T16:00:00Z",
    "fileSize": 2450678
  },
  "message": "Report generated successfully"
}
```

---

### 12.2 Get Report Types

**Endpoint:** `GET /api/v1/reports/types`

**Response:**
```json
{
  "success": true,
  "data": {
    "reportTypes": [
      {
        "id": "asset_utilization",
        "name": "Asset Utilization Report",
        "description": "Detailed analysis of asset usage and efficiency",
        "availableFilters": ["department", "category", "dateRange", "status"],
        "formats": ["pdf", "excel", "csv"]
      },
      {
        "id": "maintenance_summary",
        "name": "Maintenance Summary Report",
        "description": "Overview of maintenance activities and costs",
        "availableFilters": ["department", "dateRange", "assetType"],
        "formats": ["pdf", "excel"]
      },
      {
        "id": "budget_analysis",
        "name": "Budget Analysis Report",
        "description": "Budget allocation vs utilization analysis",
        "availableFilters": ["fiscalYear", "budgetHead", "department"],
        "formats": ["pdf", "excel"]
      },
      {
        "id": "compliance_audit",
        "name": "Compliance & Audit Report",
        "description": "Audit findings and compliance status",
        "availableFilters": ["auditType", "dateRange", "status"],
        "formats": ["pdf"]
      }
    ]
  }
}
```

---

### 12.3 Get Analytics Data

**Endpoint:** `GET /api/v1/analytics/{metricType}`

**Metric Types:**
- `asset_distribution` - Asset count and value by category
- `maintenance_trends` - Maintenance ticket trends over time
- `budget_utilization` - Budget utilization by department
- `approval_metrics` - Approval rate and processing time
- `vendor_performance` - Vendor delivery and compliance metrics

**Example Request:**
```
GET /api/v1/analytics/maintenance_trends?startDate=2024-01-01&endDate=2024-12-31&groupBy=month
```

**Response:**
```json
{
  "success": true,
  "data": {
    "metricType": "maintenance_trends",
    "period": "2024-01-01 to 2024-12-31",
    "data": [
      { "month": "Jan", "tickets": 45, "avgResolutionTime": 4.2, "cost": 125000 },
      { "month": "Feb", "tickets": 52, "avgResolutionTime": 3.8, "cost": 138000 },
      { "month": "Mar", "tickets": 48, "avgResolutionTime": 4.5, "cost": 142000 }
    ],
    "summary": {
      "totalTickets": 548,
      "avgResolutionTime": 4.2,
      "totalCost": 1650000
    }
  }
}
```

---

## 13. File Management

### 13.1 Upload File

**Endpoint:** `POST /api/v1/files/upload`

**Request (Multipart Form Data):**
```
Content-Type: multipart/form-data

file: equipment_spec.pdf
category: request_attachment
relatedId: REQ-2024-1001
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": "file_12345",
    "fileName": "equipment_spec.pdf",
    "fileUrl": "https://storage.valuekare.com/uploads/spec_12345.pdf",
    "fileSize": 245678,
    "fileType": "application/pdf",
    "uploadedAt": "2024-12-23T10:30:00Z",
    "expiresAt": null
  }
}
```

---

### 13.2 Download File

**Endpoint:** `GET /api/v1/files/{fileId}/download`

**Response:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="equipment_spec.pdf"

[Binary file content]
```

---

## 14. Integration Rules & Best Practices

### 14.1 Request/Response Standards

**Standard Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully",
  "meta": {
    "requestId": "req_uuid_12345",
    "timestamp": "2024-12-23T10:30:00Z",
    "version": "1.0"
  }
}
```

**Standard Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Field-specific error details"
    },
    "statusCode": 400
  },
  "meta": {
    "requestId": "req_uuid_12345",
    "timestamp": "2024-12-23T10:30:00Z"
  }
}
```

---

### 14.2 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_CREDENTIALS` | 401 | Invalid email or password |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | User lacks required permissions |
| `NOT_FOUND` | 404 | Requested resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `DUPLICATE_ENTRY` | 409 | Resource already exists |
| `BUDGET_EXCEEDED` | 400 | Requested amount exceeds budget |
| `STOCK_UNAVAILABLE` | 400 | Requested item out of stock |
| `INTERNAL_ERROR` | 500 | Server error |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

---

### 14.3 Pagination

**Standard Query Parameters:**
```
?page=1&limit=50&sortBy=createdAt&order=desc
```

**Pagination Response:**
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 15,
    "totalRecords": 742,
    "limit": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 14.4 Filtering & Search

**Query Parameters:**
```
?search=ventilator
&department=ICU
&status=active
&category=Medical Equipment
&dateFrom=2024-01-01
&dateTo=2024-12-31
```

---

### 14.5 Authorization Headers

**All API requests must include:**
```
Authorization: Bearer {JWT_ACCESS_TOKEN}
X-Organization-ID: HOSP-2024-001
X-Request-ID: {UUID}
Content-Type: application/json
```

---

### 14.6 Rate Limiting

**Response Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1703337600
```

**429 Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

---

### 14.7 Audit Logging

**Every API call should log:**
- User ID
- Action performed
- Resource affected
- Timestamp
- IP address
- Request ID

**Backend should store:**
```json
{
  "logId": "log_12345",
  "userId": "user_123",
  "action": "UPDATE_ASSET",
  "resource": "asset_123",
  "changes": {
    "before": { "status": "Active" },
    "after": { "status": "Under Maintenance" }
  },
  "timestamp": "2024-12-23T10:30:00Z",
  "ipAddress": "192.168.1.100",
  "requestId": "req_uuid_12345"
}
```

---

## 15. API Priority Roadmap

### Phase 1: Core Authentication & Dashboard (Week 1-2)
**Priority: Critical**

1. `POST /api/v1/auth/login`
2. `POST /api/v1/auth/refresh`
3. `POST /api/v1/auth/logout`
4. `GET /api/v1/dashboard/clinical` (Doctor/Nurse)
5. `GET /api/v1/dashboard/hod`
6. `GET /api/v1/notifications`

**Frontend Impact:**
- Login functionality
- Role-based dashboard loading
- Basic user session management

---

### Phase 2: Request & Approval Workflow (Week 3-4)
**Priority: Critical**

1. `POST /api/v1/requests` - Submit requests
2. `GET /api/v1/requests` - List requests
3. `GET /api/v1/requests/{id}` - Request details with timeline
4. `GET /api/v1/approvals/pending` - Pending approvals
5. `POST /api/v1/approvals/{id}/action` - Approve/Reject

**Frontend Impact:**
- Complete 8-stage approval workflow
- RequestorDashboard
- ApproverDashboard (L1, L2, L3)
- HODDashboard approvals tab

---

### Phase 3: Asset Management (Week 5-6)
**Priority: High**

1. `GET /api/v1/assets` - Asset listing
2. `POST /api/v1/assets` - Create asset
3. `PUT /api/v1/assets/{id}` - Update asset
4. `GET /api/v1/assets/{id}` - Asset details
5. `POST /api/v1/assets/import` - Bulk import
6. `GET /api/v1/assets/export` - CSV export
7. `POST /api/v1/assets/barcode/generate` - Barcode generation

**Frontend Impact:**
- AdminAssetManagement
- AssetManagement (User Panel)
- AssetDetail view
- Bulk operations

---

### Phase 4: Inventory & Purchase (Week 7-8)
**Priority: High**

1. `GET /api/v1/dashboard/inventory`
2. `GET /api/v1/inventory/stock` - Stock levels
3. `POST /api/v1/inventory/allocate` - Allocate stock
4. `GET /api/v1/dashboard/purchase`
5. `GET /api/v1/vendors` - Vendor list
6. `POST /api/v1/purchase/orders` - Create PO
7. `GET /api/v1/purchase/orders` - List POs

**Frontend Impact:**
- InventoryDashboard
- PurchaseDashboard
- Stock management
- Vendor management

---

### Phase 5: Finance & Budget (Week 9-10)
**Priority: High**

1. `GET /api/v1/dashboard/budget`
2. `GET /api/v1/dashboard/cfo`
3. `GET /api/v1/finance/budgets` - Budget overview
4. `GET /api/v1/finance/budget/check` - Budget compliance
5. `GET /api/v1/finance/roi-analysis/{id}` - ROI analysis
6. `GET /api/v1/assets/floor-mapping` - Floor mapping
7. `GET /api/v1/finance/cost-savings` - Cost savings

**Frontend Impact:**
- BudgetCommitteeDashboard
- CFODashboard
- Financial analytics
- Floor mapping visualization

---

### Phase 6: Maintenance & Biomedical (Week 11-12)
**Priority: Medium**

1. `POST /api/v1/maintenance/tickets` - Create ticket
2. `GET /api/v1/maintenance/tickets` - List tickets
3. `PUT /api/v1/maintenance/tickets/{id}` - Update ticket
4. `PUT /api/v1/maintenance/tickets/{id}/close` - Close ticket
5. `GET /api/v1/maintenance/calendar` - Maintenance calendar

**Frontend Impact:**
- ClinicalDashboard issue reporting
- BiomedicalDashboard
- MaintenanceCalendar
- Maintenance tracking

---

### Phase 7: Audit & Compliance (Week 13-14)
**Priority: Medium**

1. `POST /api/v1/audits` - Generate audit
2. `GET /api/v1/audits` - List audits
3. `POST /api/v1/audits/{id}/verify` - Verify asset
4. `PUT /api/v1/audits/{id}/complete` - Complete audit

**Frontend Impact:**
- AuditManagement (Admin)
- UserAuditManagement
- Audit tracking
- Barcode verification

---

### Phase 8: User & Entity Management (Week 15-16)
**Priority: Medium**

1. `GET /api/v1/users` - User listing
2. `POST /api/v1/users` - Create user
3. `PUT /api/v1/users/{id}` - Update user
4. `GET /api/v1/users/{id}/permissions` - Get permissions
5. `PUT /api/v1/users/{id}/permissions` - Update permissions
6. `GET /api/v1/organizations` - Organizations
7. `GET /api/v1/organizations/{id}/buildings` - Buildings
8. `GET /api/v1/organizations/{id}/departments` - Departments

**Frontend Impact:**
- UserManagement
- UserRightsManagement
- EntitySetup
- Admin panel features

---

### Phase 9: Reports & Analytics (Week 17-18)
**Priority: Low**

1. `POST /api/v1/reports/generate` - Generate report
2. `GET /api/v1/reports/types` - Report types
3. `GET /api/v1/analytics/{metricType}` - Analytics data

**Frontend Impact:**
- Reports module
- Analytics dashboards
- Chart data loading

---

### Phase 10: Real-Time & Notifications (Week 19-20)
**Priority: Low**

1. WebSocket connection setup
2. `PUT /api/v1/notifications/{id}/read` - Mark as read
3. Real-time notification push
4. Real-time approval updates
5. Real-time stock alerts

**Frontend Impact:**
- Real-time notifications
- Live dashboard updates
- WebSocket integration

---

## 16. Error Handling & Validation

### 16.1 Frontend Validation

**Before API Call:**
```typescript
// Validate required fields
if (!assetName || !department || !estimatedCost) {
  toast.error("Please fill all required fields");
  return;
}

// Validate data types
if (isNaN(estimatedCost) || estimatedCost <= 0) {
  toast.error("Estimated cost must be a positive number");
  return;
}

// Validate date ranges
if (amcDueDate < new Date()) {
  toast.error("AMC due date cannot be in the past");
  return;
}
```

---

### 16.2 API Error Handling

**Frontend Implementation:**
```typescript
try {
  const response = await apiClient.post('/api/v1/requests', requestData);
  
  if (response.data.success) {
    toast.success(response.data.message);
    navigate(`/requests/${response.data.data.requestId}`);
  }
} catch (error) {
  if (error.response) {
    // Server responded with error
    const { code, message, details } = error.response.data.error;
    
    switch (code) {
      case 'VALIDATION_ERROR':
        // Show field-specific errors
        Object.keys(details).forEach(field => {
          toast.error(`${field}: ${details[field]}`);
        });
        break;
        
      case 'BUDGET_EXCEEDED':
        toast.error(message, {
          action: {
            label: 'View Budget',
            onClick: () => navigate('/finance/budgets')
          }
        });
        break;
        
      case 'UNAUTHORIZED':
        // Token expired, refresh and retry
        await refreshToken();
        // Retry request
        break;
        
      default:
        toast.error(message || 'An error occurred');
    }
  } else if (error.request) {
    // Network error
    toast.error('Network error. Please check your connection.');
  } else {
    // Other errors
    toast.error('An unexpected error occurred');
  }
}
```

---

### 16.3 Backend Validation

**Expected Backend Validation:**

1. **Authentication:**
   - Valid JWT token
   - Token not expired
   - User exists and is active

2. **Authorization:**
   - User has required permissions
   - User can access the requested resource
   - Organization ID matches

3. **Input Validation:**
   - Required fields present
   - Data types correct
   - Value ranges valid
   - Foreign keys exist

4. **Business Rules:**
   - Budget availability
   - Stock availability
   - Workflow stage validation
   - Approval hierarchy

---

## 17. Security & Authorization

### 17.1 Role-Based Access Control (RBAC)

**Backend Middleware:**
```typescript
// Pseudo-code
function checkPermission(requiredPermission: string) {
  return async (req, res, next) => {
    const user = req.user; // From JWT token
    
    // Check if user has permission
    if (!user.permissions.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action'
        }
      });
    }
    
    next();
  };
}

// Usage
router.post('/api/v1/assets', 
  authenticate,
  checkPermission('add_asset'),
  createAsset
);
```

---

### 17.2 Row-Level Security

**Example: Users can only see assets from their organization**

```sql
-- Database policy
CREATE POLICY user_organization_assets ON assets
  FOR SELECT
  USING (organization_id = current_user_organization());

-- Backend filter
SELECT * FROM assets 
WHERE organization_id = :userOrganizationId
AND (
  department = :userDepartment OR -- Department-level users
  :userRole IN ('super-admin', 'cfo') -- Admin users
);
```

---

### 17.3 Data Encryption

**In Transit:**
- All API calls over HTTPS/TLS 1.3
- WebSocket connections over WSS
- Certificate pinning for mobile apps

**At Rest:**
- Sensitive fields encrypted in database
- File uploads encrypted in S3
- Backup encryption

**Sensitive Fields:**
- Passwords (bcrypt with salt)
- API keys
- Financial data
- Personal identifiable information (PII)

---

### 17.4 API Security Best Practices

1. **Input Sanitization:**
   - Escape SQL injection
   - Prevent XSS attacks
   - Validate file uploads

2. **Rate Limiting:**
   - 1000 requests/hour per user
   - 100 requests/minute per IP
   - Exponential backoff

3. **CORS Configuration:**
   ```
   Access-Control-Allow-Origin: https://app.valuekare.com
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE
   Access-Control-Allow-Headers: Authorization, Content-Type
   ```

4. **Security Headers:**
   ```
   X-Content-Type-Options: nosniff
   X-Frame-Options: DENY
   X-XSS-Protection: 1; mode=block
   Strict-Transport-Security: max-age=31536000
   ```

---

## Appendix: Quick Reference

### Common HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE with no response |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate entry |
| 422 | Unprocessable Entity | Business logic error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Maintenance mode |

---

### API Testing Checklist

- [ ] Authentication flow (login, refresh, logout)
- [ ] Role-based dashboard loading (all 15+ roles)
- [ ] Request submission and tracking
- [ ] 8-stage approval workflow (all stages)
- [ ] Asset CRUD operations
- [ ] Bulk import/export
- [ ] Barcode generation
- [ ] Inventory stock management
- [ ] Purchase order creation
- [ ] Budget compliance checking
- [ ] Maintenance ticket lifecycle
- [ ] Audit generation and verification
- [ ] User and entity management
- [ ] Notifications and real-time updates
- [ ] Report generation
- [ ] File upload/download
- [ ] Error handling
- [ ] Permission validation
- [ ] Pagination and filtering
- [ ] WebSocket connections

---

### Integration Timeline Summary

| Phase | Duration | APIs | Frontend Impact |
|-------|----------|------|-----------------|
| Phase 1 | Week 1-2 | 6 APIs | Login, Dashboards |
| Phase 2 | Week 3-4 | 5 APIs | Approval Workflow |
| Phase 3 | Week 5-6 | 7 APIs | Asset Management |
| Phase 4 | Week 7-8 | 7 APIs | Inventory & Purchase |
| Phase 5 | Week 9-10 | 7 APIs | Finance & Budget |
| Phase 6 | Week 11-12 | 5 APIs | Maintenance |
| Phase 7 | Week 13-14 | 4 APIs | Audit |
| Phase 8 | Week 15-16 | 8 APIs | User Management |
| Phase 9 | Week 17-18 | 3 APIs | Reports |
| Phase 10 | Week 19-20 | 5 APIs | Real-time |

**Total: ~57 API endpoints across 20 weeks**

---

## Document Maintenance

**Version History:**
- v1.0 (Dec 23, 2024) - Initial release

**Next Review:** March 2025

**Contact:**
- Frontend Team: frontend@valuekare.com
- Backend Team: backend@valuekare.com
- DevOps Team: devops@valuekare.com

---

**End of Document**
