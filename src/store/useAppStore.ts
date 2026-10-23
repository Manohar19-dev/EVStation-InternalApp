// PROTOTYPE: simulated, no real integration
"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AppNotification,
  AttendanceRecord,
  AuditEvent,
  ChecklistRun,
  DemoFlags,
  MoneyRequest,
  PrototypeRole,
  RequestStatus,
  RequestType,
  SessionState,
  SettingsState,
  WorkTask,
  MaintenanceTicket,
} from "@/types";
import { buildSeed, type SeedData } from "@/data/seed";
import { CHECKLIST_TEMPLATES } from "@/data/checklists";
import { permissionsFor } from "@/lib/rbac/permissions";
import { auditId, notifId, requestId, ticketId, uid } from "@/lib/ids";

const defaultDemo: DemoFlags = {
  outsideGeoFence: false,
  offline: false,
  chargerFaultAlert: false,
  overdueEscalation: false,
  agedApprovals: false,
  presenterOpen: false,
};

const emptySession: SessionState = {
  isLoggedIn: false,
  role: null,
  personaId: null,
  permissions: [],
};

type Seed = SeedData;

interface Actions {
  login: (role: PrototypeRole) => void;
  logout: () => void;
  switchRole: (role: PrototypeRole) => void;
  setDemo: (p: Partial<DemoFlags>) => void;
  setSettings: (p: Partial<SettingsState>) => void;
  resetDemo: () => void;

  checkIn: (args: { employeeId: string; stationId: string; selfie: boolean }) => { ok: boolean; reason?: string };
  checkOut: (employeeId: string) => void;

  toggleChecklistItem: (runId: string, templateId: string, patch?: Partial<ChecklistRun["items"][number]>) => void;
  completeChecklist: (runId: string) => void;

  updateTaskStatus: (taskId: string, status: WorkTask["status"]) => void;
  addTaskComment: (taskId: string, text: string, authorId: string, authorName: string) => void;

  raiseIssue: (args: {
    title: string;
    description: string;
    stationId: string;
    reporterId: string;
    kind: MaintenanceTicket["kind"];
    incidentType?: MaintenanceTicket["incidentType"];
    priority: MaintenanceTicket["priority"];
    chargerId?: string;
    photoAttached?: boolean;
  }) => string;
  updateTicketStatus: (id: string, status: MaintenanceTicket["status"]) => void;

  createRequest: (args: {
    type: RequestType;
    title: string;
    description: string;
    amount: number;
    stationId: string;
    requesterId: string;
    billAttached?: boolean;
    leaveDays?: number;
  }) => string;
  verifyRequest: (id: string, remark: string, byName: string) => void;
  decideRequest: (args: {
    id: string;
    decision: "approved" | "rejected" | "returned";
    remark?: string;
    ownerName: string;
    ownerId: string;
  }) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (audience: "admin" | "employee", employeeId?: string) => void;
}

interface Store extends Seed, Actions {
  session: SessionState;
  demo: DemoFlags;
}

function nowIso() {
  return new Date().toISOString();
}

function pushAudit(
  list: AuditEvent[],
  e: Omit<AuditEvent, "id" | "at" | "device" | "location"> & Partial<Pick<AuditEvent, "device" | "location" | "at">>,
): AuditEvent[] {
  return [
    {
      id: auditId(),
      at: nowIso(),
      device: e.device ?? "Prototype",
      location: e.location ?? "Hyderabad",
      ...e,
    },
    ...list,
  ];
}

function pushNotif(list: AppNotification[], n: Omit<AppNotification, "id" | "at" | "read"> & Partial<Pick<AppNotification, "at" | "read">>): AppNotification[] {
  return [{ id: notifId(), at: nowIso(), read: false, ...n }, ...list];
}

