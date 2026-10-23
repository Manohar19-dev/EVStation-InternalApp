"use client";

import type { Station } from "@/types";
import { cn } from "@/lib/cn";

const statusColor: Record<Station["status"], string> = {
  live: "#2F8A5F",
  under_maintenance: "#C98A1B",
  closed: "#5F6E64",
};

export function StationMiniMap({ stations, onSelect }: { stations: Station[]; onSelect?: (id: string) => void }) {
  return (
    <div className="relative h-56 w-full overflow-hidden bg-[#EEF0E8]">
      <svg viewBox="0 0 1000 900" className="h-full w-full" role="img" aria-label="Network station map">
        <rect width="1000" height="900" fill="#EEF0E8" />
        {/* soft parks / water */}
        <ellipse cx="520" cy="520" rx="70" ry="50" fill="#E4EFF4" opacity="0.9" />
        <ellipse cx="300" cy="350" rx="90" ry="60" fill="#E7ECE2" />
        <ellipse cx="750" cy="650" rx="80" ry="55" fill="#E7ECE2" />
        {/* roads */}
        <path d="M50 450 H950" stroke="#DDE1D5" strokeWidth="10" />
        <path d="M50 450 H950" stroke="#fff" strokeWidth="4" />
        <path d="M480 50 V850" stroke="#DDE1D5" strokeWidth="10" />
        <path d="M480 50 V850" stroke="#fff" strokeWidth="4" />
        <path d="M120 200 C300 280 400 700 880 720" stroke="#DDE1D5" strokeWidth="8" fill="none" />
        {stations.map((s) => (
          <g
            key={s.id}
            transform={`translate(${s.map.x}, ${s.map.y})`}
            className={cn(onSelect && "cursor-pointer")}
            onClick={() => onSelect?.(s.id)}
          >
            <circle r="14" fill="#fff" stroke={statusColor[s.status]} strokeWidth="3" />
            <circle r="4" fill={statusColor[s.status]} />
          </g>
        ))}
      </svg>
      <div className="absolute bottom-2 left-2 flex gap-3 rounded-md bg-surface/90 px-2 py-1 t-caption text-ink-500 shadow-xs">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-primary-500" /> Live
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-warn-icon" /> Maint.
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-ink-500" /> Closed
        </span>
      </div>
    </div>
  );
}
