// PROTOTYPE: fictional demo data — not real client stations or locations
import type { ClusterId, Station, StationCharger, StationStatus } from "@/types";

function chg(
  stn: string,
  n: number,
  current: "AC" | "DC",
  maxKw: number,
  type: StationCharger["connectorType"],
  connectors: number,
  available: number,
  status: StationCharger["status"] = "available",
  startMode: "remote" | "assisted" = "remote",
  activeSessions = 0,
): StationCharger {
  return {
    id: `chg-${stn}-${String(n).padStart(2, "0")}`,
    name: `CH-${String(n).padStart(2, "0")}`,
    current,
    maxKw,
    connectorType: type,
    connectors,
    available,
    status,
    startMode,
    activeSessions,
  };
}

type Spec = {
  id: string;
  short: string;
  area: string;
  address: string;
  cluster: ClusterId;
  status: StationStatus;
  map: { x: number; y: number };
  hours: string;
  is24x7: boolean;
  landlord: string;
  leaseExpiry: string;
  capacityKw: number;
  chargers: StationCharger[];
  openIssues: number;
  todayRevenue: number;
  budgetMonthly: number;
  budgetUsed: number;
  phone?: string;
};

function station(s: Spec): Station {
  return {
    id: s.id,
    name: `EV Network ${s.short}`,
    shortName: s.short,
    area: s.area,
    address: s.address,
    cluster: s.cluster,
    status: s.status,
    phone: s.phone ?? "+91 40 4000 1000",
    hours: s.hours,
    is24x7: s.is24x7,
    geoFence: { lat: 17.44 + s.map.y / 10000, lng: 78.38 + s.map.x / 10000, radiusM: 80 },
    map: s.map,
    landlord: s.landlord,
    leaseExpiry: s.leaseExpiry,
    capacityKw: s.capacityKw,
    chargers: s.chargers,
    openIssues: s.openIssues,
    todayRevenue: s.todayRevenue,
    budgetMonthly: s.budgetMonthly,
    budgetUsed: s.budgetUsed,
  };
}

const base = "Hyderabad";

