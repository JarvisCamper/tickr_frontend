"use client";
import { useEffect, useState } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { getApiUrl } from "@/constant/apiendpoints";
import { useToast } from "../../context-and-provider";
import { Camera, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useEmployeeRouteGuard } from "@/app/hooks/useEmployeeRouteGuard";

export default function ProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { isEmployeeAllowed } = useEmployeeRouteGuard();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const fileInputRef = React.createRef<HTMLInputElement>();
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
          setProfilePicture(data.avatar || data.profile_picture || data.avatar_url || null);
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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadAvatar(file);
    e.target.value = "";
  };

  const uploadAvatar = async (file: File) => {
    // client-side validation
    const MAX_BYTES = 5 * 1024 * 1024; // 5MB
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (png/jpg/etc.)', 'error');
      return;
    }
    if (file.size > MAX_BYTES) {
      showToast('Image is too large. Maximum size is 5 MB.', 'error');
      return;
    }

    setUploadingPicture(true);
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const makeAvatarForm = (fieldName: 'avatar' | 'profile_picture') => {
        const form = new FormData();
        form.append(fieldName, file);
        return form;
      };

      const attempts: Array<{
        label: string;
        url: string;
        method: 'PATCH' | 'POST';
        fieldName: 'avatar' | 'profile_picture';
      }> = [
        { label: 'PATCH /api/user/ avatar', url: getApiUrl('/api/user/'), method: 'PATCH', fieldName: 'avatar' },
        { label: 'PATCH /api/user/ profile_picture', url: getApiUrl('/api/user/'), method: 'PATCH', fieldName: 'profile_picture' },
        { label: 'POST /api/user/avatar/ avatar', url: getApiUrl('/api/user/avatar/'), method: 'POST', fieldName: 'avatar' },
        { label: 'POST /api/user/avatar/ profile_picture', url: getApiUrl('/api/user/avatar/'), method: 'POST', fieldName: 'profile_picture' },
      ];

      let resp: Response | null = null;
      let lastBodyText = '';

      for (const attempt of attempts) {
        try {
          const candidate = await fetch(attempt.url, {
            method: attempt.method,
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: makeAvatarForm(attempt.fieldName),
          });

          if (candidate.ok) {
            resp = candidate;
            lastBodyText = '';
            break;
          }

          lastBodyText = await candidate.text().catch(() => '');
          resp = candidate;

          if (candidate.status === 401) {
            router.push('/login');
            return;
          }

          if (candidate.status === 403) {
            break;
          }
        } catch {
          // Try the next known backend variant.
        }
      }

      if (resp?.ok) {
        const data = await resp.json().catch(() => null);
        const newUrl = data?.avatar || data?.profile_picture || data?.avatar_url || data?.avatar_url_full || null;
        if (newUrl) setProfilePicture(newUrl);
        showToast('Profile picture updated', 'success');
        // notify other parts
        window.dispatchEvent(new Event('auth-changed'));
      } else {
        const status = resp?.status ?? 0;
        const bodyText = lastBodyText;
        let parsed: any = {};
        try { parsed = JSON.parse(bodyText || '{}'); } catch { parsed = {}; }
        if (status === 404) {
          showToast('Upload endpoint not found on server (404). Ask backend to add avatar upload or accept multipart PATCH to /api/user/.', 'error');
        } else if (status === 500) {
          showToast('The server failed while processing the image upload. The frontend retried the common avatar endpoints, so this likely needs a backend fix.', 'error');
        } else {
          showToast(parsed.detail || parsed.error || `Failed to upload picture${status ? ` (status ${status})` : ''}`, 'error');
        }
      }
    } catch {
      showToast('Failed to upload picture', 'error');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleDeletePicture = async () => {
    if (!confirm('Delete profile picture?')) return;
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const resp = await fetch(getApiUrl('/api/user/avatar/'), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (resp.ok) {
        setProfilePicture(null);
        showToast('Profile picture deleted', 'success');
        window.dispatchEvent(new Event('auth-changed'));
      } else {
        // fallback: PATCH user/ with avatar null
        const patchResp = await fetch(getApiUrl('/api/user/'), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ avatar: null }),
        });
        if (patchResp.ok) {
          setProfilePicture(null);
          showToast('Profile picture deleted', 'success');
          window.dispatchEvent(new Event('auth-changed'));
        } else {
          const e = await resp.json().catch(() => ({}));
          showToast(e.detail || 'Failed to delete picture', 'error');
        }
      }
    } catch (err) {
      console.error('Delete avatar error:', err);
      showToast('Failed to delete picture', 'error');
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
              <p className="mt-3 text-base text-slate-600">Keep your identity and avatar up to date so the workspace feels consistent across teams and reports.</p>
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
                  {profilePicture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profilePicture} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <UserRound className="h-10 w-10 text-white/70" />
                  )}
                </div>
                <div className="mt-5 text-lg font-semibold">{username || 'Unnamed user'}</div>
                <div className="mt-1 text-sm text-slate-300">{email}</div>
                <div className="mt-6 flex w-full flex-col gap-3">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  <button onClick={triggerFileInput} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                    <Camera className="h-4 w-4" />
                    {uploadingPicture ? 'Uploading...' : 'Change picture'}
                  </button>
                  <button onClick={handleDeletePicture} className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                    Delete picture
                  </button>
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
