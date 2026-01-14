import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { FinalQuizEditor } from "@/components/admin/final-quiz-editor"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditFinalQuizPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile || profile.role !== "admin") {
    redirect("/dashboard")
  }

  const { data: quiz } = await supabase
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
    .eq("id", id)
    .single()

  if (!quiz) {
    notFound()
  }

  const sortedQuestions = quiz.final_quiz_questions
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
        href="/admin/final-quiz"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al Quiz Final
      </Link>
      <FinalQuizEditor
        quiz={{
          ...quiz,
          final_quiz_questions: sortedQuestions,
        }}
      />
    </div>
  )
}
