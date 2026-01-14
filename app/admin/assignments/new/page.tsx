import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AssignmentForm } from "@/components/admin/assignment-form"

export default async function NewAssignmentPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch modules and lessons for dropdown
  const { data: modules } = await supabase.from("modules").select("id, title, lessons(id, title)").order("order_index")

  return (
    <div className="p-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Crear Trabajo Práctico</h1>
      <AssignmentForm modules={modules || []} />
    </div>
  )
}
