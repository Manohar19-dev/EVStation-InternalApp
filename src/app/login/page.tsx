"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CombinedLogin } from "@/components/auth/CombinedLogin";
import type { PrototypeRole } from "@/types";

function LoginRedirect() {
  const params = useSearchParams();
  const role: PrototypeRole = params.get("as") === "employee" ? "employee" : "admin";
  return <CombinedLogin initialRole={role} />;
}

/** Combined login. Deep links: ?as=admin|employee. Entry after splash on `/`. */
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 t-body text-ink-500">Loading…</div>}>
      <LoginRedirect />
    </Suspense>
  );
}
