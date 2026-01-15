import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactRequest {
  id: string;
  full_name: string;
  email: string;
  message: string;
  created_at?: string;
}

export default async function AdminContactsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: contacts } = await supabase
    .from("contact_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mail className="h-6 w-6" />
          <h1 className="text-3xl font-bold tracking-tight">
            Mensajes de contacto
          </h1>
        </div>
      </div>

      <div className="space-y-4">
        {!contacts || contacts.length === 0 ? (
          <div className="border border-border bg-card p-6 text-sm text-muted-foreground">
            No hay mensajes de contacto aún.
          </div>
        ) : (
          contacts.map((c: ContactRequest, index: number) => (
            <div
              key={c.id ?? index}
              className="border border-border bg-card p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-secondary text-sm font-semibold uppercase text-secondary-foreground">
                    {getInitials(c.full_name, c.email)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <p className="font-semibold">{c.full_name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.created_at
                        ? format(new Date(c.created_at), "d 'de' MMMM, HH:mm", {
                            locale: es,
                          })
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex justify-center">
                  {(() => {
                    const subject = `Hola 👋🏻, ${c.full_name} esta es la respuesta a tu consulta en Vibe Learning`;
                    const href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                      c.email
                    )}&su=${encodeURIComponent(subject)}`;
                    return (
                      <Button asChild size="sm" className="mt-2">
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Responder por correo
                        </a>
                      </Button>
                    );
                  })()}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {c.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function getInitials(name?: string, email?: string) {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(" ");
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    return `${first}${last}`.toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "??";
}
