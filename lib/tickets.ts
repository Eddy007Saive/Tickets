// Shared metadata for ticket status and priority: ordered values, French
// labels, and desaturated "editorial" badge styles (hex, applied inline so
// they match the agreed design exactly). Keep enum values in sync with
// prisma/schema.prisma.

export const TICKET_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
] as const;

export const TICKET_PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Ouvert",
  IN_PROGRESS: "En cours",
  RESOLVED: "Résolu",
  CLOSED: "Fermé",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: "Basse",
  MEDIUM: "Moyenne",
  HIGH: "Haute",
  URGENT: "Urgente",
};

// Status badge: pill background / text / border / status dot.
export type BadgeStyle = { bg: string; text: string; border: string; dot: string };

export const STATUS_BADGE: Record<TicketStatus, BadgeStyle> = {
  OPEN: { bg: "#EEF2F7", text: "#3C5675", border: "#DBE3EE", dot: "#3C5675" },
  IN_PROGRESS: {
    bg: "#FAF1E2",
    text: "#8A6116",
    border: "#EFE0C4",
    dot: "#8A6116",
  },
  RESOLVED: { bg: "#E9F3EC", text: "#2C6242", border: "#D3E7D9", dot: "#2C6242" },
  CLOSED: { bg: "#EFEDE9", text: "#6B6862", border: "#E0DCD3", dot: "#9A968E" },
};

// Priority is rendered as small uppercase mono text in a single tone.
export const PRIORITY_COLOR: Record<TicketPriority, string> = {
  LOW: "#9A968E",
  MEDIUM: "#3C5675",
  HIGH: "#A8611C",
  URGENT: "#B8472E",
};
