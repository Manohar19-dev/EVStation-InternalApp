"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { ADMIN_NAV, moreMenuItems } from "@/config/nav";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminMorePage() {
  const router = useRouter();
  const logout = useAppStore((s) => s.logout);
  const requests = useAppStore((s) => s.requests);
  const notifications = useAppStore((s) => s.notifications);
  const items = moreMenuItems(ADMIN_NAV);
  const pending = requests.filter((r) => r.status === "submitted" || r.status === "under_review").length;
  const unread = notifications.filter((n) => !n.read && (n.audience === "admin" || n.audience === "all")).length;

  return (
    <div className="space-y-4 pb-2">
      <Card className="flex items-center gap-3 rounded-2xl p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 font-display text-[16px] font-bold text-primary-800">
          RV
        </div>
        <div>
          <div className="font-display text-[16px] font-bold">Rajesh Varma</div>
          <div className="t-caption text-ink-500">Owner / Super Admin</div>
        </div>
      </Card>

      <Card className="rounded-2xl p-2">
        {items.map((item) => {
          const Icon = item.icon;
          const count =
            item.badge === "approvals" ? pending : item.badge === "notifications" ? unread : 0;
          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-3.5 hover:bg-surface-muted"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <span className="flex-1 t-label text-ink-900">{item.label}</span>
              {count > 0 ? (
                <span className="rounded-full bg-primary-700 px-2 py-0.5 text-[10px] font-semibold text-white">{count}</span>
              ) : null}
            </Link>
          );
        })}
      </Card>

      <Button
        variant="secondary"
        fullWidth
        leftIcon={<LogOut className="h-4 w-4" />}
        onClick={() => {
          logout();
          router.push("/");
        }}
      >
        Sign out
      </Button>
    </div>
  );
}
