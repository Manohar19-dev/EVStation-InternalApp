const inrFmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const inrWhole = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function inr(n: number) {
  return inrFmt.format(Math.round(n * 100) / 100).replace(/\u00a0/g, "");
}
export function inrShort(n: number) {
  return Number.isInteger(n) ? inrWhole.format(n).replace(/\u00a0/g, "") : inr(n);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function timeOf(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  let h = d.getHours();
  const m = d.getMinutes();
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ap}`;
}

export function dateOf(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function dateTime(iso: string | Date) {
  return `${dateOf(iso)}, ${timeOf(iso)}`;
}

export function dayMonth(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function relativeAge(iso: string, now = new Date()) {
  const ms = now.getTime() - new Date(iso).getTime();
  const h = Math.floor(ms / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function pct(n: number, digits = 0) {
  return `${n.toFixed(digits)}%`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}
