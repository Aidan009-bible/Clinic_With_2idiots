create extension if not exists pgcrypto;

create table if not exists demo_users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password text not null,
  password_hint text not null,
  role text not null check (role in ('admin', 'doctor1', 'doctor2', 'reception')),
  screens text[] not null default '{}'
);

create table if not exists patients (
  id text primary key,
  patient_code text unique not null,
  name text not null,
  age integer not null,
  phone text not null,
  last_visit date not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists visits (
  id text primary key,
  patient_code text not null references patients(patient_code),
  patient_name text not null,
  doctor text not null check (doctor in ('doctor1', 'doctor2')),
  status text not null check (status in ('Waiting', 'With Doctor', 'Prescription Ready', 'Completed')),
  waiting_minutes integer not null default 0,
  symptoms text[] not null default '{}',
  diagnosis text not null default '',
  notes text not null default '',
  prescription jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists medicines (
  id text primary key,
  name text not null,
  stock integer not null default 0,
  unit text not null,
  expiry date not null,
  low_stock boolean not null default false
);

create table if not exists reports_summary (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null,
  label text not null,
  value text not null,
  detail text not null
);

alter table demo_users add column if not exists password text not null default 'demo123';
alter table visits add column if not exists diagnosis text not null default '';
alter table visits add column if not exists notes text not null default '';
alter table visits add column if not exists prescription jsonb not null default '[]'::jsonb;

-- Closed by default. Define reviewed policies before connecting a real database.
alter table demo_users enable row level security;
alter table patients enable row level security;
alter table visits enable row level security;
alter table medicines enable row level security;
alter table reports_summary enable row level security;
