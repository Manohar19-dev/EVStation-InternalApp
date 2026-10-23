"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Leaf, LogOut, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ADMIN_NAV, mobileTabs, moreMenuItems, visibleNav } from "@/config/nav";
import { cn } from "@/lib/cn";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { PresenterPanel } from "@/components/demo/PresenterPanel";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { MobileHeader } from "@/components/layout/MobileHeader";

function titleFor(pathname: string) {
  if (pathname === "/admin") return "Network";
  if (pathname.startsWith("/admin/stations")) return "Stations";
  if (pathname.startsWith("/admin/approvals")) return "Approvals";
  if (pathname.startsWith("/admin/operations")) return "Operations";
  if (pathname.startsWith("/admin/employees")) return "Employees";
  if (pathname.startsWith("/admin/notifications")) return "Alerts";
  if (pathname.startsWith("/admin/audit")) return "Audit";
  if (pathname.startsWith("/admin/settings")) return "Settings";
  if (pathname.startsWith("/admin/more")) return "More";
  return "EV Network";
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const session = useAppStore((s) => s.session);
  const notifications = useAppStore((s) => s.notifications);
  const requests = useAppStore((s) => s.requests);
  const logout = useAppStore((s) => s.logout);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const tabs = useMemo(() => mobileTabs(ADMIN_NAV), []);
  const drawerItems = useMemo(() => moreMenuItems(ADMIN_NAV), []);
  const allNav = useMemo(() => visibleNav(ADMIN_NAV), []);

  const pendingApprovals = requests.filter((r) => r.status === "submitted" || r.status === "under_review").length;
  const unread = notifications.filter((n) => !n.read && (n.audience === "admin" || n.audience === "all")).length;
  const unauthorized = hydrated && (!session.isLoggedIn || session.role !== "admin");

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
    pathname.includes("/stations/") ||
    pathname.includes("/employees/") ||
    (pathname !== "/admin" && pathname.split("/").length > 3);

  const badgeFor = (b?: "approvals" | "notifications") => {
    if (b === "approvals" && pendingApprovals > 0) return pendingApprovals;
    if (b === "notifications" && unread > 0) return unread;
    return 0;
  };

  const showTabs = !isDetail || pathname.endsWith("/more");

  return (
    <DeviceFrame side={<PresenterPanel docked />}>
      <div className="flex h-full min-h-0 flex-col bg-canvas text-ink-900">
        <MobileHeader
          title={titleFor(pathname)}
          subtitle={pathname === "/admin" ? "Owner / Super Admin" : undefined}
          showBack={isDetail && !pathname.endsWith("/more")}
          onMenu={!isDetail || pathname.endsWith("/more") ? () => setDrawerOpen(true) : undefined}
          onBell={() => router.push("/admin/notifications")}
          bellDot={unread > 0}
        />

        <main className="scroll-hide min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-1">
          {children}
        </main>

        {showTabs ? (
          <nav className="shrink-0 border-t border-line bg-surface pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5">
            <div className="flex items-stretch justify-around px-1">
              {tabs.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : item.href === "/admin/more"
                      ? pathname.startsWith("/admin/more") || drawerItems.some((d) => pathname.startsWith(d.href))
                      : pathname.startsWith(item.href);
                const Icon = item.icon;
                const count = badgeFor(item.badge);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 py-1.5 t-caption",
                      active ? "text-primary-700" : "text-ink-500",
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.75} />
                    <span className="truncate text-[10px] font-medium">{item.label}</span>
                    {count > 0 ? (
                      <span className="absolute right-[18%] top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-700 px-1 text-[9px] font-semibold text-white">
                        {count > 9 ? "9+" : count}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </nav>
        ) : null}

        {/* Menu drawer */}
        {drawerOpen ? (
          <div className="absolute inset-0 z-[80] flex">
            <button type="button" className="absolute inset-0 bg-[rgba(20,32,25,0.4)]" aria-label="Close" onClick={() => setDrawerOpen(false)} />
            <div className="relative z-10 flex h-full w-[82%] max-w-[300px] flex-col bg-surface shadow-md">
              <div className="flex items-center gap-3 border-b border-line px-4 pb-4 pt-[max(1rem,var(--sb))]">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-700 text-white">
                  <Leaf className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-[14px] font-bold text-primary-900">EV Network</div>
                  <div className="t-caption text-ink-500">Rajesh Varma · Owner</div>
                </div>
                <button type="button" aria-label="Close menu" onClick={() => setDrawerOpen(false)} className="rounded-full p-2 hover:bg-surface-muted">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                {allNav
                  .filter((i) => i.id !== "more")
                  .map((item) => {
                    const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                    const Icon = item.icon;
                    const count = badgeFor(item.badge);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setDrawerOpen(false)}
                        className={cn(
                          "mb-1 flex items-center gap-3 rounded-xl px-3 py-3 t-label",
                          active ? "bg-primary-50 text-primary-800" : "text-ink-700 hover:bg-surface-muted",
                        )}
                      >
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                        <span className="flex-1">{item.label}</span>
                        {count > 0 ? (
                          <span className="rounded-full bg-primary-700 px-2 py-0.5 text-[10px] font-semibold text-white">{count}</span>
                        ) : null}
                      </Link>
                    );
                  })}
              </div>
              <div className="border-t border-line p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    logout();
                    router.push("/");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 t-label text-err-fg hover:bg-err-bg"
                >
                  <LogOut className="h-5 w-5" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </DeviceFrame>
  );
}
