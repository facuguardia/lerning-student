import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ModuleCard } from "@/components/dashboard/module-card";
import { ProgressBar } from "@/components/dashboard/progress-bar";

export default async function ModulesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch all modules
  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("is_published", true)
    .order("order_index");

  // Fetch user's quiz attempts
  const { data: quizAttempts } = await supabase
    .from("quiz_attempts")
    .select("*, quizzes(module_id)")
    .eq("user_id", user.id);

  // Fetch module progress
  const { data: moduleProgress } = await supabase
    .from("module_progress")
    .select("*")
    .eq("user_id", user.id);

  const { data: lessons } = await supabase
    .from("lessons")
    .select("module_id, assignments(id)");
  const { data: submissions } = await supabase
    .from("submissions")
    .select("assignment_id, is_approved")
    .eq("user_id", user.id);

  const assignmentsByModule = new Map<string, string[]>();
  lessons?.forEach((l: any) => {
    const current = assignmentsByModule.get(l.module_id) || [];
    const ids = (l.assignments || []).map((a: any) => a.id);
    assignmentsByModule.set(l.module_id, current.concat(ids));
  });

  const areModuleAssignmentsApproved = (moduleId: string) => {
    const ids = assignmentsByModule.get(moduleId) || [];
    if (ids.length === 0) return true;
    return ids.every((assignmentId) => {
      const submission = submissions?.find(
        (s: any) => s.assignment_id === assignmentId
      );
      return submission?.is_approved === true;
    });
  };

  const isModuleCompleted = (moduleId: string) => {
    const progress = moduleProgress?.find((p) => p.module_id === moduleId);
    const assignmentsApproved = areModuleAssignmentsApproved(moduleId);
    const attempts = quizAttempts?.filter(
      (a: { quizzes: { module_id: string } | null; passed: boolean }) =>
        a.quizzes?.module_id === moduleId && a.passed
    );
    const passedQuiz = !!attempts && attempts.length > 0;
    return assignmentsApproved && (passedQuiz || !!progress?.completed_at);
  };

  const moduleStates = (modules || []).map((module, index, arr) => {
    const isFirst = index === 0;
    const prevModuleId = !isFirst ? arr[index - 1].id : null;
    const prevCompleted = prevModuleId ? isModuleCompleted(prevModuleId) : true;
    return {
      ...module,
      isUnlocked: isFirst ? true : prevCompleted,
    };
  });

  const getModuleQuizScore = (moduleId: string) => {
    const attempts = quizAttempts?.filter(
      (a: { quizzes: { module_id: string } | null }) =>
        a.quizzes?.module_id === moduleId
    );
    if (!attempts || attempts.length === 0) return null;
    return Math.max(
      ...attempts.map((a: { percentage: number }) => a.percentage)
    );
  };

  const completedModules = moduleStates.filter((m) =>
    isModuleCompleted(m.id)
  ).length;
  const totalModules = moduleStates.length;
  const overallProgress =
    totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Módulos del Curso</h1>
        <p className="mt-1 text-muted-foreground">
          Completa cada módulo en orden. Debes aprobar todos los trabajos
          prácticos y el quiz para desbloquear el siguiente.
        </p>
      </div>

      {/* Progress Overview */}
      <div className="mb-8 border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Progreso general</p>
            <p className="text-2xl font-bold">
              {completedModules}/{totalModules} módulos
            </p>
          </div>
          <p className="text-3xl font-bold">{Math.round(overallProgress)}%</p>
        </div>
        <ProgressBar value={overallProgress} size="lg" />
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {moduleStates.map((module, index) => (
          <div key={module.id} className="relative">
            {/* Connection line */}
            {index < moduleStates.length - 1 && (
              <div className="absolute left-[19px] top-full z-0 h-4 w-0.5 bg-border" />
            )}
            <ModuleCard
              module={module}
              index={index}
              isUnlocked={module.isUnlocked}
              isCompleted={isModuleCompleted(module.id)}
              quizScore={getModuleQuizScore(module.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
