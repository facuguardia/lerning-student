import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { QuizEditor } from "@/components/admin/quiz-editor"

export default async function NewQuizPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

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

      <QuizEditor quiz={null} modules={modules || []} />
    </div>
  )
}
