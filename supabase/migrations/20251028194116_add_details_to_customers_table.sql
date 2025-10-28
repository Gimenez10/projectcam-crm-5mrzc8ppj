-- Add new columns to the customers table for system time, equipment, and other details
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS system_time_entry TEXT,
ADD COLUMN IF NOT EXISTS system_time_exit TEXT,
ADD COLUMN IF NOT EXISTS system_time_test TEXT,
ADD COLUMN IF NOT EXISTS system_time_interval TEXT,
ADD COLUMN IF NOT EXISTS system_time_auto_arm TEXT,
ADD COLUMN IF NOT EXISTS system_time_siren TEXT,
ADD COLUMN IF NOT EXISTS equipment_central TEXT,
ADD COLUMN IF NOT EXISTS equipment_version TEXT,
ADD COLUMN IF NOT EXISTS equipment_model TEXT,
ADD COLUMN IF NOT EXISTS equipment_purchase_lease TEXT,
ADD COLUMN IF NOT EXISTS equipment_keyboard TEXT,
ADD COLUMN IF NOT EXISTS equipment_siren TEXT,
ADD COLUMN IF NOT EXISTS equipment_infra TEXT,
ADD COLUMN IF NOT EXISTS equipment_magnet TEXT,
ADD COLUMN IF NOT EXISTS equipment_central_phone TEXT,
ADD COLUMN IF NOT EXISTS equipment_communication_ways TEXT,
ADD COLUMN IF NOT EXISTS installation_team TEXT,
ADD COLUMN IF NOT EXISTS responsible_name TEXT;

COMMENT ON COLUMN public.customers.system_time_entry IS 'System entry time setting.';
COMMENT ON COLUMN public.customers.system_time_exit IS 'System exit time setting.';
COMMENT ON COLUMN public.customers.system_time_test IS 'System test time setting.';
COMMENT ON COLUMN public.customers.system_time_interval IS 'System interval time setting.';
COMMENT ON COLUMN public.customers.system_time_auto_arm IS 'System auto-arm time setting.';
COMMENT ON COLUMN public.customers.system_time_siren IS 'System siren time setting.';
COMMENT ON COLUMN public.customers.equipment_central IS 'Equipment: Central unit details.';
COMMENT ON COLUMN public.customers.equipment_version IS 'Equipment: Version.';
COMMENT ON COLUMN public.customers.equipment_model IS 'Equipment: Model.';
COMMENT ON COLUMN public.customers.equipment_purchase_lease IS 'Equipment: Purchase or lease status.';
COMMENT ON COLUMN public.customers.equipment_keyboard IS 'Equipment: Keyboard details.';
COMMENT ON COLUMN public.customers.equipment_siren IS 'Equipment: Siren details.';
COMMENT ON COLUMN public.customers.equipment_infra IS 'Equipment: Infrastructure details.';
COMMENT ON COLUMN public.customers.equipment_magnet IS 'Equipment: Magnet details.';
COMMENT ON COLUMN public.customers.equipment_central_phone IS 'Equipment: Central unit phone number.';
COMMENT ON COLUMN public.customers.equipment_communication_ways IS 'Equipment: Communication methods.';
COMMENT ON COLUMN public.customers.installation_team IS 'Name of the installation team.';
COMMENT ON COLUMN public.customers.responsible_name IS 'Name of the responsible person for the client account.';
