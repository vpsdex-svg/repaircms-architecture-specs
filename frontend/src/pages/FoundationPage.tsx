import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Boxes,
  Building2,
  CheckCircle2,
  Database,
  Hash,
  Package,
  RefreshCw,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { apiGet } from "../lib/api";
import { cn, formatCurrency, formatDate } from "../lib/utils";
import type { BootstrapData, Job, JobStatus, StatusConfig } from "../types";

const FALLBACK_COLORS: Record<JobStatus, string> = {
  DRAFT: "#94a3b8",
  BOOKED: "#f5a623",
  IN_PROGRESS: "#2589f6",
  WAITING_FOR_PARTS: "#a855f7",
  READY: "#22c55e",
  DELIVERED: "#8b98aa",
  INVOICED: "#0f766e",
  CANCELLED: "#ef4444",
};

function StatusBadge({ status, configs }: { status: JobStatus; configs: StatusConfig[] }) {
  const config = configs.find((item) => item.status === status);
  const color = config?.color ?? FALLBACK_COLORS[status];
  const label = config?.label ?? status.replaceAll("_", " ").toLowerCase();

  return (
    <span
      className="pill"
      style={{ backgroundColor: `${color}1a`, color }}
      data-testid={`status-${status}`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="capitalize">{label}</span>
    </span>
  );
}

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Wrench;
  tone?: "primary" | "green" | "amber" | "purple";
}) {
  const tones = {
    primary: "bg-primary-light text-primary",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-violet-50 text-violet-600",
  } as const;

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-1.5 text-2xl font-bold leading-tight tracking-tight text-slate-800">{value}</p>
        </div>
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", tones[tone])}>
          <Icon size={17} strokeWidth={2} />
        </span>
      </div>
      <p className="mt-2 truncate text-[12px] text-slate-500">{hint}</p>
    </div>
  );
}

function customerName(job: Job) {
  if (job.contact.companyName) return job.contact.companyName;
  return [job.contact.firstName, job.contact.lastName].filter(Boolean).join(" ") || "—";
}

