import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Calendar, Award } from "lucide-react"
import { DeleteAssignmentButton } from "@/components/admin/delete-assignment-button"

export default async function AdminAssignmentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch all assignments with lesson and module info
  const { data: assignments } = await supabase
    .from("assignments")
    .select("*, lessons(title, module_id, modules(title))")
    .order("created_at", { ascending: false })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trabajos Prácticos</h1>
          <p className="mt-1 text-muted-foreground">Gestiona los trabajos prácticos del curso</p>
        </div>
        <Link href="/admin/assignments/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Trabajo
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total trabajos</p>
          <p className="mt-1 text-3xl font-bold">{assignments?.length || 0}</p>
        </div>
        <div className="border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Con fecha límite</p>
          <p className="mt-1 text-3xl font-bold">{assignments?.filter((a) => a.due_date).length || 0}</p>
        </div>
        <div className="border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Puntos totales</p>
          <p className="mt-1 text-3xl font-bold">{assignments?.reduce((sum, a) => sum + (a.points || 0), 0) || 0}</p>
        </div>
      </div>

      {/* Assignments list */}
      {assignments && assignments.length > 0 ? (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="border border-border bg-card p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center bg-primary">
                  <FileText className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{assignment.title}</h3>
                      {assignment.lessons && (
                        <p className="text-sm text-muted-foreground">
                          {assignment.lessons.modules?.title} → {assignment.lessons.title}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{assignment.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/assignments/${assignment.id}/edit`}>
                        <Button size="sm" variant="outline">
                          Editar
                        </Button>
                      </Link>
                      <DeleteAssignmentButton assignmentId={assignment.id} />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    {assignment.due_date && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(assignment.due_date).toLocaleDateString("es-ES")}
                      </div>
                    )}
                    {assignment.points && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Award className="h-4 w-4" />
                        {assignment.points} puntos
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border border-dashed border-border p-12 text-center">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">No hay trabajos prácticos creados</p>
          <Link href="/admin/assignments/new">
            <Button className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Crear primer trabajo
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
