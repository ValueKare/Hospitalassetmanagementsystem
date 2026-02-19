# HFAMS Workflow Integration Guide

## Clinical → Biomedical → Department Head Workflow

This document outlines how the Clinical Dashboard (Doctors & Nurses) integrates with existing User Panel workflows.

## 🔄 Complete Workflow Diagrams

### 1. Equipment Issue Reporting Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     EQUIPMENT ISSUE WORKFLOW                         │
└─────────────────────────────────────────────────────────────────────┘

   👨‍⚕️ CLINICAL STAFF                🔧 BIOMEDICAL              👔 DEPT HEAD
  (Doctor/Nurse)                   (Manager)                 (Approval)

       │                               │                          │
       │ 1. Report Issue               │                          │
       │    ▶ Select Equipment         │                          │
       │    ▶ Urgency Level            │                          │
       │    ▶ Issue Description        │                          │
       │                               │                          │
       └──────────────────────────────▶│                          │
                                       │ 2. Receive Notification  │
                                       │    ▶ New ticket created  │
                                       │    ▶ View in Maintenance │
                                       │      Tickets Dashboard   │
                                       │                          │
                                       │ 3. Assign Technician     │
                                       │    ▶ Update status       │
                                       │    ▶ Schedule repair     │
                                       │                          │
       ◀──────────────────────────────┤ 4. Status Notification   │
       │                               │    ▶ "Issue Acknowledged"│
       │ 5. View Update                │                          │
       │    ▶ Maintenance Updates      │                          │
       │      section shows progress   │                          │
       │                               │                          │
       │                               │ 6. Work in Progress      │
       │                               │    ▶ Technician updates  │
       │                               │    ▶ Status: In Progress │
       │                               │                          │
       ◀──────────────────────────────┤ 7. Progress Notification │
       │                               │    ▶ "Repair in Progress"│
       │                               │                          │
       │                               │ 8. Complete Repair       │
       │                               │    ▶ Test equipment      │
       │                               │    ▶ Close ticket        │
       │                               │                          │
       ◀──────────────────────────────┤ 9. Completion Notification
       │                               │    ▶ "Repair Complete"   │
       │ 10. Equipment Ready           │    ▶ Ready for use       │
       │     ▶ View in dashboard       │                          │
       │     ▶ Status: Active          │                          │
       │                               │                          │
```

### 2. Equipment Replacement Request Workflow (Doctors Only)

```
┌─────────────────────────────────────────────────────────────────────┐
│                  REPLACEMENT REQUEST WORKFLOW                        │
└─────────────────────────────────────────────────────────────────────┘

   🩺 DOCTOR                        👔 DEPT HEAD              🏪 STORE MGR
  (Requestor)                      (Approver)                (Procurement)

       │                               │                          │
       │ 1. Request Replacement        │                          │
       │    ▶ Select Equipment         │                          │
       │    ▶ Justification            │                          │
       │    ▶ Submit Request           │                          │
       │                               │                          │
       └──────────────────────────────▶│ 2. Approval Request      │
                                       │    ▶ View in Pending     │
                                       │      Approvals           │
                                       │    ▶ Review justification│
                                       │                          │
                                       │ 3. Evaluate Request      │
                                       │    ▶ Check budget        │
                                       │    ▶ Verify necessity    │
                                       │                          │
                                       │ 4a. APPROVE              │
       ◀──────────────────────────────┤    ▶ Add comments        │
       │                               │    ▶ Forward to Store    │
       │ 5. Approval Notification      │                          │
       │    ▶ "Request Approved"       └─────────────────────────▶│
       │    ▶ View in dashboard                                   │
       │                                                           │ 6. Procurement
       │                                                           │    ▶ Check inventory
       │                                                           │    ▶ Place order
       │                                                           │    ▶ Update stock
       │                                                           │
       ◀──────────────────────────────────────────────────────────┤ 7. Delivery Update
       │                                                           │    ▶ "Equipment ready"
       │ 8. Equipment Received                                    │
       │    ▶ New asset assigned                                 │
       │    ▶ Old asset retired                                  │
       │                                                           │
                                       
                                       │ 4b. DECLINE              │
       ◀──────────────────────────────┤    ▶ Add reason          │
       │                               │    ▶ Suggest alternative │
       │ 5. Rejection Notification     │                          │
       │    ▶ "Request Declined"       │                          │
       │    ▶ View reason              │                          │
       │    ▶ Can resubmit if needed   │                          │
