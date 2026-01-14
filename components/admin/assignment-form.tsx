"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

interface Assignment {
  id: string
  title: string
  description: string
  instructions: string | null
  due_date: string | null
  points: number
  max_score: number
  lesson_id: string | null
}

interface Module {
  id: string
  title: string
  lessons: { id: string; title: string }[]
}

interface AssignmentFormProps {
  modules: Module[]
  assignment?: Assignment
}

export function AssignmentForm({ modules, assignment }: AssignmentFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: assignment?.title || "",
    description: assignment?.description || "",
    instructions: assignment?.instructions || "",
    due_date: assignment?.due_date ? assignment.due_date.split("T")[0] : "",
    points: assignment?.points || 10,
    max_score: assignment?.max_score || 100,
    lesson_id: assignment?.lesson_id || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        ...formData,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        lesson_id: formData.lesson_id || null,
      }

      if (assignment) {
        // Update existing assignment
        const { error } = await supabase.from("assignments").update(data).eq("id", assignment.id)

        if (error) throw error
      } else {
        // Create new assignment
        const { error } = await supabase.from("assignments").insert([data])

        if (error) throw error
      }

      router.push("/admin/assignments")
      router.refresh()
    } catch (error) {
      console.error("Error saving assignment:", error)
      alert("Error al guardar el trabajo práctico")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Título del Trabajo Práctico</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ej: Crear una aplicación de tareas con React"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lesson_id">Clase Asociada</Label>
        <select
          id="lesson_id"
          value={formData.lesson_id}
          onChange={(e) => setFormData({ ...formData, lesson_id: e.target.value })}
          className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Selecciona una clase</option>
          {modules.map((module) => (
            <optgroup key={module.id} label={module.title}>
              {module.lessons?.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Objetivo a Lograr</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe el objetivo principal de este trabajo..."
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Instrucciones Detalladas</Label>
        <Textarea
          id="instructions"
          value={formData.instructions}
          onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
          placeholder="Escribe las instrucciones paso a paso..."
          rows={8}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="due_date">Fecha Límite</Label>
          <Input
            id="due_date"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="points">Puntos al Aprobar</Label>
          <Input
            id="points"
            type="number"
            min="1"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: Number.parseInt(e.target.value) })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_score">Puntuación Máxima</Label>
          <Input
            id="max_score"
            type="number"
            min="1"
            value={formData.max_score}
            onChange={(e) => setFormData({ ...formData, max_score: Number.parseInt(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Formas de Entrega</Label>
        <div className="text-sm text-muted-foreground">
          Los estudiantes podrán entregar archivos PDF/ZIP, enlaces a GitHub, Vercel o URL de producción
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Link href="/admin/assignments">
          <Button type="button" variant="outline" className="gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Cancelar
          </Button>
        </Link>
        <Button type="submit" disabled={loading} className="gap-2">
          <Save className="h-4 w-4" />
          {loading ? "Guardando..." : assignment ? "Actualizar Trabajo" : "Crear Trabajo"}
        </Button>
      </div>
    </form>
  )
}