export const stations: Station[] = [
  station({
    id: "stn-hitec",
    short: "HITEC City Hub",
    area: "HITEC City",
    address: `Plot 12, Cyber Towers Rd, HITEC City, ${base} 500081`,
    cluster: "west",
    status: "live",
    map: { x: 410, y: 520 },
    hours: "Open 24x7",
    is24x7: true,
    landlord: "Cyber Towers Estates Pvt Ltd",
    leaseExpiry: "2028-06-30",
    capacityKw: 172,
    openIssues: 1,
    todayRevenue: 42850,
    budgetMonthly: 180000,
    budgetUsed: 112400,
    phone: "+91 40 4000 1201",
    chargers: [
      chg("hitec", 1, "AC", 22, "Type2", 2, 2),
      chg("hitec", 2, "DC", 30, "CCS2", 1, 0, "charging", "remote", 1),
      chg("hitec", 3, "DC", 60, "CCS2", 2, 1, "available", "remote", 1),
      chg("hitec", 4, "DC", 60, "CCS2", 1, 0, "offline"),
    ],
  }),
  station({
    id: "stn-gachibowli",
    short: "Gachibowli Financial District",
    area: "Gachibowli",
    address: `Nanakramguda Rd, Financial District, ${base} 500032`,
    cluster: "west",
    status: "live",
    map: { x: 285, y: 665 },
    hours: "6 AM – 11 PM",
    is24x7: false,
    landlord: "FD Infra LLP",
    leaseExpiry: "2027-12-31",
    capacityKw: 164,
    openIssues: 0,
    todayRevenue: 36120,
    budgetMonthly: 150000,
    budgetUsed: 98000,
    chargers: [
      chg("gachibowli", 1, "AC", 22, "Type2", 2, 2),
      chg("gachibowli", 2, "AC", 22, "Type2", 2, 1, "charging", "remote", 1),
      chg("gachibowli", 3, "DC", 60, "CCS2", 1, 1),
      chg("gachibowli", 4, "DC", 60, "CCS2", 1, 0, "charging", "remote", 1),
    ],
  }),
  station({
    id: "stn-madhapur",
    short: "Madhapur Inorbit",
    area: "Madhapur",
    address: `Inorbit Mall Rd, Madhapur, ${base} 500081`,
    cluster: "west",
    status: "live",
    map: { x: 505, y: 465 },
    hours: "10 AM – 10 PM",
    is24x7: false,
    landlord: "Inorbit Malls India",
    leaseExpiry: "2029-03-15",
    capacityKw: 60,
    openIssues: 1,
    todayRevenue: 18400,
    budgetMonthly: 90000,
    budgetUsed: 74200,
    chargers: [
      chg("madhapur", 1, "DC", 30, "CCS2", 1, 1),
      chg("madhapur", 2, "DC", 30, "CCS2", 1, 0, "offline"),
    ],
  }),
  station({
    id: "stn-kondapur",
    short: "Kondapur Botanical Garden",
    area: "Kondapur",
    address: `Kondapur Main Rd, ${base} 500084`,
    cluster: "west",
    status: "live",
    map: { x: 340, y: 400 },
    hours: "Open 24x7",
    is24x7: true,
    landlord: "Botanical Plaza Holdings",
    leaseExpiry: "2028-09-01",
    capacityKw: 74.8,
    openIssues: 0,
    todayRevenue: 22110,
    budgetMonthly: 110000,
    budgetUsed: 61000,
    chargers: [
      chg("kondapur", 1, "DC", 60, "CCS2", 1, 1),
      chg("kondapur", 2, "AC", 7.4, "Type2", 2, 2),
    ],
  }),
  station({
    id: "stn-jubilee",
    short: "Jubilee Hills Road No. 36",
    area: "Jubilee Hills",
    address: `Road No. 36, Jubilee Hills, ${base} 500033`,
    cluster: "central",
    status: "live",
    map: { x: 560, y: 580 },
    hours: "Open 24x7",
    is24x7: true,
    landlord: "JH Retail Spaces",
    leaseExpiry: "2027-08-31",
    capacityKw: 142,
    openIssues: 0,
    todayRevenue: 51200,
    budgetMonthly: 200000,
    budgetUsed: 145000,
    chargers: [
      chg("jubilee", 1, "DC", 120, "CCS2", 2, 1, "charging", "remote", 1),
      chg("jubilee", 2, "AC", 22, "Type2", 1, 1),
    ],
  }),
  station({
    id: "stn-banjara",
    short: "Banjara Hills Road No. 12",
    area: "Banjara Hills",
    address: `Road No. 12, Banjara Hills, ${base} 500034`,
    cluster: "central",
    status: "live",
    map: { x: 620, y: 610 },
    hours: "7 AM – 11 PM",
    is24x7: false,
    landlord: "Banjara Commercial Trust",
    leaseExpiry: "2026-12-31",
    capacityKw: 120,
    openIssues: 0,
    todayRevenue: 39800,
    budgetMonthly: 160000,
    budgetUsed: 132000,
    chargers: [
      chg("banjara", 1, "DC", 60, "CCS2", 2, 0, "charging", "remote", 2),
      chg("banjara", 2, "DC", 60, "CCS2", 2, 0, "charging", "remote", 2),
    ],
  }),
  station({
    id: "stn-kukatpally",
    short: "KPHB Colony",
    area: "Kukatpally",
    address: `KPHB Phase 5, ${base} 500072`,
    cluster: "north",
    status: "live",
    map: { x: 300, y: 280 },
    hours: "Open 24x7",
    is24x7: true,
    landlord: "KPHB Municipal Depot",
    leaseExpiry: "2028-01-15",
    capacityKw: 37,
    openIssues: 0,
    todayRevenue: 9800,
    budgetMonthly: 70000,
    budgetUsed: 41000,
    chargers: [
      chg("kukatpally", 1, "DC", 15, "BharatDC001", 1, 1),
      chg("kukatpally", 2, "AC", 22, "Type2", 1, 1),
    ],
  }),
  station({
    id: "stn-uppal",
    short: "Uppal Depot",
    area: "Uppal",
    address: `Uppal Depot Rd, ${base} 500039`,
    cluster: "east",
    status: "live",
    map: { x: 780, y: 420 },
    hours: "Open 24x7",
    is24x7: true,
    landlord: "TSRTC Uppal Yard",
    leaseExpiry: "2027-04-30",
    capacityKw: 22.2,
    openIssues: 0,
    todayRevenue: 6400,
    budgetMonthly: 55000,
    budgetUsed: 28000,
    chargers: [
      chg("uppal", 1, "AC", 7.4, "Type2", 1, 1, "available", "assisted"),
      chg("uppal", 2, "AC", 7.4, "Type2", 1, 1, "available", "assisted"),
      chg("uppal", 3, "AC", 7.4, "Type2", 1, 0, "charging", "assisted", 1),
    ],
  }),
];

