export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateAmount(value: string | number): string | null {
  const n = Number(value);
  if (value === "" || value === null || value === undefined) return "Amount is required";
  if (Number.isNaN(n)) return "Amount must be a number";
  if (n <= 0) return "Amount must be greater than 0";
  if (n > 999999999) return "Amount is too large";
  return null;
}

export function validateRequired(value: string | undefined | null, label: string): string | null {
  if (!value || value.trim() === "") return `${label} is required`;
  return null;
}

export function validateDate(value: string, label = "Date"): string | null {
  if (!value) return `${label} is required`;
  if (Number.isNaN(new Date(value).getTime())) return `${label} is invalid`;
  return null;
}
