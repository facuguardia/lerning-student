import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Award, CheckCircle, XCircle, Clock } from "lucide-react"

export default async function GradesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch quiz attempts with quiz and module info
  const { data: quizAttempts } = await supabase
    .from("quiz_attempts")
    .select("*, quizzes(title, passing_score, modules(title))")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })

  // Fetch submissions with assignment info
  const { data: submissions } = await supabase
    .from("submissions")
    .select("*, assignments(title, max_score, modules(title))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Calculate stats
  const totalQuizzes = quizAttempts?.length || 0
  const passedQuizzes = quizAttempts?.filter((a: { passed: boolean }) => a.passed).length || 0
  const avgQuizScore = totalQuizzes
    ? quizAttempts!.reduce((acc: number, a: { percentage: number }) => acc + a.percentage, 0) / totalQuizzes
    : 0

  const gradedSubmissions = submissions?.filter((s: { status: string }) => s.status === "graded") || []
  const avgAssignmentScore = gradedSubmissions.length
    ? gradedSubmissions.reduce(
        (acc: number, s: { score: number; assignments: { max_score: number } }) =>
          acc + (s.score / s.assignments.max_score) * 100,
        0,
      ) / gradedSubmissions.length
    : 0

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Calificaciones</h1>
        <p className="mt-1 text-muted-foreground">Revisa tu desempeño en quizzes y trabajos prácticos</p>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Quizzes Aprobados</p>
          <p className="mt-1 text-3xl font-bold">
            {passedQuizzes}/{totalQuizzes}
          </p>
        </div>
        <div className="border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Promedio Quizzes</p>
          <p className="mt-1 text-3xl font-bold">{Math.round(avgQuizScore)}%</p>
        </div>
        <div className="border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Trabajos Calificados</p>
          <p className="mt-1 text-3xl font-bold">
            {gradedSubmissions.length}/{submissions?.length || 0}
          </p>
        </div>
        <div className="border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Promedio Trabajos</p>
          <p className="mt-1 text-3xl font-bold">{Math.round(avgAssignmentScore)}%</p>
        </div>
      </div>

      {/* Quiz Results */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Resultados de Quizzes</h2>
        {quizAttempts && quizAttempts.length > 0 ? (
          <div className="overflow-hidden border border-border">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Quiz</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Módulo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Puntuación</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {quizAttempts.map(
                  (attempt: {
                    id: string
                    quizzes: { title: string; modules: { title: string } }
                    percentage: number
                    passed: boolean
                    completed_at: string
                  }) => (
                    <tr key={attempt.id} className="bg-card">
                      <td className="px-4 py-3 text-sm font-medium">{attempt.quizzes.title}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{attempt.quizzes.modules.title}</td>
                      <td className="px-4 py-3 text-sm font-medium">{Math.round(attempt.percentage)}%</td>
                      <td className="px-4 py-3">
                        {attempt.passed ? (
                          <span className="inline-flex items-center gap-1 text-sm text-success">
                            <CheckCircle className="h-4 w-4" />
                            Aprobado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sm text-destructive">
                            <XCircle className="h-4 w-4" />
                            No aprobado
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(attempt.completed_at).toLocaleDateString("es-ES")}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border border-dashed border-border p-12 text-center">
            <Award className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">Aún no has completado ningún quiz</p>
          </div>
        )}
      </div>

      {/* Assignment Results */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Trabajos Prácticos</h2>
        {submissions && submissions.length > 0 ? (
          <div className="overflow-hidden border border-border">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Trabajo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Módulo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Puntuación</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {submissions.map(
                  (submission: {
                    id: string
                    assignments: { title: string; max_score: number; modules: { title: string } }
                    score: number | null
                    status: string
                    submitted_at: string | null
                    created_at: string
                  }) => (
                    <tr key={submission.id} className="bg-card">
                      <td className="px-4 py-3 text-sm font-medium">{submission.assignments.title}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {submission.assignments.modules.title}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {submission.status === "graded"
                          ? `${submission.score}/${submission.assignments.max_score}`
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {submission.status === "graded" ? (
                          <span className="inline-flex items-center gap-1 text-sm text-success">
                            <CheckCircle className="h-4 w-4" />
                            Calificado
                          </span>
                        ) : submission.status === "submitted" ? (
                          <span className="inline-flex items-center gap-1 text-sm text-accent">
                            <Clock className="h-4 w-4" />
                            Entregado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {submission.submitted_at
                          ? new Date(submission.submitted_at).toLocaleDateString("es-ES")
                          : new Date(submission.created_at).toLocaleDateString("es-ES")}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border border-dashed border-border p-12 text-center">
            <Award className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">Aún no has entregado ningún trabajo</p>
          </div>
        )}
      </div>
    </div>
  )
}
