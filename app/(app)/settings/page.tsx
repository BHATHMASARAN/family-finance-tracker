"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { getFamilySettings, updateFamilySettings } from "@/lib/actions/settings";
import { useTheme } from "next-themes";
import { Moon, Sun, LogOut } from "lucide-react";

export default function SettingsPage() {
  const { profile, signOut } = useAuth();
  const { showToast } = useToast();
  const { theme, setTheme } = useTheme();
  const [days, setDays] = useState("30");
  const [reserve, setReserve] = useState("0");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    getFamilySettings(profile.family_id).then((s) => {
      setDays(String(s.upcoming_days));
      setReserve(String(s.emergency_reserve));
      setLoading(false);
    });
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const result = await updateFamilySettings({
      family_id: profile.family_id,
      upcoming_days: Number(days) || 30,
      emergency_reserve: Number(reserve) || 0,
    });
    setSaving(false);
    if (result?.error) showToast(result.error, "error");
    else showToast("Settings saved");
  };

  const isAdmin = profile?.role === "admin";

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
        <div className="flex gap-3">
          <Button variant={theme === "light" ? "primary" : "secondary"} onClick={() => setTheme("light")} className="flex-1">
            <Sun size={16} /> Light
          </Button>
          <Button variant={theme === "dark" ? "primary" : "secondary"} onClick={() => setTheme("dark")} className="flex-1">
            <Moon size={16} /> Dark
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Money Needed Calculator</CardTitle></CardHeader>
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : (
          <div className="flex flex-col gap-4">
            <Input
              label="Upcoming Days to Consider"
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              disabled={!isAdmin}
            />
            <Input
              label="Emergency Reserve (₹)"
              type="number"
              value={reserve}
              onChange={(e) => setReserve(e.target.value)}
              disabled={!isAdmin}
            />
            {isAdmin ? (
              <Button onClick={handleSave} loading={saving}>Save Settings</Button>
            ) : (
              <p className="text-xs text-slate-400">Only admins can change these settings.</p>
            )}
          </div>
        )}
      </Card>

      <Card>
        <Button variant="danger" className="w-full" onClick={signOut}>
          <LogOut size={16} /> Sign Out
        </Button>
      </Card>
    </div>
  );
}
