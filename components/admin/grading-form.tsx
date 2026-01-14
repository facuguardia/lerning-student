"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react"

interface GradingFormProps {
  submission: {
    id: string
    status: string
    score: number | null
    feedback: string | null
    is_approved: boolean | null
    rejection_reason: string | null
    assignments: {
      max_score: number
    }
  }
  graderId: string
}

export function GradingForm({ submission, graderId }: GradingFormProps) {
  const [score, setScore] = useState(submission.score || 0)
  const [feedback, setFeedback] = useState(submission.feedback || "")
  const [rejectionReason, setRejectionReason] = useState(submission.rejection_reason || "")
  const [isApproved, setIsApproved] = useState<boolean | null>(submission.is_approved)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const isGraded = submission.status === "graded"
  const maxScore = submission.assignments.max_score

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (score < 0 || score > maxScore) {
      setError(`La nota debe estar entre 0 y ${maxScore}`)
      setIsSubmitting(false)
      return
    }

    if (isApproved === false && !rejectionReason.trim()) {
      setError("Debes proporcionar un motivo de desaprobación")
      setIsSubmitting(false)
      return
    }

    const supabase = createClient()

    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        score,
        feedback: feedback || null,
        is_approved: isApproved,
        rejection_reason: isApproved === false ? rejectionReason : null,
        status: "graded",
        graded_at: new Date().toISOString(),
        graded_by: graderId,
      })
      .eq("id", submission.id)

    if (updateError) {
      const msg = "Error al guardar la calificación"
      setError(msg)
      toast.error(msg)
      setIsSubmitting(false)
      return
    }

    toast.success("Calificación guardada correctamente")
    router.push("/admin/grading")
    router.refresh()
  }

  return (
    <div className="sticky top-8 border border-border bg-card p-6">
      {/* Status */}
      <div
        className={`mb-6 flex items-center gap-3 p-4 ${
          isGraded
            ? isApproved === true
              ? "bg-success/10"
              : isApproved === false
                ? "bg-destructive/10"
                : "bg-warning/10"
            : "bg-accent/10"
        }`}
      >
        {isGraded ? (
          isApproved === true ? (
            <CheckCircle className="h-6 w-6 text-success" />
          ) : isApproved === false ? (
            <XCircle className="h-6 w-6 text-destructive" />
          ) : (
            <AlertCircle className="h-6 w-6 text-warning" />
          )
        ) : (
          <Clock className="h-6 w-6 text-accent" />
        )}
        <div>
          <p className="font-semibold">
            {isGraded
              ? isApproved === true
                ? "Aprobado"
                : isApproved === false
                  ? "Desaprobado"
                  : "Calificado"
              : "Pendiente"}
          </p>
          <p className="text-sm text-muted-foreground">
            {isGraded
              ? isApproved === true
                ? "Trabajo aprobado"
                : isApproved === false
                  ? "Debe rehacer el trabajo"
                  : "Ya calificaste esta entrega"
              : "Asigna una calificación"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Approval buttons */}
        <div className="space-y-2">
          <Label>Resultado</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={isApproved === true ? "default" : "outline"}
              className={isApproved === true ? "bg-success hover:bg-success/90" : ""}
              onClick={() => {
                setIsApproved(true)
                setRejectionReason("")
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Aprobar
            </Button>
            <Button
              type="button"
              variant={isApproved === false ? "default" : "outline"}
              className={isApproved === false ? "bg-destructive hover:bg-destructive/90" : ""}
              onClick={() => setIsApproved(false)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Desaprobar
            </Button>
          </div>
        </div>

        {/* Score */}
        <div className="space-y-2">
          <Label htmlFor="score">Puntuación</Label>
          <div className="flex items-center gap-2">
            <Input
              id="score"
              type="number"
              min={0}
              max={maxScore}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-muted-foreground">/ {maxScore}</span>
          </div>
          <p className="text-xs text-muted-foreground">Porcentaje: {Math.round((score / maxScore) * 100)}%</p>
        </div>

        {/* Rejection reason - only shown if disapproved */}
        {isApproved === false && (
          <div className="space-y-2">
            <Label htmlFor="rejection_reason" className="text-destructive">
              Motivo de Desaprobación *
            </Label>
            <Textarea
              id="rejection_reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ejemplo: error en la lógica del cálculo matemático..."
              rows={4}
              className="border-destructive/50"
              required
            />
            <p className="text-xs text-muted-foreground">El estudiante deberá rehacer el trabajo</p>
          </div>
        )}

        {/* Feedback */}
        <div className="space-y-2">
          <Label htmlFor="feedback">Comentarios adicionales (opcional)</Label>
          <Textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Escribe comentarios generales sobre el trabajo..."
            rows={4}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting || isApproved === null}>
          {isSubmitting ? "Guardando..." : isGraded ? "Actualizar calificación" : "Guardar calificación"}
        </Button>
      </form>
    </div>
  )
}
