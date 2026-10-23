// PROTOTYPE: types for EV Network Internal Operations Platform (Proposal 1)

export type PrototypeRole = "admin" | "employee";

/** Six Proposal 1 roles — data/model only; prototype login uses PrototypeRole. */
export type JobRole =
  | "owner"
  | "operations_manager"
  | "accounts"
  | "station_supervisor"
  | "field_technician"
  | "station_attendant";

export type PermissionScope = "all" | "cluster" | "station" | "own";
export type PermissionModule =
  | "stations"
  | "employees"
  | "attendance"
  | "checklists"
  | "tasks"
  | "maintenance"
  | "requests"
  | "notifications"
  | "audit"
  | "settings"
  | "finance"
  | "reports"
  | "documents"
  | "inventory";

export type PermissionAction =
  | "view"
  | "create"
  | "edit"
  | "assign"
  | "verify"
  | "approve"
  | "release"
  | "comment"
  | "manage";

/** e.g. "approve.requests.all" */
export type PermissionKey = `${PermissionAction}.${PermissionModule}.${PermissionScope}`;

export type StationStatus = "live" | "under_maintenance" | "closed";
export type ClusterId = "west" | "central" | "east" | "north" | "south";
export type ConnectorType = "CCS2" | "Type2" | "BharatDC001";
export type ChargerStatus = "available" | "charging" | "faulted" | "offline";

export type AttendanceStatus = "checked_in" | "checked_out" | "late" | "absent" | "on_leave" | "off";
export type ChecklistSection = "opening" | "charger_health" | "cleanliness" | "safety" | "closing";
export type TaskStatus = "open" | "in_progress" | "completed" | "overdue";
export type TaskPriority = "critical" | "high" | "medium" | "low";
export type TicketKind = "charger_fault" | "preventive" | "incident";
export type IncidentType = "safety" | "theft" | "damage" | "charger_fault";
export type TicketStatus = "open" | "in_progress" | "waiting_parts" | "resolved" | "closed";

export type RequestType =
  | "expense"
  | "petty_cash"
  | "purchase"
  | "salary_advance"
  | "vendor_bill"
  | "leave"
  | "incentive"
  | "salary_release"
  | "refund_override";

/** Phase 1 lifecycle (payout/release is Phase 2). Past "paid" may appear in seed history only. */
export type RequestStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "returned"
  | "paid";

export type NotificationAudience = "admin" | "employee" | "all";
export type NotificationChannel = "push" | "sms" | "whatsapp";
export type OnboardingStatus = "not_started" | "in_progress" | "completed" | "offboarding";
export type KycStatus = "pending" | "verified" | "rejected";
export type LanguageCode = "en" | "te" | "hi";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface StationCharger {
  id: string;
  name: string;
  current: "AC" | "DC";
  maxKw: number;
  connectorType: ConnectorType;
  connectors: number;
  available: number;
  status: ChargerStatus;
  startMode: "remote" | "assisted";
  activeSessions: number;
}

