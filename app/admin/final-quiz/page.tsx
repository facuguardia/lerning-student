import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Edit } from "lucide-react"

export default async function AdminFinalQuizPage() {
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
  const { data: quizzes } = await supabase
    .from("final_quiz")
    .select("*, final_quiz_questions(id)")
    .order("created_at", { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quiz Final</h1>
          <p className="mt-1 text-muted-foreground">
            Crea y edita el cuestionario final del curso
          </p>
        </div>
        <Link href="/admin/final-quiz/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Quiz Final
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden border border-border">
        <table className="w-full">
          <thead className="bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Título</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Preguntas</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Nota Mínima</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Tiempo</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Activo</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {quizzes?.map((q) => (
              <tr key={q.id} className="border-t">
                <td className="px-4 py-3 text-sm">{q.title}</td>
                <td className="px-4 py-3 text-sm">{q.final_quiz_questions?.length || 0}</td>
                <td className="px-4 py-3 text-sm">{q.passing_score}%</td>
                <td className="px-4 py-3 text-sm">{q.time_limit_minutes ?? "Sin límite"}</td>
                <td className="px-4 py-3 text-sm">{q.is_active ? "Sí" : "No"}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/final-quiz/${q.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
            {(!quizzes || quizzes.length === 0) && (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-muted-foreground" colSpan={6}>
                  No hay quizzes finales configurados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
