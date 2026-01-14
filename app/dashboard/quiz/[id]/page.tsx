import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Clock } from "lucide-react";
import { QuizInterface } from "@/components/quiz/quiz-interface";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QuizPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
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
    `
    )
    .eq("id", id)
    .single();

  if (!quiz) {
    notFound();
  }

  const { data: moduleAssignments } = await supabase
    .from("assignments")
    .select("id, lessons(module_id)")
    .eq("lessons.module_id", quiz.modules.id);

  const assignmentIds = moduleAssignments?.map((a) => a.id) || [];

  const { data: userSubmissions } = await supabase
    .from("submissions")
    .select("id, assignment_id, is_approved")
    .eq("user_id", user.id)
    .in("assignment_id", assignmentIds);

  const allAssignmentsApproved =
    assignmentIds.length === 0 ||
    assignmentIds.every((assignmentId) => {
      const submission = userSubmissions?.find(
        (s) => s.assignment_id === assignmentId
      );
      return submission?.is_approved === true;
    });

  const { data: lastAttempt } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("quiz_id", id)
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(1)
    .single();

  const lastFailedAttempt =
    lastAttempt && lastAttempt.passed === false ? lastAttempt : null;
  let quizCooldownRemaining = 0;
  if (lastFailedAttempt) {
    const sixHoursInMs = 6 * 60 * 60 * 1000;
    const timeSinceAttempt =
      Date.now() - new Date(lastFailedAttempt.created_at).getTime();
    quizCooldownRemaining = Math.max(0, sixHoursInMs - timeSinceAttempt);
  }
  const isQuizBlocked = !allAssignmentsApproved || quizCooldownRemaining > 0;

  // Sort questions by order_index and options
  const sortedQuestions = quiz.quiz_questions
    .sort(
      (a: { order_index: number }, b: { order_index: number }) =>
        a.order_index - b.order_index
    )
    .map(
      (q: {
        id: string;
        question_text: string;
        order_index: number;
        points: number;
        quiz_options: {
          id: string;
          option_text: string;
          is_correct: boolean;
          order_index: number;
        }[];
      }) => ({
        ...q,
        quiz_options: q.quiz_options.sort(
          (a: { order_index: number }, b: { order_index: number }) =>
            a.order_index - b.order_index
        ),
      })
    );

  return (
    <div className="p-8">
      <Link
        href={`/dashboard/modules/${quiz.modules.id}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al módulo
      </Link>

      {isQuizBlocked ? (
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 border border-border bg-card p-6">
            <div className="mb-3 flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Quiz bloqueado</span>
            </div>
            {!allAssignmentsApproved && (
              <p className="text-sm text-muted-foreground">
                Debes aprobar todos los trabajos prácticos del módulo antes de
                rendir el quiz.
              </p>
            )}
            {quizCooldownRemaining > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                Debes esperar{" "}
                {Math.ceil(quizCooldownRemaining / (60 * 60 * 1000))} horas
                antes de reintentar.
              </p>
            )}
            <div className="mt-4">
              <Button disabled className="w-full">
                <Lock className="mr-2 h-4 w-4" />
                Quiz bloqueado
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <QuizInterface
          quiz={{
            ...quiz,
            quiz_questions: sortedQuestions,
          }}
          userId={user.id}
        />
      )}
    </div>
  );
}
