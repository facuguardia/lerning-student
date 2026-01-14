"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface FinalQuizOption {
  id: string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
}

interface FinalQuizQuestion {
  id: string;
  question_text: string;
  order_index: number;
  final_quiz_options: FinalQuizOption[];
}

interface FinalQuiz {
  id: string;
  title: string;
  description: string | null;
  passing_score: number;
  time_limit_minutes: number | null;
  is_active: boolean;
  final_quiz_questions: FinalQuizQuestion[];
}

interface FinalQuizEditorProps {
  quiz: FinalQuiz | null;
}

export function FinalQuizEditor({ quiz }: FinalQuizEditorProps) {
  const [title, setTitle] = useState(quiz?.title || "Quiz Final");
  const [description, setDescription] = useState(quiz?.description || "");
  const [passingScore, setPassingScore] = useState(quiz?.passing_score || 70);
  const [timeLimit, setTimeLimit] = useState(quiz?.time_limit_minutes || 90);
  const [isActive, setIsActive] = useState(quiz?.is_active ?? true);
  const [questions, setQuestions] = useState<
    {
      id: string;
      question_text: string;
      options: { id: string; option_text: string; is_correct: boolean }[];
    }[]
  >(
    quiz?.final_quiz_questions.map((q) => ({
      id: q.id,
      question_text: q.question_text,
      options: q.final_quiz_options.map((o) => ({
        id: o.id,
        option_text: o.option_text,
        is_correct: o.is_correct,
      })),
    })) || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        question_text: "",
        options: [
          { id: crypto.randomUUID(), option_text: "", is_correct: false },
          { id: crypto.randomUUID(), option_text: "", is_correct: false },
        ],
      },
    ]);
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuestionText = (id: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, question_text: text } : q))
    );
  };

  const addOption = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: [
                ...q.options,
                { id: crypto.randomUUID(), option_text: "", is_correct: false },
              ],
            }
          : q
      )
    );
  };

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.filter((o) => o.id !== optionId) }
          : q
      )
    );
  };

  const updateOptionText = (
    questionId: string,
    optionId: string,
    text: string
  ) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((o) =>
                o.id === optionId ? { ...o, option_text: text } : o
              ),
            }
          : q
      )
    );
  };

  const toggleOptionCorrect = (questionId: string, optionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((o) =>
                o.id === optionId ? { ...o, is_correct: !o.is_correct } : o
              ),
            }
          : q
      )
    );
  };

  const validate = () => {
    if (questions.length < 1) {
      return "El quiz final debe tener al menos 1 pregunta";
    }
    for (const q of questions) {
      if (!q.question_text.trim()) {
        return "Todas las preguntas deben tener enunciado";
      }
      if (q.options.length < 2) {
        return "Cada pregunta debe tener al menos 2 opciones";
      }
      if (!q.options.some((o) => o.is_correct)) {
        return "Cada pregunta debe tener al menos una opción correcta";
      }
      for (const o of q.options) {
        if (!o.option_text.trim()) {
          return "Todas las opciones deben tener texto";
        }
      }
    }
    if (passingScore < 0 || passingScore > 100) {
      return "La nota mínima debe estar entre 0 y 100";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSubmitting(true);
    const supabase = createClient();

    if (quiz) {
      const { error: updateError } = await supabase
        .from("final_quiz")
        .update({
          title,
          description: description || null,
          passing_score: passingScore,
          time_limit_minutes: timeLimit,
          is_active: isActive,
        })
        .eq("id", quiz.id);
      if (updateError) {
        setError("No se pudo actualizar el quiz");
        setIsSubmitting(false);
        return;
      }
      if (isActive) {
        await supabase
          .from("final_quiz")
          .update({ is_active: false })
          .neq("id", quiz.id);
      }
      await supabase
        .from("final_quiz_questions")
        .delete()
        .eq("quiz_id", quiz.id);
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const { data: newQuestion } = await supabase
          .from("final_quiz_questions")
          .insert({
            quiz_id: quiz.id,
            question_text: q.question_text,
            order_index: i + 1,
          })
          .select()
          .single();
        if (newQuestion) {
          const optionsToInsert = q.options.map((o, j) => ({
            question_id: newQuestion.id,
            option_text: o.option_text,
            is_correct: o.is_correct,
            order_index: j + 1,
          }));
          await supabase.from("final_quiz_options").insert(optionsToInsert);
        }
      }
    } else {
      const { data: newQuiz, error: insertError } = await supabase
        .from("final_quiz")
        .insert({
          title,
          description: description || null,
          passing_score: passingScore,
          time_limit_minutes: timeLimit,
          is_active: isActive,
        })
        .select()
        .single();
      if (insertError || !newQuiz) {
        setError("No se pudo crear el quiz");
        setIsSubmitting(false);
        return;
      }
      if (isActive) {
        await supabase
          .from("final_quiz")
          .update({ is_active: false })
          .neq("id", newQuiz.id);
      }
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const { data: newQuestion } = await supabase
          .from("final_quiz_questions")
          .insert({
            quiz_id: newQuiz.id,
            question_text: q.question_text,
            order_index: i + 1,
          })
          .select()
          .single();
        if (newQuestion) {
          const optionsToInsert = q.options.map((o, j) => ({
            question_id: newQuestion.id,
            option_text: o.option_text,
            is_correct: o.is_correct,
            order_index: j + 1,
          }));
          await supabase.from("final_quiz_options").insert(optionsToInsert);
        }
      }
    }
    setIsSubmitting(false);
    router.push("/admin/final-quiz");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Título</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Descripción</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Nota mínima (%)</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label>Límite de tiempo (min)</Label>
          <Input
            type="number"
            min={0}
            value={timeLimit ?? 0}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
          />
        </div>
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isActive}
            onCheckedChange={(v) => setIsActive(!!v)}
          />
          <Label>Activar como quiz final vigente</Label>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Preguntas</span>
          </div>
          <Button
            type="button"
            size="sm"
            className="gap-2"
            onClick={addQuestion}
          >
            <Plus className="h-4 w-4" />
            Agregar pregunta
          </Button>
        </div>

        <div className="space-y-6 p-4">
          {questions.map((q, qIndex) => (
            <div key={q.id} className="rounded-md border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold">
                  Pregunta {qIndex + 1}
                </span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                  onClick={() => removeQuestion(q.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Enunciado</Label>
                <Textarea
                  value={q.question_text}
                  onChange={(e) => updateQuestionText(q.id, e.target.value)}
                />
              </div>
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Opciones</span>
                  <Button
                    type="button"
                    size="sm"
                    className="gap-2"
                    onClick={() => addOption(q.id)}
                  >
                    <Plus className="h-4 w-4" />
                    Agregar opción
                  </Button>
                </div>
                <div className="space-y-3">
                  {q.options.map((o) => (
                    <div key={o.id} className="flex items-center gap-3">
                      <Checkbox
                        checked={o.is_correct}
                        onCheckedChange={() => toggleOptionCorrect(q.id, o.id)}
                        aria-label="Es correcta"
                      />
                      <Input
                        placeholder="Texto de la opción"
                        value={o.option_text}
                        onChange={(e) =>
                          updateOptionText(q.id, o.id, e.target.value)
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(q.id, o.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <div className="text-destructive text-sm">{error}</div>}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar Quiz Final"}
        </Button>
      </div>
    </form>
  );
}
