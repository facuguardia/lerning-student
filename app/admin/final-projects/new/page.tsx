import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { FinalProjectForm } from "@/components/admin/final-project-form"

export default async function NewFinalProjectPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Crear Proyecto Final</h1>
      <FinalProjectForm />
    </div>
  )
}
