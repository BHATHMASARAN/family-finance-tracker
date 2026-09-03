"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getFamilySettings(familyId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("family_settings")
    .select("*")
    .eq("family_id", familyId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? { family_id: familyId, upcoming_days: 30, emergency_reserve: 0, updated_at: "" };
}

export async function updateFamilySettings(input: {
  family_id: string;
  upcoming_days: number;
  emergency_reserve: number;
}) {
  const supabase = createClient();
  const { error } = await supabase
    .from("family_settings")
    .upsert(input, { onConflict: "family_id" });
  if (error) return { error: error.message };
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { error: null };
}
