// Curated project color palette. Projects store a hex string (Project.color);
// the form offers these swatches and the UI uses the hex directly as the
// project's visual identifier (left "spine", dots, tags).

export type ProjectColor = { key: string; name: string; hex: string };

export const PROJECT_COLORS: ProjectColor[] = [
  { key: "clay", name: "Argile", hex: "#B8472E" },
  { key: "forest", name: "Forêt", hex: "#2E6A4E" },
  { key: "indigo", name: "Indigo", hex: "#3A56A0" },
  { key: "amber", name: "Ambre", hex: "#B07B22" },
  { key: "plum", name: "Prune", hex: "#7A4DA0" },
  { key: "teal", name: "Sarcelle", hex: "#2A8C9E" },
];

export const DEFAULT_PROJECT_COLOR = PROJECT_COLORS[0].hex;

/** Whether a stored color is one of the curated palette values. */
export function isValidProjectColor(hex: string): boolean {
  return PROJECT_COLORS.some((c) => c.hex === hex);
}
