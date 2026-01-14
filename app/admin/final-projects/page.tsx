import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Code2 } from "lucide-react"
import { DeleteFinalProjectButton } from "@/components/admin/delete-final-project-button"

export default async function AdminFinalProjectsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: finalProjects } = await supabase.from("final_projects").select("*").order("order_index")

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proyectos Finales</h1>
          <p className="mt-1 text-muted-foreground">Gestiona los 30 proyectos finales del curso</p>
        </div>
        <Link href="/admin/final-projects/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Proyecto
          </Button>
        </Link>
      </div>

      <div className="mb-4 text-sm text-muted-foreground">Total: {finalProjects?.length || 0} proyectos</div>

      {finalProjects && finalProjects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {finalProjects.map((project, index) => (
            <div key={project.id} className="border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-primary">
                    <Code2 className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex h-6 w-6 items-center justify-center bg-secondary text-xs font-bold">
                    {index + 1}
                  </div>
                </div>
                <div
                  className={`h-2 w-2 rounded-full ${project.is_active ? "bg-success" : "bg-muted-foreground"}`}
                  title={project.is_active ? "Activo" : "Inactivo"}
                />
              </div>
              <h3 className="mb-2 font-semibold">{project.title}</h3>
              <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
              <div className="flex gap-2">
                <Link href={`/admin/final-projects/${project.id}/edit`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full bg-transparent">
                    Editar
                  </Button>
                </Link>
                <DeleteFinalProjectButton projectId={project.id} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border border-dashed border-border p-12 text-center">
          <Code2 className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">No hay proyectos finales creados</p>
          <Link href="/admin/final-projects/new">
            <Button className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Crear primer proyecto
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
