-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('TRIAL', 'STARTER', 'BUSINESS', 'TEAM', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'TECHNICIAN', 'FRONT_DESK', 'ACCOUNTANT', 'READ_ONLY');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('INDIVIDUAL', 'BUSINESS', 'SUPPLIER');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'BOOKED', 'IN_PROGRESS', 'WAITING_FOR_PARTS', 'READY', 'DELIVERED', 'INVOICED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "JobPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "JobItemType" AS ENUM ('PART', 'LABOR', 'CUSTOM');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('RECEPTION', 'JOB_CONSUMPTION', 'SALE', 'ADJUSTMENT', 'RETURN');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CashTransactionType" AS ENUM ('OPENING', 'DEPOSIT', 'WITHDRAWAL', 'EXPENSE', 'SALE');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "ceoName" TEXT,
    "vatId" TEXT,
    "taxNumber" TEXT,
    "eInvoiceId" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Berlin',
    "locale" TEXT NOT NULL DEFAULT 'de-DE',
    "logoUrl" TEXT,
    "street" TEXT,
    "zipCode" TEXT,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'DE',
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "openingHours" TEXT DEFAULT '09:00 - 18:00',
    "iban" TEXT,
    "bic" TEXT,
    "bankName" TEXT,
    "portalSlug" TEXT NOT NULL,
    "planType" "PlanType" NOT NULL DEFAULT 'TRIAL',
    "trialEndsAt" TIMESTAMP(3),
    "subscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "street" TEXT,
    "zipCode" TEXT,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'DE',
    "phone" TEXT,
    "email" TEXT,
    "isMainStore" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "locationId" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'TECHNICIAN',
    "avatarUrl" TEXT,
    "phone" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "theme" TEXT NOT NULL DEFAULT 'default',
    "twoFactorEmail" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorApp" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "contactType" "ContactType" NOT NULL DEFAULT 'INDIVIDUAL',
    "customerNumber" TEXT NOT NULL,
    "salutation" TEXT,
    "title" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "companyName" TEXT,
    "vatId" TEXT,
    "taxNumber" TEXT,
    "eInvoiceId" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "street" TEXT,
    "zipCode" TEXT,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'DE',
    "paymentDueDays" INTEGER NOT NULL DEFAULT 14,
    "discountRate" DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    "notes" TEXT,
    "gdprAccepted" BOOLEAN NOT NULL DEFAULT false,
    "gdprAcceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "assignedTechnicianId" TEXT,
    "jobNumber" TEXT NOT NULL,
    "trackingCode" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'BOOKED',
    "priority" "JobPriority" NOT NULL DEFAULT 'NORMAL',
    "deviceType" TEXT NOT NULL DEFAULT 'SMARTPHONE',
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "imei" TEXT,
    "serialNumber" TEXT,
    "color" TEXT,
    "passcode" TEXT,
    "patternLock" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "cosmeticCondition" TEXT,
    "accessories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "devicePhotoUrl" TEXT,
    "customerReportedDefect" TEXT NOT NULL,
    "technicianFindings" TEXT,
    "diagnosisReport" TEXT,
    "internalNotes" TEXT,
    "estimatedCost" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "subtotalNet" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "taxTotal" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "totalGross" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "remainingBalance" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "depositPaid" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "quotationApprovedAt" TIMESTAMP(3),
    "quotationDeclinedAt" TIMESTAMP(3),
    "customerSignatureUrl" TEXT,
    "deliverySignatureUrl" TEXT,
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobItem" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "stockItemId" TEXT,
    "serviceId" TEXT,
    "itemType" "JobItemType" NOT NULL DEFAULT 'PART',
    "sku" TEXT,
    "title" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1.0,
    "unitCostNet" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "unitPriceNet" DECIMAL(12,2) NOT NULL,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 19.0,
    "discountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    "totalNet" DECIMAL(12,2) NOT NULL,
    "totalGross" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobActivity" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "previousStatus" "JobStatus",
    "newStatus" "JobStatus" NOT NULL,
    "changedById" TEXT NOT NULL,
    "comment" TEXT,
    "customerNotified" BOOLEAN NOT NULL DEFAULT false,
    "notificationChannel" TEXT NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockItem" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "barcode" TEXT,
    "mpn" TEXT,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brandCompatibility" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "modelCompatibility" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "quantityOnHand" INTEGER NOT NULL DEFAULT 0,
    "quantityReserved" INTEGER NOT NULL DEFAULT 0,
    "reorderPoint" INTEGER NOT NULL DEFAULT 2,
    "storageBin" TEXT,
    "supplierId" TEXT,
    "purchasePriceNet" DECIMAL(12,2) NOT NULL,
    "markupPercent" DECIMAL(6,2) NOT NULL DEFAULT 40.0,
    "sellingPriceNet" DECIMAL(12,2) NOT NULL,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 19.0,
    "sellingPriceGross" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "stockItemId" TEXT NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCostNet" DECIMAL(12,2) NOT NULL,
    "supplierRef" TEXT,
    "jobId" TEXT,
    "referenceNumber" TEXT,
    "note" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Repair',
    "description" TEXT,
    "durationMinutes" INTEGER NOT NULL DEFAULT 30,
    "laborPriceNet" DECIMAL(12,2) NOT NULL,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 19.0,
    "isExpressBookable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "jobId" TEXT,
    "documentType" TEXT NOT NULL DEFAULT 'INVOICE',
    "invoiceNumber" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'ISSUED',
    "subtotalNet" DECIMAL(12,2) NOT NULL,
    "taxTotal" DECIMAL(12,2) NOT NULL,
    "totalGross" DECIMAL(12,2) NOT NULL,
    "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "isEInvoice" BOOLEAN NOT NULL DEFAULT false,
    "tseSignatureData" TEXT,
    "epcQrCodeString" TEXT,
    "creditNoteOfId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoicePosition" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1.0,
    "unitPriceNet" DECIMAL(12,2) NOT NULL,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 19.0,
    "netTotal" DECIMAL(12,2) NOT NULL,
    "grossTotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "InvoicePosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referenceNumber" TEXT,
    "notes" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cashbook" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "closedById" TEXT,
    "registerCode" TEXT NOT NULL DEFAULT 'POS-01',
    "businessDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "openingBalance" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "totalCashIn" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "totalCashOut" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "expectedClosingBalance" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "countedClosingBalance" DECIMAL(12,2),
    "difference" DECIMAL(12,2),
    "zReportNumber" INTEGER,
    "tseSignature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cashbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashTransaction" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "cashbookId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "type" "CashTransactionType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "balanceAfter" DECIMAL(12,2) NOT NULL,
    "description" TEXT NOT NULL,
    "receiptRef" TEXT,
    "invoiceId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackingSession" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedVia" TEXT NOT NULL DEFAULT 'JOB_NUMBER_POSTAL_CODE',
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAccessAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "customerComment" TEXT,
    "signatureDataUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackingMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "authorType" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackingMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobStatusConfig" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL,
    "label" TEXT NOT NULL,
    "labelDe" TEXT,
    "color" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "triggerSms" BOOLEAN NOT NULL DEFAULT false,
    "triggerEmail" BOOLEAN NOT NULL DEFAULT false,
    "templateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobStatusConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'SMS',
    "eventKey" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "entityId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NumberSequence" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "locationId" TEXT,
    "key" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "nextValue" INTEGER NOT NULL DEFAULT 1,
    "padding" INTEGER NOT NULL DEFAULT 5,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NumberSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceBrand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL DEFAULT 'SMARTPHONE',
    "logoUrl" TEXT,

    CONSTRAINT "DeviceBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceModel" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "releaseYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceDefect" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "labelDe" TEXT,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DeviceDefect_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_portalSlug_key" ON "Company"("portalSlug");

