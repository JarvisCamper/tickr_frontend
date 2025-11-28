"use client";
import { useEffect, useState } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { getApiUrl } from "@/constant/apiendpoints";
import { useToast } from "../../context-and-provider";

export default function ProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const fileInputRef = React.createRef<HTMLInputElement>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = Cookies.get("access_token");
        if (!token) {
          router.push('/login');
          return;
        }
        const response = await fetch(getApiUrl('user/'), {
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
  }, [router, showToast]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        router.push('/login');
        return;
      }
      // Send as multipart/form-data to be compatible with backends
      // that expect file upload parsers (MultiPartParser) for user updates.
      const form = new FormData();
      form.append('email', email.trim());
      form.append('username', username.trim());

      const response = await fetch(getApiUrl('user/'), {
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

      const form = new FormData();
      form.append('avatar', file);

      // First try: PATCH to 'user/' with multipart form data (many DRF setups accept this)
      let resp = await fetch(getApiUrl('user/'), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: form,
      });

      // If backend doesn't accept PATCH multipart, try POST to 'user/avatar/' (older or custom endpoints)
      if (resp.status === 404 || resp.status === 405 || resp.status === 400) {
        try {
          resp = await fetch(getApiUrl('user/avatar/'), {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: form,
          });
        } catch (e) {
          // swallow and handle below
        }
      }

      if (resp.ok) {
        const data = await resp.json().catch(() => null);
        const newUrl = data?.avatar || data?.profile_picture || data?.avatar_url || data?.avatar_url_full || null;
        if (newUrl) setProfilePicture(newUrl);
        showToast('Profile picture updated', 'success');
        // notify other parts
        window.dispatchEvent(new Event('auth-changed'));
      } else {
        let bodyText = '';
        try {
          bodyText = await resp.text();
        } catch (e) {
          bodyText = '';
        }
        console.error('Avatar upload failed', resp.status, bodyText);
        let parsed: any = {};
        try { parsed = JSON.parse(bodyText || '{}'); } catch(e) { parsed = {}; }
        // Helpful guidance when 404 indicates endpoint missing
        if (resp.status === 404) {
          showToast('Upload endpoint not found on server (404). Ask backend to add avatar upload or accept multipart PATCH to /api/user/.', 'error');
        } else {
          showToast(parsed.detail || parsed.error || `Failed to upload picture (status ${resp.status})`, 'error');
        }
      }
    } catch (err) {
      console.error('Upload avatar error:', err);
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

      const resp = await fetch(getApiUrl('user/avatar/'), {
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
        const patchResp = await fetch(getApiUrl('user/'), {
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>

        <div className="bg-white p-6 rounded-md shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {profilePicture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400">No photo</div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <button onClick={triggerFileInput} className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600">
                {uploadingPicture ? 'Uploading...' : 'Change picture'}
              </button>
              <button onClick={handleDeletePicture} className="bg-red-100 text-red-600 px-3 py-2 rounded-md hover:bg-red-200">
                Delete picture
              </button>
            </div>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-200 rounded-md px-3 py-2 mb-4 text-black"
          />

          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-md px-3 py-2 mb-4 text-black"
          />

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
            <button
              onClick={() => router.back()}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
