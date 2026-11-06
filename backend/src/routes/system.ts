import { Router } from "express";
import { db } from "../lib/prisma.js";
import { toPlain } from "../lib/serialize.js";
import { config } from "../config.js";

export const systemRouter = Router();

systemRouter.get("/health", async (_req, res) => {
  try {
    await db.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      data: {
        status: "ok",
        database: "connected",
        environment: config.nodeEnv,
        preview: config.isPreview,
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: {
        code: "DATABASE_UNAVAILABLE",
        message: error instanceof Error ? error.message : "Database unavailable",
      },
    });
  }
});

/**
 * Phase 1 foundation snapshot: proves the migrated schema and seed data are
 * live in the running stack. Used by the bootstrap screen in the frontend.
 */
systemRouter.get("/bootstrap", async (_req, res, next) => {
  try {
    const company = await db.company.findFirst({
      orderBy: { createdAt: "asc" },
      include: { locations: true },
    });

    if (!company) {
      res.status(409).json({
        success: false,
        error: { code: "NOT_SEEDED", message: "No company found — run the seed service" },
      });
      return;
    }

    const cashbookDate = new Date();
    cashbookDate.setUTCHours(0, 0, 0, 0);

    const [
      users,
      contacts,
      jobs,
      stockItems,
      services,
      invoices,
      statusConfigs,
      activities,
      sequences,
      cashbook,
    ] = await Promise.all([
        db.user.findMany({
          where: { companyId: company.id },
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            language: true,
          },
        }),
        db.contact.count({ where: { companyId: company.id } }),
        db.job.findMany({
          where: { companyId: company.id },
          orderBy: { createdAt: "desc" },
          include: {
            contact: { select: { firstName: true, lastName: true, companyName: true } },
            assignedTechnician: { select: { firstName: true, lastName: true } },
            items: true,
            _count: { select: { activities: true } },
          },
        }),
        db.stockItem.findMany({
          where: { companyId: company.id },
          orderBy: { sku: "asc" },
        }),
        db.service.findMany({ where: { companyId: company.id }, orderBy: { code: "asc" } }),
        db.invoice.findMany({
          where: { companyId: company.id },
          orderBy: { issueDate: "desc" },
          include: { positions: true },
        }),
        db.jobStatusConfig.findMany({ where: { companyId: company.id }, orderBy: { sortOrder: "asc" } }),
        db.jobActivity.findMany({
          where: { job: { companyId: company.id } },
          orderBy: { createdAt: "desc" },
          take: 12,
          include: {
            job: { select: { jobNumber: true, brand: true, model: true } },
            changedBy: { select: { firstName: true, lastName: true } },
          },
        }),
        db.numberSequence.findMany({
          where: { companyId: company.id },
          orderBy: { key: "asc" },
        }),
        db.cashbook.findFirst({
          where: { companyId: company.id, businessDate: cashbookDate },
          orderBy: { createdAt: "desc" },
        }),
      ]);

    const counts = {
      users: users.length,
      contacts,
      jobs: jobs.length,
      stockItems: stockItems.length,
      services: services.length,
      invoices: invoices.length,
      activities: activities.length,
      deviceBrands: await db.deviceBrand.count(),
      deviceModels: await db.deviceModel.count(),
      templates: await db.messageTemplate.count({ where: { companyId: company.id } }),
      statusConfigs: statusConfigs.length,
    };

    res.json({
      success: true,
      data: toPlain({
        company,
        users,
        jobs,
        stockItems,
        services,
        invoices,
        statusConfigs,
        activities,
        sequences,
        cashbook,
        counts,
        build: {
          phase: 1,
          phaseName: "Project scaffolding & database setup",
          schemaModels: 26,
          currency: company.currency,
          generatedAt: new Date().toISOString(),
        },
      }),
    });
  } catch (error) {
    next(error);
  }
});
