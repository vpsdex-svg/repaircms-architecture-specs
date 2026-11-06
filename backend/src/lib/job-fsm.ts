import type { JobStatus } from "@prisma/client";

/**
 * Repair order finite state machine (brief §B).
 *
 * DRAFT -> BOOKED -> IN_PROGRESS -> WAITING_FOR_PARTS -> READY -> DELIVERED
 *   -> INVOICED, with CANCELLED reachable from any open state.
 */
const TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  DRAFT: ["BOOKED", "CANCELLED"],
  BOOKED: ["IN_PROGRESS", "WAITING_FOR_PARTS", "CANCELLED"],
  IN_PROGRESS: ["WAITING_FOR_PARTS", "READY", "CANCELLED"],
  WAITING_FOR_PARTS: ["IN_PROGRESS", "READY", "CANCELLED"],
  READY: ["DELIVERED", "IN_PROGRESS", "CANCELLED"],
  DELIVERED: ["INVOICED"],
  INVOICED: [],
  CANCELLED: [],
};

export const OPEN_STATUSES: JobStatus[] = [
  "DRAFT",
  "BOOKED",
  "IN_PROGRESS",
  "WAITING_FOR_PARTS",
  "READY",
];

export type TransitionContext = {
  assignedTechnicianId?: string | null;
  diagnosisReport?: string | null;
  technicianFindings?: string | null;
  deliverySignatureUrl?: string | null;
  paidAmount?: number;
  totalGross?: number;
  deliveredAt?: Date | null;
};

export type TransitionCheck = { allowed: true } | { allowed: false; reason: string };

export function canTransition(
  from: JobStatus,
  to: JobStatus,
  context: TransitionContext = {},
): TransitionCheck {
  if (from === to) return { allowed: false, reason: `Job is already in status ${to}` };

  const allowedTargets = TRANSITIONS[from] ?? [];
  if (!allowedTargets.includes(to)) {
    return {
      allowed: false,
      reason: `Illegal transition ${from} -> ${to}. Allowed: ${allowedTargets.join(", ") || "none"}`,
    };
  }

  if (to === "READY") {
    const hasTechnician = Boolean(context.assignedTechnicianId);
    const hasDiagnosis = Boolean(
      (context.diagnosisReport && context.diagnosisReport.trim()) ||
        (context.technicianFindings && context.technicianFindings.trim()),
    );
    if (!hasTechnician && !hasDiagnosis) {
      return {
        allowed: false,
        reason: "Status READY requires an assigned technician or a diagnosis report",
      };
    }
  }

  if (to === "DELIVERED") {
    if (!context.deliverySignatureUrl) {
      return { allowed: false, reason: "Status DELIVERED requires the customer's signature confirmation" };
    }
    const paid = Number(context.paidAmount ?? 0);
    const total = Number(context.totalGross ?? 0);
    if (total > 0 && paid + 0.001 < total) {
      return {
        allowed: false,
        reason: `Status DELIVERED requires verified payment (paid ${paid.toFixed(2)} of ${total.toFixed(2)})`,
      };
    }
  }

  return { allowed: true };
}

export const STATUS_ORDER: JobStatus[] = [
  "DRAFT",
  "BOOKED",
  "IN_PROGRESS",
  "WAITING_FOR_PARTS",
  "READY",
  "DELIVERED",
  "INVOICED",
  "CANCELLED",
];
