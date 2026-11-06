import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient({
  log: process.env.PRISMA_LOG === "1" ? ["query", "warn", "error"] : ["warn", "error"],
});

/**
 * Models that carry `companyId` and must therefore never be queried without a
 * tenant boundary.
 */
const TENANT_MODELS = new Set([
  "Location",
  "User",
  "Contact",
  "Job",
  "StockItem",
  "StockMovement",
  "Service",
  "Invoice",
  "Cashbook",
  "CashTransaction",
  "TrackingSession",
  "JobStatusConfig",
  "MessageTemplate",
  "Notification",
  "AuditLog",
  "NumberSequence",
]);

type AnyArgs = Record<string, any>;

/**
 * Tenant-scoped Prisma client (query interceptor).
 *
 * Every read is filtered by `companyId`, every write is stamped with it, and
 * updates/deletes can only target rows inside the tenant. Routes must use this
 * client — `db` is reserved for authentication/bootstrap paths where the tenant
 * is not known yet.
 *
 * Note: `findUnique` is intentionally not rewritten (Prisma only accepts unique
 * fields in that `where`); use `findFirst` for tenant-scoped single reads.
 */
export function tenantClient(companyId: string) {
  if (!companyId) throw new Error("tenantClient requires a companyId");

  return db.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!TENANT_MODELS.has(model)) return query(args);
          const scoped: AnyArgs = { ...(args ?? {}) };

          switch (operation) {
            case "findMany":
            case "findFirst":
            case "findFirstOrThrow":
            case "count":
            case "aggregate":
            case "groupBy":
              scoped.where = { ...(scoped.where ?? {}), companyId };
              break;
            case "create":
              scoped.data = { ...scoped.data, companyId };
              break;
            case "createMany":
              scoped.data = Array.isArray(scoped.data)
                ? scoped.data.map((row: AnyArgs) => ({ ...row, companyId }))
                : { ...scoped.data, companyId };
              break;
            case "update":
            case "updateMany":
            case "delete":
            case "deleteMany":
              scoped.where = { ...(scoped.where ?? {}), companyId };
              break;
            case "upsert":
              scoped.where = { ...(scoped.where ?? {}), companyId };
              scoped.create = { ...scoped.create, companyId };
              break;
            default:
              break;
          }

          return query(scoped);
        },
      },
    },
  });
}

export type TenantClient = ReturnType<typeof tenantClient>;
