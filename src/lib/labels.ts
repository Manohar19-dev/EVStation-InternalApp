import type {
  AttendanceStatus,
  JobRole,
  RequestStatus,
  RequestType,
  StationStatus,
  TaskPriority,
  TaskStatus,
  TicketStatus,
} from "@/types";

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  expense: "Expense claim",
  petty_cash: "Petty cash",
  purchase: "Purchase request",
  salary_advance: "Salary advance",
  vendor_bill: "Vendor / AMC bill",
  leave: "Leave request",
  incentive: "Incentive",
  salary_release: "Monthly salary release",
  refund_override: "Refund override",
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Rejected",
  returned: "Returned",
  paid: "Paid",
};

export const STATION_STATUS_LABELS: Record<StationStatus, string> = {
  live: "Live",
  under_maintenance: "Under maintenance",
  closed: "Closed",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  completed: "Completed",
  overdue: "Overdue",
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  waiting_parts: "Waiting parts",
  resolved: "Resolved",
  closed: "Closed",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  checked_in: "Checked in",
  checked_out: "Checked out",
  late: "Late",
  absent: "Absent",
  on_leave: "On leave",
  off: "Off",
};

export const JOB_ROLE_SHORT: Record<JobRole, string> = {
  owner: "Owner",
  operations_manager: "Operations",
  accounts: "Accounts",
  station_supervisor: "Supervisor",
  field_technician: "Technician",
  station_attendant: "Attendant",
};
