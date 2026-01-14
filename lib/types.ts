export type UserRole = "student" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  content: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  passing_score: number;
  time_limit_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  order_index: number;
  points: number;
  created_at: string;
}

export interface QuizOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_points: number;
  percentage: number;
  passed: boolean;
  started_at: string;
  completed_at: string;
}

export interface QuizAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option_id: string | null;
  is_correct: boolean;
}

export interface Assignment {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  due_date: string | null;
  max_score: number;
  created_at: string;
  updated_at: string;
}

export type SubmissionStatus = "pending" | "submitted" | "graded";
export type LinkType = "github" | "vercel" | "other";

export interface Submission {
  id: string;
  assignment_id: string;
  user_id: string;
  status: SubmissionStatus;
  file_url: string | null;
  file_name: string | null;
  link_url: string | null;
  link_type: LinkType | null;
  comment: string | null;
  score: number | null;
  feedback: string | null;
  submitted_at: string | null;
  graded_at: string | null;
  graded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ModuleProgress {
  id: string;
  user_id: string;
  module_id: string;
  is_unlocked: boolean;
  completed_at: string | null;
  created_at: string;
}

// Extended types with relations
export interface ModuleWithQuiz extends Module {
  quiz: Quiz | null;
  assignment: Assignment | null;
}

export interface QuizWithQuestions extends Quiz {
  questions: (QuizQuestion & { options: QuizOption[] })[];
}

export interface ModuleWithProgress extends Module {
  is_unlocked: boolean;
  quiz_passed: boolean;
  best_score: number | null;
}

// Assignment chat types
export interface AssignmentChat {
  id: string;
  assignment_id: string;
  user_id: string;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ChatSenderRole = "student" | "admin";

export interface AssignmentMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_role: ChatSenderRole;
  content: string;
  created_at: string;
}
