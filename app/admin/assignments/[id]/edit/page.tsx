import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { AssignmentForm } from "@/components/admin/assignment-form"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditAssignmentPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch assignment
  const { data: assignment } = await supabase.from("assignments").select("*").eq("id", id).single()

  if (!assignment) {
    notFound()
  }

  // Fetch modules and lessons for dropdown
  const { data: modules } = await supabase.from("modules").select("id, title, lessons(id, title)").order("order_index")

  return (
    <div className="p-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Editar Trabajo Práctico</h1>
      <AssignmentForm modules={modules || []} assignment={assignment} />
    </div>
  )
}
