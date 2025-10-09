-- Create products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    product_code TEXT UNIQUE,
    barcode TEXT UNIQUE,
    internal_code INTEGER,
    serial_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT internal_code_range CHECK (internal_code >= 0 AND internal_code <= 999)
);

COMMENT ON TABLE public.products IS 'Stores product information, including various identification codes.';
COMMENT ON COLUMN public.products.product_code IS 'Unique product identifier code.';
COMMENT ON COLUMN public.products.barcode IS 'Unique product barcode for scanning and identification.';
COMMENT ON COLUMN public.products.internal_code IS 'Internal code for the product, must be between 0 and 999.';
COMMENT ON COLUMN public.products.serial_number IS 'Alphanumeric serial number for the product unit.';

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for products table to update the updated_at timestamp
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_timestamp();

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Add new permissions for products
INSERT INTO public.permissions (name, description) VALUES
    ('products:create', 'Pode criar novos produtos'),
    ('products:read', 'Pode visualizar produtos'),
    ('products:update', 'Pode atualizar produtos'),
    ('products:delete', 'Pode excluir produtos');

-- Assign new permissions to Admin and Manager roles
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
    r.id,
    p.id
FROM public.roles r, public.permissions p
WHERE r.name IN ('admin', 'manager') AND p.name LIKE 'products:%';

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