/** Additional fictional stations to reach 32 total. */
const EXTRA: Array<Omit<Spec, "chargers"> & { kw: number; dc: number; ac: number }> = [
  { id: "stn-secunderabad", short: "Secunderabad Clock Tower", area: "Secunderabad", address: `SP Road, Secunderabad, ${base}`, cluster: "north", status: "live", map: { x: 700, y: 300 }, hours: "Open 24x7", is24x7: true, landlord: "SC Railway Estate", leaseExpiry: "2028-05-01", capacityKw: 120, openIssues: 0, todayRevenue: 27400, budgetMonthly: 120000, budgetUsed: 70000, kw: 120, dc: 2, ac: 1 },
  { id: "stn-begumpet", short: "Begumpet Airport Road", area: "Begumpet", address: `Airport Rd, Begumpet, ${base}`, cluster: "north", status: "live", map: { x: 640, y: 360 }, hours: "Open 24x7", is24x7: true, landlord: "Begumpet Retail Co", leaseExpiry: "2027-11-30", capacityKw: 90, openIssues: 1, todayRevenue: 19800, budgetMonthly: 100000, budgetUsed: 88000, kw: 90, dc: 1, ac: 2 },
  { id: "stn-shamshabad", short: "Shamshabad Airport Hub", area: "Shamshabad", address: `RGIA Approach Rd, ${base}`, cluster: "south", status: "live", map: { x: 480, y: 860 }, hours: "Open 24x7", is24x7: true, landlord: "Airport Authority Lease", leaseExpiry: "2029-01-01", capacityKw: 240, openIssues: 0, todayRevenue: 68200, budgetMonthly: 250000, budgetUsed: 160000, kw: 240, dc: 3, ac: 1 },
  { id: "stn-lb-nagar", short: "LB Nagar Ring Road", area: "LB Nagar", address: `Inner Ring Rd, LB Nagar, ${base}`, cluster: "east", status: "live", map: { x: 820, y: 620 }, hours: "6 AM – 12 AM", is24x7: false, landlord: "LB Plaza Owners", leaseExpiry: "2027-07-15", capacityKw: 90, openIssues: 0, todayRevenue: 15600, budgetMonthly: 85000, budgetUsed: 42000, kw: 90, dc: 1, ac: 1 },
  { id: "stn-dilsukhnagar", short: "Dilsukhnagar Metro", area: "Dilsukhnagar", address: `Chaitanyapuri Metro, ${base}`, cluster: "east", status: "under_maintenance", map: { x: 760, y: 560 }, hours: "Temporarily closed for works", is24x7: false, landlord: "HMRL Parking", leaseExpiry: "2028-02-28", capacityKw: 60, openIssues: 2, todayRevenue: 0, budgetMonthly: 75000, budgetUsed: 51000, kw: 60, dc: 1, ac: 1 },
  { id: "stn-charminar", short: "Charminar Heritage", area: "Old City", address: `Pathergatti Rd, ${base}`, cluster: "central", status: "live", map: { x: 680, y: 700 }, hours: "8 AM – 10 PM", is24x7: false, landlord: "Heritage Trust", leaseExpiry: "2026-11-30", capacityKw: 44, openIssues: 0, todayRevenue: 11200, budgetMonthly: 60000, budgetUsed: 39000, kw: 44, dc: 0, ac: 2 },
  { id: "stn-attapur", short: "Attapur PVNR Expressway", area: "Attapur", address: `PVNR Expressway, Attapur, ${base}`, cluster: "south", status: "live", map: { x: 420, y: 740 }, hours: "Open 24x7", is24x7: true, landlord: "Expressway Amenities", leaseExpiry: "2028-10-10", capacityKw: 120, openIssues: 0, todayRevenue: 30100, budgetMonthly: 130000, budgetUsed: 76000, kw: 120, dc: 2, ac: 0 },
  { id: "stn-miyapur", short: "Miyapur Metro Terminus", area: "Miyapur", address: `Miyapur Metro Yard, ${base}`, cluster: "north", status: "live", map: { x: 220, y: 220 }, hours: "Open 24x7", is24x7: true, landlord: "HMRL Miyapur", leaseExpiry: "2029-06-30", capacityKw: 82, openIssues: 0, todayRevenue: 21400, budgetMonthly: 95000, budgetUsed: 54000, kw: 82, dc: 1, ac: 1 },
  { id: "stn-narsingi", short: "Narsingi ORR", area: "Narsingi", address: `Outer Ring Rd, Narsingi, ${base}`, cluster: "west", status: "live", map: { x: 180, y: 700 }, hours: "Open 24x7", is24x7: true, landlord: "ORR Concessionaire", leaseExpiry: "2030-01-01", capacityKw: 180, openIssues: 0, todayRevenue: 44900, budgetMonthly: 170000, budgetUsed: 99000, kw: 180, dc: 2, ac: 1 },
  { id: "stn-kompally", short: "Kompally Medchal Road", area: "Kompally", address: `Medchal Hwy, Kompally, ${base}`, cluster: "north", status: "live", map: { x: 560, y: 140 }, hours: "6 AM – 11 PM", is24x7: false, landlord: "Kompally Logistics Park", leaseExpiry: "2027-09-30", capacityKw: 90, openIssues: 0, todayRevenue: 16700, budgetMonthly: 80000, budgetUsed: 45000, kw: 90, dc: 1, ac: 1 },
  { id: "stn-tolichowki", short: "Tolichowki Mehdipatnam", area: "Tolichowki", address: `Mehdipatnam Rd, Tolichowki, ${base}`, cluster: "central", status: "live", map: { x: 480, y: 640 }, hours: "7 AM – 11 PM", is24x7: false, landlord: "TC Commercials", leaseExpiry: "2028-04-15", capacityKw: 74, openIssues: 0, todayRevenue: 14300, budgetMonthly: 78000, budgetUsed: 51000, kw: 74, dc: 1, ac: 1 },
  { id: "stn-ameerpet", short: "Ameerpet Metro", area: "Ameerpet", address: `Ameerpet X Roads, ${base}`, cluster: "central", status: "live", map: { x: 540, y: 480 }, hours: "Open 24x7", is24x7: true, landlord: "Ameerpet Metro Parking", leaseExpiry: "2027-12-01", capacityKw: 82, openIssues: 0, todayRevenue: 25600, budgetMonthly: 105000, budgetUsed: 69000, kw: 82, dc: 1, ac: 1 },
  { id: "stn-habsiguda", short: "Habsiguda Osmania", area: "Habsiguda", address: `Osmania University Rd, ${base}`, cluster: "east", status: "live", map: { x: 740, y: 480 }, hours: "6 AM – 10 PM", is24x7: false, landlord: "OU Alumni Trust", leaseExpiry: "2026-10-31", capacityKw: 52, openIssues: 0, todayRevenue: 8900, budgetMonthly: 65000, budgetUsed: 33000, kw: 52, dc: 0, ac: 2 },
  { id: "stn-moula-ali", short: "Moula Ali Heights", area: "Moula Ali", address: `Moula Ali Rd, ${base}`, cluster: "east", status: "closed", map: { x: 800, y: 340 }, hours: "Closed — lease renewal", is24x7: false, landlord: "Heights Developers", leaseExpiry: "2026-10-15", capacityKw: 60, openIssues: 0, todayRevenue: 0, budgetMonthly: 50000, budgetUsed: 12000, kw: 60, dc: 1, ac: 1 },
  { id: "stn-manikonda", short: "Manikonda Puppalaguda", area: "Manikonda", address: `Puppalaguda Rd, Manikonda, ${base}`, cluster: "west", status: "live", map: { x: 260, y: 600 }, hours: "Open 24x7", is24x7: true, landlord: "Manikonda Township", leaseExpiry: "2029-08-20", capacityKw: 112, openIssues: 0, todayRevenue: 28700, budgetMonthly: 115000, budgetUsed: 72000, kw: 112, dc: 1, ac: 2 },
  { id: "stn-alwal", short: "Alwal Cantonment", area: "Alwal", address: `Trimulgherry Rd, Alwal, ${base}`, cluster: "north", status: "live", map: { x: 680, y: 200 }, hours: "6 AM – 10 PM", is24x7: false, landlord: "Cantonment Board", leaseExpiry: "2027-03-31", capacityKw: 67, openIssues: 0, todayRevenue: 12100, budgetMonthly: 70000, budgetUsed: 38000, kw: 67, dc: 1, ac: 1 },
  { id: "stn-kismatpur", short: "Kismatpur ORR South", area: "Kismatpur", address: `ORR Exit 14, Kismatpur, ${base}`, cluster: "south", status: "live", map: { x: 360, y: 800 }, hours: "Open 24x7", is24x7: true, landlord: "ORR South Amenities", leaseExpiry: "2030-06-01", capacityKw: 180, openIssues: 1, todayRevenue: 39200, budgetMonthly: 155000, budgetUsed: 128000, kw: 180, dc: 2, ac: 1 },
  { id: "stn-patancheru", short: "Patancheru Industrial", area: "Patancheru", address: `Isnapur Rd, Patancheru, ${base}`, cluster: "west", status: "live", map: { x: 80, y: 480 }, hours: "Open 24x7", is24x7: true, landlord: "APIIC Patancheru", leaseExpiry: "2028-12-31", capacityKw: 150, openIssues: 0, todayRevenue: 33800, budgetMonthly: 140000, budgetUsed: 81000, kw: 150, dc: 2, ac: 1 },
  { id: "stn-vanasthalipuram", short: "Vanasthalipuram Hub", area: "Vanasthalipuram", address: `NH-65, Vanasthalipuram, ${base}`, cluster: "east", status: "live", map: { x: 880, y: 680 }, hours: "Open 24x7", is24x7: true, landlord: "NHAI Wayside", leaseExpiry: "2029-04-30", capacityKw: 120, openIssues: 0, todayRevenue: 24100, budgetMonthly: 110000, budgetUsed: 64000, kw: 120, dc: 2, ac: 0 },
  { id: "stn-ghatkesar", short: "Ghatkesar ORR East", area: "Ghatkesar", address: `ORR East, Ghatkesar, ${base}`, cluster: "east", status: "live", map: { x: 920, y: 400 }, hours: "Open 24x7", is24x7: true, landlord: "ORR East Concession", leaseExpiry: "2030-03-15", capacityKw: 180, openIssues: 0, todayRevenue: 41000, budgetMonthly: 165000, budgetUsed: 92000, kw: 180, dc: 2, ac: 1 },
  { id: "stn-chandanagar", short: "Chandanagar Lingampally", area: "Chandanagar", address: `Lingampally Rd, Chandanagar, ${base}`, cluster: "west", status: "live", map: { x: 160, y: 360 }, hours: "6 AM – 11 PM", is24x7: false, landlord: "CNG Developers", leaseExpiry: "2027-06-30", capacityKw: 74, openIssues: 0, todayRevenue: 13200, budgetMonthly: 72000, budgetUsed: 41000, kw: 74, dc: 1, ac: 1 },
  { id: "stn-serilingampally", short: "Serilingampally Hub", area: "Serilingampally", address: `Gachibowli-Miyapur Rd, ${base}`, cluster: "west", status: "under_maintenance", map: { x: 220, y: 500 }, hours: "Maintenance until 28 Oct", is24x7: false, landlord: "SLP Infra", leaseExpiry: "2028-08-31", capacityKw: 90, openIssues: 3, todayRevenue: 0, budgetMonthly: 95000, budgetUsed: 87000, kw: 90, dc: 1, ac: 1 },
  { id: "stn-sainikpuri", short: "Sainikpuri Parade Ground", area: "Sainikpuri", address: `Sainikpuri Main, ${base}`, cluster: "north", status: "live", map: { x: 760, y: 240 }, hours: "6 AM – 10 PM", is24x7: false, landlord: "Defence Colony Welfare", leaseExpiry: "2027-01-31", capacityKw: 52, openIssues: 0, todayRevenue: 7600, budgetMonthly: 58000, budgetUsed: 29000, kw: 52, dc: 0, ac: 2 },
  { id: "stn-rajendranagar", short: "Rajendranagar Dairy Farm", area: "Rajendranagar", address: `Dairy Farm Rd, Rajendranagar, ${base}`, cluster: "south", status: "live", map: { x: 500, y: 780 }, hours: "Open 24x7", is24x7: true, landlord: "Dairy Farm Estate", leaseExpiry: "2028-11-30", capacityKw: 97, openIssues: 0, todayRevenue: 18900, budgetMonthly: 88000, budgetUsed: 47000, kw: 97, dc: 1, ac: 1 },
];

