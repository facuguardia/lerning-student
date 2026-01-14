import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Lock, Clock } from "lucide-react"
import { QuizInterface } from "@/components/quiz/quiz-interface"
import { Button } from "@/components/ui/button"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function QuizPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch quiz with questions and options
  const { data: quiz } = await supabase
    .from("quizzes")
    .select(
      `
      *,
      modules(id, title, order_index),
      quiz_questions(
        id,
        question_text,
        order_index,
        points,
        quiz_options(
          id,
          option_text,
          is_correct,
          order_index
        )
      )
    `,
    )
    .eq("id", id)
    .single()

  if (!quiz) {
    notFound()
  }

  const { data: moduleAssignments } = await supabase
    .from("assignments")
    .select("id, lessons(module_id)")
    .eq("lessons.module_id", quiz.modules.id)

  const assignmentIds = moduleAssignments?.map((a) => a.id) || []

  const { data: userSubmissions } = await supabase
    .from("submissions")
    .select("id, assignment_id, is_approved")
    .eq("user_id", user.id)
    .in("assignment_id", assignmentIds)

  const allAssignmentsApproved =
    assignmentIds.length === 0 ||
    assignmentIds.every((assignmentId) => {
      const submission = userSubmissions?.find((s) => s.assignment_id === assignmentId)
      return submission?.is_approved === true
    })

  if (!allAssignmentsApproved) {
    return (
      <div className="p-8">
        <Link
          href={`/dashboard/modules/${quiz.modules.id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al módulo
        </Link>

        <div className="mx-auto max-w-2xl">
          <div className="border border-warning bg-warning/5 p-8 text-center">
            <Lock className="mx-auto mb-4 h-16 w-16 text-warning" />
            <h1 className="mb-2 text-2xl font-bold">Quiz Bloqueado</h1>
            <p className="text-muted-foreground">
              Debes aprobar todos los trabajos prácticos del módulo "{quiz.modules.title}" antes de poder realizar este
              quiz.
            </p>
            <Link href={`/dashboard/modules/${quiz.modules.id}`}>
              <Button className="mt-6">Volver al módulo</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { data: lastAttempt } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("quiz_id", id)
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(1)
    .single()

  if (lastAttempt && !lastAttempt.passed && lastAttempt.next_attempt_at) {
    const nextAttemptTime = new Date(lastAttempt.next_attempt_at)
    const now = new Date()

    if (now < nextAttemptTime) {
      const hoursLeft = Math.ceil((nextAttemptTime.getTime() - now.getTime()) / (1000 * 60 * 60))
      const minutesLeft = Math.ceil((nextAttemptTime.getTime() - now.getTime()) / (1000 * 60))

      return (
        <div className="p-8">
          <Link
            href={`/dashboard/modules/${quiz.modules.id}`}
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al módulo
          </Link>

          <div className="mx-auto max-w-2xl">
            <div className="border border-accent bg-accent/5 p-8 text-center">
              <Clock className="mx-auto mb-4 h-16 w-16 text-accent" />
              <h1 className="mb-2 text-2xl font-bold">Tiempo de Espera</h1>
              <p className="mb-4 text-muted-foreground">Debes esperar 6 horas antes de volver a intentar este quiz.</p>
              <div className="mb-2 text-3xl font-bold text-accent">
                {hoursLeft > 0 ? `${hoursLeft}h` : `${minutesLeft}m`}
              </div>
              <p className="text-sm text-muted-foreground">
                Podrás intentarlo nuevamente el{" "}
                {nextAttemptTime.toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <Link href={`/dashboard/modules/${quiz.modules.id}`}>
                <Button className="mt-6 bg-transparent" variant="outline">
                  Volver al módulo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )
    }
  }

  // Check if module is unlocked (previous logic)
  const { data: allModules } = await supabase.from("modules").select("*").eq("is_published", true).order("order_index")

  const { data: quizAttempts } = await supabase
    .from("quiz_attempts")
    .select("*, quizzes(module_id)")
    .eq("user_id", user.id)

  const moduleIndex = allModules?.findIndex((m) => m.id === quiz.modules.id) ?? 0
  let isUnlocked = moduleIndex === 0

  if (moduleIndex > 0) {
    const prevModule = allModules![moduleIndex - 1]
    const prevModuleAttempts = quizAttempts?.filter(
      (a: { quizzes: { module_id: string } | null; passed: boolean }) =>
        a.quizzes?.module_id === prevModule.id && a.passed,
    )
    isUnlocked = prevModuleAttempts && prevModuleAttempts.length > 0
  }

  if (!isUnlocked) {
    redirect("/dashboard/modules")
  }

  // Sort questions by order_index and options
  const sortedQuestions = quiz.quiz_questions
    .sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
    .map(
      (q: {
        id: string
        question_text: string
        order_index: number
        points: number
        quiz_options: { id: string; option_text: string; is_correct: boolean; order_index: number }[]
      }) => ({
        ...q,
        quiz_options: q.quiz_options.sort(
          (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index,
        ),
      }),
    )

  return (
    <div className="p-8">
      <Link
        href={`/dashboard/modules/${quiz.modules.id}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al módulo
      </Link>

      <QuizInterface
        quiz={{
          ...quiz,
          quiz_questions: sortedQuestions,
        }}
        userId={user.id}
      />
    </div>
  )
}
