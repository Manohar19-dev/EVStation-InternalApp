// PROTOTYPE: fictional demo data — not real people
import type { ClusterId, Employee, JobRole } from "@/types";
import { initials } from "@/lib/format";

const TODAY = "2026-10-23";

function emp(
  id: string,
  name: string,
  phone: string,
  jobRole: JobRole,
  homeStationId: string,
  cluster: ClusterId,
  stationIds: string[],
  shiftPattern: string,
  extras: Partial<Employee> = {},
): Employee {
  return {
    id,
    name,
    phone,
    email: `${name.toLowerCase().replace(/\s+/g, ".")}@evnetwork.example.in`,
    jobRole,
    stationIds,
    homeStationId,
    cluster,
    shiftPattern,
    status: "active",
    kycStatus: "verified",
    onboardingStatus: "completed",
    emergencyContact: { name: "Family contact", phone: "+91 90000 00000", relation: "Spouse" },
    salary: { basic: 28000, allowance: 6000, incentiveEligible: true },
    joinedAt: "2025-04-12",
    avatarInitials: initials(name),
    ...extras,
  };
}

/** Admin persona — Owner */
export const OWNER: Employee = emp(
  "emp-owner",
  "Rajesh Varma",
  "+91 98480 10001",
  "owner",
  "stn-hitec",
  "west",
  [],
  "Flexible",
  {
    email: "rajesh.varma@evnetwork.example.in",
    salary: { basic: 0, allowance: 0, incentiveEligible: false },
    joinedAt: "2024-01-01",
  },
);

/** Logged-in employee persona — Operations (combined field + ops) */
export const DEMO_EMPLOYEE: Employee = emp(
  "emp-kiran",
  "Kiran Kumar",
  "+91 98480 12210",
  "operations_manager",
  "stn-hitec",
  "west",
  ["stn-hitec", "stn-gachibowli", "stn-madhapur", "stn-kondapur", "stn-manikonda", "stn-narsingi"],
  "General 9 AM – 6 PM",
  {
    email: "kiran.kumar@evnetwork.example.in",
    salary: { basic: 45000, allowance: 12000, incentiveEligible: true },
    emergencyContact: { name: "Anitha Kumar", phone: "+91 98480 12211", relation: "Spouse" },
    joinedAt: "2025-02-18",
  },
);

const FIRST = [
  "Ravi", "Suresh", "Priya", "Anil", "Deepa", "Venkatesh", "Lakshmi", "Imran", "Sneha", "Prakash",
  "Meena", "Arjun", "Fatima", "Nikhil", "Kavitha", "Rohit", "Swathi", "Harish", "Divya", "Manoj",
];
const LAST = [
  "Naik", "Reddy", "Sharma", "Goud", "Khan", "Rao", "Patel", "Singh", "Das", "Iyer",
];

const ROLE_CYCLE: JobRole[] = [
  "station_supervisor",
  "station_attendant",
  "station_attendant",
  "field_technician",
  "station_attendant",
  "accounts",
];

const SHIFT_CYCLE = ["Morning 6–14", "Afternoon 14–22", "Night 22–6", "General 9–18"];

export function buildEmployees(stationIds: string[]): Employee[] {
  const list: Employee[] = [OWNER, DEMO_EMPLOYEE];
  // Accounts lead
  list.push(
    emp("emp-accounts", "Sangeetha Iyer", "+91 98480 13301", "accounts", "stn-hitec", "west", stationIds.slice(0, 8), "General 9–18", {
      salary: { basic: 42000, allowance: 8000, incentiveEligible: false },
    }),
  );
  // Field tech lead
  list.push(
    emp("emp-tech", "Imran Shaikh", "+91 98480 14401", "field_technician", "stn-hitec", "west", ["stn-hitec", "stn-gachibowli", "stn-madhapur"], "On-call", {
      salary: { basic: 32000, allowance: 7000, incentiveEligible: true },
    }),
  );

  let i = 0;
  for (const stn of stationIds) {
    // 1 supervisor + 1 attendant per station for ~64 total with extras
    const cluster = (["west", "central", "east", "north", "south"] as ClusterId[])[i % 5]!;
    const sName = `${FIRST[i % FIRST.length]} ${LAST[i % LAST.length]}`;
    list.push(
      emp(`emp-sup-${stn}`, sName, `+91 98${String(48020000 + i).slice(0, 8)}`, "station_supervisor", stn, cluster, [stn], SHIFT_CYCLE[i % SHIFT_CYCLE.length]!, {
        joinedAt: `2025-${String((i % 9) + 1).padStart(2, "0")}-12`,
        salary: { basic: 30000, allowance: 5000, incentiveEligible: true },
      }),
    );
    i++;
    const aName = `${FIRST[i % FIRST.length]} ${LAST[(i + 3) % LAST.length]}`;
    list.push(
      emp(`emp-att-${stn}`, aName, `+91 98${String(48030000 + i).slice(0, 8)}`, ROLE_CYCLE[i % ROLE_CYCLE.length]!, stn, cluster, [stn], SHIFT_CYCLE[i % SHIFT_CYCLE.length]!, {
        kycStatus: i % 11 === 0 ? "pending" : "verified",
        onboardingStatus: i % 17 === 0 ? "in_progress" : "completed",
        status: i % 23 === 0 ? "on_leave" : "active",
        joinedAt: `2024-${String((i % 12) + 1).padStart(2, "0")}-08`,
      }),
    );
    i++;
  }

  // Trim / ensure ~64
  return list.slice(0, 64);
}

export const DEMO_TODAY = TODAY;
