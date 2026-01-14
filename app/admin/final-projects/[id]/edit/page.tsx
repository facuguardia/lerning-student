import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { FinalProjectForm } from "@/components/admin/final-project-form"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditFinalProjectPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: project } = await supabase.from("final_projects").select("*").eq("id", id).single()

  if (!project) {
    notFound()
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Editar Proyecto Final</h1>
      <FinalProjectForm project={project} />
    </div>
  )
}
