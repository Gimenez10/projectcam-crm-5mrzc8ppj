-- Step 0: Drop dependent policies before schema changes
-- This ensures the migration can run even if later migrations have been applied.
DROP POLICY IF EXISTS "Admins can view all profiles." ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all customers." ON public.customers;
DROP POLICY IF EXISTS "Admins and managers can view all service orders." ON public.service_orders;
DROP POLICY IF EXISTS "Admins can manage all service orders." ON public.service_orders;
DROP POLICY IF EXISTS "Admins and managers can view all service order items." ON public.service_order_items;
DROP POLICY IF EXISTS "Admins can manage all service order items." ON public.service_order_items;
DROP POLICY IF EXISTS "Admins can view all audit logs." ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view notification settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Admins can manage notification settings" ON public.notification_settings;

-- Step 1: Create new tables for roles and permissions
CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_predefined BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.roles IS 'Stores user roles, both predefined and custom.';

CREATE TABLE public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.permissions IS 'Stores granular permissions for the application.';

CREATE TABLE public.role_permissions (
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);
COMMENT ON TABLE public.role_permissions IS 'Join table linking roles to their permissions.';

-- Step 2: Populate permissions table with a granular list
INSERT INTO public.permissions (name, description) VALUES
    ('service_orders:create', 'Can create new service orders'),
    ('service_orders:read:own', 'Can view own service orders'),
    ('service_orders:read:all', 'Can view all service orders'),
    ('service_orders:update:own', 'Can update own service orders'),
    ('service_orders:update:all', 'Can update all service orders'),
    ('service_orders:delete:own', 'Can delete own service orders'),
    ('service_orders:delete:all', 'Can delete all service orders'),
    ('service_orders:approve', 'Can approve or reject service orders'),
    ('customers:create', 'Can create new customers'),
    ('customers:read', 'Can view customers'),
    ('customers:update', 'Can update customers'),
    ('customers:delete', 'Can delete customers'),
    ('users:read', 'Can view users and their roles'),
    ('users:invite', 'Can invite new users'),
    ('users:update', 'Can update user profiles and roles'),
    ('users:delete', 'Can delete users'),
    ('roles:create', 'Can create new roles'),
    ('roles:read', 'Can view roles and permissions'),
    ('roles:update', 'Can update roles and permissions'),
    ('roles:delete', 'Can delete custom roles'),
    ('audit_logs:read', 'Can view the audit log');

-- Step 3: Populate roles table with existing enum values
INSERT INTO public.roles (name, description, is_predefined) VALUES
    ('admin', 'Administrator with all permissions', true),
    ('manager', 'Manager with permissions to oversee operations and approve orders', true),
    ('seller', 'Salesperson with permissions to manage their own customers and orders', true);

-- Step 4: Assign permissions to predefined roles
-- Admin permissions (all)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
    (SELECT id FROM public.roles WHERE name = 'admin'),
    p.id
FROM public.permissions p;

-- Manager permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
    (SELECT id FROM public.roles WHERE name = 'manager'),
    p.id
FROM public.permissions p
WHERE p.name IN (
    'service_orders:create', 'service_orders:read:all', 'service_orders:update:all',
    'service_orders:approve', 'customers:create', 'customers:read', 'customers:update',
    'users:read'
);

-- Seller permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
    (SELECT id FROM public.roles WHERE name = 'seller'),
    p.id
FROM public.permissions p
WHERE p.name IN (
    'service_orders:create', 'service_orders:read:own', 'service_orders:update:own',
    'customers:create', 'customers:read', 'customers:update'
);

-- Step 5: Alter profiles table to use the new roles table
ALTER TABLE public.profiles ADD COLUMN role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL;
COMMENT ON COLUMN public.profiles.role_id IS 'Foreign key to the roles table.';

-- Step 6: Migrate data from old 'role' enum to new 'role_id' FK
UPDATE public.profiles p
SET role_id = (SELECT id FROM public.roles r WHERE r.name = p.role::text);

-- Step 7: Drop the old function that depends on the enum
DROP FUNCTION IF EXISTS public.get_user_role(user_id UUID);

-- Step 8: Drop the old 'role' column from profiles
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE public.profiles DROP COLUMN role;

-- Step 9: Now it should be safe to drop the type
DROP TYPE public.user_role;

-- Step 10: Recreate get_user_role function to work with the new schema
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT r.name
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = user_id;
$$;

-- Step 11: Re-grant execute on the function to authenticated role
GRANT EXECUTE ON FUNCTION public.get_user_role(user_id UUID) TO authenticated;

-- Step 12: Update handle_new_user function to assign a default role_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  default_role_id UUID;
BEGIN
  -- Find the 'seller' role ID to set as default
  SELECT id INTO default_role_id FROM public.roles WHERE name = 'seller';

  INSERT INTO public.profiles (id, full_name, avatar_url, role_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    default_role_id
  );
  RETURN NEW;
END;
$$;

-- Step 13: Enable RLS for new tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Step 14: Add RLS policies for new tables
CREATE POLICY "Authenticated users can view roles and permissions" ON public.roles
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view roles and permissions" ON public.permissions
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view roles and permissions" ON public.role_permissions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage roles" ON public.roles
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin')
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin')
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- Note: Permissions table is considered static data managed by migrations, so no insert/update/delete policies for users.

-- Step 15: Recreate policies with the new role management system
CREATE POLICY "Admins can view all profiles." ON public.profiles
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can update any profile." ON public.profiles
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage all customers." ON public.customers
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin') WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins and managers can view all service orders." ON public.service_orders
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'manager'));
CREATE POLICY "Admins can manage all service orders." ON public.service_orders
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin') WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins and managers can view all service order items." ON public.service_order_items
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'manager'));
CREATE POLICY "Admins can manage all service order items." ON public.service_order_items
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin') WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can view all audit logs." ON public.audit_logs
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');
