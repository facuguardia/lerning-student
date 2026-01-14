import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Award, CheckCircle } from "lucide-react"
import { CertificateDownload } from "@/components/dashboard/certificate-download"

export default async function CertificatePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Check if all modules are completed
  const { data: allModules } = await supabase.from("modules").select("*").eq("is_published", true).order("order_index")

  const { data: quizAttempts } = await supabase
    .from("quiz_attempts")
    .select("*, quizzes(module_id)")
    .eq("user_id", user.id)
    .eq("passed", true)

  const completedModuleIds = new Set(quizAttempts?.map((a: any) => a.quizzes.module_id) || [])
  const allModulesCompleted = allModules?.every((m) => completedModuleIds.has(m.id)) || false

  // Check final project approval
  const { data: finalProject } = await supabase
    .from("final_project_submissions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "approved")
    .single()

  // Check final quiz passed
  const { data: finalQuiz } = await supabase
    .from("final_quiz_attempts")
    .select("*")
    .eq("user_id", user.id)
    .eq("passed", true)
    .single()

  const canDownloadCertificate = allModulesCompleted && finalProject && finalQuiz

  return (
    <div className="p-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center bg-primary">
              <Award className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Certificado del Curso</h1>
          <p className="mt-2 text-muted-foreground">Completa todos los requisitos para obtener tu certificado</p>
        </div>

        {/* Requirements */}
        <div className="mb-8 space-y-4 border border-border bg-card p-8">
          <h2 className="mb-6 text-xl font-semibold">Requisitos</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              {allModulesCompleted ? (
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              ) : (
                <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 border-muted-foreground" />
              )}
              <div>
                <p className="font-medium">Completar todos los módulos</p>
                <p className="text-sm text-muted-foreground">
                  Aprobar todos los trabajos prácticos y quizzes de cada módulo
                </p>
                {allModulesCompleted && <p className="mt-1 text-sm text-success">✓ Completado</p>}
              </div>
            </div>

            <div className="flex items-start gap-3">
              {finalProject ? (
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              ) : (
                <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 border-muted-foreground" />
              )}
              <div>
                <p className="font-medium">Aprobar el Proyecto Final</p>
                <p className="text-sm text-muted-foreground">Entregar y aprobar uno de los 30 proyectos disponibles</p>
                {finalProject && <p className="mt-1 text-sm text-success">✓ Completado</p>}
              </div>
            </div>

            <div className="flex items-start gap-3">
              {finalQuiz ? (
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              ) : (
                <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 border-muted-foreground" />
              )}
              <div>
                <p className="font-medium">Aprobar el Quiz Final</p>
                <p className="text-sm text-muted-foreground">Aprobar el quiz final que engloba todo el curso</p>
                {finalQuiz && <p className="mt-1 text-sm text-success">✓ Completado</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Preview / Download */}
        {canDownloadCertificate ? (
          <CertificateDownload userName={profile?.full_name || user.email || ""} />
        ) : (
          <div className="border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">Completa todos los requisitos para desbloquear tu certificado</p>
          </div>
        )}
      </div>
    </div>
  )
}

