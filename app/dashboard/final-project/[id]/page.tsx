import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function FinalProjectDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch final project
  const { data: project } = await supabase
    .from("final_projects")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (!project) {
    notFound()
  }

  const handleSelectProject = async () => {
    "use server"
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from("final_project_submissions").insert({
      user_id: user.id,
      project_id: id,
      status: "pending",
    })

    redirect("/dashboard/final-project")
  }

  return (
    <div className="p-8">
      <Link
        href="/dashboard/final-project"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a proyectos
      </Link>

      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="border border-border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center bg-primary">
              <Code2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{project.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">Proyecto Final</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Descripción</h2>
          <p className="whitespace-pre-wrap text-muted-foreground">{project.description}</p>
        </div>

        {/* Requirements */}
        <div className="border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Requisitos Técnicos</h2>
          <p className="whitespace-pre-wrap text-muted-foreground">{project.requirements}</p>
          <div className="mt-4 space-y-2 text-sm">
            <p className="font-medium">Debes incluir:</p>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              <li>Frontend completo y funcional</li>
              <li>Backend con API REST o GraphQL</li>
              <li>Base de datos (puedes usar ORM, BaaS, etc.)</li>
              <li>Proyecto desplegado en producción</li>
            </ul>
          </div>
        </div>

        {/* Action */}
        <form action={handleSelectProject}>
          <Button type="submit" className="w-full" size="lg">
            Seleccionar este Proyecto
          </Button>
        </form>
      </div>
    </div>
  )
}
