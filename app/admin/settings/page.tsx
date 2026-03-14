"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { safeFetch, getAuthHeaders } from "../utils/apiHelper";
import { getApiUrl } from "@/constant/apiendpoints";

interface SettingsState {
  app_name: string;
  support_email: string;
  allow_public_registration: boolean;
  require_email_verification: boolean;
  maintenance_mode: boolean;
  session_timeout: number;
  max_team_members: number;
  max_projects_per_user: number;
  team_invite_expiry_days: number;
  standard_daily_hours: string;
  overtime_hourly_rate: string;
  overtime_multiplier: string;
  prevent_overlapping_entries: boolean;
  require_timer_description: boolean;
  invite_emails_enabled: boolean;
  reminder_emails_enabled: boolean;
  audit_log_retention_days: number;
}

const defaultSettings: SettingsState = {
  app_name: "Tickr",
  support_email: "support@tickr.com",
  allow_public_registration: true,
  require_email_verification: false,
  maintenance_mode: false,
  session_timeout: 60,
  max_team_members: 20,
  max_projects_per_user: 50,
  team_invite_expiry_days: 7,
  standard_daily_hours: "8.00",
  overtime_hourly_rate: "0.00",
  overtime_multiplier: "1.50",
  prevent_overlapping_entries: true,
  require_timer_description: true,
  invite_emails_enabled: true,
  reminder_emails_enabled: false,
  audit_log_retention_days: 180,
};

const emailToggleFields: Array<{
  key: "invite_emails_enabled" | "reminder_emails_enabled";
  label: string;
}> = [
  { key: "invite_emails_enabled", label: "Send invite emails" },
  { key: "reminder_emails_enabled", label: "Enable reminder emails" },
];

