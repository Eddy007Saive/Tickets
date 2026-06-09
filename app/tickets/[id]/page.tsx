import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  addComment,
  updateTicketAssignee,
  updateTicketPriority,
  updateTicketStatus,
} from "@/app/actions";
import { PriorityTag, ProjectTag, StatusBadge } from "@/app/components/ui";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "@/lib/tickets";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeStyle: "short",
});

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      project: true,
      comments: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!ticket) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <nav className="mb-5 text-[13px] text-muted">
        <Link href="/" className="hover:underline">
          Projets
        </Link>
        <span className="mx-2 text-faint">/</span>
        <Link
          href={`/projects/${ticket.project.id}`}
          className="hover:underline"
        >
          {ticket.project.name}
        </Link>
        <span className="mx-2 text-faint">/</span>
        <span className="font-medium text-ink">{ticket.subject}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_260px]">
        {/* Colonne principale */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <ProjectTag
              name={ticket.project.name}
              color={ticket.project.color}
            />
            <StatusBadge status={ticket.status} />
            <PriorityTag priority={ticket.priority} />
          </div>

          <h1 className="font-display mt-3 text-[27px] font-semibold">
            {ticket.subject}
          </h1>
          <p className="mt-2 text-[13px] text-muted">
            Ouvert par{" "}
            <span className="text-ink-soft">{ticket.requesterName}</span> ·{" "}
            <span className="font-mono">{ticket.requesterEmail}</span> ·{" "}
            {dateFmt.format(ticket.createdAt)}
          </p>

          <div className="mt-5 whitespace-pre-wrap rounded-xl border border-line bg-card p-5 text-[14.5px] leading-relaxed text-ink-soft">
            {ticket.description}
          </div>

          {ticket.imageUrl && (
            <a
              href={ticket.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block overflow-hidden rounded-xl border border-line"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ticket.imageUrl}
                alt={`Pièce jointe — ${ticket.subject}`}
                className="max-h-[480px] w-full object-contain bg-hover"
              />
            </a>
          )}

          {/* Conversation */}
          <h2 className="mt-8 mb-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
            Conversation · {ticket.comments.length}{" "}
            {ticket.comments.length === 1 ? "commentaire" : "commentaires"}
          </h2>

          <ul className="flex flex-col gap-3">
            {ticket.comments.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-line bg-card p-4"
              >
                <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
                  <span className="font-semibold text-ink">{c.author}</span>
                  <span className="font-mono text-[11px] text-faint">
                    {dateFmt.format(c.createdAt)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-ink-soft">
                  {c.body}
                </p>
              </li>
            ))}
            {ticket.comments.length === 0 && (
              <li className="text-sm text-faint">Aucun commentaire.</li>
            )}
          </ul>

          <form action={addComment} className="mt-5 flex flex-col gap-3">
            <input type="hidden" name="ticketId" value={ticket.id} />
            <input
              name="author"
              required
              placeholder="Votre nom"
              className="input"
            />
            <textarea
              name="body"
              required
              rows={3}
              placeholder="Écrire un commentaire…"
              className="input resize-y"
            />
            <button
              type="submit"
              className="self-start rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-90"
            >
              Ajouter le commentaire
            </button>
          </form>
        </div>

        {/* Panneau de gestion */}
        <aside>
          <div className="flex flex-col gap-5 rounded-xl border border-line bg-card p-4">
            <form action={updateTicketStatus} className="flex flex-col gap-1.5">
              <input type="hidden" name="id" value={ticket.id} />
              <SidebarLabel>Statut</SidebarLabel>
              <select name="status" defaultValue={ticket.status} className="input">
                {TICKET_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <SaveButton />
            </form>

            <form
              action={updateTicketPriority}
              className="flex flex-col gap-1.5"
            >
              <input type="hidden" name="id" value={ticket.id} />
              <SidebarLabel>Priorité</SidebarLabel>
              <select
                name="priority"
                defaultValue={ticket.priority}
                className="input"
              >
                {TICKET_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
              <SaveButton />
            </form>

            <form
              action={updateTicketAssignee}
              className="flex flex-col gap-1.5"
            >
              <input type="hidden" name="id" value={ticket.id} />
              <SidebarLabel>Assigné à</SidebarLabel>
              <input
                name="assignee"
                defaultValue={ticket.assignee ?? ""}
                placeholder="Non assigné"
                className="input"
              />
              <SaveButton />
            </form>

            <div className="flex flex-col gap-1.5">
              <SidebarLabel>Projet</SidebarLabel>
              <Link href={`/projects/${ticket.project.id}`}>
                <ProjectTag
                  name={ticket.project.name}
                  color={ticket.project.color}
                />
              </Link>
            </div>
          </div>
          <p className="mt-3 font-mono text-[10.5px] text-faint">
            Mis à jour le {dateFmt.format(ticket.updatedAt)}
          </p>
        </aside>
      </div>
    </div>
  );
}

function SidebarLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10.5px] uppercase tracking-wider text-faint">
      {children}
    </span>
  );
}

function SaveButton() {
  return (
    <button
      type="submit"
      className="mt-1 self-start rounded-md border border-line-strong px-3 py-1 text-xs font-medium text-ink-soft transition-colors hover:bg-hover"
    >
      Enregistrer
    </button>
  );
}
