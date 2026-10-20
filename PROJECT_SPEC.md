# Project Spec

## Purpose

Clinic_With_2idiots is a demo clinic management system for role-based daily clinic operations. It supports admin, doctor, and reception workflows with demo authentication and local JSON-backed data.

## Current Scope

The current work scope is UI/UX redesign only.

Do not change the backend, API behavior, authentication flow, data model, or existing clinic features unless a specific bug fix is requested.

## Product Roles

- `admin`: reviews clinic overview, patients, and medicine stock.
- `doctor`: manages the active patient queue, consultations, diagnosis, notes, fees, prescriptions, patient history, and stock visibility.
- `reception`: registers patients, opens visits, tracks queue, handles billing, and checks medicine stock.

## Design Direction

The app should feel like a LabPro-inspired modern clinic staff portal:

- calm, trustworthy, clean, and medical
- operational dashboard rather than landing page
- fast to scan during a busy clinic day
- professional enough for a freelance client presentation
- consistent across admin, doctor, and reception screens

## Visual System

Recommended palette:

- Primary: deep medical navy
- Secondary: medium clinical blue
- Background: soft clinical gray
- Panel: pale lab blue
- Surfaces: white
- Text: deep navy / near black
- Success: emerald
- Warning: amber
- Danger: rose/red

UI style:

- moderate rounded panels, usually `12px` to `24px` based on screen density
- subtle borders and light shadows
- clear button hierarchy
- compact but readable forms and tables
- consistent status badges
- no decorative gradients or marketing-style hero sections inside dashboard workflows

Login page exception:

- The login page may use a more branded, landing-page-inspired first impression.
- It should still read as a staff portal, not a public patient marketing site.
- Current reference direction: clinical SaaS style with white, soft gray, pale blue panels, deep navy, and crisp operational cards.

Status and meaning:

- Blue/navy: primary navigation, neutral action, trusted workflow.
- Emerald: completed, healthy, successful, and revenue/money display.
- Amber: waiting, warning, low-stock attention.
- Rose/red: danger, delete, critical, or out-of-stock moments.

## Redesign Plan

1. Login page first impression - done
2. Global visual system cleanup - in progress
3. Dashboard shell and sidebar - done
4. Admin overview, patients, and stock screens - done
5. Doctor queue workbench, consultation visit page, history, overview, and stock screens - done
6. Reception screens - partially affected by shared overview, still needs dedicated review
7. Responsive QA and final polish - remaining

## Completed UI Work

- Login page redesigned into a clinical SaaS staff portal with updated hero, operational badges, demo account panel, and sign-in form styling.
- Shared dashboard shell redesigned with light clinical sidebar navigation, role workspace label, logout styling, and page-level back button.
- Admin overview refreshed with KPI cards, workflow cards, low-stock reminders, and compact emerald revenue cards.
- Admin patients refreshed with patient registry summary cards, search panel, table styling, tags, and empty state.
- Admin stock refreshed with inventory summary cards, create-medicine panel, medicine table polish, edit panel styling, action states, and empty states.
- Doctor queue refreshed into an active workbench with grouped `Waiting`, `In consultation`, and `Ready for billing` sections, a compact workflow status strip, responsive clinical rows, visible desktop/mobile action buttons, and the doctor nav label renamed to `Queue`.
- Doctor consultation visit page refreshed with a stronger patient context header, status badge, symptoms panel, clearer clinical note zone, polished prescription builder, live billing totals, emerald handoff panel, and compact patient history cards.
- Doctor patient history refreshed with medical record cards, summary strip, status chips, visit fee display, and empty state.
- Doctor overview refreshed through the shared `PortalOverview` component with clinical KPI cards, activity panels, workflow status, money-green revenue cards, and stock reminders.
- Doctor stock page copy polished so it reads as a read-only medicine reference while preserving admin-only edit behavior.

See `CHANGELOG.md` for changed files.

## Remaining UI Work

- Dedicated reception-side UI review beyond the shared overview changes.
- Responsive visual QA across desktop and mobile.
- Optional image optimization cleanup for existing `<img>` lint warnings if the project owner approves that code-style change.
