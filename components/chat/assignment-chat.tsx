"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type {
  AssignmentChat,
  AssignmentMessage,
  ChatSenderRole,
} from "@/lib/types";
import { MessageSquare, Lock, Download, RefreshCcw } from "lucide-react";

interface AssignmentChatProps {
  assignmentId: string;
  userId: string;
  currentUserRole: ChatSenderRole;
  isClosed: boolean;
}

export function AssignmentChat({
  assignmentId,
  userId,
  currentUserRole,
  isClosed,
}: AssignmentChatProps) {
  const supabase = createClient();
  const [chat, setChat] = useState<AssignmentChat | null>(null);
  const [messages, setMessages] = useState<AssignmentMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [closed, setClosed] = useState<boolean>(isClosed);
  const [assignmentTitle, setAssignmentTitle] = useState<string | null>(null);

  const canWrite = useMemo(() => !closed, [closed]);

  const loadChatAndMessages = async () => {
    setLoading(true);
    setError(null);
    // Fetch or initialize chat reference
    const { data: existingChat } = await supabase
      .from("assignment_chats")
      .select("*")
      .eq("assignment_id", assignmentId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingChat) {
      setChat(existingChat as AssignmentChat);
      const { data: msgs } = await supabase
        .from("assignment_messages")
        .select("*")
        .eq("chat_id", existingChat.id)
        .order("created_at", { ascending: true });
      setMessages((msgs || []) as AssignmentMessage[]);
    } else {
      setChat(null);
      setMessages([]);
    }

    setLoading(false);
    setTimeout(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
  };

  useEffect(() => {
    loadChatAndMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId, userId]);

  useEffect(() => {
    (async () => {
      const { data: submission } = await supabase
        .from("submissions")
        .select("is_approved")
        .eq("assignment_id", assignmentId)
        .eq("user_id", userId)
        .maybeSingle();
      setClosed(submission?.is_approved === true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId, userId]);

  useEffect(() => {
    (async () => {
      const { data: assignment } = await supabase
        .from("assignments")
        .select("title")
        .eq("id", assignmentId)
        .single();
      setAssignmentTitle(assignment?.title ?? null);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  // Realtime disabled: actualización manual mediante botón "Actualizar"

  const handleSend = async () => {
    const content = input.trim();
    if (!content) return;
    setSending(true);
    setError(null);

    // Ensure chat exists
    let chatId = chat?.id;
    if (!chatId) {
      const { data: created, error: createErr } = await supabase
        .from("assignment_chats")
        .insert({ assignment_id: assignmentId, user_id: userId })
        .select("*")
        .single();
      if (createErr) {
        setError("No se pudo iniciar el chat");
        setSending(false);
        return;
      }
      chatId = created.id;
      setChat(created as AssignmentChat);
    }

    // Get current user id for sender
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Sesión no encontrada");
      setSending(false);
      return;
    }

    const { data: inserted, error: sendErr } = await supabase
      .from("assignment_messages")
      .insert({
        chat_id: chatId,
        sender_id: user.id,
        sender_role: currentUserRole,
        content,
      })
      .select("*")
      .single();

    if (sendErr) {
      setError("No se pudo enviar el mensaje");
      setSending(false);
      return;
    }

    setInput("");
    if (inserted) {
      setMessages((prev) => [...prev, inserted as AssignmentMessage]);
      setTimeout(() => {
        listRef.current?.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 30);
    }
    setSending(false);
  };

  const handleDownloadPdf = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const pdfTitle = assignmentTitle
      ? `Chat - Trabajo Práctico: ${assignmentTitle}`
      : "Historial de chat - Trabajo Práctico";
    const styles = `
      <style>
        body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; color: #0a0a0a; background: #fff; padding: 32px; }
        .container { max-width: 880px; margin: 0 auto; }
        h1 { font-size: 22px; margin: 0 0 12px; }
        .meta { font-size: 13px; color: #444; margin-bottom: 18px; }
        .msg { border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; }
        .msg-admin { background: #f5f8ff; border: 1px solid #dbe7ff; }
        .msg-student { background: #f9f9f9; border: 1px solid #eaeaea; }
        .msg .who { font-weight: 600; }
        .msg .time { font-size: 11px; color: #777; }
        .msg .content { margin-top: 6px; white-space: pre-wrap; }
        @media print {
          body { padding: 0; }
          .container { margin: 0; }
        }
      </style>
    `;
    const html = `
      <html>
        <head>
          <title>${pdfTitle}</title>
          ${styles}
        </head>
        <body>
          <div class="container">
            <h1>${pdfTitle}</h1>
            ${
              assignmentTitle
                ? `<div class="meta">${escapeHtml(assignmentTitle)}</div>`
                : ""
            }
            ${messages
              .map((m) => {
                const who =
                  m.sender_role === "admin" ? "Administrador" : "Alumno";
                const time = new Date(m.created_at).toLocaleString("es-ES");
                const content = escapeHtml(m.content);
                const roleClass =
                  m.sender_role === "admin" ? "msg-admin" : "msg-student";
                return `<div class="msg ${roleClass}"><div class="who">${who}</div><div class="time">${time}</div><div class="content">${content}</div></div>`;
              })
              .join("")}
          </div>
        </body>
      </html>
    `;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    // Give the document a brief moment to render before print
    setTimeout(() => w.print(), 200);
  };

  const escapeHtml = (str: string) => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  return (
    <div className="border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Chat con el administrador</h3>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadChatAndMessages}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          {isClosed && (
            <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
          )}
        </div>
      </div>

      {isClosed && (
        <div className="mb-4 flex items-center gap-2 rounded border border-warning/50 bg-warning/10 p-3 text-sm text-warning">
          <Lock className="h-4 w-4" />
          Chat cerrado: el trabajo fue aprobado. Solo lectura y descarga
          disponible.
        </div>
      )}

      <div
        ref={listRef}
        className="max-h-[320px] overflow-y-auto rounded border border-border bg-secondary/40 p-3"
      >
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando mensajes...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin mensajes aún.</p>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.sender_role === "admin" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded px-3 py-2 text-sm ${
                    m.sender_role === "admin"
                      ? "bg-accent/10 text-foreground"
                      : "bg-background border border-border text-foreground"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>
                      {m.sender_role === "admin" ? "Administrador" : "Alumno"}
                    </span>
                    <span>
                      {new Date(m.created_at).toLocaleString("es-ES")}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-end gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={canWrite ? "Escribe tu mensaje..." : "Chat cerrado"}
          rows={3}
          disabled={!canWrite || sending}
        />
        <Button onClick={handleSend} disabled={!canWrite || sending}>
          {sending ? "Enviando..." : "Enviar"}
        </Button>
      </div>

      {error && <div className="mt-3 text-sm text-destructive">{error}</div>}
    </div>
  );
}
