-- ============================================================================
-- Family Finance Tracker — OPTIONAL sample data for local development.
-- Safe to skip entirely in production. To remove sample data later, run:
--   delete from families where family_name = 'Demo Family';
-- (cascades to every table below via foreign keys).
--
-- IMPORTANT: this file only seeds financial data. The three auth users +
-- their `profiles` rows must exist first — create them in
-- Supabase Studio > Authentication > Users (see README "Creating the 3
-- family members"), then replace the placeholder UUIDs below with the real
-- auth.users ids before running this file.
-- ============================================================================

insert into families (id, family_name) values
  ('00000000-0000-0000-0000-000000000001', 'Demo Family')
on conflict (id) do nothing;

-- Replace these three ids with the real auth.users ids after creating the
-- accounts in Supabase Auth, then run the profiles insert.
-- insert into profiles (id, family_id, full_name, email, role) values
--   ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Admin', 'admin@family.local', 'admin'),
--   ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Mom', 'mom@family.local', 'member'),
--   ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Brother', 'brother@family.local', 'member');

insert into family_settings (family_id, upcoming_days, emergency_reserve) values
  ('00000000-0000-0000-0000-000000000001', 30, 10000)
on conflict (family_id) do nothing;

-- Accounts
insert into accounts (id, family_id, account_name, account_type, opening_balance, current_balance) values
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'HDFC Bank', 'Bank', 50000, 62000),
  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Cash in Hand', 'Cash', 5000, 3200),
  ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'GPay UPI', 'UPI', 2000, 4500),
  ('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'SBI Savings', 'Savings', 150000, 168000)
on conflict (id) do nothing;

-- Loans
insert into loans (id, family_id, loan_name, loan_type, lender_name, original_amount, remaining_amount, interest_rate, emi_amount, start_date, next_payment_date, status) values
  ('b0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Home Loan', 'Home Loan', 'HDFC Ltd', 2500000, 1980000, 8.5, 22000, '2022-04-01', '2026-09-05', 'Active'),
  ('b0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Car Loan', 'Vehicle Loan', 'SBI', 600000, 210000, 9.2, 12000, '2023-06-01', '2026-09-10', 'Active'),
  ('b0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Personal Loan', 'Personal Loan', 'Bajaj Finserv', 150000, 45000, 13.0, 8000, '2024-01-01', '2026-09-15', 'Active')
on conflict (id) do nothing;

-- Budgets (current month placeholder — adjust year/month as needed)
insert into budgets (family_id, category, budget_amount, month, year) values
  ('00000000-0000-0000-0000-000000000001', 'Food', 10000, 8, 2026),
  ('00000000-0000-0000-0000-000000000001', 'Travel', 5000, 8, 2026),
  ('00000000-0000-0000-0000-000000000001', 'Electricity', 3000, 8, 2026),
  ('00000000-0000-0000-0000-000000000001', 'Shopping', 5000, 8, 2026),
  ('00000000-0000-0000-0000-000000000001', 'Medical', 3000, 8, 2026),
  ('00000000-0000-0000-0000-000000000001', 'Other', 5000, 8, 2026)
on conflict do nothing;

-- Upcoming bills
insert into recurring_payments (family_id, payment_name, amount, category, due_date, frequency, status) values
  ('00000000-0000-0000-0000-000000000001', 'Electricity Bill', 2400, 'Electricity', '2026-09-05', 'Monthly', 'Upcoming'),
  ('00000000-0000-0000-0000-000000000001', 'Internet Bill', 999, 'Internet', '2026-09-07', 'Monthly', 'Upcoming'),
  ('00000000-0000-0000-0000-000000000001', 'Mobile Recharge', 599, 'Mobile', '2026-09-03', 'Monthly', 'Upcoming'),
  ('00000000-0000-0000-0000-000000000001', 'Health Insurance', 18000, 'Other', '2026-11-01', 'Yearly', 'Upcoming');

-- Savings goals
insert into savings_goals (family_id, goal_name, target_amount, current_amount, target_date, status) values
  ('00000000-0000-0000-0000-000000000001', 'Emergency Fund', 300000, 168000, '2027-03-01', 'Active'),
  ('00000000-0000-0000-0000-000000000001', 'Family Vacation', 80000, 22000, '2027-01-01', 'Active');

-- Note: expense / income sample rows are intentionally left out of this file
-- because they must go through add_expense()/add_income() to keep account
-- balances consistent, and they need real profile ids for user_id. Once your
-- 3 profiles exist, insert sample transactions via the app itself (Add
-- Expense / Add Income screens) rather than raw SQL.
