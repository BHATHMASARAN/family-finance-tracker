-- ============================================================================
-- Family Finance Tracker — Database Schema
-- Run this first in the Supabase SQL Editor.
-- ============================================================================
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- families
-- ---------------------------------------------------------------------------
create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  family_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_profiles_family on profiles(family_id);

-- ---------------------------------------------------------------------------
-- accounts
-- ---------------------------------------------------------------------------
create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  owner_id uuid references profiles(id) on delete set null,
  account_name text not null,
  account_type text not null check (account_type in ('Cash','Bank','Savings','UPI','Wallet','Other')),
  opening_balance numeric(14,2) not null default 0,
  current_balance numeric(14,2) not null default 0,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_accounts_family on accounts(family_id);
create index if not exists idx_accounts_owner on accounts(owner_id);

-- ---------------------------------------------------------------------------
-- expenses
-- ---------------------------------------------------------------------------
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  account_id uuid not null references accounts(id) on delete restrict,
  amount numeric(14,2) not null check (amount > 0),
  category text not null check (category in (
    'Food','Groceries','Travel','Fuel','Shopping','Medical','Education',
    'Electricity','Water','Internet','Mobile','Rent','EMI','Entertainment','Family','Other'
  )),
  description text,
  expense_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_expenses_family on expenses(family_id);
create index if not exists idx_expenses_user on expenses(user_id);
create index if not exists idx_expenses_date on expenses(expense_date);
create index if not exists idx_expenses_category on expenses(category);

-- ---------------------------------------------------------------------------
-- income
-- ---------------------------------------------------------------------------
create table if not exists income (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  account_id uuid not null references accounts(id) on delete restrict,
  amount numeric(14,2) not null check (amount > 0),
  income_type text not null check (income_type in
    ('Salary','Business','Freelance','Rental','Interest','Bonus','Other')),
  description text,
  income_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_income_family on income(family_id);
create index if not exists idx_income_user on income(user_id);
create index if not exists idx_income_date on income(income_date);

-- ---------------------------------------------------------------------------
-- loans
-- ---------------------------------------------------------------------------
create table if not exists loans (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  loan_name text not null,
  loan_type text not null check (loan_type in
    ('Home Loan','Personal Loan','Vehicle Loan','Education Loan','Credit Card','Borrowed Money','Other')),
  lender_name text,
  original_amount numeric(14,2) not null check (original_amount >= 0),
  remaining_amount numeric(14,2) not null check (remaining_amount >= 0),
  interest_rate numeric(5,2) default 0,
  emi_amount numeric(14,2) default 0,
  start_date date,
  end_date date,
  next_payment_date date,
  status text not null default 'Active' check (status in ('Active','Completed','Closed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_loans_family on loans(family_id);
create index if not exists idx_loans_status on loans(status);

-- ---------------------------------------------------------------------------
-- loan_payments
-- ---------------------------------------------------------------------------
create table if not exists loan_payments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references loans(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  account_id uuid references accounts(id) on delete set null,
  amount numeric(14,2) not null check (amount > 0),
  payment_date date not null default current_date,
  payment_type text not null default 'EMI' check (payment_type in ('EMI','Partial','Full Settlement','Other')),
  status text not null default 'Paid' check (status in ('Paid','Pending','Overdue')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_loan_payments_loan on loan_payments(loan_id);
create index if not exists idx_loan_payments_family on loan_payments(family_id);

-- ---------------------------------------------------------------------------
-- budgets
-- ---------------------------------------------------------------------------
create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  category text not null,
  budget_amount numeric(14,2) not null check (budget_amount >= 0),
  month int not null check (month between 1 and 12),
  year int not null check (year between 2000 and 2100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, category, month, year)
);
create index if not exists idx_budgets_family_month on budgets(family_id, year, month);

-- ---------------------------------------------------------------------------
-- recurring_payments (upcoming payments / bills)
-- ---------------------------------------------------------------------------
create table if not exists recurring_payments (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  payment_name text not null,
  amount numeric(14,2) not null check (amount >= 0),
  category text not null default 'Other',
  due_date date not null,
  frequency text not null default 'Monthly' check (frequency in ('One Time','Monthly','Quarterly','Yearly')),
  account_id uuid references accounts(id) on delete set null,
  status text not null default 'Upcoming' check (status in ('Upcoming','Paid','Overdue')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_recurring_family on recurring_payments(family_id);
create index if not exists idx_recurring_due on recurring_payments(due_date);

-- ---------------------------------------------------------------------------
-- savings_goals
-- ---------------------------------------------------------------------------
create table if not exists savings_goals (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  goal_name text not null,
  target_amount numeric(14,2) not null check (target_amount >= 0),
  current_amount numeric(14,2) not null default 0,
  target_date date,
  status text not null default 'Active' check (status in ('Active','Completed','Cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_savings_family on savings_goals(family_id);

-- ---------------------------------------------------------------------------
-- family_settings (money-needed calculator configuration)
-- ---------------------------------------------------------------------------
create table if not exists family_settings (
  family_id uuid primary key references families(id) on delete cascade,
  upcoming_days int not null default 30,
  emergency_reserve numeric(14,2) not null default 0,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at auto-touch trigger
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  for t in select unnest(array[
    'families','profiles','accounts','expenses','income','loans',
    'loan_payments','budgets','recurring_payments','savings_goals'
  ])
  loop
    execute format('drop trigger if exists trg_%1$s_updated_at on %1$s', t);
    execute format('create trigger trg_%1$s_updated_at before update on %1$s
                     for each row execute function set_updated_at()', t);
  end loop;
end $$;
