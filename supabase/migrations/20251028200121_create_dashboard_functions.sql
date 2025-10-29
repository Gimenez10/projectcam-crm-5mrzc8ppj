-- Function for KPI Cards
CREATE OR REPLACE FUNCTION get_dashboard_kpi_data()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $
DECLARE
    created_count INT;
    total_sales NUMERIC;
    total_value NUMERIC;
    conversion_rate NUMERIC;
    closed_count INT;
    rejected_count INT;
BEGIN
    SELECT count(*) INTO created_count FROM public.service_orders;

    SELECT COALESCE(sum(total_value), 0) INTO total_sales
    FROM public.service_orders
    WHERE status IN ('Aprovado', 'Fechado');

    SELECT COALESCE(sum(total_value), 0) INTO total_value FROM public.service_orders;

    SELECT count(*) INTO closed_count FROM public.service_orders WHERE status = 'Fechado';
    SELECT count(*) INTO rejected_count FROM public.service_orders WHERE status = 'Rejeitado';

    IF (closed_count + rejected_count) > 0 THEN
        conversion_rate := (closed_count::NUMERIC / (closed_count + rejected_count)) * 100;
    ELSE
        conversion_rate := 0;
    END IF;

    RETURN json_build_object(
        'createdCount', created_count,
        'totalSales', total_sales,
        'totalValue', total_value,
        'conversionRate', conversion_rate
    );
END;
$;

-- Function for Status Distribution Pie Chart
CREATE OR REPLACE FUNCTION get_dashboard_status_distribution()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $
BEGIN
    RETURN (
        SELECT json_agg(json_build_object('name', status, 'value', count))
        FROM (
            SELECT status, count(*) as count
            FROM public.service_orders
            GROUP BY status
        ) AS status_counts
    );
END;
$;

-- Function for Monthly Sales Bar Chart
CREATE OR REPLACE FUNCTION get_dashboard_monthly_sales()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $
DECLARE
    twelve_months_ago DATE;
BEGIN
    twelve_months_ago := date_trunc('month', now() - interval '11 months');

    RETURN (
        SELECT json_agg(t)
        FROM (
            SELECT
                to_char(month_series, 'Mon') AS name,
                COALESCE(SUM(so.total_value), 0) AS total
            FROM generate_series(twelve_months_ago, date_trunc('month', now()), '1 month') AS month_series
            LEFT JOIN public.service_orders so
                ON date_trunc('month', so.created_at) = month_series
                AND so.status IN ('Aprovado', 'Fechado')
            GROUP BY month_series
            ORDER BY month_series
        ) t
    );
END;
$;

-- Function for Top Customers Bar Chart
CREATE OR REPLACE FUNCTION get_dashboard_top_customers()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $
BEGIN
    RETURN (
        SELECT json_agg(json_build_object('name', c.name, 'value', total_value))
        FROM (
            SELECT
                customer_id,
                SUM(total_value) as total_value
            FROM public.service_orders
            WHERE status IN ('Aprovado', 'Fechado') AND customer_id IS NOT NULL
            GROUP BY customer_id
            ORDER BY total_value DESC
            LIMIT 5
        ) as top_customers
        JOIN public.customers c ON c.id = top_customers.customer_id
    );
END;
$;

-- Function for Sales by Salesperson Bar Chart
CREATE OR REPLACE FUNCTION get_dashboard_sales_by_salesperson()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $
BEGIN
    RETURN (
        SELECT json_agg(json_build_object('name', p.full_name, 'value', order_count))
        FROM (
            SELECT
                created_by,
                count(*) as order_count
            FROM public.service_orders
            WHERE created_by IS NOT NULL
            GROUP BY created_by
        ) as sales_counts
        JOIN public.profiles p ON p.id = sales_counts.created_by
    );
END;
$;

-- Function for Recent Activities
CREATE OR REPLACE FUNCTION get_dashboard_recent_activities()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $
BEGIN
    RETURN (
        SELECT json_agg(t)
        FROM (
            SELECT
                so.id,
                so.order_number,
                so.status,
                so.updated_at,
                json_build_object(
                    'full_name', p.full_name,
                    'avatar_url', p.avatar_url
                ) as salesperson
            FROM public.service_orders so
            LEFT JOIN public.profiles p ON so.created_by = p.id
            ORDER BY so.updated_at DESC
            LIMIT 5
        ) t
    );
END;
$;

