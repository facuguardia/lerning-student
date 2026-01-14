import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Code2, Lock, CheckCircle } from "lucide-react"

export default async function FinalProjectPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user has completed all modules
  const { data: allModules } = await supabase.from("modules").select("*").eq("is_published", true).order("order_index")

  const { data: quizAttempts } = await supabase
    .from("quiz_attempts")
    .select("*, quizzes(module_id)")
    .eq("user_id", user.id)
    .eq("passed", true)

  const completedModuleIds = new Set(quizAttempts?.map((a) => a.quizzes?.module_id) || [])
  const allModulesCompleted = allModules?.every((m) => completedModuleIds.has(m.id)) || false

  if (!allModulesCompleted) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-2xl">
          <div className="border border-warning bg-warning/5 p-8 text-center">
            <Lock className="mx-auto mb-4 h-16 w-16 text-warning" />
            <h1 className="mb-2 text-2xl font-bold">Proyecto Final Bloqueado</h1>
            <p className="text-muted-foreground">
              Debes completar y aprobar todos los módulos del curso antes de acceder al proyecto final.
            </p>
            <Link href="/dashboard/modules">
              <Button className="mt-6">Ver Módulos</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Fetch final projects
  const { data: finalProjects } = await supabase
    .from("final_projects")
    .select("*")
    .eq("is_active", true)
    .order("order_index")

  // Check if user has already selected a project
  const { data: userSubmission } = await supabase
    .from("final_project_submissions")
    .select("*, final_projects(*)")
    .eq("user_id", user.id)
    .single()

  if (userSubmission) {
    return (
      <div className="p-8">
        <h1 className="mb-6 text-3xl font-bold tracking-tight">Proyecto Final</h1>

        <div className="mx-auto max-w-3xl space-y-6">
          {/* Selected project */}
          <div className="border border-success bg-success/5 p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-success" />
              <div>
                <h2 className="text-lg font-semibold">Proyecto Seleccionado</h2>
                <p className="text-sm text-muted-foreground">{userSubmission.final_projects.title}</p>
              </div>
            </div>
          </div>

          {/* Project details */}
          <div className="border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Descripción</h3>
            <p className="whitespace-pre-wrap text-muted-foreground">{userSubmission.final_projects.description}</p>
          </div>

          <div className="border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Requisitos</h3>
            <p className="whitespace-pre-wrap text-muted-foreground">{userSubmission.final_projects.requirements}</p>
          </div>

          {/* Submission details */}
          <Link href={`/dashboard/final-project/submit`}>
            <Button className="w-full">
              {userSubmission.status === "pending" ? "Entregar Proyecto" : "Ver Entrega"}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Proyecto Final</h1>
        <p className="mt-1 text-muted-foreground">Selecciona uno de los 30 proyectos disponibles</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {finalProjects?.map((project, index) => (
          <Link key={project.id} href={`/dashboard/final-project/${project.id}`}>
            <div className="group border border-border bg-card p-6 transition-colors hover:border-primary">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center bg-primary">
                  <Code2 className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex h-8 w-8 items-center justify-center bg-secondary text-sm font-bold">
                  {index + 1}
                </div>
              </div>
              <h3 className="mb-2 font-semibold group-hover:text-primary">{project.title}</h3>
              <p className="line-clamp-3 text-sm text-muted-foreground">{project.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
