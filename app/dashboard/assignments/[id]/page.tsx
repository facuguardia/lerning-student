import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, FileText, Github, Globe, Calendar } from "lucide-react"
import { SubmissionForm } from "@/components/assignments/submission-form"
import { SubmissionStatus } from "@/components/assignments/submission-status"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AssignmentDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: assignment } = await supabase
    .from("assignments")
    .select("*, lessons(id, title, module_id, modules(id, title, order_index))")
    .eq("id", id)
    .single()

  if (!assignment) {
    notFound()
  }

  const { data: allModules } = await supabase.from("modules").select("*").eq("is_published", true).order("order_index")

  const { data: quizAttempts } = await supabase
    .from("quiz_attempts")
    .select("*, quizzes(module_id)")
    .eq("user_id", user.id)

  const moduleIndex = allModules?.findIndex((m) => m.id === assignment.lessons?.modules?.id) ?? 0
  let isUnlocked = moduleIndex === 0

  if (moduleIndex > 0) {
    const prevModule = allModules![moduleIndex - 1]
    const prevModuleAttempts = quizAttempts?.filter(
      (a: { quizzes: { module_id: string } | null; passed: boolean }) =>
        a.quizzes?.module_id === prevModule.id && a.passed,
    )
    isUnlocked = prevModuleAttempts && prevModuleAttempts.length > 0
  }

  if (!isUnlocked) {
    redirect("/dashboard/assignments")
  }

  const { data: submission } = await supabase
    .from("submissions")
    .select("*, graded_by_profile:profiles!submissions_graded_by_fkey(full_name)")
    .eq("assignment_id", id)
    .eq("user_id", user.id)
    .single()

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
                  <p className="text-sm text-muted-foreground">{assignment.lessons.modules.title}</p>
                )}
                <h1 className="text-2xl font-bold">{assignment.title}</h1>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{assignment.points || assignment.max_score}</p>
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
              <div className="prose prose-sm prose-neutral max-w-none">
                <p className="whitespace-pre-wrap text-muted-foreground">{assignment.instructions}</p>
              </div>
            </div>
          )}

          {/* Submission guidelines */}
          <div className="border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Formas de entrega</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {assignment.accepts_file_upload && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-secondary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Archivo</p>
                    <p className="text-xs text-muted-foreground">PDF, ZIP</p>
                  </div>
                </div>
              )}
              {assignment.accepts_github_link && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-secondary">
                    <Github className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">GitHub</p>
                    <p className="text-xs text-muted-foreground">Repositorio</p>
                  </div>
                </div>
              )}
              {assignment.accepts_production_url && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-secondary">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">URL</p>
                    <p className="text-xs text-muted-foreground">Deploy/Demo</p>
                  </div>
                </div>
              )}
            </div>
          </div>
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
              <SubmissionStatus submission={submission} maxScore={assignment.max_score} />
              {submission.is_approved === false && (
                <div className="mt-8 border-t border-border pt-8">
                  <h3 className="mb-4 text-lg font-semibold">Nueva Entrega/Corrección</h3>
                  <SubmissionForm assignmentId={assignment.id} userId={user.id} existingSubmission={submission} />
                </div>
              )}
            </>
          ) : (
            <SubmissionForm assignmentId={assignment.id} userId={user.id} existingSubmission={submission} />
          )}
        </div>
      </div>
    </div>
  )
}
