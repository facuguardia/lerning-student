import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Users, BookOpen, ClipboardList, FileText, Award, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch stats
  const { count: studentCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "student")

  const { count: moduleCount } = await supabase
    .from("modules")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true)

  const { count: quizCount } = await supabase.from("quizzes").select("*", { count: "exact", head: true })

  const { count: pendingSubmissions } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "submitted")

  // Recent submissions
  const { data: recentSubmissions } = await supabase
    .from("submissions")
    .select("*, profiles(full_name, email), assignments(title)")
    .eq("status", "submitted")
    .order("submitted_at", { ascending: false })
    .limit(5)

  // Quiz stats
  const { data: quizAttempts } = await supabase.from("quiz_attempts").select("passed")

  const totalAttempts = quizAttempts?.length || 0
  const passedAttempts = quizAttempts?.filter((a) => a.passed).length || 0
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
        <p className="mt-1 text-muted-foreground">
          Gestiona el contenido del curso y revisa el progreso de los estudiantes
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Estudiantes"
          value={studentCount || 0}
          subtitle="registrados"
          icon={<Users className="h-5 w-5 text-muted-foreground" />}
        />
        <StatsCard
          title="Módulos"
          value={moduleCount || 0}
          subtitle="publicados"
          icon={<BookOpen className="h-5 w-5 text-muted-foreground" />}
        />
        <StatsCard
          title="Quizzes"
          value={quizCount || 0}
          subtitle="creados"
          icon={<ClipboardList className="h-5 w-5 text-muted-foreground" />}
        />
        <StatsCard
          title="Pendientes"
          value={pendingSubmissions || 0}
          subtitle="por calificar"
          icon={<FileText className="h-5 w-5 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Quick actions */}
        <div className="border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Acciones Rápidas</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/admin/quizzes">
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <ClipboardList className="h-4 w-4" />
                Gestionar Quizzes
              </Button>
            </Link>
            <Link href="/admin/grading">
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <Award className="h-4 w-4" />
                Centro de Calificaciones
              </Button>
            </Link>
            <Link href="/admin/students">
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <Users className="h-4 w-4" />
                Ver Estudiantes
              </Button>
            </Link>
            <Link href="/admin/modules">
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <BookOpen className="h-4 w-4" />
                Gestionar Módulos
              </Button>
            </Link>
          </div>
        </div>

        {/* Quiz performance */}
        <div className="border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Rendimiento de Quizzes</h2>
          <div className="flex items-center gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-accent">
              <span className="text-2xl font-bold">{passRate}%</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tasa de aprobación</p>
              <p className="text-lg font-semibold">
                {passedAttempts} de {totalAttempts} intentos
              </p>
              <div className="mt-2 flex items-center gap-1 text-sm text-success">
                <TrendingUp className="h-4 w-4" />
                Buen rendimiento
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending submissions */}
      <div className="mt-8 border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Entregas Pendientes</h2>
          <Link href="/admin/grading">
            <Button variant="ghost" size="sm">
              Ver todas
            </Button>
          </Link>
        </div>
        {recentSubmissions && recentSubmissions.length > 0 ? (
          <div className="divide-y divide-border">
            {recentSubmissions.map((submission) => (
              <div key={submission.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{submission.assignments.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {submission.profiles.full_name || submission.profiles.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {new Date(submission.submitted_at).toLocaleDateString("es-ES")}
                  </p>
                  <Link href={`/admin/grading/${submission.id}`}>
                    <Button variant="ghost" size="sm">
                      Calificar
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-muted-foreground">No hay entregas pendientes</p>
        )}
      </div>
    </div>
  )
}
