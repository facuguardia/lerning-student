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

interface Module {
  id: string
  title: string
  description: string | null
  content: string | null
  order_index: number
  is_published: boolean
}

interface ModuleFormProps {
  module?: Module
}

export function ModuleForm({ module }: ModuleFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: module?.title || "",
    description: module?.description || "",
    content: module?.content || "",
    order_index: module?.order_index || 1,
    is_published: module?.is_published || false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      if (module) {
        // Update existing module
        const { error } = await supabase
          .from("modules")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", module.id)

        if (error) throw error
      } else {
        // Create new module
        const { error } = await supabase.from("modules").insert([formData])

        if (error) throw error
      }

      router.push("/admin/modules")
      router.refresh()
    } catch (error: any) {
      console.error("Error saving module:", error)
      alert(`Error al guardar el módulo: ${error.message || "Error desconocido"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Título del Módulo</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ej: Introducción a React"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Breve descripción del módulo"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Contenido del Módulo</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Contenido detallado del módulo..."
          rows={10}
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
        <p className="text-sm text-muted-foreground">Define el orden en que aparece este módulo</p>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="is_published"
          checked={formData.is_published}
          onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
        />
        <Label htmlFor="is_published" className="cursor-pointer">
          Publicar módulo
        </Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Link href="/admin/modules">
          <Button type="button" variant="outline" className="gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Cancelar
          </Button>
        </Link>
        <Button type="submit" disabled={loading} className="gap-2">
          <Save className="h-4 w-4" />
          {loading ? "Guardando..." : module ? "Actualizar Módulo" : "Crear Módulo"}
        </Button>
      </div>
    </form>
  )
}
