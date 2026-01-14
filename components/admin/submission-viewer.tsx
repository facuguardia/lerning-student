"use client"

import { useState } from "react"
import { Eye, FileText, Github, Globe, LinkIcon, Maximize2, ExternalLink, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader } from "@/components/ui/dialog"

interface SubmissionViewerProps {
  submission: {
    link_url: string | null
    link_type: string | null
    file_url: string | null
    file_name: string | null
    comment: string | null
  }
}

export function SubmissionViewer({ submission }: SubmissionViewerProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Helper to determine file type for preview
  const getFileType = (url: string) => {
    if (!url) return "other"
    const extension = url.split(".").pop()?.toLowerCase()
    
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
      return "image"
    }
    if (extension === "pdf") {
      return "pdf"
    }
    return "other"
  }

  const getLinkIcon = (type: string | null) => {
    switch (type) {
      case "github":
        return <Github className="h-5 w-5" />
      case "vercel":
        return <Globe className="h-5 w-5" />
      default:
        return <LinkIcon className="h-5 w-5" />
    }
  }

  const fileType = submission.file_url ? getFileType(submission.file_url) : null
  const isPreviewable = fileType === "image" || fileType === "pdf"

  return (
    <div className="space-y-4">
      {/* Link Submission */}
      {submission.link_url && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">Enlace del Proyecto</h3>
          <div className="flex items-center gap-3 rounded-md border border-border bg-secondary/50 p-3">
            {getLinkIcon(submission.link_type)}
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-foreground">{submission.link_url}</p>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <a href={submission.link_url} target="_blank" rel="noopener noreferrer" title="Abrir enlace">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      )}

      {/* File Submission */}
      {submission.file_url && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Archivo Adjunto</h3>
            <div className="flex gap-2">
              {isPreviewable && (
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      Vista Previa
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                    <DialogHeader className="p-4 border-b">
                      <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {submission.file_name}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto bg-secondary/20 p-4 flex items-center justify-center">
                      {fileType === "image" ? (
                        <div className="relative w-full h-full min-h-[300px]">
                          <Image 
                            src={submission.file_url!} 
                            alt="Vista previa" 
                            fill 
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      ) : fileType === "pdf" ? (
                         <iframe 
                           src={`${submission.file_url}#toolbar=0`} 
                           className="w-full h-full rounded-md border"
                           title="PDF Preview"
                         />
                      ) : (
                        <div className="text-center p-8">
                          <p>No hay vista previa disponible para este tipo de archivo.</p>
                          <Button className="mt-4" asChild>
                            <a href={submission.file_url!} target="_blank" rel="noopener noreferrer">
                              Descargar
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <Button variant="outline" size="sm" asChild>
                <a href={submission.file_url!} download target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </a>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-md border border-border bg-secondary/50 p-3">
            <FileText className="h-5 w-5" />
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-foreground">{submission.file_name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
