import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Bell,
  Boxes,
  ChevronDown,
  CircleHelp,
  LayoutDashboard,
  ReceiptText,
  Search,
  Settings,
  Users,
  Wrench,
} from "lucide-react";
import { cn } from "../lib/utils";

const navigation = [
  { to: "/", label: "Repair Orders", icon: Wrench, ready: true },
  { to: "/contacts", label: "Contacts", icon: Users, ready: false },
  { to: "/stock", label: "Stock", icon: Boxes, ready: false },
  { to: "/invoices", label: "Invoices", icon: ReceiptText, ready: false },
  { to: "/settings", label: "Settings", icon: Settings, ready: false },
];

function Sidebar() {
  return (
    <aside className="hidden w-[68px] shrink-0 flex-col items-center gap-1 bg-sidebar py-4 md:flex">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-[15px] font-extrabold tracking-tight text-white shadow-lg shadow-primary/30">
        RC
      </div>

      {navigation.map((item) => {
        const Icon = item.icon;
        const content = (
          <span
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl transition",
              item.ready
                ? "text-white/70 hover:bg-white/10 hover:text-white"
                : "cursor-not-allowed text-white/25",
            )}
            title={item.ready ? item.label : `${item.label} — Phase 2`}
          >
            <Icon size={19} strokeWidth={1.9} />
          </span>
        );

        return item.ready ? (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex h-11 w-11 items-center justify-center rounded-xl transition",
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )
            }
            aria-label={item.label}
          >
            <Icon size={19} strokeWidth={1.9} />
          </NavLink>
        ) : (
          <span key={item.to} aria-disabled="true">
            {content}
          </span>
        );
      })}

      <div className="mt-auto flex flex-col items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg text-white/40" title="Help">
          <CircleHelp size={18} strokeWidth={1.9} />
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-white">
          FI
        </span>
      </div>
    </aside>
  );
}

function MobileNav() {
  return (
    <nav className="flex items-center gap-1 overflow-x-auto border-b border-line bg-surface px-3 py-2 md:hidden">
      {navigation.map((item) => {
        const Icon = item.icon;
        if (!item.ready) {
          return (
            <span
              key={item.to}
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-slate-300"
            >
              <Icon size={15} /> {item.label}
            </span>
          );
        }
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold",
                isActive ? "bg-primary-light text-primary" : "text-slate-600",
              )
            }
          >
            <Icon size={15} /> {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

export function AppShell() {
  const location = useLocation();
  const isFoundation = location.pathname === "/";

  return (
    <div className="flex h-full min-h-screen bg-canvas">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 text-[13px]">
            <LayoutDashboard size={16} className="shrink-0 text-slate-400" />
            <span className="truncate font-semibold text-slate-800">{isFoundation ? "Repair Orders" : "Workspace"}</span>
            <span className="hidden rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:inline">
              Fix Berlin
            </span>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <div className="hidden items-center gap-2 rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-[12px] text-slate-400 lg:flex">
              <Search size={14} />
              <span>Search jobs, contacts…</span>
              <kbd className="rounded border border-line bg-surface px-1 py-0.5 text-[10px] font-semibold text-slate-400">
                ⌘K
              </kbd>
            </div>
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-canvas"
              aria-label="Notifications"
            >
              <Bell size={17} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-status-booked ring-2 ring-white" />
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-1.5 hover:bg-canvas"
              aria-label="Account menu"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sidebar text-[11px] font-bold text-white">
                FI
              </span>
              <span className="hidden text-left text-[12px] leading-tight sm:block">
                <span className="block font-semibold text-slate-800">Fix it</span>
                <span className="block text-[11px] text-slate-400">Owner</span>
              </span>
              <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
            </button>
          </div>
        </header>

        <MobileNav />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
