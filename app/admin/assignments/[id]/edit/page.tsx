import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AssignmentForm } from "@/components/admin/assignment-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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
  const { data: assignment, error: assignError } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  // If not found or error, show a friendly message instead of 404
  if (!assignment || assignError) {
    return (
      <div className="p-8">
        <h1 className="mb-6 text-3xl font-bold tracking-tight">Editar Trabajo Práctico</h1>
        <div className="border border-warning bg-warning/10 p-6">
          <p className="font-medium">No se encontró el trabajo solicitado</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Es posible que el ID sea incorrecto o no tengas permisos de acceso.
          </p>
          <div className="mt-4">
            <Link href="/admin/assignments">
              <Button variant="outline">Volver a Trabajos</Button>
            </Link>
          </div>
        </div>
      </div>
    )
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
