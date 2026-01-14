import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Edit, BookOpen, ClipboardList, FileText } from "lucide-react"
import Link from "next/link"
import { DeleteModuleButton } from "@/components/admin/delete-module-button"

export default async function AdminModulesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch modules with quiz and lessons counts
  const { data: modules } = await supabase.from("modules").select("*, quizzes(id), lessons(id)").order("order_index")

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Módulos del Curso</h1>
          <p className="mt-1 text-muted-foreground">Administra los módulos, clases y trabajos</p>
        </div>
        <Link href="/admin/modules/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Módulo
          </Button>
        </Link>
      </div>

      {/* Modules list */}
      <div className="space-y-4">
        {modules?.map((module, index) => (
          <div key={module.id} className="border border-border bg-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-primary text-lg font-bold text-primary-foreground">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{module.title}</h3>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium ${module.is_published ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}
                    >
                      {module.is_published ? "Publicado" : "Borrador"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/modules/${module.id}`}>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <DeleteModuleButton moduleId={module.id} moduleName={module.title} />
              </div>
            </div>

            <div className="mt-4 flex gap-6 border-t border-border pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                Contenido: {module.content ? "Sí" : "No"}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ClipboardList className="h-4 w-4" />
                Quiz: {module.quizzes?.length || 0}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                Clases: {module.lessons?.length || 0}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