export interface Station {
  id: string;
  name: string;
  shortName: string;
  area: string;
  address: string;
  cluster: ClusterId;
  status: StationStatus;
  phone: string;
  hours: string;
  is24x7: boolean;
  geoFence: GeoPoint & { radiusM: number };
  map: { x: number; y: number };
  landlord: string;
  leaseExpiry: string;
  capacityKw: number;
  chargers: StationCharger[];
  openIssues: number;
  todayRevenue: number;
  budgetMonthly: number;
  budgetUsed: number;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface SalaryStructure {
  basic: number;
  allowance: number;
  incentiveEligible: boolean;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  email: string;
  jobRole: JobRole;
  stationIds: string[];
  homeStationId: string;
  cluster: ClusterId;
  shiftPattern: string;
  status: "active" | "on_leave" | "inactive";
  kycStatus: KycStatus;
  onboardingStatus: OnboardingStatus;
  emergencyContact: EmergencyContact;
  salary: SalaryStructure;
  joinedAt: string;
  avatarInitials: string;
}

export interface Shift {
  id: string;
  employeeId: string;
  stationId: string;
  date: string;
  start: string;
  end: string;
  label: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  stationId: string;
  date: string;
  status: AttendanceStatus;
  checkInAt?: string;
  checkOutAt?: string;
  lateMinutes?: number;
  overtimeMinutes?: number;
  selfieCaptured?: boolean;
  geoOk?: boolean;
  distanceM?: number;
  note?: string;
}

export interface ChecklistItemTemplate {
  id: string;
  section: ChecklistSection;
  label: string;
  requiresPhoto: boolean;
}

export interface ChecklistItemRun {
  templateId: string;
  done: boolean;
  note?: string;
  photoAttached?: boolean;
  issueRaised?: boolean;
  completedAt?: string;
}

export interface ChecklistRun {
  id: string;
  stationId: string;
  employeeId: string;
  date: string;
  shiftLabel: string;
  items: ChecklistItemRun[];
  completedPercent: number;
  status: "not_started" | "in_progress" | "completed" | "missed";
}

export interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  at: string;
}

export interface WorkTask {
  id: string;
  title: string;
  description: string;
  stationId: string;
  assigneeId: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueAt: string;
  recurring: boolean;
  recurrenceLabel?: string;
  photoEvidence?: boolean;
  comments: TaskComment[];
  createdAt: string;
  completedAt?: string;
}

export interface MaintenanceTicket {
  id: string;
  kind: TicketKind;
  incidentType?: IncidentType;
  title: string;
  description: string;
  stationId: string;
  chargerId?: string;
  reporterId: string;
  assigneeId?: string;
  priority: TaskPriority;
  status: TicketStatus;
  partsUsed: string[];
  downtimeHours: number;
  vendorId?: string;
  photoAttached: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface Vendor {
  id: string;
  name: string;
  type: "oem" | "amc" | "parts" | "services";
  phone: string;
  amcExpiry?: string;
  stations: string[];
}

export interface RequestTimelineEntry {
  id: string;
  label: string;
  at: string;
  by?: string;
  note?: string;
}

export interface MoneyRequest {
  id: string;
  type: RequestType;
  title: string;
  description: string;
  amount: number;
  stationId: string;
  requesterId: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  billAttached: boolean;
  managerRemark?: string;
  ownerRemark?: string;
  budgetImpact: number;
  timeline: RequestTimelineEntry[];
  /** Past paid history only (Phase 1 has no release UI). */
  utr?: string;
  leaveDays?: number;
  refundSessionId?: string;
}

export interface AppNotification {
  id: string;
  audience: NotificationAudience;
  employeeId?: string;
  title: string;
  body: string;
  channel: NotificationChannel;
  module: PermissionModule | "system";
  href?: string;
  at: string;
  read: boolean;
}

export interface AuditEvent {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  stationId?: string;
  reference?: string;
  status: "success" | "failed" | "info";
  at: string;
  device: string;
  location: string;
}

export interface RoleTemplate {
  id: JobRole;
  name: string;
  description: string;
  permissions: PermissionKey[];
}

export interface SessionState {
  isLoggedIn: boolean;
  role: PrototypeRole | null;
  personaId: string | null;
  permissions: PermissionKey[];
}

export interface DemoFlags {
  outsideGeoFence: boolean;
  offline: boolean;
  chargerFaultAlert: boolean;
  overdueEscalation: boolean;
  agedApprovals: boolean;
  presenterOpen: boolean;
}

export interface SettingsState {
  language: LanguageCode;
  budgetAlertPercent: number;
  approvalAgeHours: number;
  delegateEnabled: boolean;
  delegateCap: number;
  delegateExpiry?: string;
}

export interface DailyRevenue {
  stationId: string;
  date: string;
  amount: number;
  sessions: number;
}
