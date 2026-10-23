// PROTOTYPE: fictional demo data
import type { ChecklistItemTemplate, ChecklistSection } from "@/types";

export const CHECKLIST_TEMPLATES: ChecklistItemTemplate[] = [
  { id: "cl-open-1", section: "opening", label: "Site cleanliness — forecourt clear of debris", requiresPhoto: true },
  { id: "cl-open-2", section: "opening", label: "Charger health — visual inspection of all units", requiresPhoto: false },
  { id: "cl-open-3", section: "opening", label: "Safety equipment — extinguisher & first-aid kit present", requiresPhoto: true },
  { id: "cl-open-4", section: "opening", label: "Power status — main board & UPS OK", requiresPhoto: false },
  { id: "cl-open-5", section: "opening", label: "Cash / QR reconciliation — opening float", requiresPhoto: false },
  { id: "cl-chg-1", section: "charger_health", label: "Connector cables undamaged", requiresPhoto: false },
  { id: "cl-chg-2", section: "charger_health", label: "Display / status LEDs normal", requiresPhoto: false },
  { id: "cl-chg-3", section: "charger_health", label: "Emergency stop accessible", requiresPhoto: true },
  { id: "cl-clean-1", section: "cleanliness", label: "Cabin / desk tidy", requiresPhoto: false },
  { id: "cl-clean-2", section: "cleanliness", label: "Washrooms / amenities checked", requiresPhoto: false },
  { id: "cl-safe-1", section: "safety", label: "No trip hazards on charging bays", requiresPhoto: false },
  { id: "cl-safe-2", section: "safety", label: "CCTV recording confirmed", requiresPhoto: false },
  { id: "cl-close-1", section: "closing", label: "Closing checks — lights & locks", requiresPhoto: false },
  { id: "cl-close-2", section: "closing", label: "End-of-shift reconciliation", requiresPhoto: true },
];

export const SECTION_LABELS: Record<ChecklistSection, string> = {
  opening: "Opening",
  charger_health: "Charger health",
  cleanliness: "Cleanliness",
  safety: "Safety",
  closing: "Closing",
};
