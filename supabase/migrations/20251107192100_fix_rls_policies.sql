-- Grant product management permissions to sellers to fix saving issues
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
    r.id,
    p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'seller' AND p.name LIKE 'products:%'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Update RLS policy for roles to ensure admins can manage them
DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;
CREATE POLICY "Admins can manage roles" ON public.roles
  FOR ALL
  USING (public.has_permission('roles:update'))
  WITH CHECK (public.has_permission('roles:create'));

-- Update RLS policy for role_permissions
DROP POLICY IF EXISTS "Admins can manage role permissions" ON public.role_permissions;
CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
  FOR ALL
  USING (public.has_permission('roles:update'))
  WITH CHECK (public.has_permission('roles:update'));
