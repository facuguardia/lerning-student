CREATE TABLE IF NOT EXISTS public.assignment_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (assignment_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.assignment_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.assignment_chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('student', 'admin')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assignment_chats_assignment_user ON public.assignment_chats(assignment_id, user_id);
CREATE INDEX IF NOT EXISTS idx_assignment_messages_chat ON public.assignment_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_assignment_messages_sender ON public.assignment_messages(sender_id);

ALTER TABLE public.assignment_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY assignment_chats_select_own
  ON public.assignment_chats
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY assignment_chats_insert_own
  ON public.assignment_chats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY assignment_chats_admin_all
  ON public.assignment_chats
  FOR ALL
  USING (public.is_admin());

CREATE POLICY assignment_messages_select_chat_participants
  ON public.assignment_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.assignment_chats c
      WHERE c.id = chat_id
        AND (c.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY assignment_messages_insert_student
  ON public.assignment_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.assignment_chats c
      WHERE c.id = chat_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY assignment_messages_insert_admin
  ON public.assignment_messages
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY assignment_messages_admin_all
  ON public.assignment_messages
  FOR ALL
  USING (public.is_admin());

