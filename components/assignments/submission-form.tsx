"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, LinkIcon, Github, Globe, X } from "lucide-react"
import type { Submission } from "@/lib/types"

interface SubmissionFormProps {
  assignmentId: string
  userId: string
  existingSubmission: Submission | null
}

export function SubmissionForm({ assignmentId, userId, existingSubmission }: SubmissionFormProps) {
  const [linkUrl, setLinkUrl] = useState(existingSubmission?.link_url || "")
  const [linkType, setLinkType] = useState<"github" | "vercel" | "other">(
    (existingSubmission?.link_type as "github" | "vercel" | "other") || "github",
  )
  const [comment, setComment] = useState(existingSubmission?.comment || "")
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check file type
      const validTypes = [
        "application/pdf",
        "application/zip",
        "application/x-zip-compressed",
        "image/png",
        "image/jpeg",
        "image/webp",
      ]
      if (!validTypes.includes(selectedFile.type)) {
        setError("Solo se permiten PDF, ZIP o imágenes (PNG/JPG/WEBP)")
        return
      }
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("El archivo no puede superar los 10MB")
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!linkUrl && !file) {
      setError("Debes proporcionar un enlace o subir un archivo")
      setIsSubmitting(false)
      return
    }

    const supabase = createClient()

    try {
      let fileUrl = existingSubmission?.file_url
      let fileName = existingSubmission?.file_name

      // Upload file if provided
      if (file) {
        const fileExt = file.name.split(".").pop()
        const filePath = `${userId}/${assignmentId}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage.from("submissions").upload(filePath, file)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("submissions").getPublicUrl(filePath)

        fileUrl = publicUrl
        fileName = file.name
      }

      // Create or update submission
      if (existingSubmission) {
        const { error: updateError } = await supabase
          .from("submissions")
          .update({
            link_url: linkUrl || null,
            link_type: linkUrl ? linkType : null,
            file_url: fileUrl,
            file_name: fileName,
            comment: comment || null,
            status: "submitted",
            submitted_at: new Date().toISOString(),
          })
          .eq("id", existingSubmission.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from("submissions").insert({
          assignment_id: assignmentId,
          user_id: userId,
          link_url: linkUrl || null,
          link_type: linkUrl ? linkType : null,
          file_url: fileUrl,
          file_name: fileName,
          comment: comment || null,
          status: "submitted",
          submitted_at: new Date().toISOString(),
        })

        if (insertError) throw insertError
      }

      router.refresh()
    } catch (err) {
      console.error(err)
      setError("Error al enviar la entrega. Intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">Entregar trabajo</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Link input */}
        <div className="space-y-2">
          <Label>Enlace del proyecto</Label>
          <div className="flex gap-2">
            <div className="flex border border-input">
              <button
                type="button"
                onClick={() => setLinkType("github")}
                className={`flex h-10 w-10 items-center justify-center ${linkType === "github" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
              >
                <Github className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setLinkType("vercel")}
                className={`flex h-10 w-10 items-center justify-center ${linkType === "vercel" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
              >
                <Globe className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setLinkType("other")}
                className={`flex h-10 w-10 items-center justify-center ${linkType === "other" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
              >
                <LinkIcon className="h-4 w-4" />
              </button>
            </div>
            <Input
              type="url"
              placeholder={
                linkType === "github"
                  ? "https://github.com/user/repo"
                  : linkType === "vercel"
                    ? "https://project.vercel.app"
                    : "https://..."
              }
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        {/* File upload */}
        <div className="space-y-2">
          <Label>Archivo (PDF, ZIP o imagen)</Label>
          <div className="border border-dashed border-input p-4">
            {file ? (
              <div className="flex items-center justify-between">
                <span className="text-sm">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Haz clic para subir</span>
                <span className="text-xs text-muted-foreground">PDF, ZIP, PNG, JPG, WEBP (máx. 10MB)</span>
                <input
                  type="file"
                  accept=".pdf,.zip,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <Label htmlFor="comment">Comentario (opcional)</Label>
          <Textarea
            id="comment"
            placeholder="Añade un comentario sobre tu entrega..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : existingSubmission ? "Actualizar entrega" : "Enviar trabajo"}
        </Button>
      </form>
    </div>
  )
}
