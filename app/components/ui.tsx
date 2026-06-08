import {
  PRIORITY_COLOR,
  PRIORITY_LABELS,
  STATUS_BADGE,
  STATUS_LABELS,
  TicketPriority,
  TicketStatus,
} from "@/lib/tickets";

export function StatusBadge({ status }: { status: TicketStatus }) {
  const s = STATUS_BADGE[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: s.dot }}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityTag({ priority }: { priority: TicketPriority }) {
  return (
    <span
      className="font-mono text-[10.5px] font-medium uppercase tracking-wider"
      style={{ color: PRIORITY_COLOR[priority] }}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function ProjectTag({
  name,
  color,
}: {
  name: string;
  color: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line-strong px-2.5 py-1 text-xs font-medium text-ink-soft">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: color }}
      />
      {name}
    </span>
  );
}
