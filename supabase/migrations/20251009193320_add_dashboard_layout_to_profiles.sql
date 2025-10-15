-- Add dashboard_layout column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS dashboard_layout JSONB;

-- Comment for clarity
COMMENT ON COLUMN public.profiles.dashboard_layout IS 'Stores the user''s custom dashboard layout and widget configuration.';

-- Update RLS policies for the new column
-- The existing policies for SELECT and UPDATE on profiles are sufficient,
-- as they grant access to the whole row. No new policy is strictly needed
-- for this column, but we can be explicit if required.

-- For example, ensure users can update their own dashboard layout.
-- The existing "Users can update their own profile." policy already covers this.

-- Set a default layout for existing users.
-- This layout includes all available widgets by default.
UPDATE public.profiles
SET dashboard_layout = '{
  "widgets": [
    {"id": "kpiCards"},
    {"id": "vendasMensais"},
    {"id": "statusDistribuicao"},
    {"id": "topClientes"},
    {"id": "atividadeRecente"},
    {"id": "vendasVendedor"}
  ]
}'
WHERE dashboard_layout IS NULL;
