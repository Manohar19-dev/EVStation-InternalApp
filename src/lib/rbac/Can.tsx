"use client";

import type { ReactNode } from "react";
import type { PermissionKey } from "@/types";
import { useAppStore } from "@/store/useAppStore";

export function can(permission: PermissionKey, permissions: PermissionKey[]): boolean {
  if (permissions.includes(permission)) return true;
  // Broader scopes satisfy narrower ones for the same action.module
  const [action, module] = permission.split(".") as [string, string, string];
  const broader: PermissionKey[] = [
    `${action}.${module}.all` as PermissionKey,
    `${action}.${module}.cluster` as PermissionKey,
    `${action}.${module}.station` as PermissionKey,
  ];
  return broader.some((p) => permissions.includes(p));
}

export function useCan() {
  const permissions = useAppStore((s) => s.session.permissions);
  return (permission: PermissionKey) => can(permission, permissions);
}

export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: PermissionKey;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const allowed = useCan()(permission);
  return <>{allowed ? children : fallback}</>;
}

/** Hard rule: employees never get approve/release. */
export function isMoneyDecision(permission: PermissionKey): boolean {
  return permission.startsWith("approve.") || permission.startsWith("release.");
}
