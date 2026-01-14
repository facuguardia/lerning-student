"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Send } from "lucide-react"

interface FinalProjectSubmissionFormProps {
  submission: {
    id: string
    project_id: string
    production_url: string | null
    github_url: string | null
    description: string | null
  }
  userId: string
}

export function FinalProjectSubmissionForm({ submission, userId }: FinalProjectSubmissionFormProps) {
  const [productionUrl, setProductionUrl] = useState(submission.production_url || "")
  const [githubUrl, setGithubUrl] = useState(submission.github_url || "")
  const [description, setDescription] = useState(submission.description || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!productionUrl) {
      setError("El link de producción es obligatorio")
      setIsSubmitting(false)
      return
    }

    const supabase = createClient()

    const { error: updateError } = await supabase
      .from("final_project_submissions")
      .update({
        production_url: productionUrl,
        github_url: githubUrl || null,
        description: description || null,
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", submission.id)

    if (updateError) {
      setError("Error al enviar la entrega")
      setIsSubmitting(false)
      return
    }

    router.refresh()
  }

  return (
    <div className="border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">Entregar Proyecto</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="production_url">URL de Producción *</Label>
          <Input
            id="production_url"
            type="url"
            value={productionUrl}
            onChange={(e) => setProductionUrl(e.target.value)}
            placeholder="https://mi-proyecto.vercel.app"
            required
          />
          <p className="text-xs text-muted-foreground">Link donde está desplegado tu proyecto</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="github_url">Repositorio GitHub (opcional)</Label>
          <Input
            id="github_url"
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/usuario/repo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción (opcional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe tu implementación, tecnologías usadas, etc..."
            rows={4}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
          <Send className="h-4 w-4" />
          {isSubmitting ? "Enviando..." : "Entregar Proyecto"}
        </Button>
      </form>
    </div>
  )
}
