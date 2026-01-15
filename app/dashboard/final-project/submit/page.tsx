import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { FinalProjectSubmissionForm } from "@/components/final-project/submission-form"
import { FinalProjectSubmissionStatus } from "@/components/final-project/submission-status"

export const metadata: Metadata = {
  title: "Entregar Proyecto Final",
  description: "Formulario de entrega y estado del proyecto final.",
}

export default async function SubmitFinalProjectPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's final project submission
  const { data: submission } = await supabase
    .from("final_project_submissions")
    .select("*, final_projects(*), graded_by_profile:profiles!final_project_submissions_graded_by_fkey(full_name)")
    .eq("user_id", user.id)
    .single()

  if (!submission) {
    redirect("/dashboard/final-project")
  }

  const canSubmit = submission.status === "pending" || submission.is_approved === false

  return (
    <div className="p-8">
      <Link
        href="/dashboard/final-project"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al proyecto
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Project details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-border bg-card p-6">
            <h1 className="text-2xl font-bold">{submission.final_projects.title}</h1>
            <p className="mt-2 text-muted-foreground">{submission.final_projects.description}</p>
          </div>

          <div className="border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Requisitos</h2>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {submission.final_projects.requirements}
            </p>
          </div>
        </div>

        {/* Submission */}
        <div>
          {submission.status === "submitted" || submission.status === "graded" ? (
            <>
              <FinalProjectSubmissionStatus submission={submission} />
              {submission.is_approved === false && (
                <FinalProjectSubmissionForm submission={submission} userId={user.id} />
              )}
            </>
          ) : (
            <FinalProjectSubmissionForm submission={submission} userId={user.id} />
          )}
        </div>
      </div>
    </div>
  )
}
