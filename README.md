# Family Finance Tracker

A private, mobile-first financial management app for a 3-person family (Admin, Mom, Brother). Built with Next.js 14 (App Router, TypeScript), Tailwind CSS, Supabase (Postgres + Auth + Row Level Security), and Recharts.

## What's included

- Email/password auth via Supabase Auth, no public sign-up — only the admin can create members
- Accounts (Cash/Bank/Savings/UPI/Wallet), with a running `current_balance` kept in sync automatically
- Expenses & Income CRUD, both driving account balances through **atomic Postgres functions** (`add_expense`, `update_expense`, `delete_expense`, and the `_income` equivalents) so a balance can never drift from its transactions
- Loans & EMI tracking, with an `add_loan_payment` function that records history, deducts the paying account, reduces the loan's remaining balance, advances the next due date, and auto-completes the loan at ₹0
- Monthly category budgets with 80%/100% warnings and a family-wide "Remaining Budget" figure
- Savings goals with progress bars
- Upcoming/recurring bills with due/this-week/this-month/overdue buckets and a "mark paid" action that also logs the outflow as an expense
- A configurable **Money Needed** calculator (`upcoming days` + `emergency reserve`, editable by admins in Settings)
- Dashboard with all summary cards, income vs expense, category/member charts, budget & loan progress, upcoming bills, and recent transactions
- Reports page with This Week / This Month / Last Month / This Year / Custom Date Range filters
- Full Row Level Security: every table is scoped to `family_id`; only admins can write to family-level tables (loans, budgets, bills, savings); members can only edit their own expenses/income
- Mobile bottom nav (with a center "Add" sheet) + desktop sidebar, dark/light mode, Indian Rupee formatting (₹1,00,000 style) throughout

## 1. Create the Supabase project

1. Go to supabase.com → New Project.
2. In **SQL Editor**, run the three files in `/supabase` **in order**:
   1. `01_schema.sql` — tables, indexes, triggers
   2. `02_rls.sql` — Row Level Security policies
   3. `03_functions.sql` — atomic balance-safe functions
3. (Optional) run `04_seed.sql` for sample accounts/loans/budgets/bills — see the notes inside that file about profiles and about not seeding transactions via raw SQL.

## 2. Create the 3 family members

There is no public registration page by design. To create the three approved logins:

1. Supabase Dashboard → **Authentication → Users → Add User** (set email + password) — do this 3 times, once each for Admin, Mom, Brother.
2. Copy each new user's UUID.
3. In **SQL Editor**, create the family and link each user to a `profiles` row:

```sql
insert into families (id, family_name) values ('<uuid>', 'Your Family Name');

insert into profiles (id, family_id, full_name, email, role) values
  ('<admin-auth-uid>',   '<family-id>', 'Admin',   'admin@example.com',   'admin'),
  ('<mom-auth-uid>',     '<family-id>', 'Mom',     'mom@example.com',     'member'),
  ('<brother-auth-uid>', '<family-id>', 'Brother', 'brother@example.com','member');

insert into family_settings (family_id, upcoming_days, emergency_reserve)
  values ('<family-id>', 30, 10000);
```

Everyone signs in at `/login` with the email/password you set in step 1.

## 3. Environment variables

Copy `.env.example` to `.env.local` for local dev:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

Both are safe to expose to the browser — RLS is what actually protects the data. `SUPABASE_SERVICE_ROLE_KEY` is listed in `.env.example` for completeness (e.g. if you later build an admin-only user-invite API route) but nothing in this codebase uses it, and it must **never** get a `NEXT_PUBLIC_` prefix.

## 4. Install, run, build

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # run the production build locally
```

This project has already been built end-to-end in this environment with **zero TypeScript errors** and all 21 routes generating successfully.

## 5. Deploy to Vercel

1. Push this project to a GitHub repo.
2. In Vercel: **New Project → Import** the repo.
3. Framework preset: Next.js (auto-detected).
4. Add environment variables in **Project Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy. Every subsequent push to `main` redeploys automatically.
6. In Supabase → **Authentication → URL Configuration**, add your Vercel domain to the allowed Site URL / Redirect URLs so auth cookies work in production.

## Project structure

```
app/
  login/                  public login page
  (app)/                  everything behind auth (protected layout + bottom/side nav)
    dashboard/ expenses/ income/ accounts/ loans/ budget/
    savings/ payments/ reports/ family/ profile/ settings/
components/
  ui/                     Button, Card, Input, Select, Modal, Badge, EmptyState, ConfirmDialog...
  nav/                    Sidebar, BottomNav, AddSheet, Topbar
  dashboard/ expenses/ income/ accounts/ loans/ budget/ savings/ payments/ reports/ family/
lib/
  actions/                Server Actions — all Supabase writes/reads live here
  supabase/               browser / server / middleware Supabase clients
  types.ts calculations.ts format.ts validation.ts utils.ts
hooks/                    useAuth (profile/session), useToast
supabase/                 01_schema.sql 02_rls.sql 03_functions.sql 04_seed.sql
```

## How balances stay correct

Every write that touches money goes through a Postgres function (`supabase/03_functions.sql`), not a plain `insert`/`update`. Each function body is one atomic statement: if any step fails, everything in it rolls back, so an account's `current_balance` can never end up inconsistent with the expenses/income/loan payments that produced it. Editing a transaction reverses the old amount's effect and applies the new one in the same function call; deleting reverses it entirely.

## Security notes

- RLS is enabled on every table; policies key everything off the caller's `profiles.family_id` (via a `security definer` helper function so the check doesn't recursively hit RLS on `profiles`).
- Members can add/edit/delete their own expenses & income; only admins can write to loans, budgets, recurring bills, savings goals, and family settings.
- No service-role key is used anywhere in the app code — every query runs as the logged-in user through the anon key, so Postgres itself (not app logic) is the last line of defense.
