# Clinic_With_2idiots

This project is a working clinic management demo with:

- cookie-based demo authentication
- role-based dashboards for `admin`, `doctor`, and `reception`
- backend API routes for login, patient creation, visit updates, counter completion, and stock changes
- local JSON demo storage for quick testing
- Supabase schema and seed files for a future database-backed setup

The current project phase is UI/UX redesign only. Backend logic, routes, authentication, and clinic workflows should stay unchanged unless a bug fix is required.

## Default login

- `admin` / `admin123`
- `doctor` / `doctor123`
- `reception` / `reception123`

## Run locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Current UI/UX direction

The current redesign direction is a LabPro-inspired modern clinic staff portal:

- deep medical navy, clinical blue, white, soft gray, and pale lab-blue panels
- soft emerald money-green treatment for revenue and completed/healthy states
- amber for waiting/warning states and rose/red for danger or urgent stock states
- clean operational dashboard layouts instead of marketing-style pages
- professional buttons, forms, tables, status badges, and role-based navigation
- fast scanning for reception, doctor, billing, and medicine stock workflows
- restrained shadows, clear spacing, and consistent border radius

The redesign is focused on presentation only. Existing clinic workflows, API routes, demo auth, local data behavior, and role permissions should remain unchanged unless a specific bug fix is requested.

Completed UI/UX refresh areas:

- Login page and sign-in panel
- Shared dashboard shell, sidebar navigation, logout button, and back button
- Admin overview, patient registry, stock tools, medicine table, and revenue cards
- Doctor queue workbench, active consultation visit page, patient history, overview, and stock reference copy
- Shared `PortalOverview` component used by doctor and reception overview pages

See `PROJECT_SPEC.md` and `CHANGELOG.md` for the current design plan and edited files.

## Supabase setup

The app currently runs locally without Supabase. The committed Supabase files are available if the project later needs database-backed testing.

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

## What each role can test

- `admin`: review demo users, see reports, adjust medicine stock
- `reception`: register patients, create visits, complete prescriptions at counter
- `doctor`: manage the active queue, continue consultations, review billing-ready visits, enter diagnosis, notes, fees, and stock-based prescriptions

## UI/UX work rules

- Keep backend behavior, data model, API routes, authentication, and feature logic unchanged.
- Record every changed file in `CHANGELOG.md`.
- Prefer focused design changes that match the existing role workflow.
- Run `npm run lint` after UI edits.

Current lint status:

- `npm run lint` passes with 0 errors.
- Existing warnings remain for `<img>` usage in `src/components/admin-actions.tsx` and `src/components/medicine-stock-table.tsx`.

## Useful commands

```bash
npm run lint
npm run build
```
