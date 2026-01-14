import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MessageSquare, User } from "lucide-react"
import { GradingForm } from "@/components/admin/grading-form"
import { SubmissionViewer } from "@/components/admin/submission-viewer"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function GradeSubmissionPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch submission with all details
  const { data: submission } = await supabase
    .from("submissions")
    .select(
      "*, profiles!submissions_user_id_fkey(id, full_name, email), assignments(id, title, description, instructions, max_score, lessons(id, title, modules(title)))",
    )
    .eq("id", id)
    .single()

  if (!submission) {
    notFound()
  }


  return (
    <div className="p-8">
      <Link
        href="/admin/grading"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a calificaciones
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Submission details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">{submission.assignments.lessons?.modules?.title || "Sin módulo"}</p>
            <h1 className="text-2xl font-bold">{submission.assignments.title}</h1>
            <p className="mt-2 text-muted-foreground">{submission.assignments.description}</p>
          </div>

          {/* Student info */}
          <div className="border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Estudiante</h2>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center bg-secondary">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">{submission.profiles.full_name || "Sin nombre"}</p>
                <p className="text-sm text-muted-foreground">{submission.profiles.email}</p>
              </div>
            </div>
          </div>

          <div className="border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Entrega del estudiante</h2>
            <SubmissionViewer submission={submission} />
            {submission.comment && (
              <div className="mt-4 flex items-start gap-3 rounded border border-border bg-secondary/50 p-4">
                <MessageSquare className="mt-0.5 h-5 w-5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Comentario del estudiante</p>
                  <p className="text-sm text-muted-foreground">{submission.comment}</p>
                </div>
              </div>
            )}
            <p className="mt-4 text-sm text-muted-foreground">
              Entregado el{" "}
              {new Date(submission.submitted_at).toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>


          {/* Assignment instructions */}
          {submission.assignments.instructions && (
            <div className="border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Instrucciones del trabajo</h2>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{submission.assignments.instructions}</p>
            </div>
          )}
        </div>

        {/* Grading form */}
        <div>
          <GradingForm submission={submission} graderId={user.id} />
        </div>
      </div>
    </div>
  )
}
