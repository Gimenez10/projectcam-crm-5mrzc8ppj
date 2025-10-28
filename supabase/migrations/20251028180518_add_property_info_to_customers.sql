-- Add new columns to the customers table for property information
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS property_observations TEXT,
ADD COLUMN IF NOT EXISTS property_type TEXT,
ADD COLUMN IF NOT EXISTS property_local_key TEXT,
ADD COLUMN IF NOT EXISTS property_animals TEXT;

COMMENT ON COLUMN public.customers.property_observations IS 'Observações sobre o imóvel do cliente.';
COMMENT ON COLUMN public.customers.property_type IS 'Tipo de imóvel (ex: Residencial, Comercial).';
COMMENT ON COLUMN public.customers.property_local_key IS 'Informações sobre a chave do local.';
COMMENT ON COLUMN public.customers.property_animals IS 'Informações sobre animais no local.';
