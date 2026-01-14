import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ModuleCard } from "@/components/dashboard/module-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { BookOpen, Award, FileText, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("is_published", true)
    .order("order_index");

  const { data: quizAttempts } = await supabase
    .from("quiz_attempts")
    .select("*, quizzes(module_id)")
    .eq("user_id", user.id);

  const { data: moduleProgress } = await supabase
    .from("module_progress")
    .select("*")
    .eq("user_id", user.id);

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, module_id, assignments(id)");

  const assignmentIds =
    lessons?.flatMap((l) => l.assignments.map((a: any) => a.id)) || [];

  const { data: submissions } = await supabase
    .from("submissions")
    .select("assignment_id, status, is_approved")
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

  const getModuleProgressPercent = (moduleId: string) => {
    if (isModuleCompleted(moduleId)) return 100;
    const ids = assignmentsByModule.get(moduleId) || [];
    const total = ids.length;
    if (total === 0) return 0;
    const approved = ids.filter((assignmentId) => {
      const submission = submissions?.find(
        (s: any) => s.assignment_id === assignmentId
      );
      return submission?.is_approved === true;
    }).length;
    return Math.round((approved / total) * 100);
  };

  const completedModules = moduleStates.filter((m) =>
    isModuleCompleted(m.id)
  ).length;
  const totalModules = moduleStates.length;
  const overallProgress =
    totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

  const passedAttempts =
    quizAttempts?.filter((a: { passed: boolean }) => a.passed) || [];
  const averageScore =
    passedAttempts.length > 0
      ? passedAttempts.reduce(
          (acc: number, a: { percentage: number }) => acc + a.percentage,
          0
        ) / passedAttempts.length
      : 0;

  const unlockedModuleIds = moduleStates
    .filter((m) => m.isUnlocked)
    .map((m) => m.id);
  const unlockedLessons =
    lessons?.filter((l) => unlockedModuleIds.includes(l.module_id)) || [];
  const unlockedAssignmentIds = unlockedLessons.flatMap((l) =>
    l.assignments.map((a: any) => a.id)
  );

  const pendingAssignments = unlockedAssignmentIds.filter((assignmentId) => {
    const submission = submissions?.find(
      (s) => s.assignment_id === assignmentId
    );
    return !submission || submission.status !== "approved";
  }).length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Bienvenido, {profile?.full_name || "Estudiante"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Continúa tu aprendizaje donde lo dejaste
        </p>
      </div>

      {/* Overall Progress */}
      <div className="mb-8 border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Progreso del Curso</h2>
            <p className="text-sm text-muted-foreground">
              {completedModules} de {totalModules} módulos completados
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{Math.round(overallProgress)}%</p>
            <p className="text-xs text-muted-foreground">completado</p>
          </div>
        </div>
        <ProgressBar value={overallProgress} size="lg" />
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Módulos Completados"
          value={completedModules}
          subtitle={`de ${totalModules} módulos`}
          icon={<BookOpen className="h-5 w-5 text-muted-foreground" />}
        />
        <StatsCard
          title="Quizzes Aprobados"
          value={passedAttempts.length}
          subtitle="quizzes pasados"
          icon={<Award className="h-5 w-5 text-muted-foreground" />}
        />
        <StatsCard
          title="Promedio General"
          value={`${Math.round(averageScore)}%`}
          subtitle="en quizzes aprobados"
          icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
        />
        <StatsCard
          title="Trabajos Pendientes"
          value={pendingAssignments}
          subtitle="por entregar/aprobar"
          icon={<FileText className="h-5 w-5 text-muted-foreground" />}
        />
      </div>

      {/* Modules Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Módulos del Curso</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {moduleStates.map((module, index) => (
            <ModuleCard
              key={module.id}
              module={module}
              index={index}
              isUnlocked={module.isUnlocked}
              isCompleted={isModuleCompleted(module.id)}
              quizScore={getModuleQuizScore(module.id)}
              progressPercent={getModuleProgressPercent(module.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
