import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2 } from "lucide-react"

export default async function AdminQuizzesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch quizzes with module and question count
  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("*, modules(title), quiz_questions(id)")
    .order("created_at", { ascending: false })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Quizzes</h1>
          <p className="mt-1 text-muted-foreground">Crea y edita quizzes con preguntas de opción múltiple</p>
        </div>
        <Link href="/admin/quizzes/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Quiz
          </Button>
        </Link>
      </div>

      {/* Quizzes table */}
      <div className="overflow-hidden border border-border">
        <table className="w-full">
          <thead className="bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Quiz</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Módulo</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Preguntas</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Nota Mínima</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {quizzes?.map((quiz) => (
              <tr key={quiz.id} className="bg-card">
                <td className="px-4 py-3">
                  <p className="font-medium">{quiz.title}</p>
                  {quiz.description && <p className="text-sm text-muted-foreground line-clamp-1">{quiz.description}</p>}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{quiz.modules.title}</td>
                <td className="px-4 py-3 text-sm">{quiz.quiz_questions.length} preguntas</td>
                <td className="px-4 py-3 text-sm">{quiz.passing_score}%</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/quizzes/${quiz.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
