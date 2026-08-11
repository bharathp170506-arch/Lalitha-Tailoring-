-- =====================================================================
-- LALITHA TAILORING — SUPABASE SCHEMA
-- Run this in Supabase SQL Editor (Project → SQL Editor → New query)
-- =====================================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- CLEAN SLATE
-- Unlike tables, `create type` has no "if not exists" option in
-- Postgres, so re-running this script after a partial/failed run
-- throws "type already exists". Dropping everything first (cascade
-- handles dependent tables/policies/triggers automatically) makes
-- this script safe to run as many times as you need.
-- ---------------------------------------------------------------------
drop table if exists institute_enrollments, orders, measurements, customers cascade;
drop type if exists order_status, order_type, garment_type, course_type, fee_status, batch_timing cascade;
drop function if exists set_order_number() cascade;
drop function if exists set_updated_at() cascade;

-- ---------------------------------------------------------------------
-- 1. CUSTOMERS
-- One row per customer. Phone number is the practical unique key since
-- most walk-in customers won't have email.
-- ---------------------------------------------------------------------
create table if not exists customers (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  phone_number    text not null unique,
  whatsapp_opt_in boolean not null default true,
  address         text,
  notes           text,               -- e.g. "prefers loose sleeves", "regular since 2015"
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_customers_phone on customers (phone_number);
create index if not exists idx_customers_name on customers using gin (to_tsvector('simple', name));

-- ---------------------------------------------------------------------
-- 2. MEASUREMENTS
-- A customer can have multiple measurement records over time (bodies
-- change, styles change). garment_type determines which fields matter.
-- All measurement fields are in INCHES, stored as numeric(5,2) to allow
-- quarter-inch precision (e.g. 34.25).
-- ---------------------------------------------------------------------
create type garment_type as enum ('blouse', 'churidar', 'saree_fall_pico', 'other');

create table if not exists measurements (
  id                uuid primary key default gen_random_uuid(),
  customer_id       uuid not null references customers(id) on delete cascade,
  garment_type      garment_type not null,
  label             text,             -- e.g. "Wedding blouse - Nov 2026" for the owner's own reference

  -- ===== Blouse measurements =====
  blouse_length         numeric(5,2),
  chest                 numeric(5,2),
  waist                 numeric(5,2),
  shoulder               numeric(5,2),
  sleeve_length          numeric(5,2),
  sleeve_round           numeric(5,2),
  armhole                numeric(5,2),
  front_neck_depth       numeric(5,2),
  back_neck_depth        numeric(5,2),
  bust_point_to_point    numeric(5,2),
  bust_point_to_shoulder numeric(5,2),

  -- ===== Churidar measurements =====
  churidar_top_length    numeric(5,2),
  churidar_bottom_length numeric(5,2),
  hip                    numeric(5,2),
  thigh_round            numeric(5,2),
  knee_round             numeric(5,2),
  ankle_round            numeric(5,2),
  waist_to_knee          numeric(5,2),

  -- Free-text field for anything unusual that doesn't fit a standard field
  additional_notes  text,

  recorded_by       text,             -- staff member who took the measurement
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_measurements_customer on measurements (customer_id);

-- ---------------------------------------------------------------------
-- 3. ORDERS
-- The core of the operational board. Every order is tied to a customer
-- and, optionally, to a specific measurement record used for it.
-- ---------------------------------------------------------------------
create type order_type as enum (
  'blouse_stitching',
  'churidar_stitching',
  'bridal_blouse',
  'aari_work',
  'zardozi',
  'chikankari',
  'alteration',
  'other'
);

create type order_status as enum (
  'Pending',
  'Cutting',
  'Stitching',
  'Finishing',
  'Ready for Pickup',
  'Delivered'
);

create table if not exists orders (
  id                    uuid primary key default gen_random_uuid(),
  order_number          text unique,   -- populated by trigger below, e.g. LT-2608-a1b2
  customer_id           uuid not null references customers(id) on delete restrict,
  measurement_id        uuid references measurements(id) on delete set null,

  order_type            order_type not null,
  status                order_status not null default 'Pending',

  fabric_received_date  date,
  expected_delivery     date,
  delivered_at          timestamptz,

  total_amount          numeric(10,2) not null default 0,
  advance_paid          numeric(10,2) not null default 0,
  balance_due           numeric(10,2) generated always as (total_amount - advance_paid) stored,

  special_instructions  text,          -- e.g. "extra padding", "boat neck as per photo"
  reference_image_url   text,          -- optional photo of design reference, stored in Supabase Storage

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_orders_customer on orders (customer_id);
create index if not exists idx_orders_status on orders (status);
create index if not exists idx_orders_expected_delivery on orders (expected_delivery);

-- ---------------------------------------------------------------------
-- 4. INSTITUTE ENROLLMENTS
-- For the "Lalitha Tailoring Institute" — separate from tailoring
-- customers, though a student can also be an existing customer.
-- ---------------------------------------------------------------------
create type course_type as enum ('basic_stitching', 'advanced_stitching', 'aari_work', 'combo');
create type fee_status as enum ('Unpaid', 'Partially Paid', 'Fully Paid');
create type batch_timing as enum ('Morning (10AM-12PM)', 'Afternoon (1PM-3PM)', 'Evening (4PM-6PM)');

create table if not exists institute_enrollments (
  id                uuid primary key default gen_random_uuid(),
  student_name      text not null,
  phone_number      text not null,
  age               integer,
  address           text,

  course_type       course_type not null,
  batch_timing      batch_timing not null,
  batch_start_date  date,

  course_fee        numeric(10,2) not null default 0,
  amount_paid       numeric(10,2) not null default 0,
  fee_status        fee_status not null default 'Unpaid',

  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_enrollments_phone on institute_enrollments (phone_number);
create index if not exists idx_enrollments_batch on institute_enrollments (batch_timing, batch_start_date);

-- ---------------------------------------------------------------------
-- Auto-generate `order_number` on insert
-- (Doing this in a trigger rather than a generated column because
-- to_char() on a timestamptz depends on the session timezone, which
-- Postgres won't allow inside a generated-column expression.)
-- ---------------------------------------------------------------------
create or replace function set_order_number()
returns trigger as $$
begin
  if new.order_number is null then
    new.order_number := 'LT-' || to_char(now(), 'YYMM') || '-' || substr(new.id::text, 1, 4);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_orders_order_number
  before insert on orders
  for each row execute function set_order_number();

-- ---------------------------------------------------------------------
-- Auto-update `updated_at` on row changes
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_customers_updated before update on customers
  for each row execute function set_updated_at();
create trigger trg_measurements_updated before update on measurements
  for each row execute function set_updated_at();
create trigger trg_orders_updated before update on orders
  for each row execute function set_updated_at();
create trigger trg_enrollments_updated before update on institute_enrollments
  for each row execute function set_updated_at();

-- =====================================================================
-- ROW LEVEL SECURITY
-- Public site only needs to INSERT into institute_enrollments (class
-- registration form) and nothing else. All other tables are
-- admin-only, accessed with the service role key from the dashboard,
-- or via authenticated admin users. Adjust to taste as you add auth.
-- =====================================================================
alter table customers enable row level security;
alter table measurements enable row level security;
alter table orders enable row level security;
alter table institute_enrollments enable row level security;

-- Allow anyone (anon key) to submit a class registration
create policy "Public can register for classes"
  on institute_enrollments for insert
  to anon
  with check (true);

-- Admin (authenticated) users can do everything. In production, scope
-- this further to a specific admin role/claim rather than "any logged
-- in user" once you add staff accounts.
create policy "Authenticated staff full access to customers"
  on customers for all to authenticated using (true) with check (true);

create policy "Authenticated staff full access to measurements"
  on measurements for all to authenticated using (true) with check (true);

create policy "Authenticated staff full access to orders"
  on orders for all to authenticated using (true) with check (true);

create policy "Authenticated staff full access to enrollments"
  on institute_enrollments for all to authenticated using (true) with check (true);