```

### 3. Maintenance Status Tracking

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MAINTENANCE STATUS FLOW                           │
└─────────────────────────────────────────────────────────────────────┘

   CLINICAL DASHBOARD              BIOMEDICAL DASHBOARD
   (Real-time Updates)             (Status Management)

   ┌─────────────────────┐          ┌─────────────────────┐
   │  Equipment Table    │          │  Maintenance Tickets │
   │  ─────────────────  │          │  ─────────────────  │
   │  ✅ Active          │◀────────▶│  Open • In Progress  │
   │  🔧 Under Repair    │          │  Completed           │
   │  ⚠️  Pending Service │          │                     │
   └─────────────────────┘          └─────────────────────┘
            │                                   │
            │                                   │
   ┌─────────────────────┐          ┌─────────────────────┐
   │  Notifications      │          │  Technician Update  │
   │  ─────────────────  │          │  ─────────────────  │
   │  • Repair Complete  │◀────────▶│  • Assign tech      │
   │  • Maintenance Due  │          │  • Update progress   │
   │  • Issue Ack        │          │  • Close ticket      │
   └─────────────────────┘          └─────────────────────┘
            │                                   │
            │                                   │
   ┌─────────────────────┐          ┌─────────────────────┐
   │  Updates Section    │          │  Service History    │
   │  ─────────────────  │          │  ─────────────────  │
   │  Completed (✓)      │◀────────▶│  Date • Technician  │
   │  In Progress (⟳)    │          │  Issue • Solution    │
   │  Scheduled (📅)     │          │  Parts • Cost        │
   └─────────────────────┘          └─────────────────────┘
```

## 📊 Dashboard Integration Matrix

| Feature | Doctor | Nurse | Biomedical | Dept Head | Store Mgr |
|---------|--------|-------|------------|-----------|-----------|
| **View Equipment** | Ward-level | Ward-level | All | Department | All |
| **Report Issues** | ✅ Yes | ✅ Yes | ➖ No (receives) | ➖ No | ➖ No |
| **Request Replacement** | ✅ Yes | ❌ No | ➖ No | ➖ Approves | ➖ Procures |
| **View Notifications** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Update Maintenance** | ❌ No | ❌ No | ✅ Yes | ➖ Reviews | ➖ No |
| **Approve Requests** | ❌ No | ❌ No | ❌ No | ✅ Yes | ➖ No |
| **Manage Inventory** | ❌ No | ❌ No | ✅ Parts | ❌ No | ✅ Full |

## 🔔 Notification Flow

### From Biomedical to Clinical Staff:

```javascript
// Sample notification structure
{
  type: "maintenance_update",
  priority: "success",
  from: "Biomedical Team",
  to: ["doctor@hospital.com", "nurse@hospital.com"],
  message: "Infusion Pump INF-112 has been repaired and is ready for use",
  equipment: {
    id: "INF-112",
    name: "Infusion Pump",
    status: "Active"
  },
  timestamp: "2024-10-17T14:30:00Z"
}
```

### From Department Head to Doctors:

```javascript
{
  type: "replacement_approved",
  priority: "success",
  from: "Department Head",
  to: ["doctor@hospital.com"],
  message: "Your replacement request for Vital Signs Monitor has been approved",
  requestId: "REQ-2024-156",
  nextSteps: "Equipment will be procured by Store Manager",
  timestamp: "2024-10-17T10:15:00Z"
}
```

## 🎯 Key Integration Points

### 1. Shared Data Models

