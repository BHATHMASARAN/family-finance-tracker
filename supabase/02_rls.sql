-- ============================================================================
-- Family Finance Tracker — Row Level Security
-- Run after 01_schema.sql
-- ============================================================================

-- Helper functions (SECURITY DEFINER so they can read `profiles` without
-- recursively triggering RLS on profiles itself).
create or replace function auth_family_id()
returns uuid
language sql security definer stable
set search_path = public
as $$
  select family_id from profiles where id = auth.uid();
$$;

create or replace function auth_role()
returns text
language sql security definer stable
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function auth_is_admin()
returns boolean
language sql security definer stable
set search_path = public
as $$
  select coalesce((select role from profiles where id = auth.uid()) = 'admin', false);
$$;

-- Enable RLS everywhere
alter table families enable row level security;
alter table profiles enable row level security;
alter table accounts enable row level security;
alter table expenses enable row level security;
alter table income enable row level security;
alter table loans enable row level security;
alter table loan_payments enable row level security;
alter table budgets enable row level security;
alter table recurring_payments enable row level security;
alter table savings_goals enable row level security;
alter table family_settings enable row level security;

-- ---------------------------------------------------------------------------
-- families: members can see their own family; only admins can update it.
-- ---------------------------------------------------------------------------
create policy "families_select_own" on families
  for select using (id = auth_family_id());
create policy "families_update_admin" on families
  for update using (id = auth_family_id() and auth_is_admin());

-- ---------------------------------------------------------------------------
-- profiles: everyone in a family can see each other. Only admins may
-- insert/update/delete profiles (member creation is done via invite by an
-- admin — see README, there is no public self-registration).
-- ---------------------------------------------------------------------------
create policy "profiles_select_family" on profiles
  for select using (family_id = auth_family_id());
create policy "profiles_update_self_or_admin" on profiles
  for update using (id = auth.uid() or (family_id = auth_family_id() and auth_is_admin()));
create policy "profiles_admin_insert" on profiles
  for insert with check (family_id = auth_family_id() and auth_is_admin());
create policy "profiles_admin_delete" on profiles
  for delete using (family_id = auth_family_id() and auth_is_admin() and id <> auth.uid());

-- ---------------------------------------------------------------------------
-- accounts: full family visibility. Admins manage all accounts; members
-- may manage accounts they own.
-- ---------------------------------------------------------------------------
create policy "accounts_select_family" on accounts
  for select using (family_id = auth_family_id());
create policy "accounts_insert_family" on accounts
  for insert with check (family_id = auth_family_id());
create policy "accounts_update_owner_or_admin" on accounts
  for update using (family_id = auth_family_id() and (owner_id = auth.uid() or auth_is_admin()));
create policy "accounts_delete_admin" on accounts
  for delete using (family_id = auth_family_id() and auth_is_admin());

-- ---------------------------------------------------------------------------
-- expenses: family-wide visibility (so summaries work). Members can add
-- expenses; a member may edit/delete only their own, admins may edit/delete
-- any.
-- ---------------------------------------------------------------------------
create policy "expenses_select_family" on expenses
  for select using (family_id = auth_family_id());
create policy "expenses_insert_family" on expenses
  for insert with check (family_id = auth_family_id() and (user_id = auth.uid() or auth_is_admin()));
create policy "expenses_update_own_or_admin" on expenses
  for update using (family_id = auth_family_id() and (user_id = auth.uid() or auth_is_admin()));
create policy "expenses_delete_own_or_admin" on expenses
  for delete using (family_id = auth_family_id() and (user_id = auth.uid() or auth_is_admin()));

-- ---------------------------------------------------------------------------
-- income: same shape as expenses.
-- ---------------------------------------------------------------------------
create policy "income_select_family" on income
  for select using (family_id = auth_family_id());
create policy "income_insert_family" on income
  for insert with check (family_id = auth_family_id() and (user_id = auth.uid() or auth_is_admin()));
create policy "income_update_own_or_admin" on income
  for update using (family_id = auth_family_id() and (user_id = auth.uid() or auth_is_admin()));
create policy "income_delete_own_or_admin" on income
  for delete using (family_id = auth_family_id() and (user_id = auth.uid() or auth_is_admin()));

-- ---------------------------------------------------------------------------
-- loans / loan_payments / budgets / recurring_payments / savings_goals /
-- family_settings: shared family financial data — visible to all family
-- members, but only admins can create/edit/delete (these are family-level
-- commitments, not personal transactions).
-- ---------------------------------------------------------------------------
create policy "loans_select_family" on loans
  for select using (family_id = auth_family_id());
create policy "loans_admin_write" on loans
  for insert with check (family_id = auth_family_id() and auth_is_admin());
create policy "loans_admin_update" on loans
  for update using (family_id = auth_family_id() and auth_is_admin());
create policy "loans_admin_delete" on loans
  for delete using (family_id = auth_family_id() and auth_is_admin());

create policy "loan_payments_select_family" on loan_payments
  for select using (family_id = auth_family_id());
create policy "loan_payments_admin_write" on loan_payments
  for insert with check (family_id = auth_family_id() and auth_is_admin());
create policy "loan_payments_admin_update" on loan_payments
  for update using (family_id = auth_family_id() and auth_is_admin());
create policy "loan_payments_admin_delete" on loan_payments
  for delete using (family_id = auth_family_id() and auth_is_admin());

create policy "budgets_select_family" on budgets
  for select using (family_id = auth_family_id());
create policy "budgets_admin_write" on budgets
  for insert with check (family_id = auth_family_id() and auth_is_admin());
create policy "budgets_admin_update" on budgets
  for update using (family_id = auth_family_id() and auth_is_admin());
create policy "budgets_admin_delete" on budgets
  for delete using (family_id = auth_family_id() and auth_is_admin());

create policy "recurring_select_family" on recurring_payments
  for select using (family_id = auth_family_id());
create policy "recurring_admin_write" on recurring_payments
  for insert with check (family_id = auth_family_id() and auth_is_admin());
create policy "recurring_admin_update" on recurring_payments
  for update using (family_id = auth_family_id() and auth_is_admin());
create policy "recurring_admin_delete" on recurring_payments
  for delete using (family_id = auth_family_id() and auth_is_admin());

create policy "savings_select_family" on savings_goals
  for select using (family_id = auth_family_id());
create policy "savings_admin_write" on savings_goals
  for insert with check (family_id = auth_family_id() and auth_is_admin());
create policy "savings_admin_update" on savings_goals
  for update using (family_id = auth_family_id() and auth_is_admin());
create policy "savings_admin_delete" on savings_goals
  for delete using (family_id = auth_family_id() and auth_is_admin());

create policy "family_settings_select" on family_settings
  for select using (family_id = auth_family_id());
create policy "family_settings_admin_upsert" on family_settings
  for insert with check (family_id = auth_family_id() and auth_is_admin());
create policy "family_settings_admin_update" on family_settings
  for update using (family_id = auth_family_id() and auth_is_admin());
