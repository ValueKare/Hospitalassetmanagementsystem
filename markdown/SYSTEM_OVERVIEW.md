# Hospital Fixed Asset Management System (HFAMS) - System Overview

## Architecture

The HFAMS is built with a **two-panel architecture**:
- **Admin Panel** - For Super Admins and Audit Admins
- **User Panel** - For Hospital-side users (Department Head, Biomedical, Store Manager, Viewer, Doctor, Nurse)

## Authentication & Role-Based Access

### Login System
- Common login page with Hospital ID, Email, and Password
- Automatic role detection and panel redirection
- Secure role-based routing

### Roles & Access Levels

#### Admin Panel Roles

**1. Super Admin**
- Full system access across all hospitals
- Permissions:
  - User Management (Add/Edit/Delete users, Assign roles)
  - Audit User Management
  - User Rights Management (Configure permissions)
  - Entity Setup (Hospitals, Buildings, Departments)
  - Asset Management (Global view)
  - Audit Management (Generate/Review audits)
  - Reports (Entity-wide analytics)
  
**2. Audit Admin**
- Audit and compliance control
- Permissions:
  - View and manage audits
  - Add audit team members
  - Approve audit requests
  - Generate audit reports
  - Limited user management

#### User Panel Roles

**3. Department Head**
- Department-level control
- Permissions:
  - Manage department assets
  - Add/Edit/Transfer assets
  - Request maintenance
  - Request audits
  - View department reports
  - Manage asset categories
  - Building/Floor management

**4. Biomedical Manager**
- Maintenance & service access
- Permissions:
  - View/Create maintenance tickets
  - Update maintenance status
  - Close tickets
  - View service logs
  - Asset lookup
  - Update spare parts inventory

**5. Store Manager**
- Inventory control
- Permissions:
  - Manage spare parts inventory
  - Reorder items
  - Track consumption
  - View inventory analytics
  - Generate inventory reports

**6. Viewer**
- Read-only access
- Permissions:
  - View dashboards
  - View reports
  - View assets (no edit)
  - View maintenance history

**7. Doctor**
- Clinical equipment access
- Permissions:
  - View assigned ward equipment
  - Report equipment issues
  - Request equipment replacements
  - View maintenance status
  - Track repair updates
  - Receive notifications from Biomedical team
  - Access maintenance history

**8. Nurse**
- Clinical equipment access (limited)
- Permissions:
  - View assigned ward equipment
  - Report equipment issues
  - View maintenance status
  - Track repair updates
  - Receive notifications from Biomedical team
  - Cannot request replacements (escalated to doctors)

## System Modules

### Admin Panel Modules

1. **Dashboard**
   - Global metrics (Total Hospitals, Assets, Active Audits, Users)
   - Asset category distribution
   - Maintenance trends
   - Audit status overview
   - Quick actions

2. **User Management**
   - Add/Edit/Delete users
   - Assign roles and parent users
   - Manage credentials
   - Filter by role and status
   - Export user lists

3. **Audit User Management**
   - Manage audit team members
   - Assign auditors to hospitals
   - Track auditor performance

4. **User Rights Management**
   - Visual permissions matrix
   - Toggle permissions (Green = Allowed, Red = Restricted)
   - Role-based permission templates
   - Save/Reset capabilities

5. **Entity Setup**
   - Hospital management
   - Building management
   - Department management
   - Cost center configuration
   - Floor and location setup

6. **Asset Management**
   - Global asset view across all hospitals
   - Add/Import assets
   - Generate barcodes
   - Asset lifecycle tracking

7. **Audit Management**
   - Generate audits
   - Assign auditors
   - Track audit progress
   - Approve audit requests
   - Review audit reports
   - Export audit data

8. **Reports**
   - Entity-wide analytics
   - Asset utilization reports
   - Maintenance cost comparison
   - Compliance reports

### User Panel Modules

1. **Dashboard** (Role-specific)
   - Department/Hospital KPIs
   - Quick action buttons
   - Charts and analytics
   - Recent activity
   - Alerts and notifications

2. **Asset Management**
   - Add/Import assets
   - Edit asset details
   - Transfer assets
   - Generate barcodes
   - View asset lifecycle
   - Asset detail view

3. **Asset Category Management**
   - Add/Edit categories
   - Define subcategories
   - Organize asset taxonomy
   - Category statistics

4. **Building & Floor Management**
   - Building information
   - Floor organization
   - Department mapping
   - Cost center management

5. **Maintenance Management**
   - Create maintenance tickets
   - Schedule maintenance
   - Update ticket status
   - Calibration tracking
   - Service history
   - Calendar view

6. **Audit Requests**
   - Request audits
   - Scan barcodes/QR codes
   - Track audit progress
   - Submit audit reports
   - View audit history

7. **Inventory Management**
   - Spare parts tracking
   - Stock levels
   - Reorder alerts
   - Usage analytics
   - Consumption reports

8. **Reports**
   - Department-wise reports
   - Cost-centre based reports
   - Export to PDF/Excel
   - Scheduled reports
   - Custom report generation

## Demo Credentials

### Hospital ID (for all users)
```
HOSP-2024-001
```

