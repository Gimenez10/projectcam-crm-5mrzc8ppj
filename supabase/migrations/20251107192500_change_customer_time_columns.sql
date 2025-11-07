-- Change system time columns in customers table from TEXT to TIME WITHOUT TIME ZONE
-- This prevents errors related to invalid timezone syntax by enforcing a specific data type.
-- The USING clause handles existing data, converting valid time strings and setting invalid ones to NULL.
ALTER TABLE public.customers
    ALTER COLUMN system_time_entry TYPE TIME WITHOUT TIME ZONE USING (CASE WHEN system_time_entry ~ '^[0-9]{2}:[0-9]{2}(:[0-9]{2})?$' THEN system_time_entry::time ELSE NULL END),
    ALTER COLUMN system_time_exit TYPE TIME WITHOUT TIME ZONE USING (CASE WHEN system_time_exit ~ '^[0-9]{2}:[0-9]{2}(:[0-9]{2})?$' THEN system_time_exit::time ELSE NULL END),
    ALTER COLUMN system_time_test TYPE TIME WITHOUT TIME ZONE USING (CASE WHEN system_time_test ~ '^[0-9]{2}:[0-9]{2}(:[0-9]{2})?$' THEN system_time_test::time ELSE NULL END),
    ALTER COLUMN system_time_interval TYPE TIME WITHOUT TIME ZONE USING (CASE WHEN system_time_interval ~ '^[0-9]{2}:[0-9]{2}(:[0-9]{2})?$' THEN system_time_interval::time ELSE NULL END),
    ALTER COLUMN system_time_auto_arm TYPE TIME WITHOUT TIME ZONE USING (CASE WHEN system_time_auto_arm ~ '^[0-9]{2}:[0-9]{2}(:[0-9]{2})?$' THEN system_time_auto_arm::time ELSE NULL END),
    ALTER COLUMN system_time_siren TYPE TIME WITHOUT TIME ZONE USING (CASE WHEN system_time_siren ~ '^[0-9]{2}:[0-9]{2}(:[0-9]{2})?$' THEN system_time_siren::time ELSE NULL END);
