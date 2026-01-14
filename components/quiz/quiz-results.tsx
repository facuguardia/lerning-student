"use client"

import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/dashboard/progress-bar"
import { QuizQuestion } from "./quiz-question"
import { CheckCircle, XCircle, RotateCcw, ArrowRight } from "lucide-react"

interface QuizOption {
  id: string
  option_text: string
  is_correct: boolean
  order_index: number
}

interface QuizQuestionType {
  id: string
  question_text: string
  order_index: number
  points: number
  quiz_options: QuizOption[]
}

interface Quiz {
  id: string
  title: string
  description: string | null
  passing_score: number
  modules: {
    id: string
    title: string
  }
  quiz_questions: QuizQuestionType[]
}

interface QuizResultsProps {
  quiz: Quiz
  results: {
    score: number
    totalPoints: number
    percentage: number
    passed: boolean
    answers: { questionId: string; isCorrect: boolean; selectedOptionId: string | null }[]
  }
  onRetry: () => void
  onBackToModule: () => void
}

export function QuizResults({ quiz, results, onRetry, onBackToModule }: QuizResultsProps) {
  const correctCount = results.answers.filter((a) => a.isCorrect).length
  const totalCount = results.answers.length

  return (
    <div className="mx-auto max-w-3xl">
      {/* Results header */}
      <div
        className={`mb-8 border p-8 ${results.passed ? "border-success bg-success/5" : "border-destructive bg-destructive/5"}`}
      >
        <div className="flex items-center justify-center gap-4">
          {results.passed ? (
            <CheckCircle className="h-16 w-16 text-success" />
          ) : (
            <XCircle className="h-16 w-16 text-destructive" />
          )}
          <div className="text-center">
            <h1 className="text-3xl font-bold">{results.passed ? "¡Felicitaciones!" : "Sigue intentando"}</h1>
            <p className="mt-1 text-muted-foreground">
              {results.passed
                ? "Has aprobado el quiz y desbloqueado el siguiente módulo"
                : `Necesitas ${quiz.passing_score}% para aprobar. Puedes intentarlo de nuevo.`}
            </p>
          </div>
        </div>

        {/* Score display */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-4xl font-bold">{Math.round(results.percentage)}%</p>
            <p className="text-sm text-muted-foreground">Puntuación</p>
          </div>
          <div>
            <p className="text-4xl font-bold">
              {correctCount}/{totalCount}
            </p>
            <p className="text-sm text-muted-foreground">Correctas</p>
          </div>
          <div>
            <p className="text-4xl font-bold">
              {results.score}/{results.totalPoints}
            </p>
            <p className="text-sm text-muted-foreground">Puntos</p>
          </div>
        </div>

        <div className="mt-6">
          <ProgressBar value={results.percentage} size="lg" />
          <div className="mt-2 flex justify-between text-sm text-muted-foreground">
            <span>0%</span>
            <span className="font-medium">Mínimo: {quiz.passing_score}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" onClick={onRetry} className="gap-2 bg-transparent">
            <RotateCcw className="h-4 w-4" />
            Intentar de nuevo
          </Button>
          <Button onClick={onBackToModule} className="gap-2">
            {results.passed ? "Continuar" : "Volver al módulo"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Review answers */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Revisión de respuestas</h2>
        {quiz.quiz_questions.map((question, index) => {
          const answer = results.answers.find((a) => a.questionId === question.id)
          return (
            <div key={question.id} className="relative">
              <div
                className={`absolute -left-3 top-6 h-6 w-1 ${answer?.isCorrect ? "bg-success" : "bg-destructive"}`}
              />
              <QuizQuestion
                question={question}
                selectedOptionId={answer?.selectedOptionId || undefined}
                onSelectOption={() => {}}
                questionNumber={index + 1}
                showCorrect
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