### Admin Panel Access
```
Super Admin:
Email: superadmin@hfams.com
Password: super123

Audit Admin:
Email: audit@hfams.com
Password: audit123
```

### User Panel Access
```
Department Head:
Email: dept@hospital.com
Password: dept123

Biomedical Manager:
Email: bio@hospital.com
Password: bio123

Store Manager:
Email: store@hospital.com
Password: store123

Viewer:
Email: viewer@hospital.com
Password: viewer123

Doctor:
Email: doctor@hospital.com
Password: doctor123

Nurse:
Email: nurse@hospital.com
Password: nurse123
```

## Key Features

### Two-Panel Architecture
- Separate navigation and UI for Admin vs User panels
- Role-specific dashboards
- Context-aware menus

### Role-Based Permissions
- Granular permission control
- Visual permission management
- Hierarchical user structure

### Asset Lifecycle Management
- Complete asset tracking
- Barcode/QR code generation
- Transfer workflows
- Maintenance scheduling

### Audit Management
- End-to-end audit workflow
- Request-to-completion tracking
- Barcode scanning capability
- Progress monitoring

### Inventory Management
- Real-time stock tracking
- Automated reorder alerts
- Usage analytics
- Spare parts management

### Reporting & Analytics
- Interactive charts (Recharts)
- Export functionality
- Scheduled reports
- Custom report generation

### Modern Healthcare Design
- Primary Color: #0F67FF
- Secondary Color: #E8F0FF
- Success: #0EB57D
- Warning: #FFC107
- Clean white and blue theme
- Subtle gradients
- Rounded cards
- Responsive layouts

## Technical Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS v4.0
- **UI Components**: shadcn/ui
- **Icons**: lucide-react
- **Charts**: Recharts
- **Notifications**: Sonner
- **State Management**: React Hooks

## File Structure

```
/
├── App.tsx (Main routing and panel logic)
├── components/
│   ├── LoginScreen.tsx
│   ├── AdminNavigationSidebar.tsx
│   ├── UserNavigationSidebar.tsx
│   ├── admin/
│   │   ├── SuperAdminDashboard.tsx
│   │   ├── AuditAdminDashboard.tsx
│   │   ├── UserManagement.tsx
│   │   ├── UserRightsManagement.tsx
│   │   ├── EntitySetup.tsx
│   │   ├── AuditManagement.tsx
│   │   └── ...
│   ├── user/
│   │   ├── AssetCategoryManagement.tsx
│   │   ├── UserAuditManagement.tsx
│   │   ├── BuildingFloorManagement.tsx
│   │   └── ...
│   ├── dashboards/
│   │   ├── DepartmentHeadDashboard.tsx
│   │   ├── BiomedicalDashboard.tsx
│   │   ├── StoreManagerDashboard.tsx
│   │   ├── ViewerDashboard.tsx
│   │   └── ClinicalDashboard.tsx (Doctor & Nurse)
│   └── shared/
│       ├── AssetManagement.tsx
│       ├── InventoryManagement.tsx
│       ├── MaintenanceCalendar.tsx
│       └── Reports.tsx
├── styles/
│   └── globals.css
└── components/ui/ (shadcn components)
```

## User Flows

### Admin Flow
1. Login with admin credentials
2. Redirected to Admin Panel
3. Access system-wide features
4. Manage users, entities, audits
5. View global analytics

### Hospital User Flow
1. Login with user credentials
2. Redirected to User Panel
3. Access department-specific features
4. Manage assets, request services
5. View department analytics

### Audit Flow
1. User requests audit
2. Admin approves request
3. Auditor assigned
4. Assets scanned via barcode
5. Progress tracked
6. Report generated and reviewed

## Navigation Structure

### Admin Panel Navigation
- Dashboard
- User Management
- Audit Users
- User Rights
- Entity Setup
- Asset Management
- Audit Management
- Reports
- Settings

### User Panel Navigation (Department Head)
- Dashboard
- Asset Management
- Asset Categories
- Buildings & Floors
- Maintenance
- Audit Requests
- Reports
- Settings

### User Panel Navigation (Biomedical)
- Dashboard
- Maintenance Tickets
- Asset Lookup
- Service Logs

### User Panel Navigation (Store Manager)
- Dashboard
- Inventory
- Assets
- Analytics

### User Panel Navigation (Viewer)
- Dashboard
- Reports

### User Panel Navigation (Doctor)
- Dashboard
- Assigned Equipment
- Maintenance Status
- Reports

### User Panel Navigation (Nurse)
- Dashboard
- Assigned Equipment
- Maintenance Status

## Scalability Features

- Modular component architecture
- Role-based access control
- Multi-hospital support
- Hierarchical user management
- Extensible permission system
- Customizable workflows

## Security Considerations

- Role-based authentication
- Panel-level access control
- Hierarchical permissions
- Secure credential management
- Audit trails
- User activity logging

## Future Enhancements

- Real-time notifications
- Mobile app integration
- Advanced analytics/BI
- API integrations
- Automated workflows
- AI-powered insights
- Multi-language support
- Advanced audit features
- Custom report builder