for (const e of EXTRA) {
  const chargers: StationCharger[] = [];
  let n = 1;
  for (let i = 0; i < e.dc; i++) {
    const busy = i === 0 && e.status === "live" && e.todayRevenue > 20000;
    chargers.push(
      chg(e.id.replace("stn-", ""), n++, "DC", e.dc >= 2 ? 60 : 30, "CCS2", 1, busy ? 0 : 1, busy ? "charging" : e.status === "under_maintenance" ? "offline" : "available", "remote", busy ? 1 : 0),
    );
  }
  for (let i = 0; i < e.ac; i++) {
    chargers.push(
      chg(e.id.replace("stn-", ""), n++, "AC", 22, "Type2", 1, e.status === "closed" || e.status === "under_maintenance" ? 0 : 1, e.status === "live" ? "available" : "offline"),
    );
  }
  stations.push(
    station({
      ...e,
      capacityKw: e.kw,
      chargers,
    }),
  );
}

export function getStation(id: string) {
  return stations.find((s) => s.id === id);
}

export function stationStats(list: Station[] = stations) {
  const total = list.length;
  const live = list.filter((s) => s.status === "live").length;
  const maintenance = list.filter((s) => s.status === "under_maintenance").length;
  const closed = list.filter((s) => s.status === "closed").length;
  const chargers = list.flatMap((s) => s.chargers);
  const chargerTotal = chargers.reduce((a, c) => a + c.connectors, 0);
  const chargerAvailable = chargers.reduce((a, c) => a + c.available, 0);
  const activeSessions = chargers.reduce((a, c) => a + c.activeSessions, 0);
  const todayRevenue = list.reduce((a, s) => a + s.todayRevenue, 0);
  return { total, live, maintenance, closed, chargerTotal, chargerAvailable, activeSessions, todayRevenue };
}

export const CLUSTER_LABELS: Record<ClusterId, string> = {
  west: "West",
  central: "Central",
  east: "East",
  north: "North",
  south: "South",
};
