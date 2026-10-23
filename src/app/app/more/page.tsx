"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { EMPLOYEE_NAV, visibleNav } from "@/config/nav";
import { useAppStore } from "@/store/useAppStore";
import { Avatar, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { JOB_ROLE_SHORT } from "@/lib/labels";

export default function MorePage() {
  const router = useRouter();
  const logout = useAppStore((s) => s.logout);
  const session = useAppStore((s) => s.session);
  const employees = useAppStore((s) => s.employees);
  const me = employees.find((e) => e.id === session.personaId);
  const items = visibleNav(EMPLOYEE_NAV).filter((i) => !["home", "mywork", "requests", "more"].includes(i.id));

  return (
    <div className="space-y-4 pb-2">
      <Card className="flex items-center gap-3 rounded-2xl p-4">
        <Avatar initials={me?.avatarInitials ?? "??"} size={56} />
        <div>
          <div className="font-display text-[18px] font-bold">{me?.name}</div>
          <div className="t-caption text-ink-500">{me ? JOB_ROLE_SHORT[me.jobRole] : ""}</div>
        </div>
      </Card>

      <Card className="rounded-2xl p-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.id} href={item.href} className="flex items-center gap-3 rounded-xl px-3 py-3.5 hover:bg-surface-muted">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <span className="t-label text-ink-900">{item.label}</span>
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
