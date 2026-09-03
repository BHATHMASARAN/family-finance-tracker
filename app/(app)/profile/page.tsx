"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { updateProfile } from "@/lib/actions/family";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [pwd, setPwd] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => {
    if (profile) setName(profile.full_name);
  }, [profile]);

  if (!profile) return null;

  const handleSave = async () => {
    setSaving(true);
    const result = await updateProfile(profile.id, { full_name: name });
    setSaving(false);
    if (result?.error) showToast(result.error, "error");
    else {
      showToast("Profile updated");
      refreshProfile();
    }
  };

  const handlePasswordChange = async () => {
    if (pwd.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }
    setPwdSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setPwdSaving(false);
    if (error) showToast(error.message, "error");
    else {
      showToast("Password updated");
      setPwd("");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          {profile.full_name[0]}
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{profile.full_name}</p>
          <p className="text-sm text-slate-400">{profile.email}</p>
          <Badge tone={profile.role === "admin" ? "success" : "neutral"} className="mt-1">{profile.role}</Badge>
        </div>
      </Card>

      <Card>
        <p className="mb-3 text-sm font-semibold text-slate-500">Edit Name</p>
        <div className="flex gap-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
          <Button onClick={handleSave} loading={saving}>Save</Button>
        </div>
      </Card>

      <Card>
        <p className="mb-3 text-sm font-semibold text-slate-500">Change Password</p>
        <div className="flex gap-3">
          <Input type="password" placeholder="New password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="flex-1" />
          <Button onClick={handlePasswordChange} loading={pwdSaving}>Update</Button>
        </div>
      </Card>
    </div>
  );
}
