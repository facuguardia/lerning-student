import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { LessonForm } from "@/components/admin/lesson-form"

interface PageProps {
  params: Promise<{ id: string; lessonId: string }>
}

export default async function EditLessonPage({ params }: PageProps) {
  const { id, lessonId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch lesson
  const { data: lesson } = await supabase.from("lessons").select("*").eq("id", lessonId).single()

  if (!lesson) {
    notFound()
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Editar Clase</h1>
        <p className="mt-1 text-muted-foreground">Actualiza la información de la clase</p>
      </div>

      <LessonForm moduleId={id} lesson={lesson} />
    </div>
  )
}
