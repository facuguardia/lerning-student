"use client"

import { cn } from "@/lib/utils"
import { Circle, CheckCircle2 } from "lucide-react"

interface QuizOption {
  id: string
  option_text: string
  is_correct: boolean
  order_index: number
}

interface QuizQuestionProps {
  question: {
    id: string
    question_text: string
    points: number
    quiz_options: QuizOption[]
  }
  selectedOptionId: string | undefined
  onSelectOption: (optionId: string) => void
  questionNumber: number
  showCorrect?: boolean
}

export function QuizQuestion({
  question,
  selectedOptionId,
  onSelectOption,
  questionNumber,
  showCorrect = false,
}: QuizQuestionProps) {
  return (
    <div className="border border-border bg-card">
      {/* Question header */}
      <div className="border-b border-border p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-primary text-sm font-bold text-primary-foreground">
              {questionNumber}
            </span>
            <h2 className="text-lg font-medium leading-relaxed">{question.question_text}</h2>
          </div>
          <span className="shrink-0 text-sm text-muted-foreground">{question.points} pts</span>
        </div>
      </div>

      {/* Options */}
      <div className="p-6">
        <div className="space-y-3">
          {question.quiz_options.map((option, index) => {
            const isSelected = selectedOptionId === option.id
            const letter = String.fromCharCode(65 + index) // A, B, C, D...

            let optionStyle = "border-border hover:border-foreground/30"
            if (showCorrect) {
              if (option.is_correct) {
                optionStyle = "border-success bg-success/5"
              } else if (isSelected && !option.is_correct) {
                optionStyle = "border-destructive bg-destructive/5"
              }
            } else if (isSelected) {
              optionStyle = "border-accent bg-accent/5"
            }

            return (
              <button
                key={option.id}
                onClick={() => !showCorrect && onSelectOption(option.id)}
                disabled={showCorrect}
                className={cn("flex w-full items-center gap-4 border p-4 text-left transition-colors", optionStyle)}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center text-sm font-medium",
                    isSelected && !showCorrect
                      ? "bg-accent text-accent-foreground"
                      : showCorrect && option.is_correct
                        ? "bg-success text-success-foreground"
                        : showCorrect && isSelected && !option.is_correct
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-secondary text-secondary-foreground",
                  )}
                >
                  {letter}
                </span>
                <span className="flex-1">{option.option_text}</span>
                {showCorrect ? (
                  option.is_correct ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : isSelected ? (
                    <Circle className="h-5 w-5 text-destructive" />
                  ) : null
                ) : isSelected ? (
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/30" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
