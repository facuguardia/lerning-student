-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_progress ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "profiles_admin_select" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Modules policies (everyone can view published modules)
CREATE POLICY "modules_select_all" ON public.modules FOR SELECT USING (is_published = true);
CREATE POLICY "modules_admin_all" ON public.modules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Quizzes policies
CREATE POLICY "quizzes_select_all" ON public.quizzes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.modules WHERE id = module_id AND is_published = true)
);
CREATE POLICY "quizzes_admin_all" ON public.quizzes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Quiz questions policies
CREATE POLICY "quiz_questions_select_all" ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "quiz_questions_admin_all" ON public.quiz_questions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Quiz options policies
CREATE POLICY "quiz_options_select_all" ON public.quiz_options FOR SELECT USING (true);
CREATE POLICY "quiz_options_admin_all" ON public.quiz_options FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Quiz attempts policies
CREATE POLICY "quiz_attempts_select_own" ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "quiz_attempts_insert_own" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "quiz_attempts_admin_select" ON public.quiz_attempts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Quiz answers policies
CREATE POLICY "quiz_answers_select_own" ON public.quiz_answers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.quiz_attempts WHERE id = attempt_id AND user_id = auth.uid())
);
CREATE POLICY "quiz_answers_insert_own" ON public.quiz_answers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.quiz_attempts WHERE id = attempt_id AND user_id = auth.uid())
);

-- Assignments policies
CREATE POLICY "assignments_select_all" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "assignments_admin_all" ON public.assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Submissions policies
CREATE POLICY "submissions_select_own" ON public.submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "submissions_insert_own" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "submissions_update_own" ON public.submissions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "submissions_admin_all" ON public.submissions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Module progress policies
CREATE POLICY "progress_select_own" ON public.module_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "progress_insert_own" ON public.module_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "progress_update_own" ON public.module_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "progress_admin_select" ON public.module_progress FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
