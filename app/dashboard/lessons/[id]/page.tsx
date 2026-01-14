import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Clock, ExternalLink, CheckCircle, XCircle } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LessonDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch lesson with module and assignment info
  const { data: lesson } = await supabase.from("lessons").select("*, modules(*), assignments(*)").eq("id", id).single()

  if (!lesson) {
    notFound()
  }

  // Check if user has access to this module
  const { data: allModules } = await supabase.from("modules").select("*").eq("is_published", true).order("order_index")
  const moduleIndex = allModules?.findIndex((m) => m.id === lesson.module_id) ?? 0

  // Fetch quiz attempts to verify unlock status
  const { data: quizAttempts } = await supabase
    .from("quiz_attempts")
    .select("*, quizzes(module_id)")
    .eq("user_id", user.id)

  let arePrevModuleAssignmentsApproved = true
  let isModuleUnlocked = moduleIndex === 0
  if (moduleIndex > 0) {
    const prevModule = allModules![moduleIndex - 1]
    const { data: prevAssignments } = await supabase
      .from("assignments")
      .select("id, lessons(module_id)")
      .eq("lessons.module_id", prevModule.id)
    const prevAssignmentIds = prevAssignments?.map((a: any) => a.id) || []
    if (prevAssignmentIds.length > 0) {
      const { data: userPrevSubmissions } = await supabase
        .from("submissions")
        .select("assignment_id, is_approved")
        .eq("user_id", user.id)
        .in("assignment_id", prevAssignmentIds)
      arePrevModuleAssignmentsApproved = prevAssignmentIds.every((assignmentId: string) => {
        const submission = userPrevSubmissions?.find((s: any) => s.assignment_id === assignmentId)
        return submission?.is_approved === true
      })
    }
    const prevModuleAttempts = quizAttempts?.filter(
      (a: { quizzes: { module_id: string } | null; passed: boolean }) =>
        a.quizzes?.module_id === prevModule.id && a.passed,
    )
    isModuleUnlocked = !!prevModuleAttempts && prevModuleAttempts.length > 0 && arePrevModuleAssignmentsApproved
  }

  if (!isModuleUnlocked) {
    redirect("/dashboard/modules")
  }

  // Fetch submission if there's an assignment
  const assignment = lesson.assignments?.[0]
  let submission = null
  if (assignment) {
    const { data: submissionData } = await supabase
      .from("submissions")
      .select("*")
      .eq("user_id", user.id)
      .eq("assignment_id", assignment.id)
      .single()
    submission = submissionData
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
        <div className="mb-2 text-sm text-muted-foreground">{lesson.modules.title}</div>
        <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
        {lesson.description && <p className="mt-2 text-muted-foreground">{lesson.description}</p>}
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
            <h2 className="mb-4 text-xl font-semibold">Contenido de la Clase</h2>
            <div className="prose prose-neutral max-w-none">
              <div className="whitespace-pre-wrap text-foreground">
                {lesson.content || "El contenido de esta clase estará disponible pronto."}
              </div>
            </div>
          </div>

          {/* Video if available */}
          {lesson.video_url && (
            <div className="border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">Video de la Clase</h2>
              <a
                href={lesson.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-accent hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir video
              </a>
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
                  <p className="text-xs text-muted-foreground">{assignment.max_score} puntos</p>
                </div>
              </div>

              <p className="mb-4 text-sm text-muted-foreground">{assignment.title}</p>

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
                <Button className="w-full" variant={submission?.status === "approved" ? "outline" : "default"}>
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
              Después de entregar el trabajo práctico, puedes continuar con la siguiente clase mientras esperas la
              corrección.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
