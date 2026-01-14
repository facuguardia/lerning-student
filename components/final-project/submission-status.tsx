import { CheckCircle, Clock, XCircle, AlertTriangle, Globe, Github, MessageSquare } from "lucide-react"

interface FinalProjectSubmissionStatusProps {
  submission: {
    id: string
    status: string
    production_url: string | null
    github_url: string | null
    description: string | null
    score: number | null
    feedback: string | null
    is_approved: boolean | null
    rejection_reason: string | null
    submitted_at: string | null
    graded_at: string | null
    graded_by_profile: { full_name: string } | null
  }
}

export function FinalProjectSubmissionStatus({ submission }: FinalProjectSubmissionStatusProps) {
  const isGraded = submission.status === "graded"
  const isApproved = submission.is_approved === true
  const isRejected = submission.is_approved === false

  return (
    <div className="space-y-4">
      {/* Status card */}
      <div
        className={`border p-6 ${
          isGraded
            ? isApproved
              ? "border-success bg-success/5"
              : isRejected
                ? "border-destructive bg-destructive/5"
                : "border-warning bg-warning/5"
            : "border-accent bg-accent/5"
        }`}
      >
        <div className="flex items-center gap-3">
          {isGraded ? (
            isApproved ? (
              <CheckCircle className="h-8 w-8 text-success" />
            ) : isRejected ? (
              <XCircle className="h-8 w-8 text-destructive" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-warning" />
            )
          ) : (
            <Clock className="h-8 w-8 text-accent" />
          )}
          <div>
            <h3 className="font-semibold">
              {isGraded ? (isApproved ? "Aprobado" : isRejected ? "Desaprobado" : "Calificado") : "Entregado"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isGraded
                ? `Calificado el ${new Date(submission.graded_at!).toLocaleDateString("es-ES")}`
                : `Entregado el ${new Date(submission.submitted_at!).toLocaleDateString("es-ES")}`}
            </p>
          </div>
        </div>

        {isGraded && submission.score !== null && (
          <div className="mt-4 text-center">
            <p className="text-4xl font-bold">{submission.score}</p>
            <p className="text-sm text-muted-foreground">puntos obtenidos</p>
          </div>
        )}
      </div>

      {/* Rejection reason */}
      {isRejected && submission.rejection_reason && (
        <div className="border border-destructive bg-destructive/5 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
            <div className="flex-1">
              <h3 className="mb-2 font-semibold text-destructive">Motivo de Desaprobación</h3>
              <p className="whitespace-pre-wrap text-sm text-foreground">{submission.rejection_reason}</p>
              <p className="mt-3 text-sm font-medium text-destructive">
                Debes corregir y volver a entregar el proyecto
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Submission details */}
      <div className="border border-border bg-card p-6">
        <h3 className="mb-4 font-semibold">Tu entrega</h3>
        <div className="space-y-3">
          {submission.production_url && (
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4" />
              <a
                href={submission.production_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent underline underline-offset-2"
              >
                {submission.production_url}
              </a>
            </div>
          )}
          {submission.github_url && (
            <div className="flex items-center gap-3">
              <Github className="h-4 w-4" />
              <a
                href={submission.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent underline underline-offset-2"
              >
                {submission.github_url}
              </a>
            </div>
          )}
          {submission.description && (
            <div className="flex items-start gap-3">
              <MessageSquare className="mt-0.5 h-4 w-4" />
              <p className="text-sm text-muted-foreground">{submission.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Feedback */}
      {isGraded && submission.feedback && (
        <div className="border border-border bg-card p-6">
          <h3 className="mb-2 font-semibold">Comentarios del profesor</h3>
          {submission.graded_by_profile && (
            <p className="mb-3 text-xs text-muted-foreground">Por {submission.graded_by_profile.full_name}</p>
          )}
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{submission.feedback}</p>
        </div>
      )}
    </div>
  )
}