-- CreateIndex
CREATE INDEX "Company_portalSlug_idx" ON "Company"("portalSlug");

-- CreateIndex
CREATE INDEX "Location_companyId_idx" ON "Location"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_companyId_code_key" ON "Location"("companyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_companyId_role_idx" ON "User"("companyId", "role");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_tokenHash_idx" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "Contact_companyId_email_idx" ON "Contact"("companyId", "email");

-- CreateIndex
CREATE INDEX "Contact_companyId_phone_idx" ON "Contact"("companyId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_companyId_customerNumber_key" ON "Contact"("companyId", "customerNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Job_jobNumber_key" ON "Job"("jobNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Job_trackingCode_key" ON "Job"("trackingCode");

-- CreateIndex
CREATE INDEX "Job_companyId_status_createdAt_idx" ON "Job"("companyId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Job_companyId_jobNumber_idx" ON "Job"("companyId", "jobNumber");

-- CreateIndex
CREATE INDEX "JobItem_jobId_idx" ON "JobItem"("jobId");

-- CreateIndex
CREATE INDEX "JobActivity_jobId_createdAt_idx" ON "JobActivity"("jobId", "createdAt");

-- CreateIndex
CREATE INDEX "StockItem_companyId_barcode_idx" ON "StockItem"("companyId", "barcode");

-- CreateIndex
CREATE UNIQUE INDEX "StockItem_companyId_sku_key" ON "StockItem"("companyId", "sku");

-- CreateIndex
CREATE INDEX "StockMovement_companyId_createdAt_idx" ON "StockMovement"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "StockMovement_stockItemId_idx" ON "StockMovement"("stockItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_companyId_code_key" ON "Service"("companyId", "code");

-- CreateIndex
CREATE INDEX "Invoice_companyId_status_issueDate_idx" ON "Invoice"("companyId", "status", "issueDate");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_companyId_invoiceNumber_key" ON "Invoice"("companyId", "invoiceNumber");

-- CreateIndex
CREATE INDEX "InvoicePosition_invoiceId_idx" ON "InvoicePosition"("invoiceId");

-- CreateIndex
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "Cashbook_companyId_locationId_registerCode_businessDate_key" ON "Cashbook"("companyId", "locationId", "registerCode", "businessDate");

-- CreateIndex
CREATE INDEX "CashTransaction_cashbookId_createdAt_idx" ON "CashTransaction"("cashbookId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TrackingSession_token_key" ON "TrackingSession"("token");

-- CreateIndex
CREATE INDEX "TrackingSession_companyId_idx" ON "TrackingSession"("companyId");

-- CreateIndex
CREATE INDEX "TrackingSession_jobId_idx" ON "TrackingSession"("jobId");

-- CreateIndex
CREATE INDEX "TrackingMessage_sessionId_createdAt_idx" ON "TrackingMessage"("sessionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobStatusConfig_companyId_status_key" ON "JobStatusConfig"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MessageTemplate_companyId_channel_eventKey_key" ON "MessageTemplate"("companyId", "channel", "eventKey");

-- CreateIndex
CREATE INDEX "Notification_companyId_isRead_createdAt_idx" ON "Notification"("companyId", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_companyId_createdAt_idx" ON "AuditLog"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "NumberSequence_companyId_locationId_key_year_key" ON "NumberSequence"("companyId", "locationId", "key", "year");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceBrand_name_key" ON "DeviceBrand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceModel_brandId_name_key" ON "DeviceModel"("brandId", "name");

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_assignedTechnicianId_fkey" FOREIGN KEY ("assignedTechnicianId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobItem" ADD CONSTRAINT "JobItem_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobItem" ADD CONSTRAINT "JobItem_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "StockItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobActivity" ADD CONSTRAINT "JobActivity_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobActivity" ADD CONSTRAINT "JobActivity_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "StockItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoicePosition" ADD CONSTRAINT "InvoicePosition_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cashbook" ADD CONSTRAINT "Cashbook_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cashbook" ADD CONSTRAINT "Cashbook_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cashbook" ADD CONSTRAINT "Cashbook_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashTransaction" ADD CONSTRAINT "CashTransaction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashTransaction" ADD CONSTRAINT "CashTransaction_cashbookId_fkey" FOREIGN KEY ("cashbookId") REFERENCES "Cashbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashTransaction" ADD CONSTRAINT "CashTransaction_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingSession" ADD CONSTRAINT "TrackingSession_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingSession" ADD CONSTRAINT "TrackingSession_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingMessage" ADD CONSTRAINT "TrackingMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrackingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobStatusConfig" ADD CONSTRAINT "JobStatusConfig_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageTemplate" ADD CONSTRAINT "MessageTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NumberSequence" ADD CONSTRAINT "NumberSequence_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NumberSequence" ADD CONSTRAINT "NumberSequence_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceModel" ADD CONSTRAINT "DeviceModel_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "DeviceBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
