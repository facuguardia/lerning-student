import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ModuleForm } from "@/components/admin/module-form"

export default async function NewModulePage() {
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Módulo</h1>
        <p className="mt-1 text-muted-foreground">Agrega un nuevo módulo al curso</p>
      </div>

      <ModuleForm />
    </div>
  )
}
