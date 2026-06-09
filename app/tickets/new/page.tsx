import Link from "next/link";
import { createTicket } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { ProjectTag } from "@/app/components/ui";
import { PRIORITY_LABELS, TICKET_PRIORITIES } from "@/lib/tickets";

export const dynamic = "force-dynamic";

export default async function NewTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project: projectId } = await searchParams;

  const lockedProject = projectId
    ? await prisma.project.findUnique({ where: { id: projectId } })
    : null;

  // When no project is pre-selected, offer a picker of existing projects.
  const allProjects = lockedProject
    ? []
    : await prisma.project.findMany({ orderBy: { name: "asc" } });

  const backHref = lockedProject ? `/projects/${lockedProject.id}` : "/";

  // A ticket must belong to a project. If none exist, send the user to create
  // one first.
  if (!lockedProject && allProjects.length === 0) {
    return (
      <div className="mx-auto w-full max-w-xl px-6 py-12">
        <Link href="/" className="text-sm text-muted hover:underline">
          ← Retour aux projets
        </Link>
        <div className="mt-8 rounded-xl border border-dashed border-line-strong p-10 text-center text-sm text-muted">
          Il faut d&apos;abord créer un projet avant d&apos;ouvrir un ticket.{" "}
          <Link
            href="/projects/new"
            className="font-medium text-ink underline"
          >
            Créer un projet
          </Link>
          .
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-12">
      <Link href={backHref} className="text-sm text-muted hover:underline">
        ← Retour
      </Link>
      <h1 className="font-display mt-4 text-2xl font-semibold">
        Nouveau ticket
      </h1>
      {lockedProject && (
        <p className="mt-2 flex items-center gap-2 text-sm text-muted">
          Rattaché à{" "}
          <ProjectTag name={lockedProject.name} color={lockedProject.color} />
        </p>
      )}

      <form action={createTicket} className="mt-8 flex flex-col gap-5">
        {lockedProject ? (
          <input type="hidden" name="projectId" value={lockedProject.id} />
        ) : (
          <Field label="Projet">
            <select name="projectId" required defaultValue="" className="input">
              <option value="" disabled>
                Choisir un projet…
              </option>
              {allProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field label="Sujet">
          <input
            name="subject"
            required
            maxLength={200}
            className="input"
            placeholder="Résumé court du problème"
          />
        </Field>

        <Field label="Description">
          <textarea
            name="description"
            required
            rows={6}
            className="input resize-y"
            placeholder="Décrivez le problème en détail"
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Votre nom">
            <input name="requesterName" required className="input" />
          </Field>
          <Field label="Votre e-mail">
            <input
              name="requesterEmail"
              type="email"
              required
              className="input"
            />
          </Field>
        </div>

        <Field label="Priorité">
          <select name="priority" defaultValue="MEDIUM" className="input">
            {TICKET_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </Field>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13.5px] font-medium text-ink-soft">
            Image{" "}
            <span className="font-normal text-faint">
              (facultatif · PNG, JPEG, WEBP, GIF · 8 Mo max)
            </span>
          </span>
          <input
            type="file"
            name="image"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-lg file:border file:border-line-strong file:bg-card file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-hover"
          />
        </label>

        <div className="mt-3 flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-90"
          >
            Créer le ticket
          </button>
          <Link
            href={backHref}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-hover"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13.5px] font-medium text-ink-soft">{label}</span>
      {children}
    </label>
  );
}