```typescript
// Equipment Model (shared across all dashboards)
interface Equipment {
  id: number;
  assetId: string;
  name: string;
  category: string;
  location: string;
  department: string;
  ward?: string; // For clinical staff
  status: "Active" | "Under Repair" | "Pending Calibration";
  assignedTo?: string[]; // Doctor/Nurse IDs
  lastMaintenance: Date;
  nextMaintenance: Date;
  maintenanceHistory: MaintenanceRecord[];
}

// Issue Report Model
interface IssueReport {
  id: number;
  equipmentId: string;
  reportedBy: string;
  reportedByRole: "doctor" | "nurse";
  urgency: "critical" | "high" | "medium" | "low";
  description: string;
  status: "open" | "in_progress" | "completed";
  assignedTechnician?: string;
  dateReported: Date;
  dateResolved?: Date;
}

// Replacement Request Model
interface ReplacementRequest {
  id: number;
  equipmentId: string;
  requestedBy: string; // Doctor ID
  reason: string;
  status: "pending" | "approved" | "declined";
  reviewedBy?: string; // Dept Head ID
  reviewComments?: string;
  dateRequested: Date;
  dateReviewed?: Date;
}
```

### 2. API Endpoints (Future Backend Integration)

```
POST   /api/equipment/report-issue
       ▶ Create new issue ticket
       ▶ Notify biomedical team
       ▶ Return ticket ID

POST   /api/equipment/request-replacement
       ▶ Create replacement request
       ▶ Notify department head
       ▶ Return request ID

GET    /api/equipment/assigned/:userId
       ▶ Get equipment assigned to specific ward/user
       ▶ Filter by role (doctor/nurse)

GET    /api/notifications/:userId
       ▶ Get unread notifications
       ▶ Filter by priority

PATCH  /api/maintenance/:ticketId/status
       ▶ Update ticket status
       ▶ Notify relevant clinical staff
```

### 3. Real-time Updates (WebSocket/Supabase Realtime)

```javascript
// Subscribe to equipment status changes
supabase
  .from('equipment')
  .on('UPDATE', payload => {
    // If equipment assigned to current user's ward
    if (payload.new.ward === currentUser.ward) {
      // Update dashboard
      // Show notification
    }
  })
  .subscribe();

// Subscribe to maintenance tickets
supabase
  .from('maintenance_tickets')
  .on('*', payload => {
    // Notify clinical staff when status changes
    if (payload.new.status === 'completed') {
      showNotification('Repair Complete', payload.new.equipment);
    }
  })
  .subscribe();
```

## 🚀 Next Steps for Full Integration

### Phase 1: Backend Setup (Recommended)
1. Set up Supabase project
2. Create database tables:
   - equipment
   - maintenance_tickets
   - replacement_requests
   - notifications
   - user_equipment_assignments
3. Implement Row Level Security (RLS) policies
4. Create API endpoints

### Phase 2: Real-time Features
1. Implement WebSocket connections
2. Set up notification system
3. Add real-time status updates
4. Create push notification service

### Phase 3: Enhanced Features
1. QR code scanning for equipment
2. Mobile app integration
3. Email notifications
4. SMS alerts for critical issues
5. Equipment usage tracking
6. Shift handover notes

### Phase 4: Analytics & Reporting
1. Cross-role analytics
2. Equipment downtime tracking
3. Response time metrics
4. User activity logs
5. Compliance reporting

## 📱 Mobile Considerations

When extending to mobile:
- **Doctors**: Quick issue reporting with camera for photos
- **Nurses**: Simplified interface for ward equipment checks
- **Biomedical**: Mobile ticket updates from field
- **All**: Push notifications for urgent updates

## 🔐 Security & Access Control

### Row-level Security (RLS) Examples:

```sql
-- Doctors can only view equipment in their assigned ward
CREATE POLICY "Doctors view own ward equipment"
ON equipment FOR SELECT
USING (ward = (SELECT ward FROM users WHERE id = auth.uid()));

-- Only doctors can create replacement requests
CREATE POLICY "Doctors create replacement requests"
ON replacement_requests FOR INSERT
USING (auth.role() = 'doctor');

-- Only department heads can approve requests
CREATE POLICY "Dept heads approve requests"
ON replacement_requests FOR UPDATE
USING (auth.role() = 'department-head');
```

---

**Last Updated:** October 17, 2025  
**Version:** 1.0.0  
**Integration Status:** ✅ Frontend Complete | ⏳ Backend Pending
