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
  
  // Password state
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const router = useRouter()

  const handleProfileSubmit = async (e: React.FormEvent) => {
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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "La contraseña debe tener al menos 6 caracteres" })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Las contraseñas no coinciden" })
      return
    }

    setIsPasswordLoading(true)
    setPasswordMessage(null)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordMessage({ type: "error", text: "Error al actualizar la contraseña: " + error.message })
    } else {
      setPasswordMessage({ type: "success", text: "Contraseña actualizada correctamente" })
      setNewPassword("")
      setConfirmPassword("")
    }

    setIsPasswordLoading(false)
  }

  return (
    <div className="space-y-8">
      {/* Profile Form */}
      <form onSubmit={handleProfileSubmit} className="space-y-6">
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
          
          {message && (
            <p className={`mt-4 text-sm ${message.type === "success" ? "text-green-600" : "text-destructive"}`}>
              {message.text}
            </p>
          )}

          <div className="mt-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </form>

      {/* Password Form */}
      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        <div className="border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Seguridad</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ingresa tu nueva contraseña"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu nueva contraseña"
              />
            </div>
          </div>

          {passwordMessage && (
            <p className={`mt-4 text-sm ${passwordMessage.type === "success" ? "text-green-600" : "text-destructive"}`}>
              {passwordMessage.text}
            </p>
          )}

          <div className="mt-6">
            <Button type="submit" disabled={isPasswordLoading}>
              {isPasswordLoading ? "Actualizando..." : "Cambiar contraseña"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
