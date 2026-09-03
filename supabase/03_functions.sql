-- ============================================================================
-- Family Finance Tracker — Atomic financial operations
-- These run as the calling user (SECURITY INVOKER, the default), so all
-- existing RLS policies on the underlying tables are still enforced. Each
-- function body executes as a single statement: if any step raises, every
-- change in the function is rolled back, so account balances can never end
-- up out of sync with the transactions that produced them.
-- Run after 01_schema.sql and 02_rls.sql
-- ============================================================================

-- ---------- EXPENSES ----------

create or replace function add_expense(
  p_family_id uuid, p_user_id uuid, p_account_id uuid, p_amount numeric,
  p_category text, p_description text, p_expense_date date
) returns uuid language plpgsql as $$
declare v_id uuid;
begin
  insert into expenses (family_id, user_id, account_id, amount, category, description, expense_date)
  values (p_family_id, p_user_id, p_account_id, p_amount, p_category, p_description, p_expense_date)
  returning id into v_id;

  update accounts set current_balance = current_balance - p_amount
  where id = p_account_id and family_id = p_family_id;

  return v_id;
end;
$$;

create or replace function update_expense(
  p_id uuid, p_account_id uuid, p_amount numeric, p_category text,
  p_description text, p_expense_date date
) returns void language plpgsql as $$
declare v_old expenses%rowtype;
begin
  select * into v_old from expenses where id = p_id;
  if not found then raise exception 'Expense not found'; end if;

  -- reverse old impact
  update accounts set current_balance = current_balance + v_old.amount
  where id = v_old.account_id and family_id = v_old.family_id;

  -- apply new impact
  update accounts set current_balance = current_balance - p_amount
  where id = p_account_id and family_id = v_old.family_id;

  update expenses
  set account_id = p_account_id, amount = p_amount, category = p_category,
      description = p_description, expense_date = p_expense_date
  where id = p_id;
end;
$$;

create or replace function delete_expense(p_id uuid) returns void language plpgsql as $$
declare v_old expenses%rowtype;
begin
  select * into v_old from expenses where id = p_id;
  if not found then raise exception 'Expense not found'; end if;

  update accounts set current_balance = current_balance + v_old.amount
  where id = v_old.account_id and family_id = v_old.family_id;

  delete from expenses where id = p_id;
end;
$$;

-- ---------- INCOME ----------

create or replace function add_income(
  p_family_id uuid, p_user_id uuid, p_account_id uuid, p_amount numeric,
  p_income_type text, p_description text, p_income_date date
) returns uuid language plpgsql as $$
declare v_id uuid;
begin
  insert into income (family_id, user_id, account_id, amount, income_type, description, income_date)
  values (p_family_id, p_user_id, p_account_id, p_amount, p_income_type, p_description, p_income_date)
  returning id into v_id;

  update accounts set current_balance = current_balance + p_amount
  where id = p_account_id and family_id = p_family_id;

  return v_id;
end;
$$;

create or replace function update_income(
  p_id uuid, p_account_id uuid, p_amount numeric, p_income_type text,
  p_description text, p_income_date date
) returns void language plpgsql as $$
declare v_old income%rowtype;
begin
  select * into v_old from income where id = p_id;
  if not found then raise exception 'Income not found'; end if;

  update accounts set current_balance = current_balance - v_old.amount
  where id = v_old.account_id and family_id = v_old.family_id;

  update accounts set current_balance = current_balance + p_amount
  where id = p_account_id and family_id = v_old.family_id;

  update income
  set account_id = p_account_id, amount = p_amount, income_type = p_income_type,
      description = p_description, income_date = p_income_date
  where id = p_id;
end;
$$;

create or replace function delete_income(p_id uuid) returns void language plpgsql as $$
declare v_old income%rowtype;
begin
  select * into v_old from income where id = p_id;
  if not found then raise exception 'Income not found'; end if;

  update accounts set current_balance = current_balance - v_old.amount
  where id = v_old.account_id and family_id = v_old.family_id;

  delete from income where id = p_id;
end;
$$;

-- ---------- LOAN PAYMENTS ----------
-- Recording a payment: creates history row, deducts account balance,
-- reduces loan remaining_amount, advances next_payment_date by one month,
-- and flips loan status to Completed once the remaining amount hits 0.

create or replace function add_loan_payment(
  p_loan_id uuid, p_family_id uuid, p_account_id uuid, p_amount numeric,
  p_payment_date date, p_payment_type text, p_notes text
) returns uuid language plpgsql as $$
declare v_id uuid; v_loan loans%rowtype;
begin
  select * into v_loan from loans where id = p_loan_id and family_id = p_family_id;
  if not found then raise exception 'Loan not found'; end if;

  insert into loan_payments (loan_id, family_id, account_id, amount, payment_date, payment_type, status, notes)
  values (p_loan_id, p_family_id, p_account_id, p_amount, p_payment_date, p_payment_type, 'Paid', p_notes)
  returning id into v_id;

  if p_account_id is not null then
    update accounts set current_balance = current_balance - p_amount
    where id = p_account_id and family_id = p_family_id;
  end if;

  update loans
  set remaining_amount = greatest(0, remaining_amount - p_amount),
      next_payment_date = case
        when greatest(0, remaining_amount - p_amount) <= 0 then null
        else coalesce(next_payment_date, p_payment_date) + interval '1 month'
      end,
      status = case when remaining_amount - p_amount <= 0 then 'Completed' else status end
  where id = p_loan_id;

  return v_id;
end;
$$;

create or replace function delete_loan_payment(p_id uuid) returns void language plpgsql as $$
declare v_old loan_payments%rowtype;
begin
  select * into v_old from loan_payments where id = p_id;
  if not found then raise exception 'Payment not found'; end if;

  if v_old.account_id is not null then
    update accounts set current_balance = current_balance + v_old.amount
    where id = v_old.account_id and family_id = v_old.family_id;
  end if;

  update loans
  set remaining_amount = remaining_amount + v_old.amount,
      status = case when status = 'Completed' then 'Active' else status end
  where id = v_old.loan_id;

  delete from loan_payments where id = p_id;
end;
$$;
