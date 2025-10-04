-- Create audit_logs table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_name TEXT, -- Denormalized for easier display
    action TEXT NOT NULL,
    target_user_id UUID,
    target_user_name TEXT, -- Denormalized for easier display
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comments for clarity
COMMENT ON COLUMN public.audit_logs.actor_id IS 'The user who performed the action.';
COMMENT ON COLUMN public.audit_logs.action IS 'The type of action performed, e.g., "user:create", "user:update:role".';
COMMENT ON COLUMN public.audit_logs.target_user_id IS 'The user who was affected by the action.';
COMMENT ON COLUMN public.audit_logs.details IS 'A JSON object with more details about the action, like what was changed.';

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for audit_logs
CREATE POLICY "Admins can view all audit logs." ON public.audit_logs
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- No INSERT, UPDATE, or DELETE policies are granted to users.
-- Inserts should be handled by the backend using the service_role key to maintain integrity.
