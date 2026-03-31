"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { getApiUrl } from "@/constant/apiendpoints";
import { useToast } from "../../context-and-provider";
import { Mail, ShieldCheck, UserRound } from "lucide-react";
import { useEmployeeRouteGuard } from "@/app/hooks/useEmployeeRouteGuard";

export default function ProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { isEmployeeAllowed } = useEmployeeRouteGuard();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isEmployeeAllowed) return;

    const fetchUser = async () => {
      try {
        const token = Cookies.get("access_token");
        if (!token) {
          router.push('/login');
          return;
        }
        const response = await fetch(getApiUrl('/api/user/'), {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setEmail(data.email || "");
          setUsername(data.username || "");
        } else if (response.status === 401) {
          router.push('/login');
        } else {
          showToast('Failed to load profile', 'error');
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
        showToast('Failed to load profile', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [isEmployeeAllowed, router, showToast]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        router.push('/login');
        return;
      }
      // Send as multipart/form-data to be compatible with backends
      const form = new FormData();
      form.append('email', email.trim());
      form.append('username', username.trim());

      const response = await fetch(getApiUrl('/api/user/'), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          // DO NOT set Content-Type; browser will add the correct boundary
        },
        body: form,
      });

      if (response.ok) {
        showToast('Profile updated', 'success');
        // notify other parts of app to refresh user info
        window.dispatchEvent(new Event('auth-changed'));
      } else {
        const err = await response.json().catch(() => ({}));
        showToast(err.detail || 'Failed to update profile', 'error');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      showToast('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (!isEmployeeAllowed) {
    return null;
  }

  return (
    <div className="employee-page">
      <div className="app-shell max-w-5xl">
        <section className="employee-hero rounded-4xl px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-slate-500">Account settings</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Profile</h1>
              <p className="mt-3 text-base text-slate-600">Keep your account details up to date so the workspace stays consistent across teams and reports.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="surface-card rounded-[1.4rem] px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Security</div>
                <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Protected account</div>
              </div>
              <div className="surface-card rounded-[1.4rem] px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Identity</div>
                <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900"><Mail className="h-4 w-4 text-blue-600" /> {email || 'No email set'}</div>
              </div>
            </div>
          </div>
        </section>

        <div className="surface-card mt-8 rounded-[1.8rem] p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="rounded-[1.6rem] bg-slate-950 px-6 py-7 text-white">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10">
                  <UserRound className="h-10 w-10 text-white/70" />
                </div>
                <div className="mt-5 text-lg font-semibold">{username || 'Unnamed user'}</div>
                <div className="mt-1 text-sm text-slate-300">{email}</div>
                <div className="mt-6 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  Profile pictures are disabled for this workspace.
                </div>
              </div>
            </div>

            <div>
              <div className="mb-6">
                <h2 className="section-title">Personal details</h2>
                <p className="section-subtitle">Update the information displayed in your employee workspace.</p>
              </div>

              <label className="mb-2 block text-sm font-medium text-slate-700">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pro-input mb-5"
              />

              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pro-input mb-6"
              />

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-300"
                >
                  {isSaving ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  onClick={() => router.back()}
                  className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
