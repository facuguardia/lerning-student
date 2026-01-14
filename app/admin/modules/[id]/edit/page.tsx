import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { ModuleForm } from "@/components/admin/module-form"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditModulePage({ params }: PageProps) {
  const { id } = await params
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Editar Módulo</h1>
        <p className="mt-1 text-muted-foreground">Actualiza la información del módulo</p>
      </div>

      <ModuleForm module={module} />
    </div>
  )
}
