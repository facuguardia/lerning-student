-- Add new columns to assignments table for enhanced functionality
ALTER TABLE assignments
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS delivery_methods TEXT[] DEFAULT ARRAY['file', 'github', 'vercel', 'url'];

-- Update submissions table to support approval/rejection workflow
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_submissions_user_assignment ON submissions(user_id, assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- Add quiz cooldown tracking
ALTER TABLE quiz_attempts
ADD COLUMN IF NOT EXISTS next_attempt_at TIMESTAMP WITH TIME ZONE;

-- Create table for final projects
CREATE TABLE IF NOT EXISTS final_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for final project submissions
CREATE TABLE IF NOT EXISTS final_project_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES final_projects(id) ON DELETE CASCADE,
  production_url TEXT NOT NULL,
  github_url TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'graded')),
  is_approved BOOLEAN DEFAULT NULL,
  score INTEGER,
  feedback TEXT,
  rejection_reason TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- Create final quiz table
CREATE TABLE IF NOT EXISTS final_quiz (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Quiz Final',
  description TEXT,
  passing_score INTEGER DEFAULT 70,
  time_limit_minutes INTEGER DEFAULT 90,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create final quiz questions table
CREATE TABLE IF NOT EXISTS final_quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES final_quiz(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice',
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create final quiz options table
CREATE TABLE IF NOT EXISTS final_quiz_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES final_quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create final quiz attempts table
CREATE TABLE IF NOT EXISTS final_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES final_quiz(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL,
  next_attempt_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE final_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_quiz ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for final_projects
CREATE POLICY "Anyone can view active final projects"
  ON final_projects FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage final projects"
  ON final_projects FOR ALL
  USING (is_admin());

-- RLS Policies for final_project_submissions
CREATE POLICY "Users can view their own final project submissions"
  ON final_project_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own final project submissions"
  ON final_project_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending final project submissions"
  ON final_project_submissions FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all final project submissions"
  ON final_project_submissions FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update final project submissions"
  ON final_project_submissions FOR UPDATE
  USING (is_admin());

-- RLS Policies for final_quiz
CREATE POLICY "Anyone can view active final quiz"
  ON final_quiz FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage final quiz"
  ON final_quiz FOR ALL
  USING (is_admin());

-- RLS Policies for final_quiz_questions
CREATE POLICY "Anyone can view final quiz questions"
  ON final_quiz_questions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage final quiz questions"
  ON final_quiz_questions FOR ALL
  USING (is_admin());

-- RLS Policies for final_quiz_options
CREATE POLICY "Anyone can view final quiz options"
  ON final_quiz_options FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage final quiz options"
  ON final_quiz_options FOR ALL
  USING (is_admin());

-- RLS Policies for final_quiz_attempts
CREATE POLICY "Users can view their own final quiz attempts"
  ON final_quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own final quiz attempts"
  ON final_quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all final quiz attempts"
  ON final_quiz_attempts FOR SELECT
  USING (is_admin());

-- Add comments
COMMENT ON COLUMN submissions.is_approved IS 'NULL = pending, true = approved, false = rejected';
COMMENT ON COLUMN submissions.rejection_reason IS 'Required when is_approved = false';
COMMENT ON COLUMN quiz_attempts.next_attempt_at IS 'Time when user can attempt quiz again after failing';
COMMENT ON TABLE final_projects IS 'List of 30 final projects for students to choose from';
COMMENT ON TABLE final_quiz IS 'Final comprehensive quiz with 30+ questions';
