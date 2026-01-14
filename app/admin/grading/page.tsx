import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, CheckCircle, Clock, AlertCircle, Github, Globe, LinkIcon, XCircle } from "lucide-react"

export default async function GradingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch all submissions with student and assignment info
  const { data: submissions } = await supabase
    .from("submissions")
    .select("*, profiles!submissions_user_id_fkey(id, full_name, email), assignments(id, title, max_score, lessons(id, title, modules(title)))")
    .order("submitted_at", { ascending: false })

  const getStatusBadge = (submission: any) => {
    switch (submission.status) {
      case "graded":
        if (submission.is_approved === true) {
          return (
            <span className="inline-flex items-center gap-1 bg-success/10 px-2 py-1 text-xs font-medium text-success">
              <CheckCircle className="h-3 w-3" />
              Aprobado
            </span>
          )
        }
        if (submission.is_approved === false) {
          return (
            <span className="inline-flex items-center gap-1 bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
              <XCircle className="h-3 w-3" />
              Desaprobado
            </span>
          )
        }
        return (
          <span className="inline-flex items-center gap-1 bg-success/10 px-2 py-1 text-xs font-medium text-success">
            <CheckCircle className="h-3 w-3" />
            Calificado
          </span>
        )
      case "submitted":
        return (
          <span className="inline-flex items-center gap-1 bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
            <Clock className="h-3 w-3" />
            Por calificar
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-warning/10 px-2 py-1 text-xs font-medium text-warning">
            <AlertCircle className="h-3 w-3" />
            Pendiente
          </span>
        )
    }
  }

  const getLinkIcon = (type: string | null) => {
    switch (type) {
      case "github":
        return <Github className="h-4 w-4" />
      case "vercel":
        return <Globe className="h-4 w-4" />
      default:
        return <LinkIcon className="h-4 w-4" />
    }
  }

  // Filter by status
  const pendingSubmissions = submissions?.filter((s) => s.status === "submitted") || []
  const gradedSubmissions = submissions?.filter((s) => s.status === "graded") || []

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Centro de Calificaciones</h1>
        <p className="mt-1 text-muted-foreground">Revisa y califica las entregas de los estudiantes</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Por calificar</p>
          <p className="mt-1 text-3xl font-bold text-accent">{pendingSubmissions.length}</p>
        </div>
        <div className="border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Calificadas</p>
          <p className="mt-1 text-3xl font-bold text-success">{gradedSubmissions.length}</p>
        </div>
        <div className="border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total entregas</p>
          <p className="mt-1 text-3xl font-bold">{submissions?.length || 0}</p>
        </div>
      </div>

      {/* Pending submissions */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Pendientes de calificación</h2>
        {pendingSubmissions.length > 0 ? (
          <div className="overflow-hidden border border-border">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Estudiante</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Trabajo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Entrega</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingSubmissions.map((submission) => (
                  <tr key={submission.id} className="bg-card">
                    <td className="px-4 py-3">
                      <p className="font-medium">{submission.profiles.full_name || "Sin nombre"}</p>
                      <p className="text-sm text-muted-foreground">{submission.profiles.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{submission.assignments.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {submission.assignments.lessons?.modules?.title || "Sin módulo"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {submission.link_url && (
                          <a
                            href={submission.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
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
                            className="text-accent hover:underline"
                          >
                            <FileText className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(submission.submitted_at).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/grading/${submission.id}`}>
                        <Button size="sm">Calificar</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border border-dashed border-border p-12 text-center">
            <CheckCircle className="mb-4 h-12 w-12 text-success" />
            <p className="text-muted-foreground">No hay entregas pendientes de calificación</p>
          </div>
        )}
      </div>

      {/* All submissions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Todas las entregas</h2>
        {submissions && submissions.length > 0 ? (
          <div className="overflow-hidden border border-border">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Estudiante</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Trabajo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Nota</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="bg-card">
                    <td className="px-4 py-3">
                      <p className="font-medium">{submission.profiles.full_name || "Sin nombre"}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">{submission.assignments.title}</td>
                    <td className="px-4 py-3">{getStatusBadge(submission)}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {submission.status === "graded" ? `${submission.score}/${submission.assignments.max_score}` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/grading/${submission.id}`}>
                        <Button variant="ghost" size="sm">
                          {submission.status === "graded" ? "Ver" : "Calificar"}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border border-dashed border-border p-12 text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">No hay entregas registradas</p>
          </div>
        )}
      </div>
    </div>
  )
}
