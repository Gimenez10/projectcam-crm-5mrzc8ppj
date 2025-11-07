-- Add indexes to improve query performance on frequently filtered or sorted columns.

-- Index on service_orders status for faster filtering on the main list page.
CREATE INDEX IF NOT EXISTS idx_service_orders_status ON public.service_orders(status);

-- Index on service_orders created_at for date range filtering and sorting.
CREATE INDEX IF NOT EXISTS idx_service_orders_created_at ON public.service_orders(created_at DESC);

-- Index on customers name for faster searching.
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers USING gin (to_tsvector('portuguese', name));

-- Index on products name for faster searching.
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products USING gin (to_tsvector('portuguese', name));

-- Index on foreign keys that are frequently used in JOINs.
CREATE INDEX IF NOT EXISTS idx_service_orders_customer_id ON public.service_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_created_by ON public.service_orders(created_by);
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON public.profiles(role_id);

