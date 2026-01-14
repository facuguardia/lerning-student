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

interface FinalProject {
  id: string
  title: string
  description: string
  requirements: string
  order_index: number
  is_active: boolean
}

interface FinalProjectFormProps {
  project?: FinalProject
}

export function FinalProjectForm({ project }: FinalProjectFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: project?.title || "",
    description: project?.description || "",
    requirements: project?.requirements || "",
    order_index: project?.order_index || 1,
    is_active: project?.is_active ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (project) {
        const { error } = await supabase
          .from("final_projects")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", project.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("final_projects").insert([formData])

        if (error) throw error
      }

      router.push("/admin/final-projects")
      router.refresh()
    } catch (error) {
      console.error("Error saving final project:", error)
      alert("Error al guardar el proyecto final")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Título del Proyecto</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ej: Sistema de Gestión de Inventario"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe el proyecto y sus objetivos..."
          rows={5}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requirements">Requisitos Técnicos</Label>
        <Textarea
          id="requirements"
          value={formData.requirements}
          onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
          placeholder="Frontend: React/Next.js&#10;Backend: Node.js/API REST&#10;Base de datos: PostgreSQL/MongoDB&#10;..."
          rows={8}
          required
        />
      </div>

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

      <div className="flex items-center gap-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active" className="cursor-pointer">
          Proyecto activo
        </Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Link href="/admin/final-projects">
          <Button type="button" variant="outline" className="gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Cancelar
          </Button>
        </Link>
        <Button type="submit" disabled={loading} className="gap-2">
          <Save className="h-4 w-4" />
          {loading ? "Guardando..." : project ? "Actualizar Proyecto" : "Crear Proyecto"}
        </Button>
      </div>
    </form>
  )
}
