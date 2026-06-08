import Link from "next/link";
import { createProject } from "@/app/actions";
import { PROJECT_COLORS } from "@/lib/projects";

export default function NewProjectPage() {
  return (
    <div className="mx-auto w-full max-w-xl px-6 py-12">
      <Link href="/" className="text-sm text-muted hover:underline">
        ← Retour aux projets
      </Link>
      <h1 className="font-display mt-4 text-2xl font-semibold">
        Nouveau projet
      </h1>
      <p className="mt-1 text-sm text-muted">
        Regroupe les tickets d&apos;un même périmètre.
      </p>

      <form action={createProject} className="mt-8 flex flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13.5px] font-medium text-ink-soft">Nom</span>
          <input
            name="name"
            required
            maxLength={120}
            className="input"
            placeholder="ex. Site web"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13.5px] font-medium text-ink-soft">
            Description{" "}
            <span className="font-normal text-faint">(facultatif)</span>
          </span>
          <textarea
            name="description"
            rows={3}
            maxLength={500}
            className="input resize-y"
            placeholder="À quoi sert ce projet ?"
          />
        </label>

        <div className="flex flex-col gap-2.5">
          <span className="text-[13.5px] font-medium text-ink-soft">
            Couleur
          </span>
          <div className="flex flex-wrap gap-3">
            {PROJECT_COLORS.map((c, i) => (
              <label
                key={c.key}
                className="cursor-pointer"
                title={c.name}
              >
                <input
                  type="radio"
                  name="color"
                  value={c.hex}
                  defaultChecked={i === 0}
                  className="peer sr-only"
                />
                <span
                  className="block h-8 w-8 rounded-lg ring-2 ring-transparent ring-offset-2 ring-offset-paper transition-shadow peer-checked:ring-ink"
                  style={{ background: c.hex }}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-90"
          >
            Créer le projet
          </button>
          <Link
            href="/"
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-hover"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
