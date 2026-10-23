import type { JobRole, PermissionKey, RoleTemplate } from "@/types";

/** Owner / Super Admin — everything including approve & release. */
export const ADMIN_PERMISSIONS: PermissionKey[] = [
  "view.stations.all",
  "edit.stations.all",
  "manage.stations.all",
  "view.employees.all",
  "create.employees.all",
  "edit.employees.all",
  "assign.employees.all",
  "manage.employees.all",
  "view.attendance.all",
  "view.checklists.all",
  "view.tasks.all",
  "create.tasks.all",
  "assign.tasks.all",
  "edit.tasks.all",
  "view.maintenance.all",
  "create.maintenance.all",
  "edit.maintenance.all",
  "view.requests.all",
  "comment.requests.all",
  "approve.requests.all",
  "release.requests.all",
  "view.notifications.all",
  "view.audit.all",
  "manage.settings.all",
  "view.finance.all",
  "view.reports.all",
  "view.documents.all",
  "view.inventory.all",
];

/**
 * Combined employee prototype set = union of Ops / Accounts / Supervisor /
 * Technician / Attendant capabilities, minus every approve.* and release.*.
 */
export const EMPLOYEE_PERMISSIONS: PermissionKey[] = [
  "view.stations.cluster",
  "view.employees.cluster",
  "view.attendance.own",
  "create.attendance.own",
  "view.checklists.station",
  "create.checklists.station",
  "edit.checklists.station",
  "view.tasks.station",
  "edit.tasks.station",
  "create.tasks.station",
  "view.maintenance.station",
  "create.maintenance.station",
  "edit.maintenance.station",
  "view.requests.own",
  "create.requests.own",
  "edit.requests.own",
  "verify.requests.cluster",
  "comment.requests.cluster",
  "view.notifications.own",
  "view.finance.station",
  "view.documents.station",
  "view.inventory.station",
];

export function permissionsFor(role: "admin" | "employee"): PermissionKey[] {
  return role === "admin" ? [...ADMIN_PERMISSIONS] : [...EMPLOYEE_PERMISSIONS];
}

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: "owner",
    name: "Owner / Super Admin",
    description: "Sole approver for all money movement. Full network access.",
    permissions: ADMIN_PERMISSIONS,
  },
  {
    id: "operations_manager",
    name: "Operations Manager",
    description: "Assign staff and tasks, review reports, verify and recommend requests.",
    permissions: EMPLOYEE_PERMISSIONS.filter(
      (p) => !p.startsWith("create.attendance") && p !== "view.finance.station",
    ),
  },
  {
    id: "accounts",
    name: "Accounts / Finance",
    description: "Prepare payouts, upload bills, reconcile. Cannot approve or release.",
    permissions: [
      "view.requests.own",
      "comment.requests.cluster",
      "view.finance.station",
      "view.notifications.own",
      "view.stations.cluster",
      "view.employees.cluster",
    ],
  },
  {
    id: "station_supervisor",
    name: "Station Supervisor",
    description: "Run checklists, raise requests, mark attendance, log incidents.",
    permissions: EMPLOYEE_PERMISSIONS.filter((p) => !p.startsWith("verify.")),
  },
  {
    id: "field_technician",
    name: "Field Technician",
    description: "Accept and close maintenance tickets, log parts, upload photos.",
    permissions: [
      "view.stations.cluster",
      "view.tasks.station",
      "edit.tasks.station",
      "view.maintenance.station",
      "create.maintenance.station",
      "edit.maintenance.station",
      "view.notifications.own",
      "create.attendance.own",
      "view.attendance.own",
    ],
  },
  {
    id: "station_attendant",
    name: "Station Attendant",
    description: "Check in/out, complete shift checklist, raise issues, request advance or leave.",
    permissions: [
      "view.stations.station",
      "create.attendance.own",
      "view.attendance.own",
      "view.checklists.station",
      "create.checklists.station",
      "edit.checklists.station",
      "view.tasks.station",
      "edit.tasks.station",
      "create.maintenance.station",
      "view.maintenance.station",
      "create.requests.own",
      "view.requests.own",
      "view.notifications.own",
    ],
  },
];

export function roleLabel(role: JobRole): string {
  return ROLE_TEMPLATES.find((r) => r.id === role)?.name ?? role;
}
