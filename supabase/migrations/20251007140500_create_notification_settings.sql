-- Create notification_settings table
CREATE TABLE IF NOT EXISTS public.notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    recipients JSONB NOT NULL DEFAULT '{"users": [], "roles": []}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.notification_settings IS 'Stores configuration for system notifications.';
COMMENT ON COLUMN public.notification_settings.event_type IS 'A unique identifier for the event, e.g., "user.role.changed".';
COMMENT ON COLUMN public.notification_settings.description IS 'A user-friendly description of the event.';
COMMENT ON COLUMN public.notification_settings.is_enabled IS 'Whether notifications for this event are active.';
COMMENT ON COLUMN public.notification_settings.recipients IS 'JSONB object containing arrays of user UUIDs and role names.';

-- Enable RLS
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Admins can view notification settings" ON public.notification_settings;
CREATE POLICY "Admins can view notification settings" ON public.notification_settings
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Admins can manage notification settings" ON public.notification_settings;
CREATE POLICY "Admins can manage notification settings" ON public.notification_settings
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin')
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- Seed initial notification events
INSERT INTO public.notification_settings (event_type, description, is_enabled, recipients)
VALUES
    ('user.role.changed', 'Quando as permissões de um usuário são alteradas.', true, '{"users": [], "roles": ["admin"]}'),
    ('access.request.pending', 'Quando há uma nova solicitação de acesso pendente.', true, '{"users": [], "roles": ["admin", "manager"]}'),
    ('service_order.approved', 'Quando uma ordem de serviço é aprovada.', true, '{"users": [], "roles": ["seller"]}'),
    ('service_order.rejected', 'Quando uma ordem de serviço é rejeitada.', true, '{"users": [], "roles": ["seller"]}'),
    ('user.registered', 'Quando um novo usuário se cadastra no sistema.', true, '{"users": [], "roles": ["admin"]}'),
    ('auth.login.failed', 'Quando ocorre uma tentativa de login malsucedida.', false, '{"users": [], "roles": ["admin"]}')
ON CONFLICT (event_type) DO NOTHING;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for notification_settings
DROP TRIGGER IF EXISTS set_timestamp ON public.notification_settings;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.notification_settings
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_timestamp();
