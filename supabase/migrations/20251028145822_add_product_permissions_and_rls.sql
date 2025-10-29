-- Add new permissions for products
INSERT INTO public.permissions (name, description) VALUES
    ('products:create', 'Pode criar novos produtos'),
    ('products:read', 'Pode visualizar produtos'),
    ('products:update', 'Pode atualizar produtos'),
    ('products:delete', 'Pode excluir produtos')
ON CONFLICT (name) DO NOTHING;

-- Assign new permissions to Admin and Manager roles
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
    r.id,
    p.id
FROM public.roles r, public.permissions p
WHERE r.name IN ('admin', 'manager') AND p.name LIKE 'products:%'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- RLS Policies for products
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar produtos." ON public.products;
CREATE POLICY "Usuários autenticados podem visualizar produtos." ON public.products
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Usuários com permissão podem criar produtos." ON public.products;
CREATE POLICY "Usuários com permissão podem criar produtos." ON public.products
  FOR INSERT WITH CHECK (public.has_permission('products:create'));

DROP POLICY IF EXISTS "Usuários com permissão podem atualizar produtos." ON public.products;
CREATE POLICY "Usuários com permissão podem atualizar produtos." ON public.products
  FOR UPDATE USING (public.has_permission('products:update'));

DROP POLICY IF EXISTS "Usuários com permissão podem excluir produtos." ON public.products;
CREATE POLICY "Usuários com permissão podem excluir produtos." ON public.products
  FOR DELETE USING (public.has_permission('products:delete'));
