-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    product_code TEXT NOT NULL UNIQUE,
    barcode TEXT UNIQUE,
    internal_code TEXT UNIQUE,
    serial_number TEXT UNIQUE,
    price NUMERIC,
    stock INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.products IS 'Stores product information, including various identification codes.';
COMMENT ON COLUMN public.products.product_code IS 'Unique product identifier code.';
COMMENT ON COLUMN public.products.barcode IS 'Unique product barcode for scanning and identification.';
COMMENT ON COLUMN public.products.internal_code IS 'Internal code for the product.';
COMMENT ON COLUMN public.products.serial_number IS 'Alphanumeric serial number for the product unit.';
COMMENT ON COLUMN public.products.price IS 'The selling price of the product.';
COMMENT ON COLUMN public.products.stock IS 'The current stock quantity of the product.';

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for products table to update the updated_at timestamp
DROP TRIGGER IF EXISTS set_timestamp ON public.products;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_timestamp();

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
