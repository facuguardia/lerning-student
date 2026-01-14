import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AssignmentChat } from "@/components/chat/assignment-chat"
import { MessageSquare, CheckCircle, XCircle, Clock } from "lucide-react"

export default async function AdminChatPage({
  searchParams,
}: {
  searchParams: Promise<{ assignmentId?: string; userId?: string }>
}) {
  const { assignmentId: qpAssignmentId, userId: qpUserId } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Ensure admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  // Fetch chats with assignment and profile info
  const { data: chats } = await supabase
    .from("assignment_chats")
    .select(
      "*, assignments(id, title), profiles:profiles!assignment_chats_user_id_fkey(id, full_name, email)",
    )
    .order("updated_at", { ascending: false })

  const chatList = chats || []

  // Determine selected chat
  const selected =
    chatList.find((c: any) => c.assignment_id === qpAssignmentId && c.user_id === qpUserId) ||
    chatList[0] ||
    null

  // Determine approval (closed) for selected chat
  let isClosed = false
  if (selected) {
    const { data: submission } = await supabase
      .from("submissions")
      .select("is_approved")
      .eq("assignment_id", selected.assignment_id)
      .eq("user_id", selected.user_id)
      .maybeSingle()
    isClosed = submission?.is_approved === true
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6" />
          <h1 className="text-3xl font-bold tracking-tight">Chat</h1>
        </div>
        <Link href="/admin">
          <Button variant="outline">Volver al panel</Button>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Chat list */}
        <div className="space-y-2">
          <div className="border border-border bg-card">
            <div className="border-b border-border p-3">
              <p className="text-sm font-medium">Chats por trabajo práctico</p>
            </div>
            <div className="max-h-[520px] overflow-y-auto">
              {chatList.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">No hay chats creados aún</div>
              ) : (
                chatList.map((c: any) => {
                  const isSelected =
                    selected &&
                    selected.assignment_id === c.assignment_id &&
                    selected.user_id === c.user_id
                  const statusIcon =
                    c.closed_at
                      ? CheckCircle
                      : Clock
                  const Icon = statusIcon
                  return (
                    <Link
                      key={`${c.assignment_id}-${c.user_id}`}
                      href={`/admin/chat?assignmentId=${c.assignment_id}&userId=${c.user_id}`}
                      className={`flex items-center justify-between gap-3 border-b border-border p-3 text-sm transition-colors ${
                        isSelected ? "bg-secondary/50" : "hover:bg-secondary/40"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {c.assignments?.title || "Trabajo"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {c.profiles?.full_name || c.profiles?.email || "Estudiante"}
                        </p>
                      </div>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Chat detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <AssignmentChat
              assignmentId={selected.assignment_id}
              userId={selected.user_id}
              currentUserRole="admin"
              isClosed={isClosed}
            />
          ) : (
            <div className="border border-dashed border-border p-12 text-center text-muted-foreground">
              Selecciona un chat de la lista
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

