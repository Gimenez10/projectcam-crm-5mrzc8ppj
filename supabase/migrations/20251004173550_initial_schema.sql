-- Create custom types
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'seller');
CREATE TYPE public.service_order_status AS ENUM ('Rascunho', 'Pendente', 'Aprovado', 'Rejeitado', 'Fechado');
CREATE TYPE public.approval_status AS ENUM ('Pendente', 'Aprovado', 'Rejeitado');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    role public.user_role NOT NULL DEFAULT 'seller',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'seller' -- Default role
  );
  RETURN NEW;
END;
$;

-- Trigger to call the function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create customers table
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cpf_cnpj TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create service_orders table
CREATE TABLE public.service_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number SERIAL,
    title TEXT,
    description TEXT,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status public.service_order_status NOT NULL DEFAULT 'Rascunho',
    total_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
    global_discount NUMERIC(5, 2) NOT NULL DEFAULT 0,
    payment_conditions TEXT,
    observations TEXT,
    valid_until DATE,
    approval_status public.approval_status,
    approver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approval_comments TEXT,
    requested_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create service_order_items table
CREATE TABLE public.service_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_order_id UUID NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
    code TEXT,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(5, 2) NOT NULL DEFAULT 0
);

-- Set up Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_order_items ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS public.user_role
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $
  SELECT role FROM public.profiles WHERE id = user_id;
$;

-- Policies for profiles
CREATE POLICY "Users can view their own profile." ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles." ON public.profiles
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can update any profile." ON public.profiles
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin') WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- Policies for customers
CREATE POLICY "Authenticated users can create customers." ON public.customers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can view all customers." ON public.customers
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update customers they created." ON public.customers
  FOR UPDATE USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Admins can manage all customers." ON public.customers
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin') WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- Policies for service_orders
CREATE POLICY "Users can create service orders." ON public.service_orders
  FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can view their own service orders." ON public.service_orders
  FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can update their own service orders." ON public.service_orders
  FOR UPDATE USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can delete their own service orders." ON public.service_orders
  FOR DELETE USING (auth.uid() = created_by);
CREATE POLICY "Admins and managers can view all service orders." ON public.service_orders
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'manager'));
CREATE POLICY "Admins can manage all service orders." ON public.service_orders
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin') WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- Policies for service_order_items
CREATE POLICY "Users can manage items for their own service orders." ON public.service_order_items
  FOR ALL USING (
    auth.uid() = (SELECT created_by FROM public.service_orders WHERE id = service_order_id)
  );
CREATE POLICY "Admins and managers can view all service order items." ON public.service_order_items
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'manager'));
CREATE POLICY "Admins can manage all service order items." ON public.service_order_items
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin') WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- Add unique constraint to service_orders.order_number
ALTER TABLE public.service_orders ADD CONSTRAINT service_orders_order_number_key UNIQUE (order_number);
-- Ensure order_number is between 0 and 1000 as requested
ALTER TABLE public.service_orders ADD CONSTRAINT order_number_check CHECK (order_number >= 0 AND order_number <= 1000);

