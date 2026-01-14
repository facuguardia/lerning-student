import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Users, Award, BookOpen, TrendingUp } from "lucide-react"

export default async function StudentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch all students with their progress
  const { data: students } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("created_at", { ascending: false })

  // Fetch quiz attempts and submissions for stats
  const { data: quizAttempts } = await supabase.from("quiz_attempts").select("user_id, passed, percentage")

  const { data: submissions } = await supabase.from("submissions").select("user_id, status, score")

  // Calculate stats for each student
  const getStudentStats = (studentId: string) => {
    const studentAttempts = quizAttempts?.filter((a) => a.user_id === studentId) || []
    const studentSubmissions = submissions?.filter((s) => s.user_id === studentId) || []

    const passedQuizzes = studentAttempts.filter((a) => a.passed).length
    const avgQuizScore = studentAttempts.length
      ? studentAttempts.reduce((acc, a) => acc + a.percentage, 0) / studentAttempts.length
      : 0

    const gradedSubmissions = studentSubmissions.filter((s) => s.status === "graded")

    return {
      quizzesPassed: passedQuizzes,
      quizzesTotal: studentAttempts.length,
      avgQuizScore: Math.round(avgQuizScore),
      submissionsTotal: studentSubmissions.length,
      submissionsGraded: gradedSubmissions.length,
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Estudiantes</h1>
        <p className="mt-1 text-muted-foreground">Vista general del progreso de todos los estudiantes</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Total estudiantes</p>
              <p className="text-3xl font-bold">{students?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Quizzes completados</p>
              <p className="text-3xl font-bold">{quizAttempts?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Trabajos entregados</p>
              <p className="text-3xl font-bold">{submissions?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Students table */}
      {students && students.length > 0 ? (
        <div className="overflow-hidden border border-border">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Estudiante</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Quizzes</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Promedio</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Trabajos</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((student) => {
                const stats = getStudentStats(student.id)
                return (
                  <tr key={student.id} className="bg-card">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center bg-secondary text-sm font-medium uppercase">
                          {student.full_name?.[0] || student.email[0]}
                        </div>
                        <div>
                          <p className="font-medium">{student.full_name || "Sin nombre"}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{stats.quizzesPassed}</span>
                        <span className="text-muted-foreground">aprobados</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {stats.quizzesTotal > 0 ? (
                          <>
                            <TrendingUp
                              className={`h-4 w-4 ${stats.avgQuizScore >= 70 ? "text-success" : "text-warning"}`}
                            />
                            <span className="font-medium">{stats.avgQuizScore}%</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{stats.submissionsGraded}</span>
                      <span className="text-muted-foreground">/{stats.submissionsTotal}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(student.created_at).toLocaleDateString("es-ES")}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border border-dashed border-border p-12 text-center">
          <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">No hay estudiantes registrados</p>
        </div>
      )}
    </div>
  )
}
