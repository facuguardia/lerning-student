"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import type { Profile } from "@/lib/types"

interface SettingsFormProps {
  profile: Profile
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const [fullName, setFullName] = useState(profile.full_name || "")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const supabase = createClient()

    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", profile.id)

    if (error) {
      setMessage({ type: "error", text: "Error al actualizar el perfil" })
    } else {
      setMessage({ type: "success", text: "Perfil actualizado correctamente" })
      router.refresh()
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Información Personal</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" value={profile.email} disabled className="bg-secondary" />
            <p className="text-xs text-muted-foreground">El correo electrónico no puede ser modificado</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre completo</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre completo"
            />
          </div>
        </div>
      </div>

      {message && (
        <p className={`text-sm ${message.type === "success" ? "text-success" : "text-destructive"}`}>{message.text}</p>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  )
}
