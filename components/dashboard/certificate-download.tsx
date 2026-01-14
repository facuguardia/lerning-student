"use client"

import { Button } from "@/components/ui/button"
import { Download, Award } from "lucide-react"

interface CertificateDownloadProps {
  userName: string
}

export function CertificateDownload({ userName }: CertificateDownloadProps) {
  const handleDownloadCertificate = async () => {
    // Here you would generate and download a PDF certificate
    // For now, we'll show an alert
    alert("Funcionalidad de descarga de certificado en desarrollo. Se generará un PDF con tu certificado.")
  }

  return (
    <div className="border border-border bg-card p-8 text-center">
      <div className="mb-6">
        <div className="mb-4 inline-flex h-24 w-24 items-center justify-center bg-success/10">
          <Award className="h-12 w-12 text-success" />
        </div>
        <h3 className="text-2xl font-bold">¡Felicitaciones!</h3>
        <p className="mt-2 text-muted-foreground">Has completado exitosamente el curso</p>
      </div>

      <Button size="lg" onClick={handleDownloadCertificate} className="gap-2">
        <Download className="h-5 w-5" />
        Descargar Certificado
      </Button>

      <p className="mt-4 text-sm text-muted-foreground">
        Certificado a nombre de: <span className="font-medium">{userName}</span>
      </p>
    </div>
  )
}
