import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Lock, Clock } from "lucide-react"
import { FinalQuizInterface } from "@/components/final-quiz/quiz-interface"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Quiz Final",
  description: "Accede al quiz final del curso cuando completes los módulos.",
}

export default async function FinalQuizPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user has completed all modules
  const { data: allModules } = await supabase.from("modules").select("*").eq("is_published", true).order("order_index")

  const { data: quizAttempts } = await supabase
    .from("quiz_attempts")
    .select("*, quizzes(module_id)")
    .eq("user_id", user.id)
    .eq("passed", true)

  const completedModuleIds = new Set(quizAttempts?.map((a) => a.quizzes?.module_id) || [])
  const allModulesCompleted = allModules?.every((m) => completedModuleIds.has(m.id)) || false

  if (!allModulesCompleted) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-2xl">
          <div className="border border-warning bg-warning/5 p-8 text-center">
            <Lock className="mx-auto mb-4 h-16 w-16 text-warning" />
            <h1 className="mb-2 text-2xl font-bold">Quiz Final Bloqueado</h1>
            <p className="text-muted-foreground">
              Debes completar y aprobar todos los módulos del curso antes de acceder al quiz final.
            </p>
            <Link href="/dashboard/modules">
              <Button className="mt-6">Ver Módulos</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Fetch active final quiz
  const { data: finalQuiz } = await supabase
    .from("final_quiz")
    .select(
      `
      *,
      final_quiz_questions(
        id,
        question_text,
        order_index,
        final_quiz_options(
          id,
          option_text,
          is_correct,
          order_index
        )
      )
    `,
    )
    .eq("is_active", true)
    .single()

  if (!finalQuiz) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-2xl">
          <div className="border border-border bg-card p-8 text-center">
            <h1 className="mb-2 text-2xl font-bold">Quiz Final no Disponible</h1>
            <p className="text-muted-foreground">El quiz final aún no ha sido configurado por el administrador.</p>
          </div>
        </div>
      </div>
    )
  }

  // Check for cooldown
  const { data: lastAttempt } = await supabase
    .from("final_quiz_attempts")
    .select("*")
    .eq("quiz_id", finalQuiz.id)
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
            href="/dashboard"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al dashboard
          </Link>

          <div className="mx-auto max-w-2xl">
            <div className="border border-accent bg-accent/5 p-8 text-center">
              <Clock className="mx-auto mb-4 h-16 w-16 text-accent" />
              <h1 className="mb-2 text-2xl font-bold">Tiempo de Espera</h1>
              <p className="mb-4 text-muted-foreground">
                Debes esperar 6 horas antes de volver a intentar el quiz final.
              </p>
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
            </div>
          </div>
        </div>
      )
    }
  }

  // Sort questions and options
  const sortedQuestions = finalQuiz.final_quiz_questions
    .sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
    .map((q: any) => ({
      ...q,
      final_quiz_options: q.final_quiz_options.sort(
        (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index,
      ),
    }))

  return (
    <div className="p-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al dashboard
      </Link>

      <FinalQuizInterface
        quiz={{
          ...finalQuiz,
          final_quiz_questions: sortedQuestions,
        }}
        userId={user.id}
      />
    </div>
  )
}
