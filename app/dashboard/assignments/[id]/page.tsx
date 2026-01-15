import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Github, Globe, Calendar } from "lucide-react";
import { SubmissionForm } from "@/components/assignments/submission-form";
import { SubmissionStatus } from "@/components/assignments/submission-status";
import { AssignmentChat } from "@/components/chat/assignment-chat";
import type React from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: assignment } = await supabase
    .from("assignments")
    .select("title, lessons(modules(title))")
    .eq("id", id)
    .single();
  const moduleTitle = (assignment as any)?.lessons?.modules?.title as string | undefined;
  const title = assignment ? `Trabajo: ${assignment.title}` : "Trabajo";
  const description = moduleTitle
    ? `Trabajo práctico del módulo ${moduleTitle}.`
    : "Trabajo práctico del curso.";
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

export default async function AssignmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: assignment } = await supabase
    .from("assignments")
    .select("*, lessons(id, title, module_id, modules(id, title, order_index))")
    .eq("id", id)
    .single();

  if (!assignment) {
    notFound();
  }

  const { data: allModules } = await supabase
    .from("modules")
    .select("*")
    .eq("is_published", true)
    .order("order_index");

  const { data: quizAttempts } = await supabase
    .from("quiz_attempts")
    .select("*, quizzes(module_id)")
    .eq("user_id", user.id);

  const moduleIndex =
    allModules?.findIndex((m) => m.id === assignment.lessons?.modules?.id) ?? 0;
  let isUnlocked = moduleIndex === 0;

  if (moduleIndex > 0) {
    const prevModule = allModules![moduleIndex - 1];
    const prevModuleAttempts = quizAttempts?.filter(
      (a: { quizzes: { module_id: string } | null; passed: boolean }) =>
        a.quizzes?.module_id === prevModule.id && a.passed
    );
    isUnlocked = !!prevModuleAttempts && prevModuleAttempts.length > 0;
  }

  if (!isUnlocked) {
    redirect("/dashboard/assignments");
  }

  const { data: submission } = await supabase
    .from("submissions")
    .select(
      "*, graded_by_profile:profiles!submissions_graded_by_fkey(full_name)"
    )
    .eq("assignment_id", id)
    .eq("user_id", user.id)
    .single();

  return (
    <div className="p-8">
      <Link
        href={`/dashboard/lessons/${assignment.lessons?.id}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a la clase
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Assignment details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center bg-primary">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                {assignment.lessons?.modules && (
                  <p className="text-sm text-muted-foreground">
                    {assignment.lessons.modules.title}
                  </p>
                )}
                <h1 className="text-2xl font-bold">{assignment.title}</h1>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {assignment.points || assignment.max_score}
                </p>
                <p className="text-sm text-muted-foreground">puntos</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Descripción</h2>
            <p className="text-muted-foreground">{assignment.description}</p>
          </div>

          {/* Instructions */}
          {assignment.instructions && (
            <div className="border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Instrucciones</h2>
              <div className="max-w-none">
                <RichTextRenderer text={assignment.instructions} />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Submission */}
        <div className="space-y-6">
          {/* Due date */}
          {assignment.due_date && (
            <div className="border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Fecha límite</p>
                  <p className="font-medium">
                    {new Date(assignment.due_date).toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submission status or form */}
          {submission ? (
            <>
              <SubmissionStatus
                submission={submission}
                maxScore={assignment.max_score}
              />
              {submission.is_approved === false && (
                <div className="mt-8 border-t border-border pt-8">
                  <h3 className="mb-4 text-lg font-semibold">
                    Nueva Entrega/Corrección
                  </h3>
                  <SubmissionForm
                    assignmentId={assignment.id}
                    userId={user.id}
                    existingSubmission={submission}
                  />
                </div>
              )}
            </>
          ) : (
            <SubmissionForm
              assignmentId={assignment.id}
              userId={user.id}
              existingSubmission={submission}
            />
          )}

          {/* Chat with admin */}
          <div className="mt-8">
            <AssignmentChat
              assignmentId={assignment.id}
              userId={user.id}
              currentUserRole="student"
              isClosed={submission?.is_approved === true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
