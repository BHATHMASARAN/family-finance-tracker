"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getFamilyMembers() {
  const supabase = createClient();
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function updateMemberRole(id: string, role: "admin" | "member") {
  const supabase = createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/family");
  return { error: null };
}

export async function updateProfile(id: string, input: { full_name?: string; avatar_url?: string | null }) {
  const supabase = createClient();
  const { error } = await supabase.from("profiles").update(input).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/profile");
  revalidatePath("/family");
  return { error: null };
}