const asNumber = (value: string, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseError = async (response: Response) => {
  try {
    const data = await response.json();
    if (typeof data?.detail === "string") return data.detail;
    if (typeof data?.message === "string") return data.message;
    if (data && typeof data === "object") {
      const first = Object.values(data)[0];
      if (Array.isArray(first) && first[0]) return String(first[0]);
      if (typeof first === "string") return first;
    }
  } catch {
    // ignore
  }
  return "Something went wrong.";
};

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-7">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function FieldLabel({
  label,
  hint,
}: {
  label: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-800">{label}</label>
      {hint ? <p className="text-xs text-slate-500 mt-1">{hint}</p> : null}
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError("");

    const data = await safeFetch("/admin/api/settings/");
    if (data) {
      setSettings({
        ...defaultSettings,
        ...data,
        standard_daily_hours: String(data.standard_daily_hours ?? defaultSettings.standard_daily_hours),
        overtime_hourly_rate: String(data.overtime_hourly_rate ?? defaultSettings.overtime_hourly_rate),
        overtime_multiplier: String(data.overtime_multiplier ?? defaultSettings.overtime_multiplier),
      });
    } else {
      setError("Failed to load settings.");
    }

    setLoading(false);
  };

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const clearAlerts = () => {
    setError("");
    setMessage("");
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    clearAlerts();

    try {
      const response = await fetch(getApiUrl("/admin/api/settings/"), {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({
          ...settings,
          standard_daily_hours: settings.standard_daily_hours,
          overtime_hourly_rate: settings.overtime_hourly_rate,
          overtime_multiplier: settings.overtime_multiplier,
          session_timeout: asNumber(String(settings.session_timeout), defaultSettings.session_timeout),
          max_team_members: asNumber(String(settings.max_team_members), defaultSettings.max_team_members),
          max_projects_per_user: asNumber(String(settings.max_projects_per_user), defaultSettings.max_projects_per_user),
          team_invite_expiry_days: asNumber(String(settings.team_invite_expiry_days), defaultSettings.team_invite_expiry_days),
          audit_log_retention_days: asNumber(
            String(settings.audit_log_retention_days),
            defaultSettings.audit_log_retention_days
          ),
        }),
      });

      if (!response.ok) {
        setError(await parseError(response));
        return;
      }

      setMessage("Admin settings saved successfully.");
      await fetchSettings();
    } catch {
      setError("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordSaving(true);
    clearAlerts();

    try {
      const response = await fetch(getApiUrl("/admin/api/settings/change-password/"), {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(passwordForm),
      });

      if (!response.ok) {
        setError(await parseError(response));
        return;
      }

      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
      setMessage("Password updated successfully.");
    } catch {
      setError("Failed to update password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDownload = async (endpoint: string, filename: string) => {
    clearAlerts();

    try {
      const response = await fetch(getApiUrl(endpoint), {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        setError(await parseError(response));
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      setMessage(`Downloaded ${filename}.`);
    } catch {
      setError(`Failed to download ${filename}.`);
    }
  };

  const healthStats = useMemo(
    () => [
      {
        label: "Public Signup",
        value: settings.allow_public_registration ? "Open" : "Restricted",
        tone: settings.allow_public_registration ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700",
      },
      {
        label: "Maintenance",
        value: settings.maintenance_mode ? "Enabled" : "Off",
        tone: settings.maintenance_mode ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-700",
      },
      {
        label: "Overtime Rule",
        value: `${settings.standard_daily_hours}h / ${settings.overtime_multiplier}x`,
        tone: "bg-sky-50 text-sky-700",
      },
      {
        label: "Email Rules",
        value: settings.invite_emails_enabled ? "Enabled" : "Quiet",
        tone: settings.invite_emails_enabled ? "bg-cyan-50 text-cyan-700" : "bg-slate-100 text-slate-700",
      },
    ],
    [settings]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,#ecfeff_0%,#f8fafc_48%,#ffffff_100%)] p-6 md:p-7 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Admin Control Center</p>
            <h1 className="text-3xl font-bold text-slate-950 mt-2">System Settings</h1>
            <p className="text-slate-600 mt-2 max-w-2xl">
              Configure security, user limits, overtime rules, email behavior, and compliance exports from one place.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:w-[460px]">
            {healthStats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-sm font-semibold ${item.tone}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <div className="space-y-6">
          <SectionCard
            title="Security & Access"
            description="Control signup, email verification, maintenance state, and admin password updates."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <FieldLabel label="Workspace Name" hint="Shown across admin emails and system messages." />
                <input
                  type="text"
                  value={settings.app_name}
                  onChange={(e) => updateSetting("app_name", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <FieldLabel label="Support Email" hint="Used as the main contact email for operations." />
                <input
                  type="email"
                  value={settings.support_email}
                  onChange={(e) => updateSetting("support_email", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <FieldLabel label="Session Timeout (minutes)" hint="Stored admin session policy value." />
                <input
                  type="number"
                  value={settings.session_timeout}
                  onChange={(e) => updateSetting("session_timeout", asNumber(e.target.value, 60))}
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900">Access Policy</p>
                <div className="mt-4 space-y-3">
                  <label className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-700">Allow public registration</span>
                    <input
                      type="checkbox"
                      checked={settings.allow_public_registration}
                      onChange={(e) => updateSetting("allow_public_registration", e.target.checked)}
                      className="h-5 w-5 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-700">Require email verification</span>
                    <input
                      type="checkbox"
                      checked={settings.require_email_verification}
                      onChange={(e) => updateSetting("require_email_verification", e.target.checked)}
                      className="h-5 w-5 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-700">Maintenance mode</span>
                    <input
                      type="checkbox"
                      checked={settings.maintenance_mode}
                      onChange={(e) => updateSetting("maintenance_mode", e.target.checked)}
                      className="h-5 w-5 rounded"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-slate-900">Change Admin Password</h4>
                  <p className="text-sm text-slate-500 mt-1">Updates the currently signed-in superadmin password.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <input
                  type="password"
                  placeholder="Current password"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm((current) => ({ ...current, current_password: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm((current) => ({ ...current, new_password: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm((current) => ({ ...current, confirm_password: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>
              <button
                onClick={handleChangePassword}
                disabled={passwordSaving}
                className="mt-4 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {passwordSaving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </SectionCard>

          <SectionCard
            title="User Management"
            description="Set workspace limits and onboarding policy for new users and ongoing account growth."
          >
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <FieldLabel label="Max Projects Per User" hint="Creation cap enforced when a user creates projects." />
                <input
                  type="number"
                  value={settings.max_projects_per_user}
                  onChange={(e) => updateSetting("max_projects_per_user", asNumber(e.target.value, 50))}
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <FieldLabel label="Max Team Members" hint="Used to limit team expansion and invitations." />
                <input
                  type="number"
                  value={settings.max_team_members}
                  onChange={(e) => updateSetting("max_team_members", asNumber(e.target.value, 20))}
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <FieldLabel label="Invite Expiry (days)" hint="How long invite links remain valid." />
                <input
                  type="number"
                  value={settings.team_invite_expiry_days}
                  onChange={(e) => updateSetting("team_invite_expiry_days", asNumber(e.target.value, 7))}
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Time Tracking & Overtime"
            description="Configure overtime money calculation and time-entry behavior for the whole workspace."
          >
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <FieldLabel label="Standard Daily Hours" hint="Hours worked before overtime begins." />
                <input
                  type="number"
                  step="0.25"
                  value={settings.standard_daily_hours}
                  onChange={(e) => updateSetting("standard_daily_hours", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <FieldLabel label="Overtime Hourly Rate" hint="Base overtime pay rate per hour." />
                <input
                  type="number"
                  step="0.01"
                  value={settings.overtime_hourly_rate}
                  onChange={(e) => updateSetting("overtime_hourly_rate", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <FieldLabel label="Overtime Multiplier" hint="Multiplier applied to the overtime rate." />
                <input
                  type="number"
                  step="0.01"
                  value={settings.overtime_multiplier}
                  onChange={(e) => updateSetting("overtime_multiplier", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div>
                  <p className="font-medium text-slate-900">Prevent overlapping entries</p>
                  <p className="text-sm text-slate-500 mt-1">Use as policy for future time-entry enforcement and audits.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.prevent_overlapping_entries}
                  onChange={(e) => updateSetting("prevent_overlapping_entries", e.target.checked)}
                  className="h-5 w-5 rounded"
                />
              </label>
              <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div>
                  <p className="font-medium text-slate-900">Require timer description</p>
                  <p className="text-sm text-slate-500 mt-1">Enabled in the timer start flow.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.require_timer_description}
                  onChange={(e) => updateSetting("require_timer_description", e.target.checked)}
                  className="h-5 w-5 rounded"
                />
              </label>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">Overtime output</p>
              <p className="text-sm text-amber-800 mt-1">
                Exported time reports now include overtime hours and overtime pay calculated from these values.
              </p>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard
            title="Teams, Projects & Email Delivery"
            description="Control team email behavior while SMTP credentials stay managed in backend environment variables."
          >
            <div className="grid gap-3">
              {emailToggleFields.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <span className="text-sm font-medium text-slate-800">{label}</span>
                  <input
                    type="checkbox"
                    checked={settings[key]}
                    onChange={(e) => updateSetting(key, e.target.checked)}
                    className="h-5 w-5 rounded"
                  />
                </label>
              ))}
            </div>

          </SectionCard>

          <SectionCard
            title="Audit & Compliance"
            description="Retention policy and CSV exports for activity monitoring and payroll-style review."
          >
            <div>
              <FieldLabel
                label="Audit Log Retention (days)"
                hint="Currently stored as policy configuration for long-term compliance planning."
              />
              <input
                type="number"
                value={settings.audit_log_retention_days}
                onChange={(e) => updateSetting("audit_log_retention_days", asNumber(e.target.value, 180))}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid gap-4">
              <button
                onClick={() => handleDownload("/admin/api/settings/export/activity-logs/", "tickr-activity-logs.csv")}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left hover:bg-slate-100"
              >
                <span>
                  <span className="block font-medium text-slate-900">Export Activity Logs</span>
                  <span className="block text-sm text-slate-500 mt-1">Download admin audit records as CSV.</span>
                </span>
                <span className="text-sm font-semibold text-slate-700">CSV</span>
              </button>
              <button
                onClick={() => handleDownload("/admin/api/settings/export/reports/", "tickr-time-report.csv")}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left hover:bg-slate-100"
              >
                <span>
                  <span className="block font-medium text-slate-900">Export Time Reports</span>
                  <span className="block text-sm text-slate-500 mt-1">Includes overtime hours and overtime pay columns.</span>
                </span>
                <span className="text-sm font-semibold text-slate-700">CSV</span>
              </button>
            </div>
          </SectionCard>

          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Deploy Settings</p>
            <h3 className="mt-3 text-xl font-semibold">Save the current admin configuration</h3>
            <p className="mt-2 text-sm text-slate-300">
              This writes the settings to the backend admin configuration store and updates enforcement for signup, project limits, invite expiry, timer description rules, and reporting.
            </p>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="mt-5 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
            >
              {saving ? "Saving settings..." : "Save Admin Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
