import Link from "next/link"
import { cn } from "@/lib/utils"
import { Lock, CheckCircle, PlayCircle, BookOpen } from "lucide-react"
import { ProgressBar } from "./progress-bar"
import { Button } from "@/components/ui/button"
import type { Module } from "@/lib/types"

interface ModuleCardProps {
  module: Module
  isUnlocked: boolean
  isCompleted: boolean
  quizScore: number | null
  index: number
}

export function ModuleCard({ module, isUnlocked, isCompleted, quizScore, index }: ModuleCardProps) {
  const statusIcon = isCompleted ? (
    <CheckCircle className="h-5 w-5 text-success" />
  ) : isUnlocked ? (
    <PlayCircle className="h-5 w-5 text-accent" />
  ) : (
    <Lock className="h-5 w-5 text-muted-foreground" />
  )

  return (
    <div
      className={cn(
        "group relative border border-border bg-card p-6 transition-all",
        isUnlocked ? "hover:border-foreground/20" : "opacity-60",
      )}
    >
      {/* Module number */}
      <div className="absolute -left-px -top-px flex h-8 w-8 items-center justify-center bg-primary text-xs font-bold text-primary-foreground">
        {String(index + 1).padStart(2, "0")}
      </div>

      <div className="ml-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold leading-tight">{module.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{module.description}</p>
          </div>
          {statusIcon}
        </div>

        {/* Progress */}
        {isUnlocked && (
          <div className="space-y-2">
            <ProgressBar value={isCompleted ? 100 : quizScore || 0} size="sm" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {isCompleted ? "Completado" : "En progreso"}
              </span>
              {quizScore !== null && <span>Quiz: {quizScore}%</span>}
            </div>
          </div>
        )}

        {/* Action */}
        {isUnlocked ? (
          <Link href={`/dashboard/modules/${module.id}`}>
            <Button size="sm" variant={isCompleted ? "outline" : "default"} className="w-full">
              {isCompleted ? "Revisar módulo" : "Continuar"}
            </Button>
          </Link>
        ) : (
          <Button size="sm" variant="outline" disabled className="w-full bg-transparent">
            <Lock className="mr-2 h-4 w-4" />
            Bloqueado
          </Button>
        )}
      </div>
    </div>
  )
}
