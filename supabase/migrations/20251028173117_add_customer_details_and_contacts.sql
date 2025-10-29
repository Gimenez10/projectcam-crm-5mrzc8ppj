-- Add new columns to the customers table
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS trade_name TEXT,
ADD COLUMN IF NOT EXISTS ie_rg TEXT,
ADD COLUMN IF NOT EXISTS line_of_business TEXT;

COMMENT ON COLUMN public.customers.trade_name IS 'Nome fantasia do cliente.';
COMMENT ON COLUMN public.customers.ie_rg IS 'Inscrição Estadual ou RG do cliente.';
COMMENT ON COLUMN public.customers.line_of_business IS 'Ramo de atividade do cliente.';

-- Create customer_local_contacts table
CREATE TABLE IF NOT EXISTS public.customer_local_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    name TEXT,
    phone TEXT,
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.customer_local_contacts IS 'Stores local contact information for customers.';
ALTER TABLE public.customer_local_contacts ENABLE ROW LEVEL SECURITY;

-- Create customer_emergency_contacts table
CREATE TABLE IF NOT EXISTS public.customer_emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    name TEXT,
    relationship TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.customer_emergency_contacts IS 'Stores emergency contact information for customers.';
ALTER TABLE public.customer_emergency_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for local contacts
DROP POLICY IF EXISTS "Users with customer read permission can view local contacts" ON public.customer_local_contacts;
CREATE POLICY "Users with customer read permission can view local contacts"
ON public.customer_local_contacts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM customers c WHERE c.id = customer_id AND public.has_permission('customers:read'::text)
  )
);

DROP POLICY IF EXISTS "Users with customer update permission can manage local contacts" ON public.customer_local_contacts;
CREATE POLICY "Users with customer update permission can manage local contacts"
ON public.customer_local_contacts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM customers c WHERE c.id = customer_id AND public.has_permission('customers:update'::text)
  )
);

-- RLS Policies for emergency contacts
DROP POLICY IF EXISTS "Users with customer read permission can view emergency contacts" ON public.customer_emergency_contacts;
CREATE POLICY "Users with customer read permission can view emergency contacts"
ON public.customer_emergency_contacts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM customers c WHERE c.id = customer_id AND public.has_permission('customers:read'::text)
  )
);

DROP POLICY IF EXISTS "Users with customer update permission can manage emergency contacts" ON public.customer_emergency_contacts;
CREATE POLICY "Users with customer update permission can manage emergency contacts"
ON public.customer_emergency_contacts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM customers c WHERE c.id = customer_id AND public.has_permission('customers:update'::text)
  )
);
