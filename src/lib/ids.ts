let seq = 1000;

export function uid(prefix: string) {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${seq}`;
}

export function requestId() {
  return `REQ-2610-${String(seq++).padStart(4, "0")}`;
}

export function taskId() {
  return `TSK-2610-${String(seq++).padStart(4, "0")}`;
}

export function ticketId() {
  return `MNT-2610-${String(seq++).padStart(4, "0")}`;
}

export function notifId() {
  return `NTF-${String(seq++).padStart(5, "0")}`;
}

export function auditId() {
  return `AUD-${String(seq++).padStart(5, "0")}`;
}

export function resetIdSeq(n = 1000) {
  seq = n;
}
