import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { tickets: true } } },
  });

  // "Ouverts" = tickets en cours de traitement (OPEN + IN_PROGRESS).
  const openGroups = await prisma.ticket.groupBy({
    by: ["projectId"],
    where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
    _count: { _all: true },
  });
  const openByProject = new Map(
    openGroups.map((g) => [g.projectId, g._count._all])
  );
  const totalOpen = openGroups.reduce((sum, g) => sum + g._count._all, 0);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <header className="mb-9 flex items-center justify-between">
        <div className="flex items-baseline gap-2.5">
          <span className="font-display text-xl font-semibold">Ticketing</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
            Support
          </span>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-90"
        >
          <span className="text-[15px] leading-none opacity-80">+</span>
          Nouveau projet
        </Link>
      </header>

      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
        Vue d&apos;ensemble
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold">Projets</h1>
      <p className="mt-1.5 text-sm text-muted">
        {projects.length} {projects.length === 1 ? "projet" : "projets"} ·{" "}
        {totalOpen} {totalOpen === 1 ? "ticket ouvert" : "tickets ouverts"}
      </p>

      {projects.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-line-strong p-12 text-center text-sm text-muted">
          Aucun projet pour l&apos;instant.{" "}
          <Link href="/projects/new" className="font-medium text-ink underline">
            Créer le premier projet
          </Link>
          .
        </div>
      ) : (
        <ul className="mt-7 border-t border-line">
          {projects.map((p) => {
            const open = openByProject.get(p.id) ?? 0;
            return (
              <li key={p.id}>
                <Link
                  href={`/projects/${p.id}`}
                  className="grid grid-cols-[4px_1fr_auto] items-center gap-5 border-b border-line py-5 transition-colors hover:bg-hover"
                >
                  <span
                    className="h-11 w-1 self-center rounded"
                    style={{ background: p.color }}
                  />
                  <div className="min-w-0">
                    <div className="font-display text-xl font-semibold">
                      {p.name}
                    </div>
                    {p.description && (
                      <div className="mt-0.5 truncate text-[13.5px] text-muted">
                        {p.description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-6">
                    <Stat n={open} label="Ouverts" />
                    <Stat n={p._count.tickets} label="Total" />
                    <span className="text-lg text-faint">→</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex flex-col items-end">
      <span className="font-display text-2xl font-semibold leading-none">
        {n}
      </span>
      <span className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-faint">
        {label}
      </span>
    </div>
  );
}
