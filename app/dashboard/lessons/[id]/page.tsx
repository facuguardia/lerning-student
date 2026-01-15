import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  Clock,
  ExternalLink,
  CheckCircle,
  XCircle,
} from "lucide-react";

import type React from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: lesson } = await supabase
    .from("lessons")
    .select("title, description, modules(title)")
    .eq("id", id)
    .single();
  const moduleTitle = (lesson as any)?.modules?.title as string | undefined;
  const title = lesson ? `Clase: ${lesson.title}` : "Clase";
  const description =
    lesson?.description ||
    (moduleTitle ? `Contenido de ${moduleTitle}.` : "Detalle de la clase.");
  return { title, description };
}

function RichTextRenderer({ text }: { text: string }) {
  const lines = text.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length && lines[i].trim().startsWith("```")) {
        i++;
      }
      elements.push(
        <pre
          key={`code-${i}`}
          className="mb-4 overflow-x-auto rounded bg-secondary p-4 text-sm"
        >
          <code className="font-mono">{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    if (/^#{1,3}\s+/.test(line)) {
      const level = line.match(/^#{1,3}/)![0].length;
      const content = line.replace(/^#{1,3}\s+/, "");
      const size =
        level === 1 ? "text-2xl" : level === 2 ? "text-xl" : "text-lg";
      elements.push(
        <h3 key={`h-${i}`} className={`mb-2 font-semibold ${size}`}>
          {content}
        </h3>
      );
      i++;
      continue;
    }

    if (/^\s*\d+[\.\)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[\.\)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[\.\)]\s+/, ""));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="mb-4 list-decimal space-y-1 pl-6">
          {items.map((it, idx) => (
            <li key={idx} className="text-muted-foreground">
              {it}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    if (/^\s*[-•]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-•]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-•]\s+/, ""));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="mb-4 list-disc space-y-1 pl-6">
          {items.map((it, idx) => (
            <li key={idx} className="text-muted-foreground">
              {it}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (trimmed === "") {
      i++;
      continue;
    }

    const parts = line.split(/(`[^`]+`)/g);
    elements.push(
      <p key={`p-${i}`} className="mb-3 text-muted-foreground">
        {parts.map((part, idx) =>
          part.startsWith("`") ? (
            <code
              key={idx}
              className="rounded bg-secondary px-1 py-0.5 font-mono text-[0.9em]"
            >
              {part.slice(1, -1)}
            </code>
          ) : (
            part
          )
        )}
      </p>
    );
    i++;
  }

  return <div>{elements}</div>;
}

export default async function LessonDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch lesson with module and assignment info
  const { data: lesson } = await supabase
    .from("lessons")
    .select("*, modules(*), assignments(*)")
    .eq("id", id)
    .single();

  if (!lesson) {
    notFound();
  }

  const { data: allModules } = await supabase
    .from("modules")
    .select("*")
    .eq("is_published", true)
    .order("order_index");

  // Fetch submission if there's an assignment
  const assignment = lesson.assignments?.[0];
  let submission = null;
  if (assignment) {
    const { data: submissionData } = await supabase
      .from("submissions")
      .select("*")
      .eq("user_id", user.id)
      .eq("assignment_id", assignment.id)
      .single();
    submission = submissionData;
  }

  return (
    <div className="p-8">
      {/* Back button */}
      <Link
        href={`/dashboard/modules/${lesson.module_id}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al módulo
      </Link>

      {/* Lesson header */}
      <div className="mb-8 border-b border-border pb-8">
        <div className="mb-2 text-sm text-muted-foreground">
          {lesson.modules.title}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
        {lesson.description && (
          <p className="mt-2 text-muted-foreground">{lesson.description}</p>
        )}
        {lesson.duration_minutes && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Duración estimada: {lesson.duration_minutes} minutos
          </p>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Lesson content */}
          <div className="border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">
              Contenido de la Clase
            </h2>
            <div className="max-w-none">
              <RichTextRenderer
                text={
                  lesson.content ||
                  "El contenido de esta clase estará disponible pronto."
                }
              />
            </div>
          </div>

          {/* Video if available */}
          {lesson.video_url && (
            <div className="border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">Video de la Clase</h2>
              <Button variant="outline" asChild className="gap-2">
                <a
                  href={lesson.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir video
                </a>
              </Button>
            </div>
          )}

          {/* Attached resources */}
          {(lesson.pdf_url ||
            (Array.isArray(lesson.resource_links) &&
              lesson.resource_links.length > 0)) && (
            <div className="border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">Recursos Adjuntos</h2>
              <div className="space-y-3">
                {lesson.pdf_url && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>PDF de la clase</span>
                    </div>
                    <Button variant="outline" asChild className="gap-2">
                      <a
                        href={lesson.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Abrir PDF
                      </a>
                    </Button>
                  </div>
                )}
                {Array.isArray(lesson.resource_links) &&
                  lesson.resource_links.length > 0 && (
                    <div>
                      <div className="mb-2 font-medium">Enlaces</div>
                      <ul className="space-y-2">
                        {lesson.resource_links.map(
                          (url: string, idx: number) => (
                            <li
                              key={idx}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <ExternalLink className="h-4 w-4" />
                                <span className="truncate max-w-[70%]">
                                  {url}
                                </span>
                              </div>
                              <Button variant="outline" asChild>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Abrir
                                </a>
                              </Button>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Assignment */}
        <div className="space-y-6">
          {assignment && (
            <div className="border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-secondary">
                  <FileText className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Trabajo Práctico</h3>
                  <p className="text-xs text-muted-foreground">
                    {assignment.max_score} puntos
                  </p>
                </div>
              </div>

              <p className="mb-4 text-sm text-muted-foreground">
                {assignment.title}
              </p>

              {/* Submission status */}
              {submission && (
                <div className="mb-4 rounded bg-muted p-3">
                  {submission.status === "approved" ? (
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Aprobado</span>
                    </div>
                  ) : submission.status === "rejected" ? (
                    <div className="flex items-center gap-2 text-destructive">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Rechazado</span>
                    </div>
                  ) : submission.status === "submitted" ? (
                    <div className="flex items-center gap-2 text-accent">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">En revisión</span>
                    </div>
                  ) : null}
                  {submission.score !== null && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Nota: {submission.score}/{assignment.max_score}
                    </p>
                  )}
                </div>
              )}

              <Link href={`/dashboard/assignments/${assignment.id}`}>
                <Button
                  className="w-full"
                  variant={
                    submission?.status === "approved" ? "outline" : "default"
                  }
                >
                  {submission?.status === "approved"
                    ? "Ver entrega"
                    : submission?.status === "rejected"
                    ? "Volver a entregar"
                    : submission?.status === "submitted"
                    ? "Ver estado"
                    : "Entregar trabajo"}
                </Button>
              </Link>
            </div>
          )}

          {/* Navigation hint */}
          <div className="border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              Después de entregar el trabajo práctico, puedes continuar con la
              siguiente clase mientras esperas la corrección.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
