-- Step 1: Add new permissions for customers
INSERT INTO public.permissions (name, description) VALUES
    ('customers:create', 'Pode criar novos clientes'),
    ('customers:read', 'Pode visualizar clientes'),
    ('customers:update', 'Pode atualizar clientes'),
    ('customers:delete', 'Pode excluir clientes')
ON CONFLICT (name) DO NOTHING;

-- Step 2: Assign new permissions to predefined roles
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p WHERE r.name = 'admin' AND p.name LIKE 'customers:%'
ON CONFLICT (role_id, permission_id) DO NOTHING;
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p WHERE r.name = 'manager' AND p.name LIKE 'customers:%'
ON CONFLICT (role_id, permission_id) DO NOTHING;
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p WHERE r.name = 'seller' AND p.name IN ('customers:create', 'customers:read', 'customers:update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Step 3: Drop old RLS policies on the customers table
DROP POLICY IF EXISTS "Authenticated users can create customers." ON public.customers;
DROP POLICY IF EXISTS "Users can view all customers." ON public.customers;
DROP POLICY IF EXISTS "Users can update customers they created." ON public.customers;
DROP POLICY IF EXISTS "Admins can manage all customers." ON public.customers;

-- Helper function to check for a specific permission
CREATE OR REPLACE FUNCTION public.has_permission(permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles pr
    JOIN public.role_permissions rp ON pr.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE pr.id = auth.uid() AND p.name = permission_name
  );
END;
$$;

-- Step 4: Create new RLS policies based on permissions
DROP POLICY IF EXISTS "Usuários com permissão podem visualizar clientes." ON public.customers;
CREATE POLICY "Usuários com permissão podem visualizar clientes." ON public.customers
  FOR SELECT USING (public.has_permission('customers:read'::text));

DROP POLICY IF EXISTS "Usuários com permissão podem criar clientes." ON public.customers;
CREATE POLICY "Usuários com permissão podem criar clientes." ON public.customers
  FOR INSERT WITH CHECK (public.has_permission('customers:create'::text));

DROP POLICY IF EXISTS "Usuários com permissão podem atualizar clientes." ON public.customers;
CREATE POLICY "Usuários com permissão podem atualizar clientes." ON public.customers
  FOR UPDATE USING (public.has_permission('customers:update'::text));

DROP POLICY IF EXISTS "Usuários com permissão podem excluir clientes." ON public.customers;
CREATE POLICY "Usuários com permissão podem excluir clientes." ON public.customers
  FOR DELETE USING (public.has_permission('customers:delete'::text));
