-- This migration fixes the Row-Level Security (RLS) policies for the 'roles' table.
-- The previous single 'FOR ALL' policy had incorrect permission checks for different operations,
-- leading to RLS violations even for admin users.
-- This script replaces it with specific policies for SELECT, INSERT, UPDATE, and DELETE,
-- each checking for the correct corresponding permission ('roles:read', 'roles:create', etc.).

-- Drop the existing flawed policy for managing roles.
-- This policy incorrectly used 'roles:update' for SELECT/DELETE and 'roles:create' for UPDATE checks.
DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;

-- Drop the overly permissive SELECT policy that allowed any authenticated user to view roles.
-- We replace it with a permission-based policy for consistency and better security.
DROP POLICY IF EXISTS "Authenticated users can view roles and permissions" ON public.roles;

-- Create a new, more specific SELECT policy based on 'roles:read' permission.
-- This ensures only users with the explicit permission can view role details.
CREATE POLICY "Users with read permission can view roles" ON public.roles
  FOR SELECT
  USING (public.has_permission('roles:read'));

-- Create a new INSERT policy based on 'roles:create' permission.
-- This correctly allows users with 'roles:create' to add new roles.
CREATE POLICY "Users with create permission can insert roles" ON public.roles
  FOR INSERT
  WITH CHECK (public.has_permission('roles:create'));

-- Create a new UPDATE policy based on 'roles:update' permission.
-- This correctly allows users with 'roles:update' to modify existing roles.
CREATE POLICY "Users with update permission can update roles" ON public.roles
  FOR UPDATE
  USING (public.has_permission('roles:update'))
  WITH CHECK (public.has_permission('roles:update'));

-- Create a new DELETE policy based on 'roles:delete' permission.
-- This correctly allows users with 'roles:delete' to remove roles.
CREATE POLICY "Users with delete permission can delete roles" ON public.roles
  FOR DELETE
  USING (public.has_permission('roles:delete'));
