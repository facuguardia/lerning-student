import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { LessonForm } from "@/components/admin/lesson-form"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NewLessonPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch module
  const { data: module } = await supabase.from("modules").select("*").eq("id", id).single()

  if (!module) {
    notFound()
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Crear Nueva Clase</h1>
        <p className="mt-1 text-muted-foreground">Agrega una nueva clase al módulo: {module.title}</p>
      </div>

      <LessonForm moduleId={id} />
    </div>
  )
}
