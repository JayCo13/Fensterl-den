-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.designs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  material text NOT NULL,
  name text NOT NULL,
  description text,
  base_price integer NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT designs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.fold_configurations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  window_type_id uuid,
  name text NOT NULL,
  left_folds integer DEFAULT 1,
  right_folds integer DEFAULT 1,
  description text,
  price_multiplier numeric DEFAULT 1.0,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fold_configurations_pkey PRIMARY KEY (id),
  CONSTRAINT fold_configurations_window_type_id_fkey FOREIGN KEY (window_type_id) REFERENCES public.window_types(id)
);
CREATE TABLE public.fold_quantities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  quantity integer NOT NULL,
  price_multiplier numeric DEFAULT 1.0,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fold_quantities_pkey PRIMARY KEY (id)
);
CREATE TABLE public.klappladen_quote_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  email character varying NOT NULL,
  phone character varying,
  material character varying,
  klappladen_type_id uuid,
  lamellentyp_id uuid,
  wood_type_id uuid,
  oberflaeche_id uuid,
  montageprofil_id uuid,
  rahdenformat_id uuid,
  width_mm integer,
  height_mm integer,
  ral_color character varying,
  calculated_price numeric,
  message text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT klappladen_quote_requests_pkey PRIMARY KEY (id),
  CONSTRAINT klappladen_quote_requests_klappladen_type_id_fkey FOREIGN KEY (klappladen_type_id) REFERENCES public.klappladen_types(id),
  CONSTRAINT klappladen_quote_requests_lamellentyp_id_fkey FOREIGN KEY (lamellentyp_id) REFERENCES public.lamellentypen(id),
  CONSTRAINT klappladen_quote_requests_wood_type_id_fkey FOREIGN KEY (wood_type_id) REFERENCES public.wood_types(id),
  CONSTRAINT klappladen_quote_requests_oberflaeche_id_fkey FOREIGN KEY (oberflaeche_id) REFERENCES public.oberflaechen(id),
  CONSTRAINT klappladen_quote_requests_montageprofil_id_fkey FOREIGN KEY (montageprofil_id) REFERENCES public.montageprofile(id),
  CONSTRAINT klappladen_quote_requests_rahdenformat_id_fkey FOREIGN KEY (rahdenformat_id) REFERENCES public.rahdenformate(id)
);
CREATE TABLE public.klappladen_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  description text,
  material character varying NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT klappladen_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.lamelle_directions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  image_url text,
  price_addon numeric DEFAULT 0,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lamelle_directions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.lamellentypen (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  description text,
  compatible_materials ARRAY DEFAULT '{}'::text[],
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lamellentypen_pkey PRIMARY KEY (id)
);
CREATE TABLE public.materials (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT materials_pkey PRIMARY KEY (id)
);
CREATE TABLE public.montageprofile (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  description text,
  price_addon numeric DEFAULT 0,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT montageprofile_pkey PRIMARY KEY (id)
);
CREATE TABLE public.oberflaechen (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  type character varying NOT NULL,
  description text,
  compatible_materials ARRAY DEFAULT '{}'::text[],
  price_addon numeric DEFAULT 0,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT oberflaechen_pkey PRIMARY KEY (id)
);
CREATE TABLE public.payment_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_code bigint NOT NULL UNIQUE,
  package_type text NOT NULL CHECK (package_type = ANY (ARRAY['day_pass'::text, 'credit_pack'::text, 'vip_pro'::text, 'deposit'::text])),
  amount bigint NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'cancelled'::text, 'expired'::text])),
  payos_payment_link_id text,
  payos_checkout_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  paid_at timestamp with time zone,
  CONSTRAINT payment_orders_pkey PRIMARY KEY (id),
  CONSTRAINT payment_orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.quote_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  material text,
  design_id uuid,
  wood_type_id uuid,
  ral_color text,
  width_mm integer,
  height_mm integer,
  calculated_price integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT quote_requests_pkey PRIMARY KEY (id),
  CONSTRAINT quote_requests_design_id_fkey FOREIGN KEY (design_id) REFERENCES public.designs(id),
  CONSTRAINT quote_requests_wood_type_id_fkey FOREIGN KEY (wood_type_id) REFERENCES public.wood_types(id)
);
CREATE TABLE public.rahdenformate (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  description text,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT rahdenformate_pkey PRIMARY KEY (id)
);
CREATE TABLE public.ral_colors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ral_code text NOT NULL UNIQUE,
  name text NOT NULL,
  hex_color text NOT NULL,
  is_popular boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ral_colors_pkey PRIMARY KEY (id)
);
CREATE TABLE public.shutter_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  image_url text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shutter_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  package_type text NOT NULL CHECK (package_type = ANY (ARRAY['day_pass'::text, 'credit_pack'::text, 'vip_pro'::text])),
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'expired'::text, 'cancelled'::text])),
  starts_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  scan_credits_remaining integer,
  payment_reference text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.wallet_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL,
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['deposit'::text, 'scan_purchase'::text, 'vip_subscription'::text, 'marketplace_buy'::text, 'marketplace_sale'::text, 'escrow_hold'::text, 'escrow_release'::text, 'bid_hold'::text, 'bid_release'::text, 'razz_purchase'::text, 'razz_win_refund'::text, 'withdrawal'::text, 'withdrawal_pending'::text, 'platform_fee'::text])),
  amount bigint NOT NULL,
  balance_after bigint NOT NULL,
  description text,
  reference_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT wallet_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT wallet_transactions_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.wallets(id),
  CONSTRAINT wallet_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.wallets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  available_balance bigint NOT NULL DEFAULT 0 CHECK (available_balance >= 0),
  held_balance bigint NOT NULL DEFAULT 0 CHECK (held_balance >= 0),
  total_deposited bigint NOT NULL DEFAULT 0,
  total_withdrawn bigint NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT wallets_pkey PRIMARY KEY (id),
  CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.window_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  shutter_type_id uuid,
  name text NOT NULL,
  step_count integer DEFAULT 1,
  description text,
  image_url text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT window_types_pkey PRIMARY KEY (id),
  CONSTRAINT window_types_shutter_type_id_fkey FOREIGN KEY (shutter_type_id) REFERENCES public.shutter_types(id)
);
CREATE TABLE public.wood_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_addon integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT wood_types_pkey PRIMARY KEY (id)
);