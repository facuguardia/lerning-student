"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, GripVertical, CheckCircle } from "lucide-react"

interface QuizOption {
  id: string
  option_text: string
  is_correct: boolean
  order_index: number
}

interface QuizQuestion {
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
  module_id: string
  modules: { id: string; title: string }
  quiz_questions: QuizQuestion[]
}

interface QuizEditorProps {
  quiz: Quiz | null
  modules: { id: string; title: string }[]
}

export function QuizEditor({ quiz, modules }: QuizEditorProps) {
  const [title, setTitle] = useState(quiz?.title || "")
  const [description, setDescription] = useState(quiz?.description || "")
  const [moduleId, setModuleId] = useState(quiz?.module_id || "")
  const [passingScore, setPassingScore] = useState(quiz?.passing_score || 70)
  const [timeLimit, setTimeLimit] = useState(quiz?.time_limit_minutes || 15)
  const [questions, setQuestions] = useState<
    {
      id: string
      question_text: string
      points: number
      options: { id: string; option_text: string; is_correct: boolean }[]
    }[]
  >(
    quiz?.quiz_questions.map((q) => ({
      id: q.id,
      question_text: q.question_text,
      points: q.points,
      options: q.quiz_options.map((o) => ({
        id: o.id,
        option_text: o.option_text,
        is_correct: o.is_correct,
      })),
    })) || [],
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        question_text: "",
        points: 1,
        options: [
          { id: `new-opt-${Date.now()}-1`, option_text: "", is_correct: true },
          { id: `new-opt-${Date.now()}-2`, option_text: "", is_correct: false },
          { id: `new-opt-${Date.now()}-3`, option_text: "", is_correct: false },
          { id: `new-opt-${Date.now()}-4`, option_text: "", is_correct: false },
        ],
      },
    ])
  }

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, field: string, value: string | number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === index
          ? {
              ...q,
              [field]: value,
            }
          : q,
      ),
    )
  }

  const updateOption = (questionIndex: number, optionIndex: number, field: string, value: string | boolean) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: q.options.map((o, j) =>
                j === optionIndex
                  ? { ...o, [field]: value }
                  : field === "is_correct" && value === true
                    ? { ...o, is_correct: false }
                    : o,
              ),
            }
          : q,
      ),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!title || !moduleId) {
      setError("El título y el módulo son obligatorios")
      setIsSubmitting(false)
      return
    }

    if (questions.length === 0) {
      setError("Debes agregar al menos una pregunta")
      setIsSubmitting(false)
      return
    }

    // Validate questions
    for (const q of questions) {
      if (!q.question_text.trim()) {
        setError("Todas las preguntas deben tener texto")
        setIsSubmitting(false)
        return
      }
      const hasCorrect = q.options.some((o) => o.is_correct)
      if (!hasCorrect) {
        setError("Cada pregunta debe tener al menos una respuesta correcta")
        setIsSubmitting(false)
        return
      }
      const hasOptions = q.options.every((o) => o.option_text.trim())
      if (!hasOptions) {
        setError("Todas las opciones deben tener texto")
        setIsSubmitting(false)
        return
      }
    }

    const supabase = createClient()

    try {
      if (quiz) {
        // Update existing quiz
        await supabase
          .from("quizzes")
          .update({
            title,
            description: description || null,
            module_id: moduleId,
            passing_score: passingScore,
            time_limit_minutes: timeLimit,
          })
          .eq("id", quiz.id)

        // Delete existing questions and options
        await supabase.from("quiz_questions").delete().eq("quiz_id", quiz.id)

        // Insert new questions and options
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i]
          const { data: newQuestion } = await supabase
            .from("quiz_questions")
            .insert({
              quiz_id: quiz.id,
              question_text: q.question_text,
              order_index: i + 1,
              points: q.points,
            })
            .select()
            .single()

          if (newQuestion) {
            const optionsToInsert = q.options.map((o, j) => ({
              question_id: newQuestion.id,
              option_text: o.option_text,
              is_correct: o.is_correct,
              order_index: j + 1,
            }))
            await supabase.from("quiz_options").insert(optionsToInsert)
          }
        }
      } else {
        // Create new quiz
        const { data: newQuiz } = await supabase
          .from("quizzes")
          .insert({
            title,
            description: description || null,
            module_id: moduleId,
            passing_score: passingScore,
            time_limit_minutes: timeLimit,
          })
          .select()
          .single()

        if (newQuiz) {
          for (let i = 0; i < questions.length; i++) {
            const q = questions[i]
            const { data: newQuestion } = await supabase
              .from("quiz_questions")
              .insert({
                quiz_id: newQuiz.id,
                question_text: q.question_text,
                order_index: i + 1,
                points: q.points,
              })
              .select()
              .single()

            if (newQuestion) {
              const optionsToInsert = q.options.map((o, j) => ({
                question_id: newQuestion.id,
                option_text: o.option_text,
                is_correct: o.is_correct,
                order_index: j + 1,
              }))
              await supabase.from("quiz_options").insert(optionsToInsert)
            }
          }
        }
      }

      router.push("/admin/quizzes")
      router.refresh()
    } catch (err) {
      console.error(err)
      setError("Error al guardar el quiz")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-8 text-3xl font-bold">{quiz ? "Editar Quiz" : "Nuevo Quiz"}</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Quiz details */}
        <div className="border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Información del Quiz</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título del quiz"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción del quiz"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="module">Módulo</Label>
              <Select value={moduleId} onValueChange={setModuleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un módulo" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passingScore">Nota mínima (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  min={1}
                  max={100}
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Tiempo (min)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min={1}
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Preguntas ({questions.length})</h2>
            <Button type="button" variant="outline" onClick={addQuestion} className="gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
              Agregar pregunta
            </Button>
          </div>

          {questions.map((question, qIndex) => (
            <div key={question.id} className="border border-border bg-card p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <span className="flex h-8 w-8 items-center justify-center bg-primary text-sm font-bold text-primary-foreground">
                    {qIndex + 1}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`points-${qIndex}`} className="text-sm">
                      Puntos:
                    </Label>
                    <Input
                      id={`points-${qIndex}`}
                      type="number"
                      min={1}
                      value={question.points}
                      onChange={(e) => updateQuestion(qIndex, "points", Number(e.target.value))}
                      className="w-16"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mb-4 space-y-2">
                <Label htmlFor={`question-${qIndex}`}>Pregunta</Label>
                <Textarea
                  id={`question-${qIndex}`}
                  value={question.question_text}
                  onChange={(e) => updateQuestion(qIndex, "question_text", e.target.value)}
                  placeholder="Escribe la pregunta"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Opciones (marca la correcta)</Label>
                {question.options.map((option, oIndex) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateOption(qIndex, oIndex, "is_correct", true)}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center ${option.is_correct ? "bg-success text-success-foreground" : "bg-secondary text-secondary-foreground"}`}
                    >
                      {option.is_correct && <CheckCircle className="h-4 w-4" />}
                      {!option.is_correct && String.fromCharCode(65 + oIndex)}
                    </button>
                    <Input
                      value={option.option_text}
                      onChange={(e) => updateOption(qIndex, oIndex, "option_text", e.target.value)}
                      placeholder={`Opción ${String.fromCharCode(65 + oIndex)}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {questions.length === 0 && (
            <div className="flex flex-col items-center justify-center border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">No hay preguntas. Haz clic en "Agregar pregunta" para comenzar.</p>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : quiz ? "Guardar cambios" : "Crear Quiz"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} className="bg-transparent">
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
