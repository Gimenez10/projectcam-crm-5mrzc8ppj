-- Drop the existing check constraint as the column type is changing
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS internal_code_range;

-- Alter columns to match new requirements
ALTER TABLE public.products
    ALTER COLUMN product_code SET NOT NULL,
    ALTER COLUMN internal_code TYPE TEXT,
    ADD CONSTRAINT products_internal_code_key UNIQUE (internal_code),
    ADD CONSTRAINT products_serial_number_key UNIQUE (serial_number);

-- Add new columns for price and stock
ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS price NUMERIC,
    ADD COLUMN IF NOT EXISTS stock INTEGER;

-- Add comments for new columns
COMMENT ON COLUMN public.products.price IS 'The selling price of the product.';
COMMENT ON COLUMN public.products.stock IS 'The current stock quantity of the product.';
