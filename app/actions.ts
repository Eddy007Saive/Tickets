"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TicketPriority, TicketStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { escapeHtml, sendTelegramMessage } from "@/lib/telegram";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/tickets";
import { DEFAULT_PROJECT_COLOR, isValidProjectColor } from "@/lib/projects";

// NOTE: auth is intentionally not wired up yet. These Server Actions are
// reachable via direct POST requests — add authentication/authorization here
// before deploying anything that isn't a trusted demo.

export async function createProject(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const colorInput = String(formData.get("color") ?? "");
  const color = isValidProjectColor(colorInput)
    ? colorInput
    : DEFAULT_PROJECT_COLOR;

  if (!name) throw new Error("Le nom du projet est requis");

  const project = await prisma.project.create({
    data: { name, description: description || null, color },
  });

  revalidatePath("/");
  redirect(`/projects/${project.id}`);
}

export async function createTicket(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "");
  const subject = String(formData.get("subject") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const requesterName = String(formData.get("requesterName") ?? "").trim();
  const requesterEmail = String(formData.get("requesterEmail") ?? "").trim();
  const priority = String(formData.get("priority") ?? "MEDIUM");

  if (!projectId) throw new Error("Un projet est requis");
  if (!subject || !description || !requesterName || !requesterEmail) {
    throw new Error("Champs obligatoires manquants");
  }

  const ticket = await prisma.ticket.create({
    data: {
      projectId,
      subject,
      description,
      requesterName,
      requesterEmail,
      priority: priority as TicketPriority,
    },
    include: { project: true },
  });

  await notifyNewTicket(ticket);

  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
  redirect(`/tickets/${ticket.id}`);
}

type NewTicketWithProject = {
  id: string;
  subject: string;
  description: string;
  requesterName: string;
  requesterEmail: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: Date;
  project: { name: string };
};

// Build and send the Telegram notification for a freshly created ticket.
// Failures are swallowed inside sendTelegramMessage so they never block
// ticket creation.
async function notifyNewTicket(ticket: NewTicketWithProject) {
  const baseUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );
  const link = `${baseUrl}/tickets/${ticket.id}`;

  const lines = [
    `🎫 <b>Nouveau ticket</b>`,
    ``,
    `<b>Projet :</b> ${escapeHtml(ticket.project.name)}`,
    `<b>Sujet :</b> ${escapeHtml(ticket.subject)}`,
    `<b>Priorité :</b> ${PRIORITY_LABELS[ticket.priority]}`,
    `<b>Statut :</b> ${STATUS_LABELS[ticket.status]}`,
    `<b>De :</b> ${escapeHtml(ticket.requesterName)} (${escapeHtml(ticket.requesterEmail)})`,
    `<b>Ouvert le :</b> ${ticket.createdAt.toLocaleString("fr-FR")}`,
    ``,
    `<b>Description :</b>`,
    escapeHtml(ticket.description),
    ``,
    `🔗 ${escapeHtml(link)}`,
  ];

  await sendTelegramMessage(lines.join("\n"));
}

export async function updateTicketStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as TicketStatus;
  if (!id) throw new Error("Identifiant de ticket manquant");

  const ticket = await prisma.ticket.update({
    where: { id },
    data: { status },
  });

  revalidatePath(`/tickets/${id}`);
  revalidatePath(`/projects/${ticket.projectId}`);
  revalidatePath("/");
}

export async function updateTicketPriority(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const priority = String(formData.get("priority") ?? "") as TicketPriority;
  if (!id) throw new Error("Identifiant de ticket manquant");

  const ticket = await prisma.ticket.update({
    where: { id },
    data: { priority },
  });

  revalidatePath(`/tickets/${id}`);
  revalidatePath(`/projects/${ticket.projectId}`);
  revalidatePath("/");
}

export async function updateTicketAssignee(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const assignee = String(formData.get("assignee") ?? "").trim();
  if (!id) throw new Error("Identifiant de ticket manquant");

  await prisma.ticket.update({
    where: { id },
    data: { assignee: assignee || null },
  });

  revalidatePath(`/tickets/${id}`);
}

export async function addComment(formData: FormData) {
  const ticketId = String(formData.get("ticketId") ?? "");
  const author = String(formData.get("author") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!ticketId) throw new Error("Identifiant de ticket manquant");
  if (!author || !body) throw new Error("Champs obligatoires manquants");

  await prisma.comment.create({ data: { ticketId, author, body } });
  // Touch the ticket so its updatedAt reflects the new activity.
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { updatedAt: new Date() },
  });

  revalidatePath(`/tickets/${ticketId}`);
}
