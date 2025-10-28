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
CREATE POLICY "Usuários autenticados podem visualizar produtos." ON public.products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários com permissão podem criar produtos." ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM profiles pr
      JOIN role_permissions rp ON pr.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE pr.id = auth.uid() AND p.name = 'products:create'
    )
  );

CREATE POLICY "Usuários com permissão podem atualizar produtos." ON public.products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM profiles pr
      JOIN role_permissions rp ON pr.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE pr.id = auth.uid() AND p.name = 'products:update'
    )
  );

CREATE POLICY "Usuários com permissão podem excluir produtos." ON public.products
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM profiles pr
      JOIN role_permissions rp ON pr.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE pr.id = auth.uid() AND p.name = 'products:delete'
    )
  );
