import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  PlayCircle,
  BookOpen,
  Lock,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ModuleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: module } = await supabase
    .from("modules")
    .select("*, lessons(*, assignments(*))")
    .eq("id", id)
    .single();

  if (!module) {
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
  const moduleIndex = allModules?.findIndex((m) => m.id === id) ?? 0;

  // Fetch quiz for this module
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("*")
    .eq("module_id", id)
    .single();

  const assignmentIds =
    module.lessons?.flatMap((l: any) => l.assignments.map((a: any) => a.id)) ||
    [];
  const { data: submissions } = await supabase
    .from("submissions")
    .select("*")
    .eq("user_id", user.id)
    .in("assignment_id", assignmentIds);

  const allAssignmentsApproved =
    assignmentIds.length === 0 ||
    assignmentIds.every((assignmentId: string) => {
      const submission = submissions?.find(
        (s) => s.assignment_id === assignmentId
      );
      return submission?.is_approved === true;
    });

  const moduleAttempts = quizAttempts?.filter(
    (a: { quizzes: { module_id: string } | null }) =>
      a.quizzes?.module_id === id
  );
  const lastFailedAttempt = moduleAttempts
    ?.filter((a: { passed: boolean }) => !a.passed)
    .sort(
      (a: { created_at: string }, b: { created_at: string }) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

  let quizCooldownRemaining = 0;
  if (lastFailedAttempt) {
    const sixHoursInMs = 6 * 60 * 60 * 1000;
    const timeSinceAttempt =
      Date.now() - new Date(lastFailedAttempt.created_at).getTime();
    quizCooldownRemaining = Math.max(0, sixHoursInMs - timeSinceAttempt);
  }

  const isQuizBlocked = !allAssignmentsApproved || quizCooldownRemaining > 0;

  const bestScore = moduleAttempts?.length
    ? Math.max(
        ...moduleAttempts.map((a: { percentage: number }) => a.percentage)
      )
    : null;
  const hasPassed = moduleAttempts?.some((a: { passed: boolean }) => a.passed);
  const hasCompleted = !!hasPassed && !!allAssignmentsApproved;

  const sortedLessons =
    module.lessons?.sort((a: any, b: any) => a.order_index - b.order_index) ||
    [];

  return (
    <div className="p-8">
      <Link
        href="/dashboard/modules"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a módulos
      </Link>

      <div className="mb-8 border-b border-border pb-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center bg-primary text-lg font-bold text-primary-foreground">
            {String(moduleIndex + 1).padStart(2, "0")}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {module.title}
            </h1>
            <p className="mt-2 text-muted-foreground">{module.description}</p>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="text-muted-foreground">
                {sortedLessons.length}{" "}
                {sortedLessons.length === 1 ? "clase" : "clases"}
              </span>
              <span className="text-muted-foreground">
                {assignmentIds.length}{" "}
                {assignmentIds.length === 1
                  ? "trabajo práctico"
                  : "trabajos prácticos"}
              </span>
            </div>
          </div>
          {hasCompleted && (
            <div className="flex items-center gap-2 bg-success/10 px-3 py-1.5 text-sm font-medium text-success">
              <CheckCircle className="h-4 w-4" />
              Módulo Completado
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Clases del Módulo</h2>

          {sortedLessons.length === 0 ? (
            <div className="border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                Este módulo aún no tiene clases disponibles.
              </p>
            </div>
          ) : (
            sortedLessons.map((lesson: any, index: number) => {
              const assignment = lesson.assignments?.[0];
              const submission = assignment
                ? submissions?.find((s) => s.assignment_id === assignment.id)
                : null;

              return (
                <div
                  key={lesson.id}
                  className="border border-border bg-card p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-accent text-sm font-bold text-accent-foreground">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{lesson.title}</h3>
                        {lesson.description && (
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {lesson.description}
                          </p>
                        )}
                        {lesson.duration_minutes && (
                          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {lesson.duration_minutes} minutos
                          </p>
                        )}
                      </div>
                    </div>

                    {assignment && (
                      <div className="flex flex-col items-end gap-2">
                        {submission?.is_approved === true ? (
                          <span className="inline-flex items-center gap-1 bg-success/10 px-2 py-1 text-xs font-medium text-success">
                            <CheckCircle className="h-3 w-3" />
                            Aprobado
                          </span>
                        ) : submission?.is_approved === false ? (
                          <span className="inline-flex items-center gap-1 bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
                            <XCircle className="h-3 w-3" />
                            Rechazado
                          </span>
                        ) : submission ? (
                          <span className="inline-flex items-center gap-1 bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
                            <Clock className="h-3 w-3" />
                            En revisión
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-warning/10 px-2 py-1 text-xs font-medium text-warning">
                            Pendiente
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2 justify-end">
                    <Link href={`/dashboard/lessons/${lesson.id}`}>
                      <Button size="sm" variant="outline">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Ver clase
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar - Quiz */}
        <div className="space-y-6">
          {quiz && (
            <div className="border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-accent">
                  <PlayCircle className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Quiz del Módulo</h3>
                  <p className="text-xs text-muted-foreground">
                    Nota mínima: {quiz.passing_score}%
                  </p>
                </div>
              </div>

              {bestScore !== null && (
                <div className="mb-4 rounded bg-muted p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Mejor puntuación
                    </span>
                    <span
                      className={
                        hasPassed
                          ? "font-semibold text-success"
                          : "font-semibold text-destructive"
                      }
                    >
                      {Math.round(bestScore)}%
                    </span>
                  </div>
                </div>
              )}

              {isQuizBlocked && (
                <div className="mb-4 rounded border border-warning/20 bg-warning/10 p-3">
                  <p className="text-sm font-medium text-warning">
                    Quiz bloqueado
                  </p>
                  {!allAssignmentsApproved && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Debes aprobar todos los trabajos prácticos del módulo
                      primero.
                    </p>
                  )}
                  {quizCooldownRemaining > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Debes esperar{" "}
                      {Math.ceil(quizCooldownRemaining / (60 * 60 * 1000))}{" "}
                      horas antes de reintentar.
                    </p>
                  )}
                </div>
              )}

              {isQuizBlocked ? (
                <Button className="w-full" disabled>
                  <Lock className="mr-2 h-4 w-4" />
                  Quiz bloqueado
                </Button>
              ) : (
                <Link href={`/dashboard/quiz/${quiz.id}`}>
                  <Button
                    className="w-full"
                    variant={hasPassed ? "outline" : "default"}
                  >
                    {hasPassed
                      ? "Repetir Quiz"
                      : bestScore !== null
                      ? "Reintentar Quiz"
                      : "Comenzar Quiz"}
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Next Module */}
          {moduleIndex < (allModules?.length ?? 0) - 1 && (
            <div className="border border-border bg-card p-6">
              <h3 className="mb-2 font-semibold">Siguiente Módulo</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {allModules![moduleIndex + 1].title}
              </p>
              {hasCompleted ? (
                <Link
                  href={`/dashboard/modules/${allModules![moduleIndex + 1].id}`}
                >
                  <Button variant="outline" className="w-full bg-transparent">
                    Continuar
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  disabled
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Completa este módulo primero
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
