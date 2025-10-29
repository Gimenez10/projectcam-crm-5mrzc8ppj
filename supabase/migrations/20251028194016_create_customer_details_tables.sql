-- Create customer_passwords table
CREATE TABLE IF NOT EXISTS public.customer_passwords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    question TEXT,
    answer TEXT,
    username TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.customer_passwords IS 'Stores security credentials for customers.';
ALTER TABLE public.customer_passwords ENABLE ROW LEVEL SECURITY;

-- Create customer_operating_hours table
CREATE TABLE IF NOT EXISTS public.customer_operating_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
    morning_open TIME WITH TIME ZONE,
    morning_close TIME WITH TIME ZONE,
    afternoon_open TIME WITH TIME ZONE,
    afternoon_close TIME WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.customer_operating_hours IS 'Stores operating hours for customers for each day of the week.';
ALTER TABLE public.customer_operating_hours ENABLE ROW LEVEL SECURITY;

-- Trigger for customer_operating_hours to update the updated_at timestamp
DROP TRIGGER IF EXISTS set_timestamp ON public.customer_operating_hours;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.customer_operating_hours
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_timestamp();

-- RLS Policies for customer_passwords
CREATE POLICY "Users with customer read permission can view passwords"
ON public.customer_passwords FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM customers c WHERE c.id = customer_id AND public.has_permission('customers:read'::text)
  )
);

CREATE POLICY "Users with customer update permission can manage passwords"
ON public.customer_passwords FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM customers c WHERE c.id = customer_id AND public.has_permission('customers:update'::text)
  )
);

-- RLS Policies for customer_operating_hours
CREATE POLICY "Users with customer read permission can view operating hours"
ON public.customer_operating_hours FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM customers c WHERE c.id = customer_id AND public.has_permission('customers:read'::text)
  )
);

CREATE POLICY "Users with customer update permission can manage operating hours"
ON public.customer_operating_hours FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM customers c WHERE c.id = customer_id AND public.has_permission('customers:update'::text)
  )
);

