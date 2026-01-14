import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StatsCard } from "@/components/dashboard/stats-card";
import {
  Users,
  BookOpen,
  ClipboardList,
  FileText,
  Award,
  TrendingUp,
  Clock,
  Github,
  Globe,
  LinkIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch stats
  const { count: studentCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "student");

  const { count: moduleCount } = await supabase
    .from("modules")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);

  const { count: quizCount } = await supabase
    .from("quizzes")
    .select("*", { count: "exact", head: true });

  const { count: pendingSubmissions } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "submitted");

  // Recent submissions
  const { data: recentSubmissions } = await supabase
    .from("submissions")
    .select(
      "*, profiles!submissions_user_id_fkey(full_name, email), assignments!submissions_assignment_id_fkey(title)"
    )
    .eq("status", "submitted")
    .order("submitted_at", { ascending: false })
    .limit(5);

  // Quiz stats
  const { data: quizAttempts } = await supabase
    .from("quiz_attempts")
    .select("passed");

  const totalAttempts = quizAttempts?.length || 0;
  const passedAttempts = quizAttempts?.filter((a) => a.passed).length || 0;
  const passRate =
    totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

  const getLinkIcon = (type?: string | null) => {
    if (type === "github") return <Github className="h-4 w-4" />;
    if (type === "vercel") return <Globe className="h-4 w-4" />;
    return <LinkIcon className="h-4 w-4" />;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Panel de Administración
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gestiona el contenido del curso y revisa el progreso de los
          estudiantes
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
              <Button
                variant="outline"
                className="w-full justify-start gap-2 bg-transparent"
              >
                <ClipboardList className="h-4 w-4" />
                Gestionar Quizzes
              </Button>
            </Link>
            <Link href="/admin/grading">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 bg-transparent"
              >
                <Award className="h-4 w-4" />
                Centro de Calificaciones
              </Button>
            </Link>
            <Link href="/admin/students">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 bg-transparent"
              >
                <Users className="h-4 w-4" />
                Ver Estudiantes
              </Button>
            </Link>
            <Link href="/admin/modules">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 bg-transparent"
              >
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
              <p className="text-sm text-muted-foreground">
                Tasa de aprobación
              </p>
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
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Entregas Pendientes</h2>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
              {pendingSubmissions || 0}
            </span>
          </div>
          <Link href="/admin/grading">
            <Button variant="ghost" size="sm">
              Ver todas
            </Button>
          </Link>
        </div>
        {recentSubmissions && recentSubmissions.length > 0 ? (
          <div className="divide-y divide-border">
            {recentSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="flex items-center justify-between py-3 transition-colors hover:bg-accent/5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-secondary">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium leading-tight line-clamp-1">
                      {submission.assignments.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="line-clamp-1">
                        {submission.profiles.full_name ||
                          submission.profiles.email}
                      </span>
                      <div className="flex items-center gap-2">
                        {submission.link_url && (
                          <a
                            href={submission.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Enlace de entrega"
                            className="text-accent hover:underline"
                          >
                            {getLinkIcon(submission.link_type)}
                          </a>
                        )}
                        {submission.file_name && (
                          <a
                            href={submission.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Archivo adjunto"
                            className="text-accent hover:underline"
                          >
                            <FileText className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Link href={`/admin/grading/${submission.id}`}>
                      <Button size="sm">Calificar</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border border-dashed border-border p-12 text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">No hay entregas pendientes</p>
          </div>
        )}
      </div>
    </div>
  );
}
