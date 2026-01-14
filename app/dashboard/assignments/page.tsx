import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { FileText, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function AssignmentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: lessons } = await supabase.from("lessons").select("*, modules(id, title, order_index), assignments(*)")

  const { data: submissions } = await supabase.from("submissions").select("*").eq("user_id", user.id)

  const { data: quizAttempts } = await supabase
    .from("quiz_attempts")
    .select("*, quizzes(module_id)")
    .eq("user_id", user.id)

  const { data: allModules } = await supabase.from("modules").select("*").eq("is_published", true).order("order_index")

  const assignmentsByModule = new Map<string, string[]>()
  lessons?.forEach((lesson: any) => {
    const current = assignmentsByModule.get(lesson.modules.id) || []
    const ids = (lesson.assignments || []).map((a: any) => a.id)
    assignmentsByModule.set(lesson.modules.id, current.concat(ids))
  })

  const areModuleAssignmentsApproved = (moduleId: string) => {
    const ids = assignmentsByModule.get(moduleId) || []
    if (ids.length === 0) return true
    return ids.every((assignmentId) => {
      const submission = submissions?.find((s: any) => s.assignment_id === assignmentId)
      return submission?.is_approved === true
    })
  }

  const isModuleUnlocked = (moduleId: string) => {
    const moduleIndex = allModules?.findIndex((m) => m.id === moduleId) ?? 0
    if (moduleIndex === 0) return true

    const prevModule = allModules![moduleIndex - 1]
    const prevModuleAttempts = quizAttempts?.filter(
      (a: { quizzes: { module_id: string } | null; passed: boolean }) =>
        a.quizzes?.module_id === prevModule.id && a.passed,
    )
    return !!prevModuleAttempts && prevModuleAttempts.length > 0 && areModuleAssignmentsApproved(prevModule.id)
  }

  const getSubmission = (assignmentId: string) => {
    return submissions?.find((s) => s.assignment_id === assignmentId)
  }

  const getStatusBadge = (status: string | undefined, isApproved: boolean | null) => {
    if (status === "approved" || isApproved === true) {
      return (
        <span className="inline-flex items-center gap-1 bg-success/10 px-2 py-1 text-xs font-medium text-success">
          <CheckCircle className="h-3 w-3" />
          Aprobado
        </span>
      )
    }
    if (status === "rejected" || isApproved === false) {
      return (
        <span className="inline-flex items-center gap-1 bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
          <XCircle className="h-3 w-3" />
          Rechazado
        </span>
      )
    }
    if (status === "submitted") {
      return (
        <span className="inline-flex items-center gap-1 bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
          <Clock className="h-3 w-3" />
          En revisión
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 bg-warning/10 px-2 py-1 text-xs font-medium text-warning">
        <AlertCircle className="h-3 w-3" />
        Pendiente
      </span>
    )
  }

  const allAssignments = lessons?.flatMap((lesson) =>
    lesson.assignments.map((assignment: any) => ({
      ...assignment,
      lesson: { id: lesson.id, title: lesson.title },
      module: lesson.modules,
    })),
  )

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Trabajos Prácticos</h1>
        <p className="mt-1 text-muted-foreground">Entrega tus proyectos y recibe feedback del profesor</p>
      </div>

      {/* Assignments list */}
      <div className="space-y-4">
        {allAssignments && allAssignments.length > 0 ? (
          allAssignments.map((assignment: any) => {
            const submission = getSubmission(assignment.id)
            const unlocked = isModuleUnlocked(assignment.module.id)

            return (
              <div key={assignment.id} className={`border border-border bg-card p-6 ${!unlocked ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-secondary">
                      <FileText className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{assignment.title}</h3>
                        {getStatusBadge(submission?.status, submission?.is_approved)}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {assignment.module.title} - {assignment.lesson.title}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{assignment.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm font-medium">{assignment.points || assignment.max_score} pts</span>
                    {submission?.status === "approved" && submission.score !== null && (
                      <span className="text-lg font-bold text-success">
                        {submission.score}/{assignment.points || assignment.max_score}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  {unlocked ? (
                    <Link href={`/dashboard/assignments/${assignment.id}`}>
                      <Button
                        variant={submission?.status === "approved" ? "outline" : "default"}
                        size="sm"
                        className={submission?.status === "approved" ? "bg-transparent" : ""}
                      >
                        {submission?.status === "approved"
                          ? "Ver feedback"
                          : submission?.status === "rejected"
                            ? "Volver a entregar"
                            : submission?.status === "submitted"
                              ? "Ver estado"
                              : "Entregar trabajo"}
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" size="sm" disabled className="bg-transparent">
                      Módulo bloqueado
                    </Button>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No hay trabajos prácticos disponibles en este momento.</p>
          </div>
        )}
      </div>
    </div>
  )
}
