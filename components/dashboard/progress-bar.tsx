import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
}

export function ProgressBar({ value, max = 100, className, showLabel = false, size = "md" }: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const heights = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  }

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-muted-foreground">Progreso</span>
          <span className="font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn("w-full overflow-hidden bg-secondary", heights[size])}>
        <div
          className={cn("h-full bg-accent transition-all duration-500", percentage === 100 && "bg-success")}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
