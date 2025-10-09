-- Add dashboard_layout column to profiles table
ALTER TABLE public.profiles
ADD COLUMN dashboard_layout JSONB;

-- Comment for clarity
COMMENT ON COLUMN public.profiles.dashboard_layout IS 'Stores the user''s custom dashboard layout and widget configuration.';

-- Update RLS policies for the new column
-- The existing policies for SELECT and UPDATE on profiles are sufficient,
-- as they grant access to the whole row. No new policy is strictly needed
-- for this column, but we can be explicit if required.

-- For example, ensure users can update their own dashboard layout.
-- The existing "Users can update their own profile." policy already covers this.

-- Set a default layout for existing users.
-- This layout includes a welcome message and some default widgets.
UPDATE public.profiles
SET dashboard_layout = '{
  "layout": [
    {"i": "kpi-cards", "x": 0, "y": 0, "w": 12, "h": 2},
    {"i": "monthly-sales", "x": 0, "y": 2, "w": 8, "h": 4},
    {"i": "status-pie", "x": 8, "y": 2, "w": 4, "h": 4},
    {"i": "recent-activity", "x": 0, "y": 6, "w": 12, "h": 4}
  ],
  "widgets": [
    {"id": "kpi-cards", "component": "KpiCardsWidget"},
    {"id": "monthly-sales", "component": "VendasMensaisBarChartWidget"},
    {"id": "status-pie", "component": "StatusPieChartWidget"},
    {"id": "recent-activity", "component": "RecentActivityWidget"}
  ]
}'
WHERE dashboard_layout IS NULL;
