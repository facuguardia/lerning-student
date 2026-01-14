import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Edit, BookOpen, FileText } from "lucide-react"
import Link from "next/link"
import { DeleteLessonButton } from "@/components/admin/delete-lesson-button"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ModuleLessonsPage({ params }: PageProps) {
  const { id } = await params

  if (id === "new") {
    redirect("/admin/modules/new")
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  // Fetch module
  const { data: module } = await supabase.from("modules").select("*").eq("id", id).single()

  if (!module) {
    notFound()
  }

  // Fetch lessons with assignments count
  const { data: lessons } = await supabase
    .from("lessons")
    .select("*, assignments(id)")
    .eq("module_id", id)
    .order("order_index")

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{module.title}</h1>
          <p className="mt-1 text-muted-foreground">Gestiona las clases de este módulo</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/modules/${id}/edit`}>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Edit className="h-4 w-4" />
              Editar Módulo
            </Button>
          </Link>
          <Link href={`/admin/modules/${id}/lessons/new`}>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Clase
            </Button>
          </Link>
        </div>
      </div>

      {/* Lessons list */}
      {lessons && lessons.length > 0 ? (
        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <div key={lesson.id} className="border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-accent text-sm font-bold text-accent-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{lesson.title}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium ${lesson.is_published ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}
                      >
                        {lesson.is_published ? "Publicada" : "Borrador"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{lesson.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/modules/${id}/lessons/${lesson.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <DeleteLessonButton lessonId={lesson.id} lessonTitle={lesson.title} />
                </div>
              </div>

              <div className="mt-4 flex gap-6 border-t border-border pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  Contenido: {lesson.content ? "Sí" : "No"}
                </div>
                {lesson.video_url && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    Video incluido
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Trabajos: {lesson.assignments?.length || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-border bg-card p-12 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No hay clases</h3>
          <p className="mb-4 text-sm text-muted-foreground">Comienza agregando tu primera clase a este módulo</p>
          <Link href={`/admin/modules/${id}/lessons/new`}>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Crear Primera Clase
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
