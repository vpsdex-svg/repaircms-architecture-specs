/**
 * RepairCMS Enterprise — database seed.
 *
 * Idempotent: safe to run on every container start. Produces the tenant
 * described in the rebuild brief (Fix Berlin) plus the catalog data captured in
 * data/seed-records.json.
 */
import {
  PrismaClient,
  ContactType,
  JobPriority,
  JobStatus,
  UserRole,
  PlanType,
  JobItemType,
  InvoiceStatus,
  StockMovementType,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { calculateDocument, toDecimal } from "../src/lib/money.js";
import { priceFromMarkup } from "../src/lib/numbering.js";

const db = new PrismaClient();
const SEED_PASSWORD = process.env.SEED_PASSWORD ?? "Repair2026!";

async function main() {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);

  // ---------------------------------------------------------------- company
  const company = await db.company.upsert({
    where: { portalSlug: "pMOoTOxoDa" },
    update: {},
    create: {
      id: "6aecfc2e244f3ec67e92dd39",
      name: "Fix Berlin",
      legalName: "Fix Repair Services UG",
      ceoName: "Fix it",
      vatId: "DE318492011",
      taxNumber: "37/241/01928",
      eInvoiceId: "04011000-12345-67",
      currency: "EUR",
      timezone: "Europe/Berlin",
      locale: "de-DE",
      street: "Hauptstraße 12",
      zipCode: "10827",
      city: "Berlin",
      country: "DE",
      phone: "+493012345678",
      email: "fix@repaircms.test",
      website: "fix-berlin.de",
      openingHours: "09:00 - 18:00",
      iban: "DE02120300000000202051",
      bic: "BYLADEM1001",
      bankName: "Deutsche Kreditbank Berlin",
      portalSlug: "pMOoTOxoDa",
      planType: PlanType.BUSINESS,
      trialEndsAt: new Date("2026-12-31T00:00:00Z"),
    },
  });

  // --------------------------------------------------------------- location
  const location = await db.location.upsert({
    where: { companyId_code: { companyId: company.id, code: "BER-01" } },
    update: {},
    create: {
      companyId: company.id,
      name: "Berlin Hauptfiliale",
      code: "BER-01",
      street: "Hauptstraße 12",
      zipCode: "10827",
      city: "Berlin",
      country: "DE",
      phone: "+493012345678",
      email: "berlin@repaircms.test",
      isMainStore: true,
    },
  });

  const secondLocation = await db.location.upsert({
    where: { companyId_code: { companyId: company.id, code: "BER-02" } },
    update: {},
    create: {
      companyId: company.id,
      name: "Berlin Werkstatt Süd",
      code: "BER-02",
      street: "Karl-Liebknecht-Str. 8",
      zipCode: "10178",
      city: "Berlin",
      country: "DE",
      isMainStore: false,
    },
  });

  // ------------------------------------------------------------------ users
  const owner = await db.user.upsert({
    where: { email: "fix@repaircms.test" },
    update: { passwordHash },
    create: {
      companyId: company.id,
      locationId: location.id,
      email: "fix@repaircms.test",
      passwordHash,
      firstName: "Fix",
      lastName: "it",
      role: UserRole.OWNER,
      phone: "+493012345678",
      language: "de",
    },
  });

  const technician = await db.user.upsert({
    where: { email: "tech@repaircms.test" },
    update: { passwordHash },
    create: {
      companyId: company.id,
      locationId: location.id,
      email: "tech@repaircms.test",
      passwordHash,
      firstName: "Mehmet",
      lastName: "Yilmaz",
      role: UserRole.TECHNICIAN,
      language: "de",
    },
  });

  await db.user.upsert({
    where: { email: "frontdesk@repaircms.test" },
    update: { passwordHash },
    create: {
      companyId: company.id,
      locationId: secondLocation.id,
      email: "frontdesk@repaircms.test",
      passwordHash,
      firstName: "Anna",
      lastName: "Schneider",
      role: UserRole.FRONT_DESK,
      language: "de",
    },
  });

  // --------------------------------------------------------------- contacts
  const individual = await db.contact.upsert({
    where: { companyId_customerNumber: { companyId: company.id, customerNumber: "K-1001" } },
    update: {},
    create: {
      companyId: company.id,
      contactType: ContactType.INDIVIDUAL,
      customerNumber: "K-1001",
      salutation: "Mr",
      firstName: "TEST",
      lastName: "TEST",
      email: "customer@example.com",
      mobile: "+491701234567",
      phone: "+491701234567",
      street: "Alexanderplatz 1",
      zipCode: "10178",
      city: "Berlin",
      country: "DE",
      paymentDueDays: 0,
      gdprAccepted: true,
      gdprAcceptedAt: new Date("2026-10-01T09:12:00Z"),
    },
  });

  const business = await db.contact.upsert({
    where: { companyId_customerNumber: { companyId: company.id, customerNumber: "K-1002" } },
    update: {},
    create: {
      companyId: company.id,
      contactType: ContactType.BUSINESS,
      customerNumber: "K-1002",
      companyName: "TechFleet Logistics GmbH",
      firstName: "Stefan",
      lastName: "Schmidt",
      vatId: "DE815492019",
      eInvoiceId: "04011000-12345-67",
      email: "fleet@techfleet.de",
      mobile: "+491719876543",
      street: "Kurfürstendamm 102",
      zipCode: "10711",
      city: "Berlin",
      country: "DE",
      paymentDueDays: 14,
      gdprAccepted: true,
      gdprAcceptedAt: new Date("2026-10-02T10:00:00Z"),
    },
  });

  const supplier = await db.contact.upsert({
    where: { companyId_customerNumber: { companyId: company.id, customerNumber: "L-2001" } },
    update: {},
    create: {
      companyId: company.id,
      contactType: ContactType.SUPPLIER,
      customerNumber: "L-2001",
      companyName: "EuroParts Wholesale B.V.",
      firstName: "Lars",
      lastName: "Van Dijk",
      vatId: "NL859201948B01",
      email: "orders@europarts.eu",
      phone: "+31201234567",
      city: "Amsterdam",
      country: "NL",
      paymentDueDays: 30,
    },
  });

  // ------------------------------------------------------- device catalogue
  const brands: Array<{ name: string; deviceType: string; models: string[] }> = [
    { name: "Apple", deviceType: "SMARTPHONE", models: ["iPhone 14 Pro", "iPhone 15 Pro", "iPhone 13", "iPad Air 5", "MacBook Pro 14"] },
    { name: "Samsung", deviceType: "SMARTPHONE", models: ["Galaxy S23", "Galaxy S22", "Galaxy A54", "Galaxy Tab S9"] },
    { name: "Google", deviceType: "SMARTPHONE", models: ["Pixel 8 Pro", "Pixel 7a"] },
    { name: "Xiaomi", deviceType: "SMARTPHONE", models: ["13T Pro", "Redmi Note 13"] },
    { name: "Huawei", deviceType: "SMARTPHONE", models: ["P60 Pro"] },
    { name: "OnePlus", deviceType: "SMARTPHONE", models: ["11 5G"] },
    { name: "Sony", deviceType: "SMARTPHONE", models: ["Xperia 1 V"] },
    { name: "Oppo", deviceType: "SMARTPHONE", models: ["Find X6"] },
    { name: "Nokia", deviceType: "SMARTPHONE", models: ["G42 5G"] },
    { name: "Motorola", deviceType: "SMARTPHONE", models: ["Edge 40"] },
    { name: "Microsoft", deviceType: "LAPTOP", models: ["Surface Pro 9"] },
    { name: "Dell", deviceType: "LAPTOP", models: ["XPS 15 9520"] },
    { name: "Lenovo", deviceType: "LAPTOP", models: ["ThinkPad X1 Carbon"] },
    { name: "Nintendo", deviceType: "GAME_CONSOLE", models: ["Switch OLED"] },
  ];

  for (const brand of brands) {
    const record = await db.deviceBrand.upsert({
      where: { name: brand.name },
      update: { deviceType: brand.deviceType },
      create: { name: brand.name, deviceType: brand.deviceType },
    });
    for (const model of brand.models) {
      await db.deviceModel.upsert({
        where: { brandId_name: { brandId: record.id, name: model } },
        update: {},
        create: { brandId: record.id, name: model },
      });
    }
  }

  const defects = [
    { label: "Cracked screen", labelDe: "Display gesprungen", category: "DISPLAY", sortOrder: 1 },
    { label: "Display shows no image", labelDe: "Kein Bild", category: "DISPLAY", sortOrder: 2 },
    { label: "Battery drains fast", labelDe: "Akku entlädt schnell", category: "POWER", sortOrder: 3 },
    { label: "Will not charge", labelDe: "Lädt nicht", category: "POWER", sortOrder: 4 },
    { label: "Liquid damage", labelDe: "Wasserschaden", category: "BOARD", sortOrder: 5 },
    { label: "No sound / earpiece dead", labelDe: "Kein Ton", category: "AUDIO", sortOrder: 6 },
    { label: "Camera not working", labelDe: "Kamera defekt", category: "CAMERA", sortOrder: 7 },
    { label: "Bent frame", labelDe: "Rahmen verbogen", category: "BODY", sortOrder: 8 },
  ];
  if ((await db.deviceDefect.count()) === 0) {
    await db.deviceDefect.createMany({ data: defects });
  }

  // ----------------------------------------------------------- stock items
  const stockSeed = [
    { sku: "SCR-IP14P-OLED", barcode: "4012345678901", mpn: "821-0492-A", title: "iPhone 14 Pro OLED Display Assembly", category: "Screens", brand: "Apple", model: "iPhone 14 Pro", purchase: 65, markup: 130, qty: 6 },
    { sku: "BAT-IP14P-3274", barcode: "4012345678902", mpn: "616-00941", title: "iPhone 14 Pro Battery 3274mAh", category: "Batteries", brand: "Apple", model: "iPhone 14 Pro", purchase: 14.5, markup: 200, qty: 12 },
    { sku: "SCR-SGS23-AMOLED", barcode: "4012345678903", mpn: "GH82-31224A", title: "Galaxy S23 AMOLED Display Assembly", category: "Screens", brand: "Samsung", model: "Galaxy S23", purchase: 78, markup: 110, qty: 4 },
    { sku: "BAT-SGS23-EB", barcode: "4012345678904", mpn: "EB-BS911ABY", title: "Galaxy S23 Battery 3900mAh", category: "Batteries", brand: "Samsung", model: "Galaxy S23", purchase: 16.2, markup: 190, qty: 9 },
    { sku: "FLEX-SGS23-CHG", barcode: "4012345678905", mpn: "GH96-15618A", title: "Galaxy S23 Charge Port Flex", category: "Flex Cables", brand: "Samsung", model: "Galaxy S23", purchase: 6.4, markup: 240, qty: 15 },
    { sku: "ADH-TAPE-3MM", barcode: "4012345678906", mpn: "ADH-3MM", title: "Display Adhesive Tape 3mm x 50m", category: "Consumables", brand: "Universal", model: "Universal", purchase: 3.2, markup: 180, qty: 24 },
    { sku: "TOOL-SUCTION-KIT", barcode: "4012345678907", mpn: "TL-SCK-01", title: "Suction Cup + Pry Tool Kit", category: "Tools", brand: "Universal", model: "Universal", purchase: 7.9, markup: 120, qty: 3 },
    { sku: "CBL-USBC-2M", barcode: "4012345678908", mpn: "USB-C-2M", title: "USB-C Braided Cable 2m 100W", category: "Accessories", brand: "Universal", model: "Universal", purchase: 2.4, markup: 250, qty: 40 },
    { sku: "GLS-IP14P-TG", barcode: "4012345678909", mpn: "TG-IP14P", title: "iPhone 14 Pro Tempered Glass Protector", category: "Accessories", brand: "Apple", model: "iPhone 14 Pro", purchase: 1.1, markup: 400, qty: 60 },
    { sku: "CAM-IP14P-REAR", barcode: "4012345678910", mpn: "821-0384-A", title: "iPhone 14 Pro Rear Camera Module", category: "Cameras", brand: "Apple", model: "iPhone 14 Pro", purchase: 39, markup: 150, qty: 2 },
  ];

  for (const item of stockSeed) {
    const { sellingPriceNet, sellingPriceGross } = priceFromMarkup(item.purchase, item.markup, 19);
    const stockItem = await db.stockItem.upsert({
      where: { companyId_sku: { companyId: company.id, sku: item.sku } },
      update: {},
      create: {
        companyId: company.id,
        locationId: location.id,
        sku: item.sku,
        barcode: item.barcode,
        mpn: item.mpn,
        title: item.title,
        category: item.category,
        brandCompatibility: [item.brand],
        modelCompatibility: [item.model],
        quantityOnHand: item.qty,
        reorderPoint: 2,
        storageBin: `A-${item.sku.slice(-2)}`,
        supplierId: supplier.id,
        purchasePriceNet: toDecimal(item.purchase),
        markupPercent: toDecimal(item.markup),
        sellingPriceNet: toDecimal(sellingPriceNet),
        taxRate: toDecimal(19),
        sellingPriceGross: toDecimal(sellingPriceGross),
      },
    });

    const existingMovement = await db.stockMovement.findFirst({
      where: { stockItemId: stockItem.id, type: StockMovementType.RECEPTION, note: "Initial seed stock" },
    });
    if (!existingMovement) {
      await db.stockMovement.create({
        data: {
          companyId: company.id,
          stockItemId: stockItem.id,
          type: StockMovementType.RECEPTION,
          quantity: item.qty,
          unitCostNet: toDecimal(item.purchase),
          supplierRef: "WE-2026-0001",
          note: "Initial seed stock",
          userId: owner.id,
        },
      });
    }
  }

  // --------------------------------------------------------------- services
  const serviceSeed = [
    { code: "SRV-DISP-01", title: "Smartphone Display Replacement (Labour)", category: "Display Service", minutes: 35, price: 39, express: true },
    { code: "SRV-BATT-01", title: "Battery Replacement (Labour)", category: "Power Service", minutes: 25, price: 29, express: true },
    { code: "SRV-DIAG-01", title: "Board Level Diagnostics & Cleaning", category: "Diagnostics", minutes: 60, price: 79, express: false },
    { code: "SRV-PORT-01", title: "Charge Port Replacement (Labour)", category: "Power Service", minutes: 40, price: 34, express: false },
    { code: "SRV-SW-01", title: "Software Restore & Data Transfer", category: "Software", minutes: 45, price: 49, express: false },
    { code: "SRV-CHK-01", title: "Full Device Check-Up (12-Point)", category: "Diagnostics", minutes: 20, price: 19, express: true },
  ];

  for (const service of serviceSeed) {
    await db.service.upsert({
      where: { companyId_code: { companyId: company.id, code: service.code } },
      update: {},
      create: {
        companyId: company.id,
        code: service.code,
        title: service.title,
        category: service.category,
        description: `${service.title} — standard workshop rate (19% VAT).`,
        durationMinutes: service.minutes,
        laborPriceNet: toDecimal(service.price),
        taxRate: toDecimal(19),
        isExpressBookable: service.express,
      },
    });
  }

  // --------------------------------------------------------- status pipeline
  const statusSeed: Array<{ status: JobStatus; label: string; labelDe: string; color: string; sort: number; sms: boolean; isDefault?: boolean }> = [
    { status: JobStatus.DRAFT, label: "Draft", labelDe: "Entwurf", color: "#94a3b8", sort: 1, sms: false },
    { status: JobStatus.BOOKED, label: "Booked", labelDe: "Angenommen", color: "#f5a623", sort: 2, sms: true, isDefault: true },
    { status: JobStatus.IN_PROGRESS, label: "In Progress", labelDe: "In Reparatur", color: "#2589f6", sort: 3, sms: true },
    { status: JobStatus.WAITING_FOR_PARTS, label: "Waiting for Parts", labelDe: "Warten auf Teile", color: "#a855f7", sort: 4, sms: true },
    { status: JobStatus.READY, label: "Ready for Pickup", labelDe: "Abholbereit", color: "#22c55e", sort: 5, sms: true },
    { status: JobStatus.DELIVERED, label: "Delivered", labelDe: "Ausgeliefert", color: "#8b98aa", sort: 6, sms: false },
    { status: JobStatus.INVOICED, label: "Invoiced", labelDe: "Abgerechnet", color: "#0f766e", sort: 7, sms: false },
    { status: JobStatus.CANCELLED, label: "Cancelled", labelDe: "Storniert", color: "#ef4444", sort: 8, sms: false },
  ];

  for (const entry of statusSeed) {
    await db.jobStatusConfig.upsert({
      where: { companyId_status: { companyId: company.id, status: entry.status } },
      update: { label: entry.label, labelDe: entry.labelDe, color: entry.color, sortOrder: entry.sort },
      create: {
        companyId: company.id,
        status: entry.status,
        label: entry.label,
        labelDe: entry.labelDe,
        color: entry.color,
        sortOrder: entry.sort,
        isDefault: entry.isDefault ?? false,
        triggerSms: entry.sms,
        triggerEmail: entry.status === JobStatus.READY,
      },
    });
  }

  // ------------------------------------------------------ message templates
  const templateSeed = [
    {
      channel: "SMS",
      eventKey: "JOB_CREATED",
      subject: null,
      body: "Hallo {{customer_name}}, wir haben Ihr {{device_model}} angenommen. Auftrag {{job_id}}. Status: {{tracking_url}}",
    },
    {
      channel: "SMS",
      eventKey: "STATUS_CHANGED",
      subject: null,
      body: "Ihr Auftrag {{job_id}} ({{device_model}}) ist jetzt: {{status}}. Details: {{tracking_url}}",
    },
    {
      channel: "SMS",
      eventKey: "QUOTE_READY",
      subject: null,
      body: "Kostenvoranschlag für {{job_id}} ist fertig: {{quote_total}} EUR. Bitte bestätigen: {{tracking_url}}",
    },
    {
      channel: "EMAIL",
      eventKey: "INVOICE_ISSUED",
      subject: "Ihre Rechnung {{invoice_number}} — {{company_name}}",
      body: "Guten Tag {{customer_name}},\n\nanbei die Rechnung {{invoice_number}} über {{invoice_total}} EUR.\n\nMit freundlichen Grüßen\n{{company_name}}",
    },
  ];

  for (const template of templateSeed) {
    await db.messageTemplate.upsert({
      where: {
        companyId_channel_eventKey: {
          companyId: company.id,
          channel: template.channel,
          eventKey: template.eventKey,
        },
      },
      update: {},
      create: {
        companyId: company.id,
        channel: template.channel,
        eventKey: template.eventKey,
        subject: template.subject,
        body: template.body,
      },
    });
  }

  // ------------------------------------------------------------------ jobs
  const job380468Items = [
    { itemType: JobItemType.PART, sku: "SCR-IP14P-OLED", title: "iPhone 14 Pro OLED Display Assembly", quantity: 1, unitCostNet: 65, unitPriceNet: 149.5, taxRate: 19 },
    { itemType: JobItemType.LABOR, sku: "SRV-DISP-01", title: "Display Replacement Labour", quantity: 1, unitCostNet: 0, unitPriceNet: 39, taxRate: 19 },
  ];
  const job223703Items = [
    { itemType: JobItemType.PART, sku: "BAT-SGS23-EB", title: "Galaxy S23 Battery 3900mAh", quantity: 1, unitCostNet: 16.2, unitPriceNet: 47.0, taxRate: 19 },
    { itemType: JobItemType.PART, sku: "FLEX-SGS23-CHG", title: "Galaxy S23 Charge Port Flex", quantity: 1, unitCostNet: 6.4, unitPriceNet: 21.7, taxRate: 19 },
    { itemType: JobItemType.LABOR, sku: "SRV-BATT-01", title: "Battery & Charge Port Repair Labour", quantity: 1, unitCostNet: 0, unitPriceNet: 58, taxRate: 19 },
  ];

  const buildItemData = (items: typeof job380468Items) =>
    items.map((item) => {
      const totals = calculateDocument([{ quantity: item.quantity, unitPriceNet: item.unitPriceNet, taxRate: item.taxRate }]);
      return {
        itemType: item.itemType,
        sku: item.sku,
        title: item.title,
        quantity: toDecimal(item.quantity),
        unitCostNet: toDecimal(item.unitCostNet),
        unitPriceNet: toDecimal(item.unitPriceNet),
        taxRate: toDecimal(item.taxRate),
        totalNet: toDecimal(totals.subtotalNet),
        totalGross: toDecimal(totals.totalGross),
      };
    });

  const totals380468 = calculateDocument(
    job380468Items.map((item) => ({ quantity: item.quantity, unitPriceNet: item.unitPriceNet, taxRate: item.taxRate })),
  );
  const totals223703 = calculateDocument(
    job223703Items.map((item) => ({ quantity: item.quantity, unitPriceNet: item.unitPriceNet, taxRate: item.taxRate })),
  );

  const job380468 = await db.job.upsert({
    where: { jobNumber: "380468" },
    update: {},
    create: {
      companyId: company.id,
      locationId: location.id,
      contactId: individual.id,
      assignedTechnicianId: technician.id,
      jobNumber: "380468",
      trackingCode: "c66f53d99abd4c6b",
      status: JobStatus.IN_PROGRESS,
      priority: JobPriority.HIGH,
      deviceType: "SMARTPHONE",
      brand: "Apple",
      model: "iPhone 14 Pro",
      imei: "352099001761482",
      serialNumber: "F2LX90K8MD6R",
      color: "Deep Purple",
      passcode: "1988",
      patternLock: [1, 2, 5, 8, 9],
      cosmeticCondition: "USED",
      accessories: ["charger", "cable", "case"],
      customerReportedDefect: "Broken front OLED display, vertical green line, touch only responds on the lower half.",
      technicianFindings: "OLED panel cracked at the top edge; digitizer partially responsive. Frame straight, no liquid contact.",
      diagnosisReport: "Full display assembly replacement required. Face ID module intact and will be transferred.",
      internalNotes: "Customer requested original quality OLED panel replacement.",
      estimatedCost: toDecimal(189),
      subtotalNet: toDecimal(totals380468.subtotalNet),
      taxTotal: toDecimal(totals380468.taxTotal),
      totalGross: toDecimal(totals380468.totalGross),
      paidAmount: toDecimal(0),
      remainingBalance: toDecimal(totals380468.totalGross),
      depositPaid: toDecimal(50),
      dueAt: new Date("2026-11-09T16:00:00Z"),
      items: { create: buildItemData(job380468Items) },
    },
  });

  const job223703 = await db.job.upsert({
    where: { jobNumber: "223703" },
    update: {},
    create: {
      companyId: company.id,
      locationId: location.id,
      contactId: business.id,
      assignedTechnicianId: technician.id,
      jobNumber: "223703",
      trackingCode: "9f1c7ab2e4d05c88",
      status: JobStatus.READY,
      priority: JobPriority.NORMAL,
      deviceType: "SMARTPHONE",
      brand: "Samsung",
      model: "Galaxy S23",
      imei: "356789012345671",
      serialNumber: "RF8T70ABCDE",
      color: "Phantom Black",
      passcode: "4402",
      patternLock: [],
      cosmeticCondition: "LIKE_NEW",
      accessories: ["case"],
      customerReportedDefect: "Battery does not hold charge; device shuts off as soon as the charger is removed. Charge port is loose.",
      technicianFindings: "Battery health 61%, charge port flex intermittent after liquid-free wear.",
      diagnosisReport: "Battery and charge port flex replaced. Device charges at 18W, hold test passed.",
      estimatedCost: toDecimal(140),
      subtotalNet: toDecimal(totals223703.subtotalNet),
      taxTotal: toDecimal(totals223703.taxTotal),
      totalGross: toDecimal(totals223703.totalGross),
      paidAmount: toDecimal(0),
      remainingBalance: toDecimal(totals223703.totalGross),
      depositPaid: toDecimal(0),
      completedAt: new Date("2026-11-05T17:20:00Z"),
      dueAt: new Date("2026-11-07T16:00:00Z"),
      items: { create: buildItemData(job223703Items) },
    },
  });

  // ---------------------------------------------------- job history entries
  const history380468: Array<{ previousStatus: JobStatus | null; newStatus: JobStatus; comment: string; at: string }> = [
    { previousStatus: null, newStatus: JobStatus.BOOKED, comment: "Device accepted at Berlin Hauptfiliale. Intake slip printed.", at: "2026-11-03T09:14:00Z" },
    { previousStatus: JobStatus.BOOKED, newStatus: JobStatus.IN_PROGRESS, comment: "Diagnosis complete, technician assigned. Display assembly reserved from stock.", at: "2026-11-03T11:02:00Z" },
    { previousStatus: JobStatus.IN_PROGRESS, newStatus: JobStatus.WAITING_FOR_PARTS, comment: "Ordered OEM OLED panel from EuroParts Wholesale.", at: "2026-11-04T08:40:00Z" },
    { previousStatus: JobStatus.WAITING_FOR_PARTS, newStatus: JobStatus.IN_PROGRESS, comment: "Panel received (WE-2026-0001). Repair started.", at: "2026-11-05T07:55:00Z" },
  ];
  const history223703: Array<{ previousStatus: JobStatus | null; newStatus: JobStatus; comment: string; at: string }> = [
    { previousStatus: null, newStatus: JobStatus.BOOKED, comment: "Device accepted from TechFleet Logistics GmbH (fleet contract).", at: "2026-11-02T10:05:00Z" },
    { previousStatus: JobStatus.BOOKED, newStatus: JobStatus.IN_PROGRESS, comment: "Battery and charge port diagnostics started.", at: "2026-11-02T13:30:00Z" },
    { previousStatus: JobStatus.IN_PROGRESS, newStatus: JobStatus.READY, comment: "Repair finished, 12-point check-up passed. Customer notified by SMS.", at: "2026-11-05T17:20:00Z" },
  ];

  const seedHistory = async (jobId: string, entries: typeof history380468) => {
    if ((await db.jobActivity.count({ where: { jobId } })) > 0) return;
    for (const entry of entries) {
      await db.jobActivity.create({
        data: {
          jobId,
          previousStatus: entry.previousStatus,
          newStatus: entry.newStatus,
          changedById: technician.id,
          comment: entry.comment,
          customerNotified: entry.newStatus === JobStatus.READY,
          notificationChannel: entry.newStatus === JobStatus.READY ? "SMS" : "NONE",
          createdAt: new Date(entry.at),
        },
      });
    }
  };

  await seedHistory(job380468.id, history380468);
  await seedHistory(job223703.id, history223703);

  // --------------------------------------------------------------- invoice
  const invoiceNumber = "RE-2026-00001";
  const invoice = await db.invoice.findFirst({
    where: { companyId: company.id, invoiceNumber },
  });
  if (!invoice) {
    await db.invoice.create({
      data: {
        companyId: company.id,
        locationId: location.id,
        contactId: individual.id,
        jobId: job380468.id,
        invoiceNumber,
        status: InvoiceStatus.ISSUED,
        subtotalNet: toDecimal(totals380468.subtotalNet),
        taxTotal: toDecimal(totals380468.taxTotal),
        totalGross: toDecimal(totals380468.totalGross),
        paidAmount: toDecimal(0),
        currency: "EUR",
        issueDate: new Date("2026-11-05T00:00:00Z"),
        dueDate: new Date("2026-11-19T00:00:00Z"),
        positions: {
          create: job380468Items.map((item, index) => {
            const totals = calculateDocument([
              { quantity: item.quantity, unitPriceNet: item.unitPriceNet, taxRate: item.taxRate },
            ]);
            return {
              position: index + 1,
              title: item.title,
              quantity: toDecimal(item.quantity),
              unitPriceNet: toDecimal(item.unitPriceNet),
              taxRate: toDecimal(item.taxRate),
              netTotal: toDecimal(totals.subtotalNet),
              grossTotal: toDecimal(totals.totalGross),
            };
          }),
        },
      },
    });
  }

  // ------------------------------------------------- fiscal number sequences
  const year = 2026;
  const sequences = [
    { key: "JOB", prefix: "JOB", nextValue: 380469 },
    { key: "INVOICE", prefix: "RE", nextValue: 2 },
    { key: "CREDIT_NOTE", prefix: "ST", nextValue: 1 },
    { key: "CASHBOOK", prefix: "AB", nextValue: 1 },
  ];
  for (const sequence of sequences) {
    const existing = await db.numberSequence.findFirst({
      where: { companyId: company.id, locationId: location.id, key: sequence.key, year },
    });
    if (!existing) {
      await db.numberSequence.create({
        data: {
          companyId: company.id,
          locationId: location.id,
          key: sequence.key,
          prefix: sequence.prefix,
          year,
          nextValue: sequence.nextValue,
          padding: 5,
        },
      });
    }
  }

  // ---------------------------------------------------------------- cashbook
  const businessDate = new Date();
  businessDate.setUTCHours(0, 0, 0, 0);
  let cashbook = await db.cashbook.findFirst({
    where: { companyId: company.id, locationId: location.id, registerCode: "POS-01", businessDate },
  });
  if (!cashbook) {
    cashbook = await db.cashbook.create({
      data: {
        companyId: company.id,
        locationId: location.id,
        registerCode: "POS-01",
        businessDate,
        status: "OPEN",
        openingBalance: toDecimal(200),
        totalCashIn: toDecimal(50),
        totalCashOut: toDecimal(0),
        expectedClosingBalance: toDecimal(250),
      },
    });
    await db.cashTransaction.create({
      data: {
        companyId: company.id,
        cashbookId: cashbook.id,
        locationId: location.id,
        type: "OPENING",
        amount: toDecimal(200),
        balanceAfter: toDecimal(200),
        description: "Opening cash count",
        userId: owner.id,
      },
    });
    await db.cashTransaction.create({
      data: {
        companyId: company.id,
        cashbookId: cashbook.id,
        locationId: location.id,
        type: "DEPOSIT",
        amount: toDecimal(50),
        balanceAfter: toDecimal(250),
        description: "Deposit for job 380468",
        receiptRef: "380468",
        userId: owner.id,
      },
    });
  }

  // ------------------------------------------------------------ audit trail
  if ((await db.auditLog.count({ where: { companyId: company.id } })) === 0) {
    await db.auditLog.create({
      data: {
        companyId: company.id,
        userId: owner.id,
        action: "SEED_DATABASE",
        entityType: "Company",
        entityId: company.id,
        after: { company: company.name, jobs: 2, users: 3 },
      },
    });
  }

  const summary = {
    company: company.name,
    vatId: company.vatId,
    locations: await db.location.count({ where: { companyId: company.id } }),
    users: await db.user.count({ where: { companyId: company.id } }),
    contacts: await db.contact.count({ where: { companyId: company.id } }),
    jobs: await db.job.count({ where: { companyId: company.id } }),
    stockItems: await db.stockItem.count({ where: { companyId: company.id } }),
    services: await db.service.count({ where: { companyId: company.id } }),
    invoices: await db.invoice.count({ where: { companyId: company.id } }),
    brands: await db.deviceBrand.count(),
    models: await db.deviceModel.count(),
  };

  console.log("[seed] RepairCMS seed complete:", summary);
}

main()
  .catch((error) => {
    console.error("[seed] failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