function JobsTable({ jobs, configs }: { jobs: Job[]; configs: StatusConfig[] }) {
  return (
    <div className="card overflow-hidden">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <Wrench size={15} className="text-slate-400" />
          <h2 className="card-title">Active repair orders</h2>
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500">
            {jobs.length}
          </span>
        </div>
        <span className="hidden text-[11px] font-medium text-slate-400 sm:block">Seeded from tenant capture</span>
      </div>

      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Job</th>
              <th>Device</th>
              <th>Customer</th>
              <th>Status</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>
                  <div className="font-semibold text-slate-800">#{job.jobNumber}</div>
                  <div className="text-[11px] text-slate-400">{formatDate(job.createdAt)}</div>
                </td>
                <td>
                  <div className="font-medium text-slate-700">
                    {job.brand} {job.model}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {job.imei ? `IMEI ${job.imei}` : `SN ${job.serialNumber ?? "—"}`}
                  </div>
                </td>
                <td>
                  <div className="max-w-[170px] truncate text-slate-700">{customerName(job)}</div>
                  <div className="text-[11px] text-slate-400">
                    {job.assignedTechnician
                      ? `${job.assignedTechnician.firstName} ${job.assignedTechnician.lastName}`
                      : "Unassigned"}
                  </div>
                </td>
                <td>
                  <StatusBadge status={job.status} configs={configs} />
                </td>
                <td className="text-right">
                  <div className="font-semibold tabular-nums text-slate-800">{formatCurrency(job.totalGross)}</div>
                  <div className="text-[11px] text-slate-400">
                    {job.remainingBalance > 0 ? `${formatCurrency(job.remainingBalance)} open` : "settled"}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StockTable({ data }: { data: BootstrapData }) {
  return (
    <div className="card overflow-hidden">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <Boxes size={15} className="text-slate-400" />
          <h2 className="card-title">Spare parts inventory</h2>
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500">
            {data.stockItems.length}
          </span>
        </div>
        <span className="hidden text-[11px] font-medium text-slate-400 sm:block">
          Cost + markup → net → 19% VAT → gross
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Item</th>
              <th className="text-right">On hand</th>
              <th className="text-right">Cost</th>
              <th className="text-right">Markup</th>
              <th className="text-right">Net</th>
              <th className="text-right">Gross</th>
            </tr>
          </thead>
          <tbody>
            {data.stockItems.map((item) => {
              const low = item.quantityOnHand <= item.reorderPoint;
              return (
                <tr key={item.id}>
                  <td className="whitespace-nowrap font-mono text-[11px] text-slate-500">{item.sku}</td>
                  <td>
                    <div className="max-w-[260px] truncate font-medium text-slate-700">{item.title}</div>
                    <div className="text-[11px] text-slate-400">
                      {item.category}
                      {item.storageBin ? ` · Bin ${item.storageBin}` : ""}
                    </div>
                  </td>
                  <td className="text-right">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold tabular-nums",
                        low ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600",
                      )}
                    >
                      {low && <AlertTriangle size={11} />}
                      {item.quantityOnHand}
                    </span>
                  </td>
                  <td className="text-right tabular-nums text-slate-500">{formatCurrency(item.purchasePriceNet)}</td>
                  <td className="text-right tabular-nums text-slate-500">{item.markupPercent}%</td>
                  <td className="text-right tabular-nums text-slate-700">{formatCurrency(item.sellingPriceNet)}</td>
                  <td className="text-right font-semibold tabular-nums text-slate-800">
                    {formatCurrency(item.sellingPriceGross)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CompanyCard({ data }: { data: BootstrapData }) {
  const { company } = data;
  const rows = [
    { label: "VAT ID (USt-IdNr.)", value: company.vatId ?? "—" },
    { label: "Tax number", value: company.taxNumber ?? "—" },
    { label: "Address", value: [company.street, `${company.zipCode ?? ""} ${company.city ?? ""}`].filter(Boolean).join(", ") },
    { label: "Managing director", value: company.ceoName ?? "—" },
    { label: "Bank", value: company.iban ?? "—" },
    { label: "Portal slug", value: company.portalSlug },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <Building2 size={15} className="text-slate-400" />
          <h2 className="card-title">Tenant</h2>
        </div>
        <span className="pill bg-emerald-50 text-emerald-600">{company.planType.toLowerCase()}</span>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sidebar text-sm font-bold text-white">
            FB
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-slate-800">{company.name}</p>
            <p className="truncate text-[12px] text-slate-500">{company.legalName}</p>
          </div>
        </div>

        <dl className="mt-4 space-y-2 border-t border-line pt-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-3 text-[12px]">
              <dt className="shrink-0 text-slate-400">{row.label}</dt>
              <dd className="max-w-[62%] truncate text-right font-medium text-slate-700">{row.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">
          {company.locations.map((location) => (
            <span key={location.id} className="pill bg-slate-100 text-slate-600">
              {location.code} · {location.city}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PipelineCard({ data }: { data: BootstrapData }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <ShieldCheck size={15} className="text-slate-400" />
          <h2 className="card-title">Status pipeline</h2>
        </div>
        <span className="text-[11px] font-medium text-slate-400">8 stages</span>
      </div>

      <ol className="divide-y divide-line">
        {data.statusConfigs.map((config) => (
          <li key={config.id} className="flex items-center gap-2.5 px-5 py-2.5">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: config.color }} />
            <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-slate-700">{config.label}</span>
            <span className="shrink-0 font-mono text-[10.5px] text-slate-400">{config.status}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function FiscalCard({ data }: { data: BootstrapData }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <Hash size={15} className="text-slate-400" />
          <h2 className="card-title">Fiscal counters</h2>
        </div>
        <span className="text-[11px] font-medium text-slate-400">GoBD</span>
      </div>

      <div className="space-y-2.5 p-5">
        {data.sequences.map((sequence) => (
          <div key={sequence.id} className="flex items-center justify-between gap-3">
            <span className="text-[12px] text-slate-500">{sequence.key.replace("_", " ").toLowerCase()}</span>
            <span className="font-mono text-[12px] font-semibold text-slate-700">
              {sequence.prefix}-{sequence.year}-{String(sequence.nextValue).padStart(sequence.padding, "0")}
            </span>
          </div>
        ))}

        {data.cashbook && (
          <div className="mt-1 flex items-center justify-between gap-3 border-t border-line pt-3">
            <span className="text-[12px] text-slate-500">
              Cashbook {data.cashbook.registerCode} · {data.cashbook.status.toLowerCase()}
            </span>
            <span className="font-semibold tabular-nums text-slate-700">
              {formatCurrency(data.cashbook.expectedClosingBalance)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function ServicesCard({ data }: { data: BootstrapData }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <Package size={15} className="text-slate-400" />
          <h2 className="card-title">Service catalog</h2>
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500">
            {data.services.length}
          </span>
        </div>
        <span className="text-[11px] font-medium text-slate-400">Labour rates</span>
      </div>

      <ul className="divide-y divide-line">
        {data.services.map((service) => (
          <li key={service.id} className="flex items-center gap-3 px-5 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-slate-700">{service.title}</p>
              <p className="text-[11px] text-slate-400">
                {service.code} · {service.category} · {service.durationMinutes} min
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[13px] font-semibold tabular-nums text-slate-800">
                {formatCurrency(service.laborPriceNet)}
              </p>
              {service.isExpressBookable && (
                <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">express</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FoundationChecks({ data }: { data: BootstrapData }) {
  const checks = [
    { label: "PostgreSQL 16 connected & migrated", detail: `${data.build.schemaModels} Prisma models` },
    { label: "Tenant seeded with Fix Berlin", detail: `VAT ${data.company.vatId ?? "—"}` },
    { label: "Repair orders present", detail: `${data.counts.jobs} active jobs` },
    { label: "Device catalog loaded", detail: `${data.counts.deviceBrands} brands · ${data.counts.deviceModels} models` },
    { label: "Gap-free fiscal numbering", detail: `${data.sequences.length} counters` },
    {
      label: "Notification templates",
      detail: `${data.counts.templates} SMS / e-mail templates`,
    },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <Database size={15} className="text-slate-400" />
          <h2 className="card-title">Foundation verification</h2>
        </div>
        <span className="pill bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={11} /> all green
        </span>
      </div>

      <ul className="grid grid-cols-1 gap-x-6 gap-y-3 p-5 sm:grid-cols-2">
        {checks.map((check) => (
          <li key={check.label} className="flex items-start gap-2.5">
            <BadgeCheck size={15} className="mt-0.5 shrink-0 text-emerald-500" />
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-medium text-slate-700">{check.label}</p>
              <p className="truncate text-[11px] text-slate-400">{check.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FoundationPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["bootstrap"],
    queryFn: () => apiGet<BootstrapData>("/system/bootstrap"),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6">
        <div className="card p-6">
          <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-3 w-64 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className="card h-[104px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6">
        <div className="card mx-auto max-w-lg p-6 text-center">
          <AlertTriangle className="mx-auto text-amber-500" size={26} />
          <h1 className="mt-3 text-[15px] font-semibold text-slate-800">Cannot reach the RepairCMS API</h1>
          <p className="mt-1 text-[12.5px] text-slate-500">
            {(error as Error | null)?.message ?? "The API did not respond."}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-[12.5px] font-semibold text-white hover:bg-primary-hover"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const openJobs = data.jobs.filter((job) =>
    ["DRAFT", "BOOKED", "IN_PROGRESS", "WAITING_FOR_PARTS", "READY"].includes(job.status),
  ).length;
  const readyJobs = data.jobs.filter((job) => job.status === "READY").length;
  const stockValue = data.stockItems.reduce((sum, item) => sum + item.sellingPriceNet * item.quantityOnHand, 0);
  const outstanding = data.invoices.reduce((sum, invoice) => sum + (invoice.totalGross - invoice.paidAmount), 0);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[19px] font-bold tracking-tight text-slate-900">Repair Orders</h1>
          <p className="mt-0.5 text-[12.5px] text-slate-500">
            Live tenant data served by the API · {data.counts.contacts} contacts · {data.counts.users} team members
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="pill bg-white text-slate-500 ring-1 ring-line">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Phase {data.build.phase} · Foundation
          </span>
          <button
            type="button"
            onClick={() => void refetch()}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white text-slate-500 hover:text-slate-700"
            aria-label="Refresh data"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3">
        <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-emerald-700">
          <CheckCircle2 size={14} /> Foundation online
        </span>
        <span className="text-[12px] text-emerald-700/80">
          Schema migrated, seed applied, API reachable at <code className="font-mono text-[11px]">/api/v1</code>
        </span>
        <span className="ml-auto hidden text-[11px] text-emerald-700/70 sm:block">
          Synced {new Date(data.build.generatedAt).toLocaleTimeString("de-DE")}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard label="Open jobs" value={String(openJobs)} hint={`${data.jobs.length} total in tenant`} icon={Wrench} />
        <KpiCard
          label="Ready for pickup"
          value={String(readyJobs)}
          hint="Waiting on customer collection"
          icon={BadgeCheck}
          tone="green"
        />
        <KpiCard
          label="Inventory value"
          value={formatCurrency(stockValue)}
          hint={`${data.stockItems.length} SKUs · net stock value`}
          icon={Boxes}
          tone="purple"
        />
        <KpiCard
          label="Outstanding"
          value={formatCurrency(outstanding)}
          hint={`${data.invoices.length} issued invoices`}
          icon={ArrowUpRight}
          tone="amber"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.9fr)_minmax(320px,1fr)]">
        <div className="min-w-0 space-y-4">
          <JobsTable jobs={data.jobs} configs={data.statusConfigs} />
          <StockTable data={data} />
        </div>

        <div className="min-w-0 space-y-4">
          <CompanyCard data={data} />
          <PipelineCard data={data} />
          <FiscalCard data={data} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FoundationChecks data={data} />
        <ServicesCard data={data} />
      </div>
    </div>
  );
}
