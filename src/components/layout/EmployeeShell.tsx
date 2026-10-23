"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AlertTriangle, Banknote, CheckSquare, ClipboardList, Leaf, LogIn, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EMPLOYEE_NAV, mobileTabs, moreMenuItems, visibleNav } from "@/config/nav";
import { cn } from "@/lib/cn";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { PresenterPanel } from "@/components/demo/PresenterPanel";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { MobileHeader } from "@/components/layout/MobileHeader";

function titleFor(pathname: string) {
  if (pathname === "/app") return "Home";
  if (pathname.startsWith("/app/work")) return "My Work";
  if (pathname.startsWith("/app/attendance")) return "Attendance";
  if (pathname.startsWith("/app/checklists")) return "Checklist";
  if (pathname.startsWith("/app/tasks")) return "Tasks";
  if (pathname.startsWith("/app/maintenance")) return "Maintenance";
  if (pathname.startsWith("/app/requests")) return "Requests";
  if (pathname.startsWith("/app/notifications")) return "Alerts";
  if (pathname.startsWith("/app/stations")) return "Stations";
  if (pathname.startsWith("/app/employees")) return "Team";
  if (pathname.startsWith("/app/profile")) return "Profile";
  if (pathname.startsWith("/app/more")) return "More";
  return "EV Network";
}

export function EmployeeShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const session = useAppStore((s) => s.session);
  const notifications = useAppStore((s) => s.notifications);
  const employees = useAppStore((s) => s.employees);
  const [quickOpen, setQuickOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const tabs = useMemo(() => mobileTabs(EMPLOYEE_NAV), []);
  const allNav = useMemo(() => visibleNav(EMPLOYEE_NAV).filter((i) => i.id !== "more"), []);
  const me = employees.find((e) => e.id === session.personaId);
  const unread = notifications.filter(
    (n) => !n.read && (n.audience === "employee" || n.audience === "all") && (!n.employeeId || n.employeeId === session.personaId),
  ).length;
  const unauthorized = hydrated && (!session.isLoggedIn || session.role !== "employee");

  useEffect(() => {
    if (unauthorized) router.replace("/");
  }, [unauthorized, router]);

  if (!hydrated || unauthorized) {
    return (
      <DeviceFrame side={<PresenterPanel docked />}>
        <div className="flex h-full items-center justify-center bg-canvas t-body text-ink-500">Loading…</div>
      </DeviceFrame>
    );
  }

  const isDetail =
    pathname.includes("/tasks/") ||
    pathname.includes("/maintenance/") ||
    pathname.includes("/requests/") ||
    pathname.endsWith("/new");

  const showTabs = !isDetail;

  return (
    <DeviceFrame side={<PresenterPanel docked />}>
      <div className="flex h-full min-h-0 flex-col bg-canvas text-ink-900">
        <MobileHeader
          title={titleFor(pathname)}
          subtitle={pathname === "/app" ? me?.name.split(" ")[0] : undefined}
          showBack={isDetail}
          onMenu={!isDetail ? () => setDrawerOpen(true) : undefined}
          onBell={() => router.push("/app/notifications")}
          bellDot={unread > 0}
        />

        <main className="scroll-hide min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-1">
          {children}
        </main>

        {showTabs ? (
          <nav className="relative shrink-0 border-t border-line bg-surface pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
            <div className="flex items-end justify-around px-1">
              {tabs.slice(0, 2).map((item) => {
                const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn("flex w-[18%] flex-col items-center gap-0.5 py-1.5", active ? "text-primary-700" : "text-ink-500")}
                  >
                    <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.75} />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </Link>
                );
              })}

              <button
                type="button"
                aria-label="Quick actions"
                onClick={() => setQuickOpen(true)}
                className="-mt-6 flex h-[56px] w-[56px] items-center justify-center rounded-full bg-primary-700 text-white shadow-md ring-4 ring-canvas"
              >
                <Plus className="h-7 w-7" strokeWidth={2.25} />
              </button>

              {tabs.slice(2).map((item) => {
                const active =
                  item.id === "more"
                    ? pathname.startsWith("/app/more") || moreMenuItems(EMPLOYEE_NAV).some((d) => pathname.startsWith(d.href) && !mobileTabs(EMPLOYEE_NAV).some((t) => t.href === d.href))
                    : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn("flex w-[18%] flex-col items-center gap-0.5 py-1.5", active ? "text-primary-700" : "text-ink-500")}
                  >
                    <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.75} />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        ) : null}

        {/* Quick actions sheet */}
        {quickOpen ? (
          <div className="absolute inset-0 z-[80] flex flex-col justify-end">
            <button type="button" className="absolute inset-0 bg-[rgba(20,32,25,0.4)]" aria-label="Close" onClick={() => setQuickOpen(false)} />
            <div className="relative z-10 rounded-t-[28px] bg-surface px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-sheet">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line-strong" />
              <div className="mb-3 font-display text-[16px] font-bold">Quick actions</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { href: "/app/attendance", label: "Check in", icon: LogIn, tint: "bg-primary-50 text-primary-700" },
                  { href: "/app/checklists", label: "Checklist", icon: CheckSquare, tint: "bg-sage-100 text-sage-600" },
                  { href: "/app/maintenance/new", label: "Raise issue", icon: AlertTriangle, tint: "bg-warn-bg text-warn-fg" },
                  { href: "/app/requests/new", label: "Request money", icon: Banknote, tint: "bg-clay-100 text-clay-700" },
                ].map((a) => (
                  <button
                    key={a.href}
                    type="button"
                    className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-canvas p-4 text-left active:scale-[0.98]"
                    onClick={() => {
                      setQuickOpen(false);
                      router.push(a.href);
                    }}
                  >
                    <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", a.tint)}>
                      <a.icon className="h-5 w-5" />
                    </div>
                    <span className="t-label text-ink-900">{a.label}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-line px-4 py-3.5 text-left"
                onClick={() => {
                  setQuickOpen(false);
                  router.push("/app/tasks");
                }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-ink-700">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <span className="t-label">Open tasks</span>
              </button>
            </div>
          </div>
        ) : null}

        {drawerOpen ? (
          <div className="absolute inset-0 z-[80] flex">
            <button type="button" className="absolute inset-0 bg-[rgba(20,32,25,0.4)]" aria-label="Close" onClick={() => setDrawerOpen(false)} />
            <div className="relative z-10 flex h-full w-[82%] max-w-[300px] flex-col bg-surface shadow-md">
              <div className="flex items-center gap-3 border-b border-line px-4 pb-4 pt-[max(1rem,var(--sb))]">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-700 text-white">
                  <Leaf className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-[14px] font-bold text-primary-900">{me?.name ?? "Employee"}</div>
                  <div className="t-caption text-ink-500">Field operations</div>
                </div>
                <button type="button" aria-label="Close" onClick={() => setDrawerOpen(false)} className="rounded-full p-2">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                {allNav.map((item) => {
                  const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={cn(
                        "mb-1 flex items-center gap-3 rounded-xl px-3 py-3 t-label",
                        active ? "bg-primary-50 text-primary-800" : "text-ink-700",
                      )}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </DeviceFrame>
  );
}
