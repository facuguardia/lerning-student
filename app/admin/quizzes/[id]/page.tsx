import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { QuizEditor } from "@/components/admin/quiz-editor"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditQuizPage({ params }: PageProps) {
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
      modules(id, title),
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

  // Sort questions and options
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

  // Fetch all modules for selection
  const { data: modules } = await supabase.from("modules").select("id, title").order("order_index")

  return (
    <div className="p-8">
      <Link
        href="/admin/quizzes"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a quizzes
      </Link>

      <QuizEditor
        quiz={{
          ...quiz,
          quiz_questions: sortedQuestions,
        }}
        modules={modules || []}
      />
    </div>
  )
}
