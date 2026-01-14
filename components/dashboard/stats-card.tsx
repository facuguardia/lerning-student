import type React from "react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: "up" | "down" | "neutral"
  className?: string
}

export function StatsCard({ title, value, subtitle, icon, className }: StatsCardProps) {
  return (
    <div className={cn("border border-border bg-card p-6", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {icon && <div className="flex h-10 w-10 items-center justify-center bg-secondary">{icon}</div>}
      </div>
    </div>
  )
}
