-- Drop existing problematic policies
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;
DROP POLICY IF EXISTS "modules_admin_all" ON public.modules;
DROP POLICY IF EXISTS "quizzes_admin_all" ON public.quizzes;
DROP POLICY IF EXISTS "quiz_questions_admin_all" ON public.quiz_questions;
DROP POLICY IF EXISTS "quiz_options_admin_all" ON public.quiz_options;
DROP POLICY IF EXISTS "quiz_attempts_admin_select" ON public.quiz_attempts;
DROP POLICY IF EXISTS "assignments_admin_all" ON public.assignments;
DROP POLICY IF EXISTS "submissions_admin_all" ON public.submissions;
DROP POLICY IF EXISTS "progress_admin_select" ON public.module_progress;

-- Create a function to check if user is admin (avoids recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Recreate admin policies using the function
CREATE POLICY "profiles_admin_select" ON public.profiles 
  FOR SELECT 
  USING (public.is_admin());

CREATE POLICY "modules_admin_all" ON public.modules 
  FOR ALL 
  USING (public.is_admin());

CREATE POLICY "quizzes_admin_all" ON public.quizzes 
  FOR ALL 
  USING (public.is_admin());

CREATE POLICY "quiz_questions_admin_all" ON public.quiz_questions 
  FOR ALL 
  USING (public.is_admin());

CREATE POLICY "quiz_options_admin_all" ON public.quiz_options 
  FOR ALL 
  USING (public.is_admin());

CREATE POLICY "quiz_attempts_admin_select" ON public.quiz_attempts 
  FOR SELECT 
  USING (public.is_admin());

CREATE POLICY "assignments_admin_all" ON public.assignments 
  FOR ALL 
  USING (public.is_admin());

CREATE POLICY "submissions_admin_all" ON public.submissions 
  FOR ALL 
  USING (public.is_admin());

CREATE POLICY "progress_admin_select" ON public.module_progress 
  FOR SELECT 
  USING (public.is_admin());
