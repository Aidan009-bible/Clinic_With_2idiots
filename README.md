# Clinic System

A Next.js / TypeScript prototype for a small clinic's reception, doctor, and admin workflows. It shows patient registration, visit queues, prescriptions, billing, and medicine stock.

**[Try the public interactive demo](https://aidan-projects.nuttyoak11.chatgpt.site/demo/clinic.html).** The public demo is a browser-only simulation with synthetic data; it does not connect to this app or a patient database.

## Run locally

1. Run `npm install`.
2. Copy `.env.example` to `.env.local` and set `CLINIC_SESSION_SECRET` to a random value of at least 32 characters.
3. Run `npm run dev` and open `http://localhost:3000`.

Demo accounts: `admin/admin123`, `doctor/doctor123`, `reception/reception123`. The app stores test changes in an ignored local JSON file at `data/clinic-store.json`.

## Important limits

This is a learning prototype. The demo accounts are intentionally public. Do not deploy it with real patient information, use the sample passwords for a real clinic, or treat its role screens as production access control. Sessions are signed, but the app still needs proper user identity, authorization, audit trails, validated input, and durable protected storage before real use.

The `supabase/` SQL is a reference prototype. Its tables have row level security enabled with no public policies. The current app uses local JSON; Supabase is not wired into these workflows. Review database policies and password storage before connecting any live project.

## Roles

- **Reception:** register patients, create visits, and complete billing.
- **Doctor:** handle the queue, diagnosis, notes, and prescriptions.
- **Admin:** view operations and manage medicine stock.
