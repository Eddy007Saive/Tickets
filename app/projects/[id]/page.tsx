import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PriorityTag, StatusBadge } from "@/app/components/ui";
import {
  STATUS_LABELS,
  TICKET_STATUSES,
  TicketStatus,
} from "@/lib/tickets";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const { status } = await searchParams;
  const activeStatus = TICKET_STATUSES.includes(status as TicketStatus)
    ? (status as TicketStatus)
    : undefined;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  const tickets = await prisma.ticket.findMany({
    where: {
      projectId: id,
      ...(activeStatus ? { status: activeStatus } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { comments: true } } },
  });

  const openCount = await prisma.ticket.count({
    where: { projectId: id, status: { in: ["OPEN", "IN_PROGRESS"] } },
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <header className="mb-7 flex items-center justify-between">
        <div className="flex items-baseline gap-2.5">
          <Link href="/" className="font-display text-xl font-semibold">
            Ticketing
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
            Support
          </span>
        </div>
        <Link
          href={`/tickets/new?project=${project.id}`}
          className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-90"
        >
          <span className="text-[15px] leading-none opacity-80">+</span>
          Nouveau ticket
        </Link>
      </header>

      <nav className="mb-4 text-[13px] text-muted">
        <Link href="/" className="hover:underline">
          Projets
        </Link>
        <span className="mx-2 text-faint">/</span>
        <span className="font-medium text-ink">{project.name}</span>
      </nav>

      <div className="flex items-center gap-3">
        <span
          className="block h-8 w-[5px] rounded"
          style={{ background: project.color }}
        />
        <h1 className="font-display text-3xl font-semibold">{project.name}</h1>
      </div>
      <p className="mt-1.5 text-sm text-muted">
        {project.description ? `${project.description} · ` : ""}
        {openCount} {openCount === 1 ? "ouvert" : "ouverts"}
      </p>

      <nav className="mt-6 flex flex-wrap gap-2 text-[13px]">
        <FilterChip
          label="Tous"
          href={`/projects/${project.id}`}
          active={!activeStatus}
        />
        {TICKET_STATUSES.map((s) => (
          <FilterChip
            key={s}
            label={STATUS_LABELS[s]}
            href={`/projects/${project.id}?status=${s}`}
            active={activeStatus === s}
          />
        ))}
      </nav>

      {tickets.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-line-strong p-10 text-center text-sm text-muted">
          {activeStatus ? (
            "Aucun ticket avec ce statut."
          ) : (
            <>
              Aucun ticket dans ce projet.{" "}
              <Link
                href={`/tickets/new?project=${project.id}`}
                className="font-medium text-ink underline"
              >
                Créer le premier
              </Link>
              .
            </>
          )}
        </div>
      ) : (
        <ul className="mt-4 border-t border-line">
          {tickets.map((t) => (
            <li key={t.id}>
              <Link
                href={`/tickets/${t.id}`}
                className="grid grid-cols-[1fr_auto] items-center gap-5 border-b border-line py-4 transition-colors hover:bg-hover"
              >
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-medium text-ink">
                    {t.subject}
                  </div>
                  <div className="mt-0.5 truncate text-[12.5px] text-faint">
                    {t.requesterName} ·{" "}
                    <span className="font-mono">{t.requesterEmail}</span>
                    {t._count.comments > 0
                      ? ` · ${t._count.comments} commentaire${t._count.comments === 1 ? "" : "s"}`
                      : ""}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <PriorityTag priority={t.priority} />
                  <StatusBadge status={t.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1.5 transition-colors ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-line-strong text-muted hover:bg-hover"
      }`}
    >
      {label}
    </Link>
  );
}
