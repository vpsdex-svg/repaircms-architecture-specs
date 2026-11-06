export type JobStatus =
  | "DRAFT"
  | "BOOKED"
  | "IN_PROGRESS"
  | "WAITING_FOR_PARTS"
  | "READY"
  | "DELIVERED"
  | "INVOICED"
  | "CANCELLED";

export type JobPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface Location {
  id: string;
  name: string;
  code: string | null;
  city: string | null;
  isMainStore: boolean;
}

export interface Company {
  id: string;
  name: string;
  legalName: string | null;
  ceoName: string | null;
  vatId: string | null;
  taxNumber: string | null;
  eInvoiceId: string | null;
  currency: string;
  street: string | null;
  zipCode: string | null;
  city: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  openingHours: string | null;
  iban: string | null;
  bic: string | null;
  bankName: string | null;
  portalSlug: string;
  planType: string;
  locations: Location[];
}

export interface UserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  language: string;
}

export interface JobItem {
  id: string;
  itemType: "PART" | "LABOR" | "CUSTOM";
  sku: string | null;
  title: string;
  quantity: number;
  unitPriceNet: number;
  taxRate: number;
  totalNet: number;
  totalGross: number;
}

export interface Job {
  id: string;
  jobNumber: string;
  trackingCode: string;
  status: JobStatus;
  priority: JobPriority;
  deviceType: string;
  brand: string;
  model: string;
  imei: string | null;
  serialNumber: string | null;
  patternLock: number[];
  cosmeticCondition: string | null;
  accessories: string[];
  customerReportedDefect: string;
  technicianFindings: string | null;
  diagnosisReport: string | null;
  estimatedCost: number;
  subtotalNet: number;
  taxTotal: number;
  totalGross: number;
  paidAmount: number;
  remainingBalance: number;
  depositPaid: number;
  dueAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  contact: { firstName: string | null; lastName: string | null; companyName: string | null };
  assignedTechnician: { firstName: string; lastName: string } | null;
  items: JobItem[];
  _count: { activities: number };
}

export interface StockItem {
  id: string;
  sku: string;
  barcode: string | null;
  mpn: string | null;
  title: string;
  category: string;
  quantityOnHand: number;
  reorderPoint: number;
  storageBin: string | null;
  purchasePriceNet: number;
  markupPercent: number;
  sellingPriceNet: number;
  taxRate: number;
  sellingPriceGross: number;
}

export interface Service {
  id: string;
  code: string;
  title: string;
  category: string;
  durationMinutes: number;
  laborPriceNet: number;
  taxRate: number;
  isExpressBookable: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  subtotalNet: number;
  taxTotal: number;
  totalGross: number;
  paidAmount: number;
  issueDate: string;
  dueDate: string;
  positions: Array<{ id: string; title: string; quantity: number; unitPriceNet: number; taxRate: number }>;
}

export interface StatusConfig {
  id: string;
  status: JobStatus;
  label: string;
  labelDe: string | null;
  color: string;
  sortOrder: number;
  isDefault: boolean;
}

export interface JobActivity {
  id: string;
  previousStatus: JobStatus | null;
  newStatus: JobStatus;
  comment: string | null;
  createdAt: string;
  customerNotified: boolean;
  notificationChannel: string;
  job: { jobNumber: string; brand: string; model: string };
  changedBy: { firstName: string; lastName: string };
}

export interface NumberSequence {
  id: string;
  key: string;
  prefix: string;
  year: number;
  nextValue: number;
  padding: number;
}

export interface CashbookSummary {
  id: string;
  registerCode: string;
  status: string;
  businessDate: string;
  openingBalance: number;
  totalCashIn: number;
  totalCashOut: number;
  expectedClosingBalance: number;
}

export interface BootstrapData {
  company: Company;
  users: UserSummary[];
  jobs: Job[];
  stockItems: StockItem[];
  services: Service[];
  invoices: Invoice[];
  statusConfigs: StatusConfig[];
  activities: JobActivity[];
  sequences: NumberSequence[];
  cashbook: CashbookSummary | null;
  counts: {
    users: number;
    contacts: number;
    jobs: number;
    stockItems: number;
    services: number;
    invoices: number;
    activities: number;
    deviceBrands: number;
    deviceModels: number;
    templates: number;
    statusConfigs: number;
  };
  build: {
    phase: number;
    phaseName: string;
    schemaModels: number;
    currency: string;
    generatedAt: string;
  };
}