export const useAppStore = create<Store>()(
  persist(
    (set, get) => ({
      ...buildSeed(),
      session: { ...emptySession },
      demo: { ...defaultDemo },

      login: (role) => {
        const seed = get();
        const personaId = role === "admin" ? seed.ownerId : seed.demoEmployeeId;
        set({
          session: {
            isLoggedIn: true,
            role,
            personaId,
            permissions: permissionsFor(role),
          },
        });
      },

      logout: () => set({ session: { ...emptySession } }),

      switchRole: (role) => {
        get().login(role);
      },

      setDemo: (p) => set((s) => ({ demo: { ...s.demo, ...p } })),

      setSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),

      resetDemo: () => {
        const fresh = buildSeed();
        set({
          ...fresh,
          session: { ...emptySession },
          demo: { ...defaultDemo },
        });
      },

      checkIn: ({ employeeId, stationId, selfie }) => {
        const { demo } = get();
        if (demo.outsideGeoFence) {
          return { ok: false, reason: "You are outside the station geo-fence (≈240 m). Move closer and try again." };
        }
        const today = "2026-10-23";
        set((s) => {
          const existing = s.attendance.find((a) => a.employeeId === employeeId && a.date === today);
          const record: AttendanceRecord = {
            id: existing?.id ?? uid("att"),
            employeeId,
            stationId,
            date: today,
            status: "checked_in",
            checkInAt: nowIso(),
            selfieCaptured: selfie,
            geoOk: true,
            distanceM: 18,
          };
          const attendance = existing
            ? s.attendance.map((a) => (a.id === existing.id ? record : a))
            : [record, ...s.attendance];
          const emp = s.employees.find((e) => e.id === employeeId);
          return {
            attendance,
            audit: pushAudit(s.audit, {
              userId: employeeId,
              userName: emp?.name ?? "Employee",
              action: "Checked in",
              module: "Attendance",
              stationId,
              status: "success",
              location: s.stations.find((st) => st.id === stationId)?.shortName ?? "Station",
            }),
            notifications: pushNotif(s.notifications, {
              audience: "admin",
              title: "Check-in recorded",
              body: `${emp?.name ?? "Employee"} checked in at ${s.stations.find((st) => st.id === stationId)?.shortName ?? "station"}.`,
              channel: "push",
              module: "attendance",
              href: "/admin/operations?tab=attendance",
            }),
          };
        });
        return { ok: true };
      },

      checkOut: (employeeId) => {
        const today = "2026-10-23";
        set((s) => {
          const attendance = s.attendance.map((a) =>
            a.employeeId === employeeId && a.date === today
              ? { ...a, status: "checked_out" as const, checkOutAt: nowIso() }
              : a,
          );
          const emp = s.employees.find((e) => e.id === employeeId);
          return {
            attendance,
            audit: pushAudit(s.audit, {
              userId: employeeId,
              userName: emp?.name ?? "Employee",
              action: "Checked out",
              module: "Attendance",
              status: "success",
            }),
          };
        });
      },

      toggleChecklistItem: (runId, templateId, patch) => {
        set((s) => {
          const checklistRuns = s.checklistRuns.map((run) => {
            if (run.id !== runId) return run;
            const items = run.items.map((it) => {
              if (it.templateId !== templateId) return it;
              const done = patch?.done ?? !it.done;
              return {
                ...it,
                ...patch,
                done,
                completedAt: done ? nowIso() : undefined,
              };
            });
            const completedPercent = Math.round((items.filter((i) => i.done).length / items.length) * 100);
            const status: ChecklistRun["status"] =
              completedPercent === 100 ? "completed" : completedPercent > 0 ? "in_progress" : "not_started";
            return {
              ...run,
              items,
              completedPercent,
              status,
            };
          });
          return { checklistRuns };
        });
      },

      completeChecklist: (runId) => {
        set((s) => {
          const checklistRuns = s.checklistRuns.map((run) => {
            if (run.id !== runId) return run;
            const items = CHECKLIST_TEMPLATES.map((t) => {
              const existing = run.items.find((i) => i.templateId === t.id);
              return {
                templateId: t.id,
                done: true,
                photoAttached: existing?.photoAttached || t.requiresPhoto,
                note: existing?.note,
                completedAt: existing?.completedAt ?? nowIso(),
              };
            });
            return { ...run, items, completedPercent: 100, status: "completed" as const };
          });
          const run = checklistRuns.find((r) => r.id === runId);
          const emp = s.employees.find((e) => e.id === run?.employeeId);
          return {
            checklistRuns,
            audit: pushAudit(s.audit, {
              userId: run?.employeeId ?? "",
              userName: emp?.name ?? "Employee",
              action: "Completed daily checklist",
              module: "Checklists",
              stationId: run?.stationId,
              status: "success",
            }),
            notifications: pushNotif(s.notifications, {
              audience: "admin",
              title: "Checklist completed",
              body: `${emp?.name ?? "Employee"} completed today's checklist.`,
              channel: "push",
              module: "checklists",
              href: "/admin/operations?tab=checklists",
            }),
          };
        });
      },

      updateTaskStatus: (taskId, status) => {
        set((s) => {
          const tasks = s.tasks.map((t) =>
            t.id === taskId
              ? { ...t, status, completedAt: status === "completed" ? nowIso() : t.completedAt }
              : t,
          );
          const task = tasks.find((t) => t.id === taskId);
          const actor = s.session.personaId ?? "";
          const emp = s.employees.find((e) => e.id === actor);
          return {
            tasks,
            audit: pushAudit(s.audit, {
              userId: actor,
              userName: emp?.name ?? "User",
              action: `Task marked ${status}`,
              module: "Tasks",
              stationId: task?.stationId,
              reference: taskId,
              status: "success",
            }),
          };
        });
      },

      addTaskComment: (taskId, text, authorId, authorName) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  comments: [...t.comments, { id: uid("tc"), authorId, authorName, text, at: nowIso() }],
                }
              : t,
          ),
        }));
      },

      raiseIssue: (args) => {
        const id = ticketId();
        set((s) => {
          const ticket: MaintenanceTicket = {
            id,
            kind: args.kind,
            incidentType: args.incidentType,
            title: args.title,
            description: args.description,
            stationId: args.stationId,
            chargerId: args.chargerId,
            reporterId: args.reporterId,
            priority: args.priority,
            status: "open",
            partsUsed: [],
            downtimeHours: 0,
            photoAttached: !!args.photoAttached,
            createdAt: nowIso(),
            updatedAt: nowIso(),
          };
          const emp = s.employees.find((e) => e.id === args.reporterId);
          const stations = s.stations.map((st) =>
            st.id === args.stationId ? { ...st, openIssues: st.openIssues + 1 } : st,
          );
          return {
            tickets: [ticket, ...s.tickets],
            stations,
            audit: pushAudit(s.audit, {
              userId: args.reporterId,
              userName: emp?.name ?? "Employee",
              action: "Raised maintenance issue",
              module: "Maintenance",
              stationId: args.stationId,
              reference: id,
              status: "success",
            }),
            notifications: pushNotif(s.notifications, {
              audience: "admin",
              title: "New maintenance issue",
              body: `${args.title} at ${s.stations.find((st) => st.id === args.stationId)?.shortName ?? "station"}`,
              channel: "sms",
              module: "maintenance",
              href: `/admin/operations?tab=maintenance`,
            }),
          };
        });
        return id;
      },

      updateTicketStatus: (id, status) => {
        set((s) => ({
          tickets: s.tickets.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  updatedAt: nowIso(),
                  resolvedAt: status === "resolved" || status === "closed" ? nowIso() : t.resolvedAt,
                }
              : t,
          ),
        }));
      },

      createRequest: (args) => {
        const id = requestId();
        set((s) => {
          const emp = s.employees.find((e) => e.id === args.requesterId);
          const req: MoneyRequest = {
            id,
            type: args.type,
            title: args.title,
            description: args.description,
            amount: args.amount,
            stationId: args.stationId,
            requesterId: args.requesterId,
            status: "submitted",
            createdAt: nowIso(),
            updatedAt: nowIso(),
            billAttached: !!args.billAttached,
            leaveDays: args.leaveDays,
            budgetImpact: args.amount,
            timeline: [{ id: uid("tl"), label: "Submitted", at: nowIso(), by: emp?.name }],
          };
          return {
            requests: [req, ...s.requests],
            audit: pushAudit(s.audit, {
              userId: args.requesterId,
              userName: emp?.name ?? "Employee",
              action: `Submitted ${args.type.replace("_", " ")} request`,
              module: "Requests",
              stationId: args.stationId,
              reference: id,
              status: "success",
            }),
            notifications: pushNotif(s.notifications, {
              audience: "admin",
              title: "New request for approval",
              body: `${emp?.name ?? "Employee"} · ${args.title} · ₹${args.amount.toLocaleString("en-IN")}`,
              channel: "push",
              module: "requests",
              href: `/admin/approvals?id=${id}`,
            }),
          };
        });
        return id;
      },

      verifyRequest: (id, remark, byName) => {
        set((s) => ({
          requests: s.requests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: "under_review" as RequestStatus,
                  managerRemark: remark,
                  updatedAt: nowIso(),
                  timeline: [...r.timeline, { id: uid("tl"), label: "Under review", at: nowIso(), by: byName, note: remark }],
                }
              : r,
          ),
        }));
      },

      decideRequest: ({ id, decision, remark, ownerName, ownerId }) => {
        set((s) => {
          const req = s.requests.find((r) => r.id === id);
          const requester = s.employees.find((e) => e.id === req?.requesterId);
          const label = decision === "approved" ? "Approved" : decision === "rejected" ? "Rejected" : "Returned";
          const requests = s.requests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: decision as RequestStatus,
                  ownerRemark: remark,
                  updatedAt: nowIso(),
                  timeline: [...r.timeline, { id: uid("tl"), label, at: nowIso(), by: ownerName, note: remark }],
                }
              : r,
          );
          return {
            requests,
            audit: pushAudit(s.audit, {
              userId: ownerId,
              userName: ownerName,
              action: `${label} request`,
              module: "Approvals",
              stationId: req?.stationId,
              reference: id,
              status: "success",
            }),
            notifications: pushNotif(s.notifications, {
              audience: "employee",
              employeeId: req?.requesterId,
              title: `Request ${label.toLowerCase()}`,
              body: `${req?.title ?? "Your request"} was ${label.toLowerCase()}${remark ? `: ${remark}` : "."}`,
              channel: "whatsapp",
              module: "requests",
              href: `/app/requests/${id}`,
            }),
          };
        });
      },

      markNotificationRead: (id) => {
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        }));
      },

      markAllNotificationsRead: (audience, employeeId) => {
        set((s) => ({
          notifications: s.notifications.map((n) => {
            if (n.audience === "all" || n.audience === audience) {
              if (audience === "employee" && n.employeeId && employeeId && n.employeeId !== employeeId) return n;
              return { ...n, read: true };
            }
            return n;
          }),
        }));
      },
    }),
    {
      name: "evn-ops-proto-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        session: s.session,
        attendance: s.attendance,
        checklistRuns: s.checklistRuns,
        tasks: s.tasks,
        tickets: s.tickets,
        requests: s.requests,
        notifications: s.notifications,
        audit: s.audit,
        settings: s.settings,
        stations: s.stations,
        // employees/shifts/vendors/revenue stay from seed on hydrate mismatch — persist key entities that mutate
        employees: s.employees,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Store>;
        return {
          ...current,
          ...p,
          demo: { ...defaultDemo },
          session: p.session ?? current.session,
        };
      },
    },
  ),
);

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
