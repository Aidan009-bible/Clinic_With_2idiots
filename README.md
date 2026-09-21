# Clinic_With_2idiots

This project is now a working clinic demo with:

- cookie-based demo authentication
- role-based dashboards for `admin`, `doctor`, and `reception`
- backend API routes for login, patient creation, visit updates, counter completion, and stock changes
- Supabase-backed data for real testing
- automatic local JSON fallback when Supabase tables are missing

## Default login

- `admin` / `admin123`
- `doctor` / `doctor123`
- `reception` / `reception123`

## Supabase setup

1. Copy `.env.example` to `.env.local`
2. Add:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. In Supabase SQL Editor, rerun:

- `supabase/schema.sql`
- `supabase/seed.sql`

Important:
- this updated schema adds demo passwords plus visit diagnosis, notes, and prescription fields
- row level security is disabled on these demo tables so the anon key can be used for testing
- if Supabase is not ready, the app will store demo changes in `data/clinic-store.json`

## Run

```bash
npm run dev
```

Then open `http://localhost:3000`.

## What each role can test

- `admin`: review demo users, see reports, adjust medicine stock
- `reception`: register patients, create visits, complete prescriptions at counter
- `doctor`: manage the waiting queue, diagnosis, notes, fees, and stock-based prescriptions
