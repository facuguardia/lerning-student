import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="mb-4 rounded-full bg-destructive/10 p-3 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h1 className="mb-2 text-2xl font-bold">Error de autenticación</h1>
      <p className="mb-6 text-muted-foreground">
        Hubo un problema al verificar tu enlace de inicio de sesión. <br />
        Es posible que el enlace haya expirado o ya haya sido utilizado.
      </p>
      <Button asChild>
        <Link href="/auth/login">Volver al inicio de sesión</Link>
      </Button>
    </div>
  )
}
