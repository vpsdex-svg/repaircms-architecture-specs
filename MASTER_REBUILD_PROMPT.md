# MASTER ARCHITECTURAL PROMPT: ENTERPRISE REBUILD OF REPAIRCMS

> **Target Agent / Tech Lead Persona**: Senior Enterprise Software Architect & Principal Full-Stack Engineer  
> **Source Repository**: [`https://github.com/vpsdex-svg/repaircms-architecture-specs`](https://github.com/vpsdex-svg/repaircms-architecture-specs)  
> **Documentation Standard**: OpenAPI 3.1, Prisma 5.x / PostgreSQL 16, TypeScript 5.x, React 18 / Next.js 14, TailwindCSS + Shadcn/ui / Ant Design  

---

```markdown
# MISSION BRIEFING & SYSTEM REQUIREMENTS SPECIFICATION (SRS)
## Project Name: RepairCMS Enterprise Rebuild (Full-Stack Multi-Tenant SaaS)

You are tasked with engineering a production-grade, enterprise-scale clone of **RepairCMS**—a SaaS Management Operating System designed specifically for electronics, smartphone, computer, and device repair centers, complete with a customer-facing public Tracking Portal.

You must build this application strictly adhering to the architectural blueprints, database schemas, REST API contracts, and user interface specifications stored in the repository:
`https://github.com/vpsdex-svg/repaircms-architecture-specs`

---

### 1. REPOSITORY ASSETS & SPECIFICATION REFERENCES
Before writing any code, you must inspect and internalize the following foundational specifications:
1. `docs/schemas/schema.prisma`: The canonical relational schema containing 22 models (Company, Location, User, Job, Contact, StockItem, Invoice, Cashbook, TrackingSession, etc.) with explicit indexes and relations.
2. `docs/schemas/mongoose-models.ts`: MongoDB schema equivalents for NoSQL implementations.
3. `docs/openapi.yaml`: Complete OpenAPI 3.1 REST API specification with parameter validation and response structures.
4. `docs/API_AND_TRACKING_DEEPDIVE.md`: In-depth specification of JWT token schemas, tenant boundaries, settings structures, and public tracking portal endpoints (`/v1/tracking/*`).
5. `docs/ENTERPRISE_ARCHITECTURE.md`: Core system architecture, multi-tenancy isolation policies, and repair order Finite State Machine (FSM).
6. `docs/FULL_APPLICATION_MANUAL.md`: Visual UI layout, dialog flows, calculation algorithms, and interactions cross-referenced with 66 screenshots.
7. `data/seed-records.json`: Production tenant records (Tenant: "Fix Berlin", CEO: "Fix it", VAT: DE318492011, Jobs: #380468 & #223703) to use as default seed data.

---

### 2. CORE ARCHITECTURAL PRINCIPLES & NON-NEGOTIABLES

#### A. Multi-Tenancy & Data Isolation
- **Tenant Context Scoping**: Every database entity (except global system metadata) MUST include `companyId` and optionally `locationId`.
- **Query Interceptor / Middleware**: Enforce tenant isolation at the database layer (e.g., Prisma Client Extensions or Mongoose pre-find hooks). No request should ever query or mutate data without validating the authenticated `companyId` from the JWT claims.
- **Role-Based Access Control (RBAC)**: Support roles: `OWNER`, `ADMIN`, `TECHNICIAN`, `FRONT_DESK`, `ACCOUNTANT`, and `READ_ONLY`.

#### B. Repair Order State Machine (FSM)
Repair orders (`Job`) must transition strictly across predefined states:
`DRAFT` ➔ `BOOKED` ➔ `IN_PROGRESS` ➔ `WAITING_FOR_PARTS` ➔ `READY` ➔ `DELIVERED` ➔ `INVOICED` (or `CANCELLED`).
- **Validation Rules**:
  - Cannot transition to `READY` without at least one assigned technician or diagnosis report.
  - Cannot transition to `DELIVERED` without recording delivery timestamp, recipient signature confirmation, and payment status verification.
  - Every transition must create an immutable entry in `JobHistory` (recording `previousStatus`, `newStatus`, `changedBy`, `timestamp`, and `comment`).

#### C. European & German Fiscal Compliance (GoBD & VAT)
- **Sequential Numbering**: Generate immutable, gap-free, tenant-scoped receipt and invoice numbers (e.g., `RE-2026-00001`, `AB-2026-00001`). Once an invoice is finalized, it cannot be edited or deleted—only cancelled via a credit note (`STORNO`).
- **Standard Tax Rates**: Support EU standard (19%), reduced (7%), and tax-exempt (0% / Reverse Charge / §25a UStG differential taxation).
- **Audit-Proof Cashbook (`Kassenbuch`)**: Every cash transaction must record current balance, transaction type (Deposit, Withdrawal, Expense), receipt reference, and user ID.

#### D. Hardware & Peripheral Validation
- **IMEI / Serial Validation**: Implement the **Luhn Algorithm** (`mod 10`) for 15-digit IMEI checksum verification.
- **Pattern Lock Matrix**: Interactive 3x3 pattern lock widget on intake step 2, serializing the touch pattern as sequential numeric coordinates (e.g., `[1, 2, 5, 8, 9]`).

---

### 3. MANDATED TECH STACK

#### Backend Stack
- **Framework**: Node.js 20+ with NestJS (or Express + TypeScript in Clean Architecture)
- **Database**: PostgreSQL 16 with Prisma ORM (or MongoDB with Mongoose)
- **Authentication**: JWT (Access Tokens 15m expiry + Refresh Tokens 7d with sliding window), bcrypt for hashing (work factor 12)
- **Caching & Job Queue**: Redis + BullMQ (for automated customer SMS/Email alerts and PDF invoice rendering)
- **Validation**: `class-validator` and `zod` for request payload sanitization matching OpenAPI schemas

#### Frontend Stack
- **Framework**: React 18+ with Vite or Next.js 14 (App Router)
- **Design System & Styling**: TailwindCSS + Shadcn/ui (Radix primitives) or Ant Design 5, Lucide Icons
- **State Management**: TanStack React Query (server cache) + Zustand (local client state & intake wizard)
- **Forms**: React Hook Form with Zod schema resolvers
- **Document / PDF Generation**: `@react-pdf/renderer` or server-side Puppeteer for thermal receipts (80mm), job intake slips (A4), and official VAT invoices.

---

### 4. MODULE-BY-MODULE FUNCTIONAL BREAKDOWN

#### Module 1: Authentication & Organization Management
- Tenant registration with Company Profile (Name, USt-IdNr, Address, IBAN, BIC, Currency, Logo upload).
- Multi-location management (Store locations with distinct receipt numbering counters).
- Team management with email invitations, role assignment, and security audit logs.

#### Module 2: The 4-Step Repair Intake Wizard (`/jobs/new`)
- **Step 1 - Device Type & Brand**: Grid selector for Smartphone, Tablet, Laptop, Smartwatch, Desktop, Game Console. Dynamic brand & model autocomplete.
- **Step 2 - Device Details & Diagnostics**: Serial number, IMEI (with Luhn check), visual inspection flags (Scratched, Cracked screen, Liquid damage, Bent frame), Passcode/PIN input, and interactive 3x3 Pattern Lock grid.
- **Step 3 - Customer Assignment**: Live search across existing contacts (Individuals & Companies). Inline quick-add modal with phone, email, and billing address.
- **Step 4 - Job Scope, Quote & Assignee**: Pre-check checklist, customer-reported defect description, preliminary cost estimate, internal technician notes, assigned technician, estimated delivery date, and instant 80mm intake slip printing.

#### Module 3: Repair Workspace & Job Lifecycle (`/jobs/:id`)
- Unified Job Detail layout with top status banner, action buttons (Print receipt, Send SMS/Email, Finalize Invoice).
- **Tabbed Workspace**:
  - `Overview`: Diagnosis, defect checklist, internal technician notes, customer communication history.
  - `Spare Parts & Labor`: Search and attach parts from inventory (auto-deducting stock) and predefined service labor rates.
  - `Receipt / Intake Slip`: Formatted A4/80mm document preview.
  - `Quotation / KVA`: Cost estimation with customer approval tracking.
  - `Invoice`: Direct conversion of job parts and labor into a finalized VAT invoice.
  - `History & Audit Trail`: Chronological timeline of all changes.

#### Module 4: Contacts & CRM (`/contacts`)
- Categorized contacts: `Individual`, `Company` (with VAT / USt-IdNr validation), `Supplier`.
- Detail view listing all repair orders, purchased stock items, and issued invoices for the contact.
- GDPR data export and customer portal link generation.

#### Module 5: Inventory & Spare Parts Management (`/stock`)
- Stock items with SKU, Manufacturer Part Number (MPN), Barcode (EAN-13), Location shelf bin.
- Profit margin calculator: `Cost Price` + `Markup %` = `Net Price` + `VAT (19%)` = `Gross Retail Price`.
- Goods reception workflow (`Wareneingang`): Record supplier delivery note, adjust purchase cost, update warehouse quantities.
- Low-stock threshold alerts.

#### Module 6: Invoicing & Cashbook (`/invoices` & `/cashbook`)
- Invoices: Creation from repair jobs or direct counter sales. Multi-position table with line discounts, tax summaries, payment methods (Cash, Card, PayPal, Bank Transfer).
- POS Quick-Checkout modal for rapid accessory sales.
- Cashbook: Daily opening/closing cash counts, petty cash withdrawals, and end-of-day Z-Report (`Tagesabschluss`).

#### Module 7: Public Customer Tracking Portal (`/tracking`)
- Standalone, mobile-first responsive web portal accessible without system login.
- Access via: `Job Number` + `Postal Code` OR secure one-time URL token (`/tracking?token=...`).
- Displays live status bar, device photo, technician diagnosis, cost estimate, and one-click **"Approve Quotation"** / **"Decline Quotation"** buttons with electronic customer signature pad.

#### Module 8: Settings & Integrations (`/settings`)
- Custom status pipelines (add custom stages, colors, and automated SMS triggers).
- SMS and Email notification templates with placeholder tags (`{{customer_name}}`, `{{device_model}}`, `{{tracking_url}}`, `{{job_id}}`).
- Barcode and label printer configuration (Brother / Dymo 62x29mm label formats).
- Integration stubs: Seven.io / Twilio (SMS), Lexware / SevDesk (Accounting), DHL (Shipping labels).

---

### 5. SEED DATA REQUIREMENT
On initial setup, seed the database with the realistic dataset from `data/seed-records.json`:
- **Company**: Fix Berlin (DE318492011, Hauptstraße 12, 10827 Berlin)
- **Users**: Admin/Technician (Fix it, fix@repaircms.test)
- **Active Repair Orders**:
  - Job #380468: iPhone 14 Pro, Display Replacement, Status `IN_PROGRESS`, Pattern Lock `[1, 2, 5, 8, 9]`.
  - Job #223703: Samsung Galaxy S23, Battery & Charge Port, Status `READY`.
- **Pre-populated catalog**: 10 device brands, common spare parts, and standard repair services.

---

### 6. EXECUTION ROADMAP & STEP-BY-STEP WORKFLOW

Execute the build sequentially in following verifiable phases:
- **Phase 1: Project Scaffolding & Database Setup**: Initialize monorepo or dual-package structure (`backend/` and `frontend/`). Apply Prisma migration using `schema.prisma`. Execute database seed script.
- **Phase 2: Auth & Core REST APIs**: Implement JWT auth, tenant scoping interceptor, and complete CRUD endpoints for Company, Users, Jobs, Contacts, and Stock items according to `openapi.yaml`.
- **Phase 3: Frontend Layout & Shell**: Build the responsive dashboard layout matching screenshots `00_*` and `01_dashboard.png` (Topbar, Sidebar, Theme switcher, Notification popovers).
- **Phase 4: Repair Intake Wizard & Job Details**: Implement the 4-step intake modal with IMEI Luhn validator, pattern lock canvas, and the comprehensive tabbed Job View matching screenshots `02_*`.
- **Phase 5: CRM, Inventory & Billing**: Build Contacts (`03_*`), Stock Items & Calculator (`04_*`), Services (`05_*`), and Invoices (`06_*`).
- **Phase 6: Public Customer Tracking Portal**: Implement the standalone responsive portal (`07_repair_tracking.png` & `07_tracking_portal_login.png`).
- **Phase 7: Settings, Testing & Verification**: Implement customizable status pipelines (`09_*`), print templates, automated tests (Unit & E2E), and Docker Compose deployment orchestration.

Begin immediately with **Phase 1**. Inspect the specifications, configure the database connection, run the migration, and report the results before advancing.
```
