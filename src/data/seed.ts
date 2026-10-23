// PROTOTYPE: fictional demo data — not real client stations, people or finances
import type {
  AppNotification,
  AttendanceRecord,
  AuditEvent,
  ChecklistRun,
  DailyRevenue,
  Employee,
  MaintenanceTicket,
  MoneyRequest,
  SettingsState,
  Shift,
  Vendor,
  WorkTask,
} from "@/types";
import { CHECKLIST_TEMPLATES } from "@/data/checklists";
import { buildEmployees, DEMO_EMPLOYEE, DEMO_TODAY, OWNER } from "@/data/employees";
import { stations } from "@/data/stations";
import { resetIdSeq } from "@/lib/ids";

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function iso(day: string, h: number, m = 0) {
  return new Date(`${day}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00+05:30`).toISOString();
}

function daysAgo(n: number) {
  const d = new Date(`${DEMO_TODAY}T12:00:00+05:30`);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export interface SeedData {
  stations: typeof stations;
  employees: Employee[];
  shifts: Shift[];
  attendance: AttendanceRecord[];
  checklistRuns: ChecklistRun[];
  tasks: WorkTask[];
  tickets: MaintenanceTicket[];
  vendors: Vendor[];
  requests: MoneyRequest[];
  notifications: AppNotification[];
  audit: AuditEvent[];
  revenue: DailyRevenue[];
  settings: SettingsState;
  ownerId: string;
  demoEmployeeId: string;
}

export function buildSeed(): SeedData {
  resetIdSeq(2000);
  const rand = mulberry32(42);
  const employees = buildEmployees(stations.map((s) => s.id));
  const ownerId = OWNER.id;
  const demoEmployeeId = DEMO_EMPLOYEE.id;

  // --- Shifts & attendance (3 weeks) ---
  const shifts: Shift[] = [];
  const attendance: AttendanceRecord[] = [];
  for (let d = 0; d < 21; d++) {
    const date = daysAgo(d);
    for (const e of employees) {
      if (e.jobRole === "owner" || e.jobRole === "accounts") continue;
      if (!e.homeStationId) continue;
      const shiftId = `sh-${e.id}-${date}`;
      shifts.push({
        id: shiftId,
        employeeId: e.id,
        stationId: e.homeStationId,
        date,
        start: "09:00",
        end: "18:00",
        label: e.shiftPattern,
      });
      if (d === 0 && e.id === demoEmployeeId) {
        attendance.push({
          id: `att-${e.id}-${date}`,
          employeeId: e.id,
          stationId: e.homeStationId,
          date,
          status: "checked_out",
          note: "Awaiting check-in",
        });
        continue;
      }
      const roll = rand();
      let status: AttendanceRecord["status"] = "checked_out";
      if (e.status === "on_leave" || roll > 0.94) status = "on_leave";
      else if (roll > 0.9) status = "absent";
      else if (roll > 0.82) status = "late";
      else if (d === 0) status = roll > 0.3 ? "checked_in" : "checked_out";

      attendance.push({
        id: `att-${e.id}-${date}`,
        employeeId: e.id,
        stationId: e.homeStationId,
        date,
        status,
        checkInAt: status === "absent" || status === "on_leave" ? undefined : iso(date, status === "late" ? 9 : 8, status === "late" ? 22 : 55),
        checkOutAt: status === "checked_out" ? iso(date, 18, 5) : undefined,
        lateMinutes: status === "late" ? 22 : undefined,
        selfieCaptured: status !== "absent" && status !== "on_leave",
        geoOk: true,
        distanceM: Math.floor(rand() * 40),
      });
    }
  }

  // --- Checklist runs (today for demo employee + sample network) ---
  const checklistRuns: ChecklistRun[] = [];
  const makeRun = (stationId: string, employeeId: string, date: string, doneRatio: number, status: ChecklistRun["status"]): ChecklistRun => {
    const items = CHECKLIST_TEMPLATES.map((t, idx) => {
      const done = idx / CHECKLIST_TEMPLATES.length < doneRatio;
      return {
        templateId: t.id,
        done,
        photoAttached: done && t.requiresPhoto,
        completedAt: done ? iso(date, 9, 10 + idx) : undefined,
      };
    });
    const completedPercent = Math.round((items.filter((i) => i.done).length / items.length) * 100);
    return {
      id: `clr-${stationId}-${date}-${employeeId}`,
      stationId,
      employeeId,
      date,
      shiftLabel: "Morning",
      items,
      completedPercent,
      status,
    };
  };
  checklistRuns.push(makeRun("stn-hitec", demoEmployeeId, DEMO_TODAY, 0.2, "in_progress"));
  for (const s of stations.slice(0, 20)) {
    if (s.id === "stn-hitec") continue;
    const emp = employees.find((e) => e.homeStationId === s.id && e.jobRole === "station_supervisor");
    if (!emp) continue;
    const r = rand();
    checklistRuns.push(makeRun(s.id, emp.id, DEMO_TODAY, r > 0.25 ? 1 : r, r > 0.25 ? "completed" : r < 0.1 ? "missed" : "in_progress"));
  }

  // --- Tasks ---
  const tasks: WorkTask[] = [
    {
      id: "TSK-2610-1001",
      title: "Replace CH-04 connector cable",
      description: "HITEC CH-04 offline — cable sheath cracked. Swap with spare CCS2 cable and log downtime.",
      stationId: "stn-hitec",
      assigneeId: "emp-tech",
      priority: "high",
      status: "open",
      dueAt: iso(DEMO_TODAY, 17, 0),
      recurring: false,
      comments: [],
      createdAt: iso(daysAgo(1), 11, 20),
    },
    {
      id: "TSK-2610-1002",
      title: "Weekly bay line painting check",
      description: "Inspect parking bay markings and report faded sections.",
      stationId: "stn-hitec",
      assigneeId: demoEmployeeId,
      priority: "medium",
      status: "in_progress",
      dueAt: iso(DEMO_TODAY, 16, 0),
      recurring: true,
      recurrenceLabel: "Weekly · Fridays",
      comments: [{ id: "tc1", authorId: demoEmployeeId, authorName: "Kiran Kumar", text: "Started bay A–C.", at: iso(DEMO_TODAY, 10, 5) }],
      createdAt: iso(daysAgo(7), 9, 0),
    },
    {
      id: "TSK-2610-1003",
      title: "Follow up AMC visit — Serilingampally",
      description: "Coordinate OEM visit for under-maintenance station.",
      stationId: "stn-serilingampally",
      assigneeId: demoEmployeeId,
      priority: "critical",
      status: "overdue",
      dueAt: iso(daysAgo(1), 18, 0),
      recurring: false,
      comments: [],
      createdAt: iso(daysAgo(4), 14, 0),
    },
  ];
  const priorities: WorkTask["priority"][] = ["low", "medium", "high", "critical"];
  for (let i = 0; i < 37; i++) {
    const stn = stations[Math.floor(rand() * stations.length)]!;
    const emp = employees.find((e) => e.homeStationId === stn.id) ?? DEMO_EMPLOYEE;
    const due = daysAgo(Math.floor(rand() * 5) - 1);
    const overdue = due < DEMO_TODAY && rand() > 0.6;
    tasks.push({
      id: `TSK-2610-${1100 + i}`,
      title: ["Inspect UPS batteries", "Clean filter vents", "Verify QR stickers", "Restock first-aid", "Update notice board"][i % 5]!,
      description: "Operational task generated for prototype demo.",
      stationId: stn.id,
      assigneeId: emp.id,
      priority: priorities[i % 4]!,
      status: overdue ? "overdue" : (["open", "in_progress", "completed"] as const)[i % 3]!,
      dueAt: iso(due, 17, 0),
      recurring: i % 5 === 0,
      recurrenceLabel: i % 5 === 0 ? "Monthly" : undefined,
      comments: [],
      createdAt: iso(daysAgo(3 + (i % 10)), 10, 0),
      completedAt: i % 3 === 2 ? iso(due, 15, 0) : undefined,
    });
  }

  // --- Vendors ---
  const vendors: Vendor[] = [
    { id: "vnd-abb", name: "ABB India EV Services", type: "oem", phone: "+91 80 4000 1000", amcExpiry: "2027-03-31", stations: ["stn-hitec", "stn-jubilee", "stn-shamshabad"] },
    { id: "vnd-exicom", name: "Exicom AMC Desk", type: "amc", phone: "+91 124 4000 200", amcExpiry: "2026-12-15", stations: ["stn-gachibowli", "stn-madhapur", "stn-serilingampally"] },
    { id: "vnd-parts", name: "Deccan EV Spares", type: "parts", phone: "+91 40 4000 3300", stations: stations.slice(0, 12).map((s) => s.id) },
  ];

  // --- Maintenance tickets ---
  const tickets: MaintenanceTicket[] = [
    {
      id: "MNT-2610-2001",
      kind: "charger_fault",
      incidentType: "charger_fault",
      title: "CH-04 offline — no heartbeats",
      description: "Charger went offline at 06:12. Matches customer-app offline connector.",
      stationId: "stn-hitec",
      chargerId: "chg-hitec-04",
      reporterId: demoEmployeeId,
      assigneeId: "emp-tech",
      priority: "high",
      status: "open",
      partsUsed: [],
      downtimeHours: 8.5,
      vendorId: "vnd-abb",
      photoAttached: true,
      createdAt: iso(DEMO_TODAY, 6, 20),
      updatedAt: iso(DEMO_TODAY, 8, 0),
    },
    {
      id: "MNT-2610-2002",
      kind: "incident",
      incidentType: "damage",
      title: "Bay bollard damaged by vehicle",
      description: "Customer scraped bay B bollard. Photos attached. No injury.",
      stationId: "stn-madhapur",
      reporterId: employees.find((e) => e.homeStationId === "stn-madhapur")?.id ?? demoEmployeeId,
      priority: "medium",
      status: "in_progress",
      partsUsed: ["Reflective tape"],
      downtimeHours: 0,
      photoAttached: true,
      createdAt: iso(daysAgo(1), 19, 40),
      updatedAt: iso(DEMO_TODAY, 9, 10),
    },
    {
      id: "MNT-2610-2003",
      kind: "preventive",
      title: "Quarterly PM — Serilingampally",
      description: "Scheduled preventive maintenance; station marked under maintenance.",
      stationId: "stn-serilingampally",
      reporterId: demoEmployeeId,
      assigneeId: "emp-tech",
      priority: "critical",
      status: "waiting_parts",
      partsUsed: [],
      downtimeHours: 36,
      vendorId: "vnd-exicom",
      photoAttached: false,
      createdAt: iso(daysAgo(3), 8, 0),
      updatedAt: iso(daysAgo(1), 16, 0),
    },
  ];
  for (let i = 0; i < 25; i++) {
    const stn = stations[Math.floor(rand() * stations.length)]!;
    tickets.push({
      id: `MNT-2610-${2100 + i}`,
      kind: (["charger_fault", "preventive", "incident"] as const)[i % 3]!,
      incidentType: (["safety", "theft", "damage", "charger_fault"] as const)[i % 4]!,
      title: ["Display flicker", "Grounding check", "Lock jammed", "Cable overheat alert", "Water seepage"][i % 5]!,
      description: "Seeded maintenance record for network visibility.",
      stationId: stn.id,
      chargerId: stn.chargers[0]?.id,
      reporterId: employees.find((e) => e.homeStationId === stn.id)?.id ?? demoEmployeeId,
      priority: priorities[i % 4]!,
      status: (["open", "in_progress", "resolved", "closed"] as const)[i % 4]!,
      partsUsed: i % 3 === 0 ? ["Fuse 32A"] : [],
      downtimeHours: Math.round(rand() * 12 * 10) / 10,
      photoAttached: rand() > 0.4,
      createdAt: iso(daysAgo(1 + (i % 14)), 10, 0),
      updatedAt: iso(daysAgo(i % 7), 12, 0),
    });
  }

  // --- Requests (incl. 12 pending for owner covering all owner types) ---
  const requests: MoneyRequest[] = [
    {
      id: "REQ-2610-3001",
      type: "expense",
      title: "Site cleaning consumables",
      description: "Mops, disinfectant and gloves for HITEC City Hub.",
      amount: 1850,
      stationId: "stn-hitec",
      requesterId: demoEmployeeId,
      status: "submitted",
      createdAt: iso(DEMO_TODAY, 9, 40),
      updatedAt: iso(DEMO_TODAY, 9, 40),
      billAttached: true,
      budgetImpact: 1850,
      timeline: [{ id: "tl1", label: "Submitted", at: iso(DEMO_TODAY, 9, 40), by: "Kiran Kumar" }],
    },
    {
      id: "REQ-2610-3002",
      type: "petty_cash",
      title: "Petty cash top-up",
      description: "Float exhausted after weekend toll reimbursements.",
      amount: 5000,
      stationId: "stn-gachibowli",
      requesterId: employees.find((e) => e.homeStationId === "stn-gachibowli")?.id ?? demoEmployeeId,
      status: "under_review",
      createdAt: iso(daysAgo(1), 16, 10),
      updatedAt: iso(DEMO_TODAY, 8, 30),
      billAttached: false,
      managerRemark: "Verified — recommend approve.",
      budgetImpact: 5000,
      timeline: [
        { id: "tl2a", label: "Submitted", at: iso(daysAgo(1), 16, 10) },
        { id: "tl2b", label: "Under review", at: iso(DEMO_TODAY, 8, 30), by: "Kiran Kumar", note: "Verified — recommend approve." },
      ],
    },
    {
      id: "REQ-2610-3003",
      type: "purchase",
      title: "CCS2 spare cable",
      description: "Purchase request for CH-04 replacement cable.",
      amount: 18500,
      stationId: "stn-hitec",
      requesterId: "emp-tech",
      status: "submitted",
      createdAt: iso(daysAgo(2), 11, 0),
      updatedAt: iso(daysAgo(2), 11, 0),
      billAttached: true,
      budgetImpact: 18500,
      timeline: [{ id: "tl3", label: "Submitted", at: iso(daysAgo(2), 11, 0), by: "Imran Shaikh" }],
    },
    {
      id: "REQ-2610-3004",
      type: "vendor_bill",
      title: "Exicom AMC quarterly invoice",
      description: "Q3 AMC invoice for West cluster.",
      amount: 86400,
      stationId: "stn-serilingampally",
      requesterId: "emp-accounts",
      status: "submitted",
      createdAt: iso(daysAgo(3), 10, 0),
      updatedAt: iso(daysAgo(3), 10, 0),
      billAttached: true,
      budgetImpact: 86400,
      timeline: [{ id: "tl4", label: "Submitted", at: iso(daysAgo(3), 10, 0), by: "Sangeetha Iyer" }],
    },
    {
      id: "REQ-2610-3005",
      type: "salary_advance",
      title: "Salary advance — medical",
      description: "Advance against November salary.",
      amount: 15000,
      stationId: "stn-madhapur",
      requesterId: employees.find((e) => e.homeStationId === "stn-madhapur")?.id ?? demoEmployeeId,
      status: "submitted",
      createdAt: iso(daysAgo(1), 12, 20),
      updatedAt: iso(daysAgo(1), 12, 20),
      billAttached: false,
      budgetImpact: 15000,
      timeline: [{ id: "tl5", label: "Submitted", at: iso(daysAgo(1), 12, 20) }],
    },
    {
      id: "REQ-2610-3006",
      type: "incentive",
      title: "Uptime incentive — September",
      description: "Station supervisor incentive for 99% uptime.",
      amount: 3500,
      stationId: "stn-jubilee",
      requesterId: demoEmployeeId,
      status: "under_review",
      createdAt: iso(daysAgo(4), 9, 0),
      updatedAt: iso(daysAgo(2), 15, 0),
      billAttached: false,
      managerRemark: "Matches uptime report.",
      budgetImpact: 3500,
      timeline: [
        { id: "tl6a", label: "Submitted", at: iso(daysAgo(4), 9, 0) },
        { id: "tl6b", label: "Under review", at: iso(daysAgo(2), 15, 0), note: "Matches uptime report." },
      ],
    },
    {
      id: "REQ-2610-3007",
      type: "salary_release",
      title: "October salary release batch",
      description: "Monthly salary release for 62 active staff. Approve as one batch.",
      amount: 2145000,
      stationId: "stn-hitec",
      requesterId: "emp-accounts",
      status: "submitted",
      createdAt: iso(daysAgo(1), 18, 0),
      updatedAt: iso(daysAgo(1), 18, 0),
      billAttached: true,
      budgetImpact: 2145000,
      timeline: [{ id: "tl7", label: "Submitted", at: iso(daysAgo(1), 18, 0), by: "Sangeetha Iyer" }],
    },
    {
      id: "REQ-2610-3008",
      type: "refund_override",
      title: "Customer refund override — EVN-S-2610-4720",
      description: "Customer ticket EVN-T-10455 (overcharged). Override unused-balance policy for goodwill refund.",
      amount: 200,
      stationId: "stn-hitec",
      requesterId: "emp-accounts",
      status: "submitted",
      createdAt: iso(daysAgo(0), 10, 15),
      updatedAt: iso(DEMO_TODAY, 10, 15),
      billAttached: false,
      budgetImpact: 200,
      refundSessionId: "EVN-S-2610-4720",
      timeline: [{ id: "tl8", label: "Submitted", at: iso(DEMO_TODAY, 10, 15), by: "Sangeetha Iyer" }],
    },
    {
      id: "REQ-2610-3009",
      type: "leave",
      title: "Casual leave — 2 days",
      description: "Family function on 28–29 Oct.",
      amount: 0,
      leaveDays: 2,
      stationId: "stn-hitec",
      requesterId: demoEmployeeId,
      status: "submitted",
      createdAt: iso(daysAgo(2), 8, 0),
      updatedAt: iso(daysAgo(2), 8, 0),
      billAttached: false,
      budgetImpact: 0,
      timeline: [{ id: "tl9", label: "Submitted", at: iso(daysAgo(2), 8, 0), by: "Kiran Kumar" }],
    },
    {
      id: "REQ-2610-3010",
      type: "expense",
      title: "Local transport — OEM escort",
      description: "Auto fare for escorting Exicom engineer.",
      amount: 640,
      stationId: "stn-serilingampally",
      requesterId: "emp-tech",
      status: "submitted",
      createdAt: iso(daysAgo(2), 20, 0),
      updatedAt: iso(daysAgo(2), 20, 0),
      billAttached: true,
      budgetImpact: 640,
      timeline: [{ id: "tl10", label: "Submitted", at: iso(daysAgo(2), 20, 0) }],
    },
    {
      id: "REQ-2610-3011",
      type: "purchase",
      title: "Safety cones (set of 8)",
      description: "Replace damaged cones at Banjara Hills.",
      amount: 4200,
      stationId: "stn-banjara",
      requesterId: employees.find((e) => e.homeStationId === "stn-banjara")?.id ?? demoEmployeeId,
      status: "submitted",
      createdAt: iso(daysAgo(5), 14, 0),
      updatedAt: iso(daysAgo(5), 14, 0),
      billAttached: true,
      budgetImpact: 4200,
      timeline: [{ id: "tl11", label: "Submitted", at: iso(daysAgo(5), 14, 0) }],
    },
    {
      id: "REQ-2610-3012",
      type: "vendor_bill",
      title: "Deccan spares — fuse kit",
      description: "Invoice INV-8841 for fuse kit stock.",
      amount: 9800,
      stationId: "stn-hitec",
      requesterId: "emp-accounts",
      status: "under_review",
      createdAt: iso(daysAgo(2), 9, 30),
      updatedAt: iso(daysAgo(1), 11, 0),
      billAttached: true,
      managerRemark: "Stock matched GRN.",
      budgetImpact: 9800,
      timeline: [
        { id: "tl12a", label: "Submitted", at: iso(daysAgo(2), 9, 30) },
        { id: "tl12b", label: "Under review", at: iso(daysAgo(1), 11, 0), note: "Stock matched GRN." },
      ],
    },
  ];

  // History: approved / rejected / returned / paid
  for (let i = 0; i < 33; i++) {
    const stn = stations[Math.floor(rand() * 12)]!;
    const status = (["approved", "rejected", "returned", "paid", "draft"] as const)[i % 5]!;
    requests.push({
      id: `REQ-2610-${3200 + i}`,
      type: (["expense", "petty_cash", "purchase", "leave", "incentive"] as const)[i % 5]!,
      title: `Historical request #${i + 1}`,
      description: "Seeded history for filters and requester history panel.",
      amount: Math.round(500 + rand() * 20000),
      stationId: stn.id,
      requesterId: i % 4 === 0 ? demoEmployeeId : employees.find((e) => e.homeStationId === stn.id)?.id ?? demoEmployeeId,
      status,
      createdAt: iso(daysAgo(6 + (i % 12)), 11, 0),
      updatedAt: iso(daysAgo(3 + (i % 8)), 16, 0),
      billAttached: rand() > 0.3,
      ownerRemark: status === "rejected" ? "Insufficient documentation." : status === "returned" ? "Attach GST invoice." : undefined,
      budgetImpact: Math.round(500 + rand() * 20000),
      utr: status === "paid" ? `UTR${260900000 + i}` : undefined,
      timeline: [
        { id: `htl-${i}-1`, label: "Submitted", at: iso(daysAgo(6 + (i % 12)), 11, 0) },
        { id: `htl-${i}-2`, label: status === "paid" ? "Approved" : status, at: iso(daysAgo(3 + (i % 8)), 16, 0), by: "Rajesh Varma" },
      ],
    });
  }

  // --- Notifications ---
  const notifications: AppNotification[] = [
    { id: "NTF-10001", audience: "admin", title: "12 approvals waiting", body: "₹22.9L pending owner decision. 3 items older than 24 hours.", channel: "push", module: "requests", href: "/admin/approvals", at: iso(DEMO_TODAY, 8, 0), read: false },
    { id: "NTF-10002", audience: "admin", title: "Critical fault — HITEC CH-04", body: "Charger offline since 06:12. Ticket MNT-2610-2001 open.", channel: "sms", module: "maintenance", href: "/admin/operations?tab=maintenance", at: iso(DEMO_TODAY, 6, 25), read: false },
    { id: "NTF-10003", audience: "admin", title: "Budget alert — Madhapur", body: "Station budget at 82% for October.", channel: "whatsapp", module: "requests", href: "/admin/stations/stn-madhapur", at: iso(daysAgo(1), 19, 0), read: true },
    { id: "NTF-10004", audience: "employee", employeeId: demoEmployeeId, title: "Task overdue", body: "Follow up AMC visit — Serilingampally is overdue.", channel: "push", module: "tasks", href: "/app/tasks/TSK-2610-1003", at: iso(DEMO_TODAY, 7, 30), read: false },
    { id: "NTF-10005", audience: "employee", employeeId: demoEmployeeId, title: "Checklist reminder", body: "Complete today's opening checklist at HITEC City Hub.", channel: "push", module: "checklists", href: "/app/checklists", at: iso(DEMO_TODAY, 8, 15), read: false },
    { id: "NTF-10006", audience: "employee", employeeId: demoEmployeeId, title: "Ticket assigned", body: "CH-04 offline assigned to Imran Shaikh — track in Maintenance.", channel: "sms", module: "maintenance", href: "/app/maintenance/MNT-2610-2001", at: iso(DEMO_TODAY, 8, 5), read: true },
  ];
  for (let i = 0; i < 19; i++) {
    notifications.push({
      id: `NTF-${10100 + i}`,
      audience: i % 2 === 0 ? "admin" : "employee",
      employeeId: i % 2 === 0 ? undefined : demoEmployeeId,
      title: ["Missed checklist", "Task completed", "Leave update", "Fault cleared", "Request returned"][i % 5]!,
      body: "Prototype notification seed.",
      channel: (["push", "sms", "whatsapp"] as const)[i % 3]!,
      module: "system",
      at: iso(daysAgo(i % 10), 12, 0),
      read: i > 5,
    });
  }

  // --- Audit ---
  const audit: AuditEvent[] = [
    { id: "AUD-10001", userId: ownerId, userName: "Rajesh Varma", action: "Viewed approval desk", module: "Approvals", at: iso(DEMO_TODAY, 8, 5), status: "info", device: "Desktop · Chrome", location: "HITEC City" },
    { id: "AUD-10002", userId: demoEmployeeId, userName: "Kiran Kumar", action: "Submitted expense request", module: "Requests", stationId: "stn-hitec", reference: "REQ-2610-3001", at: iso(DEMO_TODAY, 9, 40), status: "success", device: "Android · Pixel", location: "HITEC City Hub" },
    { id: "AUD-10003", userId: demoEmployeeId, userName: "Kiran Kumar", action: "Verified petty cash request", module: "Requests", stationId: "stn-gachibowli", reference: "REQ-2610-3002", at: iso(DEMO_TODAY, 8, 30), status: "success", device: "Android · Pixel", location: "Gachibowli" },
    { id: "AUD-10004", userId: "emp-tech", userName: "Imran Shaikh", action: "Opened charger fault ticket", module: "Maintenance", stationId: "stn-hitec", reference: "MNT-2610-2001", at: iso(DEMO_TODAY, 6, 20), status: "success", device: "Android", location: "HITEC City Hub" },
    { id: "AUD-10005", userId: ownerId, userName: "Rajesh Varma", action: "Employee role viewed", module: "Employees", reference: "emp-kiran", at: iso(daysAgo(1), 17, 0), status: "info", device: "Desktop · Chrome", location: "Head office" },
  ];
  for (let i = 0; i < 75; i++) {
    audit.push({
      id: `AUD-${11000 + i}`,
      userId: i % 3 === 0 ? ownerId : demoEmployeeId,
      userName: i % 3 === 0 ? "Rajesh Varma" : "Kiran Kumar",
      action: ["Approved expense", "Rejected purchase", "Completed checklist", "Checked in", "Updated task", "Returned request", "Commented on ticket"][i % 7]!,
      module: ["Approvals", "Requests", "Checklists", "Attendance", "Tasks", "Maintenance"][i % 6]!,
      stationId: stations[i % stations.length]!.id,
      reference: `REF-${i}`,
      status: "success",
      at: iso(daysAgo(i % 20), 9 + (i % 8), i % 60),
      device: i % 2 === 0 ? "Desktop · Chrome" : "Android",
      location: stations[i % stations.length]!.area,
    });
  }

  // --- Revenue (Proposal 2 read-only) ---
  const revenue: DailyRevenue[] = stations.flatMap((s) =>
    Array.from({ length: 14 }, (_, i) => ({
      stationId: s.id,
      date: daysAgo(i),
      amount: i === 0 ? s.todayRevenue : Math.round(s.todayRevenue * (0.7 + rand() * 0.5)),
      sessions: Math.round(4 + rand() * 28),
    })),
  );

  const settings: SettingsState = {
    language: "en",
    budgetAlertPercent: 80,
    approvalAgeHours: 24,
    delegateEnabled: false,
    delegateCap: 5000,
  };

  return {
    stations,
    employees,
    shifts,
    attendance,
    checklistRuns,
    tasks,
    tickets,
    vendors,
    requests,
    notifications,
    audit,
    revenue,
    settings,
    ownerId,
    demoEmployeeId,
  };
}
