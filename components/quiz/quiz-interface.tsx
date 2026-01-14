"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/dashboard/progress-bar"
import { QuizQuestion } from "./quiz-question"
import { QuizResults } from "./quiz-results"
import { Clock, AlertCircle } from "lucide-react"

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
  time_limit_minutes: number | null
  modules: {
    id: string
    title: string
  }
  quiz_questions: QuizQuestionType[]
}

interface QuizInterfaceProps {
  quiz: Quiz
  userId: string
}

export function QuizInterface({ quiz, userId }: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState<{
    score: number
    totalPoints: number
    percentage: number
    passed: boolean
    answers: { questionId: string; isCorrect: boolean; selectedOptionId: string | null }[]
  } | null>(null)
  const router = useRouter()

  const questions = quiz.quiz_questions
  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const answeredQuestions = Object.keys(answers).length

  const handleSelectAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Calculate results
    let score = 0
    let totalPoints = 0
    const answerResults: { questionId: string; isCorrect: boolean; selectedOptionId: string | null }[] = []

    questions.forEach((question) => {
      totalPoints += question.points
      const selectedOptionId = answers[question.id]
      const selectedOption = question.quiz_options.find((o) => o.id === selectedOptionId)
      const isCorrect = selectedOption?.is_correct || false

      if (isCorrect) {
        score += question.points
      }

      answerResults.push({
        questionId: question.id,
        isCorrect,
        selectedOptionId: selectedOptionId || null,
      })
    })

    const percentage = (score / totalPoints) * 100
    const passed = percentage >= quiz.passing_score

    const nextAttemptAt = !passed ? new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() : null

    // Save attempt to database
    const supabase = createClient()

    const { data: attempt, error: attemptError } = await supabase
      .from("quiz_attempts")
      .insert({
        quiz_id: quiz.id,
        user_id: userId,
        score,
        total_points: totalPoints,
        percentage,
        passed,
        next_attempt_at: nextAttemptAt,
      })
      .select()
      .single()

    if (!attemptError && attempt) {
      // Save individual answers
      const answersToInsert = answerResults.map((answer) => ({
        attempt_id: attempt.id,
        question_id: answer.questionId,
        selected_option_id: answer.selectedOptionId,
        is_correct: answer.isCorrect,
      }))

      await supabase.from("quiz_answers").insert(answersToInsert)

      // If passed, update module progress
      if (passed) {
        const { data: existingProgress } = await supabase
          .from("module_progress")
          .select()
          .eq("user_id", userId)
          .eq("module_id", quiz.modules.id)
          .single()

        if (existingProgress) {
          await supabase
            .from("module_progress")
            .update({ is_unlocked: true, completed_at: new Date().toISOString() })
            .eq("id", existingProgress.id)
        } else {
          await supabase.from("module_progress").insert({
            user_id: userId,
            module_id: quiz.modules.id,
            is_unlocked: true,
            completed_at: new Date().toISOString(),
          })
        }
      }
    }

    setResults({
      score,
      totalPoints,
      percentage,
      passed,
      answers: answerResults,
    })

    setIsSubmitting(false)
  }

  const handleRetry = () => {
    // Redirect to quiz page which will check cooldown
    router.push(`/dashboard/quiz/${quiz.id}`)
    router.refresh()
  }

  // Show results if quiz is completed
  if (results) {
    return (
      <QuizResults
        quiz={quiz}
        results={results}
        onRetry={handleRetry}
        onBackToModule={() => router.push(`/dashboard/modules/${quiz.modules.id}`)}
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Quiz header */}
      <div className="mb-8 border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{quiz.modules.title}</p>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            {quiz.description && <p className="mt-1 text-muted-foreground">{quiz.description}</p>}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {quiz.time_limit_minutes ? `${quiz.time_limit_minutes} min` : "Sin límite"}
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-muted-foreground">
              Pregunta {currentQuestionIndex + 1} de {totalQuestions}
            </span>
            <span className="font-medium">
              {answeredQuestions}/{totalQuestions} respondidas
            </span>
          </div>
          <ProgressBar value={answeredQuestions} max={totalQuestions} size="sm" />
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <QuizQuestion
          question={currentQuestion}
          selectedOptionId={answers[currentQuestion.id]}
          onSelectOption={(optionId) => handleSelectAnswer(currentQuestion.id, optionId)}
          questionNumber={currentQuestionIndex + 1}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="bg-transparent"
        >
          Anterior
        </Button>

        <div className="flex gap-2">
          {questions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`flex h-8 w-8 items-center justify-center text-sm font-medium transition-colors ${
                index === currentQuestionIndex
                  ? "bg-primary text-primary-foreground"
                  : answers[q.id]
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-secondary-foreground"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestionIndex === totalQuestions - 1 ? (
          <Button onClick={handleSubmit} disabled={isSubmitting || answeredQuestions < totalQuestions}>
            {isSubmitting ? "Enviando..." : "Enviar Quiz"}
          </Button>
        ) : (
          <Button onClick={handleNext}>Siguiente</Button>
        )}
      </div>

      {/* Warning if not all answered */}
      {answeredQuestions < totalQuestions && currentQuestionIndex === totalQuestions - 1 && (
        <div className="mt-4 flex items-center gap-2 text-sm text-warning">
          <AlertCircle className="h-4 w-4" />
          Debes responder todas las preguntas para enviar el quiz
        </div>
      )}
    </div>
  )
}
