import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  MapPinned,
  Users,
  ClipboardCheck,
  Inbox,
  Bell,
  ScrollText,
  Settings,
  Home,
  Briefcase,
  CalendarClock,
  ListChecks,
  ListTodo,
  AlertTriangle,
  FileText,
  UserRound,
  MoreHorizontal,
} from "lucide-react";
import type { PermissionKey } from "@/types";
import { FEATURES } from "@/config/features";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  permission: PermissionKey;
  phase: 1 | 2;
  mobileTab?: boolean;
  badge?: "approvals" | "notifications";
  group?: string;
}

/** Admin bottom tabs: Home · Stations · Approvals · Ops · More */
export const ADMIN_NAV: NavItem[] = [
  { id: "dash", label: "Home", href: "/admin", icon: LayoutDashboard, permission: "view.stations.all", phase: 1, mobileTab: true },
  { id: "stations", label: "Stations", href: "/admin/stations", icon: MapPinned, permission: "view.stations.all", phase: 1, mobileTab: true },
  { id: "approvals", label: "Approvals", href: "/admin/approvals", icon: Inbox, permission: "approve.requests.all", phase: 1, mobileTab: true, badge: "approvals" },
  { id: "operations", label: "Ops", href: "/admin/operations", icon: ClipboardCheck, permission: "view.tasks.all", phase: 1, mobileTab: true },
  { id: "more", label: "More", href: "/admin/more", icon: MoreHorizontal, permission: "view.stations.all", phase: 1, mobileTab: true },
  // Drawer / More menu only
  { id: "employees", label: "Employees", href: "/admin/employees", icon: Users, permission: "view.employees.all", phase: 1, group: "Manage" },
  { id: "notifications", label: "Notifications", href: "/admin/notifications", icon: Bell, permission: "view.notifications.all", phase: 1, badge: "notifications", group: "Manage" },
  { id: "audit", label: "Audit Log", href: "/admin/audit", icon: ScrollText, permission: "view.audit.all", phase: 1, group: "Manage" },
  { id: "settings", label: "Settings", href: "/admin/settings", icon: Settings, permission: "manage.settings.all", phase: 1, group: "Manage" },
  { id: "finance", label: "Finance", href: "/admin/finance", icon: FileText, permission: "view.finance.all", phase: 2, group: "Manage" },
];

/** Employee bottom tabs: Home · Work · (FAB) · Requests · More */
export const EMPLOYEE_NAV: NavItem[] = [
  { id: "home", label: "Home", href: "/app", icon: Home, permission: "view.notifications.own", phase: 1, mobileTab: true, group: "Field" },
  { id: "mywork", label: "My Work", href: "/app/work", icon: Briefcase, permission: "view.tasks.station", phase: 1, mobileTab: true, group: "Field" },
  { id: "requests", label: "Requests", href: "/app/requests", icon: FileText, permission: "view.requests.own", phase: 1, mobileTab: true, group: "Requests" },
  { id: "more", label: "More", href: "/app/more", icon: MoreHorizontal, permission: "view.notifications.own", phase: 1, mobileTab: true, group: "Me" },
  { id: "attendance", label: "Attendance", href: "/app/attendance", icon: CalendarClock, permission: "view.attendance.own", phase: 1, group: "Field" },
  { id: "checklists", label: "Checklists", href: "/app/checklists", icon: ListChecks, permission: "view.checklists.station", phase: 1, group: "Field" },
  { id: "tasks", label: "Tasks", href: "/app/tasks", icon: ListTodo, permission: "view.tasks.station", phase: 1, group: "Field" },
  { id: "maintenance", label: "Maintenance", href: "/app/maintenance", icon: AlertTriangle, permission: "view.maintenance.station", phase: 1, group: "Field" },
  { id: "notifications", label: "Notifications", href: "/app/notifications", icon: Bell, permission: "view.notifications.own", phase: 1, badge: "notifications", group: "Requests" },
  { id: "stations", label: "Stations", href: "/app/stations", icon: MapPinned, permission: "view.stations.cluster", phase: 1, group: "Directory" },
  { id: "employees", label: "Employees", href: "/app/employees", icon: Users, permission: "view.employees.cluster", phase: 1, group: "Directory" },
  { id: "profile", label: "Profile", href: "/app/profile", icon: UserRound, permission: "view.notifications.own", phase: 1, group: "Me" },
];

export function visibleNav(items: NavItem[]) {
  return items.filter((i) => i.phase === 1 || FEATURES.phase2);
}

export function mobileTabs(items: NavItem[]) {
  return visibleNav(items).filter((i) => i.mobileTab);
}

export function moreMenuItems(items: NavItem[]) {
  return visibleNav(items).filter((i) => !i.mobileTab);
}
