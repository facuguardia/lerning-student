"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

interface Lesson {
  id: string
  module_id: string
  title: string
  description: string | null
  content: string | null
  video_url: string | null
  order_index: number
  duration_minutes: number | null
  is_published: boolean
}

interface LessonFormProps {
  moduleId: string
  lesson?: Lesson
}

export function LessonForm({ moduleId, lesson }: LessonFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: lesson?.title || "",
    description: lesson?.description || "",
    content: lesson?.content || "",
    video_url: lesson?.video_url || "",
    order_index: lesson?.order_index || 1,
    duration_minutes: lesson?.duration_minutes || null,
    is_published: lesson?.is_published || false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (lesson) {
        // Update existing lesson
        const { error } = await supabase
          .from("lessons")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", lesson.id)

        if (error) throw error
      } else {
        // Create new lesson
        const { error } = await supabase.from("lessons").insert([
          {
            ...formData,
            module_id: moduleId,
          },
        ])

        if (error) throw error
      }

      router.push(`/admin/modules/${moduleId}`)
      router.refresh()
    } catch (error) {
      console.error("Error saving lesson:", error)
      alert("Error al guardar la clase")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Título de la Clase</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ej: Introducción a Hooks"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Breve descripción de la clase"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Contenido de la Clase</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Contenido detallado de la clase..."
          rows={10}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="video_url">URL del Video (opcional)</Label>
        <Input
          id="video_url"
          type="url"
          value={formData.video_url}
          onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
          placeholder="https://youtube.com/watch?v=..."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="order_index">Orden</Label>
          <Input
            id="order_index"
            type="number"
            min="1"
            value={formData.order_index}
            onChange={(e) => setFormData({ ...formData, order_index: Number.parseInt(e.target.value) })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration_minutes">Duración (minutos)</Label>
          <Input
            id="duration_minutes"
            type="number"
            min="0"
            value={formData.duration_minutes || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                duration_minutes: e.target.value ? Number.parseInt(e.target.value) : null,
              })
            }
            placeholder="30"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="is_published"
          checked={formData.is_published}
          onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
        />
        <Label htmlFor="is_published" className="cursor-pointer">
          Publicar clase
        </Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Link href={`/admin/modules/${moduleId}`}>
          <Button type="button" variant="outline" className="gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Cancelar
          </Button>
        </Link>
        <Button type="submit" disabled={loading} className="gap-2">
          <Save className="h-4 w-4" />
          {loading ? "Guardando..." : lesson ? "Actualizar Clase" : "Crear Clase"}
        </Button>
      </div>
    </form>
  )
}
