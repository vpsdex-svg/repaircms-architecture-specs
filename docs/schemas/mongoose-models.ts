// ==============================================================================
// RepairCMS Ultimate - MongoDB Mongoose Schemas Specification
// Reference Schema Models for Production MERN Architecture
// ==============================================================================

import { Schema, Document, Types } from 'mongoose';

// 1. Company Schema
export const CompanySchema = new Schema({
  ownerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  legalName: { type: String },
  ceoName: { type: String },
  vatId: { type: String },
  taxNumber: { type: String },
  leitwegId: { type: String },
  currency: { type: String, default: 'EUR' },
  timezone: { type: String, default: 'Europe/Berlin' },
  street: { type: String, required: true },
  zipCode: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, default: 'DE' },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  website: { type: String },
  openingHours: { type: String, default: '09:00 - 18:00' },
  portalSlug: { type: String, required: true, unique: true, index: true },
  taxSettings: {
    defaultVatRate: { type: Number, default: 19.0 },
    vatLabel: { type: String, default: 'VAT' },
  },
  bankDetails: {
    bankName: { type: String },
    iban: { type: String },
    bic: { type: String },
  },
  locations: [{
    name: { type: String, required: true },
    street: { type: String },
    zipCode: { type: String },
    city: { type: String },
    phone: { type: String },
    isMainStore: { type: Boolean, default: false }
  }]
}, { timestamps: true });

// 2. Job Schema (Repair Tickets)
export const JobSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true, index: true },
  jobNumber: { type: String, required: true },
  trackingCode: { type: String, required: true, unique: true, index: true }, // 16-hex code
  status: {
    type: String,
    enum: ['NEW', 'BOOKED', 'DIAGNOSING', 'WAITING_FOR_PARTS', 'QUOTATION_SENT', 'QUOTATION_ACCEPTED', 'IN_PROGRESS', 'TESTING', 'READY_FOR_PICKUP', 'DELIVERED', 'CANCELLED', 'UNREPAIRABLE'],
    default: 'BOOKED',
    index: true,
  },
  priority: { type: String, enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'], default: 'NORMAL' },
  customer: {
    contactId: { type: Schema.Types.ObjectId, ref: 'Contact', required: true },
    displayName: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
  },
  device: {
    deviceType: { type: String, default: 'SMARTPHONE' },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    imei: { type: String },
    passcode: { type: String },
    patternLock: [{ type: Number }], // 3x3 matrix 0-8
    accessories: [{ type: String }],
  },
  defect: {
    customerReportedDefect: { type: String, required: true },
    technicianFindings: { type: String },
    checklist: [{ name: String, status: { type: String, enum: ['PASS', 'FAIL', 'NOT_TESTED'] } }]
  },
  assignedTechnicianId: { type: Schema.Types.ObjectId, ref: 'User' },
  items: [{
    itemType: { type: String, enum: ['PART', 'LABOR', 'CUSTOM'], required: true },
    sku: String,
    title: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unitPriceNet: { type: Number, required: true },
    taxRate: { type: Number, default: 19.0 },
    totalNet: Number,
    totalGross: Number
  }],
  financials: {
    subtotalNet: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    totalGross: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    remainingBalance: { type: Number, default: 0 }
  },
  dueAt: Date,
  completedAt: Date,
  deliveredAt: Date,
  activityLog: [{
    statusFrom: String,
    statusTo: String,
    changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    comment: String,
    customerNotified: Boolean
  }]
}, { timestamps: true });

JobSchema.index({ companyId: 1, jobNumber: 1 }, { unique: true });
JobSchema.index({ companyId: 1, status: 1, createdAt: -1 });

// 3. Contact Schema (CRM)
export const ContactSchema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  contactType: { type: String, enum: ['INDIVIDUAL', 'BUSINESS', 'SUPPLIER'], default: 'INDIVIDUAL' },
  customerNumber: { type: String, required: true },
  firstName: String,
  lastName: String,
  companyName: String,
  vatId: String,
  email: { type: String, index: true },
  phone: { type: String, index: true },
  billingAddress: {
    street: String,
    zipCode: String,
    city: String,
    country: { type: String, default: 'DE' }
  },
  paymentDueDays: { type: Number, default: 14 },
  gdprConsent: { accepted: Boolean, acceptedAt: Date }
}, { timestamps: true });

ContactSchema.index({ companyId: 1, customerNumber: 1 }, { unique: true });

// 4. StockItem Schema (Inventory)
export const StockItemSchema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true, index: true },
  sku: { type: String, required: true, uppercase: true },
  barcode: String,
  title: { type: String, required: true },
  category: { type: String, required: true },
  quantityOnHand: { type: Number, default: 0 },
  quantityReserved: { type: Number, default: 0 },
  reorderPoint: { type: Number, default: 2 },
  purchasePriceNet: { type: Number, required: true },
  markupPercent: { type: Number, default: 40.0 },
  sellingPriceNet: { type: Number, required: true },
  taxRate: { type: Number, default: 19.0 },
  sellingPriceGross: { type: Number, required: true },
  storageBin: String
}, { timestamps: true });

StockItemSchema.index({ companyId: 1, sku: 1 }, { unique: true });

// 5. Invoice Schema (Fiscal Invoicing & POS)
export const InvoiceSchema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true, index: true },
  invoiceNumber: { type: String, required: true },
  status: { type: String, enum: ['DRAFT', 'ISSUED', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED'], default: 'ISSUED' },
  referenceJobId: { type: Schema.Types.ObjectId, ref: 'Job' },
  positions: [{
    title: String,
    quantity: Number,
    unitPriceNet: Number,
    taxRate: Number,
    netTotal: Number,
    grossTotal: Number
  }],
  subtotalNet: Number,
  taxTotal: Number,
  totalGross: Number,
  paidAmount: { type: Number, default: 0 },
  currency: { type: String, default: 'EUR' },
  issueDate: { type: Date, default: Date.now },
  dueDate: Date,
  compliance: {
    isEInvoice: Boolean,
    eInvoiceType: { type: String, enum: ['ZUGFERD_2_3', 'XRECHNUNG_3_0'] },
    tseSignature: String,
    epcQrCodeString: String
  }
}, { timestamps: true });

InvoiceSchema.index({ companyId: 1, invoiceNumber: 1 }, { unique: true });
