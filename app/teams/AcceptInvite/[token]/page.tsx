// app/teams/AcceptInvite/[token]/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import type { ReactNode } from 'react';

// Simple local Button component
type ButtonProps = {
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children?: ReactNode;
};
const Button = ({ variant = 'primary', fullWidth = false, disabled = false, onClick, children }: ButtonProps) => {
  const base = "px-4 py-2 rounded text-sm font-medium focus:outline-none";
  const variantClasses =
    variant === 'secondary'
      ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
      : 'bg-blue-600 text-white hover:bg-blue-700';
  const widthClass = fullWidth ? 'w-full' : '';
  return (
    <button
      className={`${base} ${variantClasses} ${widthClass}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

import { getApiUrl } from '@/constant/apiendpoints';

const getAuthHeaders = () => {
  const token = Cookies.get("access_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

interface InvitationDetails {
  id: number;
  team: {
    id: number;
    name: string;
    description: string;
  };
  invited_by: {
    username: string;
  };
  expires_at: string;
  status: string;
}

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [teamName, setTeamName] = useState<string>('');
  const [invitationDetails, setInvitationDetails] = useState<InvitationDetails | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(true);

  const fetchInvitationDetails = useCallback(async () => {
    setLoadingDetails(true);
    try {
      const response = await fetch(
        getApiUrl(`teams/invitations/${token}/`),
        {
          method: 'GET',
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setInvitationDetails(data);
        setTeamName(data.team?.name || 'a team');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || 'Failed to load invitation details');
      }
    } catch (err) {
      console.error('Error fetching invitation details:', err);
      setError('Failed to load invitation. Please check the link and try again.');
    } finally {
      setLoadingDetails(false);
    }
  }, [token]);

  // Check authentication status and listen for changes
  useEffect(() => {
    let wasAuthenticated = false;
    
    const checkAuth = () => {
      const authToken = Cookies.get("access_token");
      const nowAuthenticated = !!authToken;
      
      // If user just became authenticated (e.g., after login redirect), refresh invitation details
      if (!wasAuthenticated && nowAuthenticated) {
        fetchInvitationDetails();
      }
      
      wasAuthenticated = nowAuthenticated;
      setIsAuthenticated(nowAuthenticated);
    };
    
    // Check immediately
    checkAuth();
    
    // Listen for auth changes (e.g., after login)
    window.addEventListener('auth-changed', checkAuth);
    
    // Also check periodically in case cookies were set (e.g., after redirect from login)
    const interval = setInterval(checkAuth, 500);
    
    return () => {
      window.removeEventListener('auth-changed', checkAuth);
      clearInterval(interval);
    };
  }, [fetchInvitationDetails]);

  // Fetch invitation details on mount (this is public, doesn't require auth)
  useEffect(() => {
    fetchInvitationDetails();
  }, [fetchInvitationDetails]);

  const handleAcceptInvite = async () => {
    // Check if user is authenticated before accepting
    const authToken = Cookies.get("access_token");
    if (!authToken) {
      // Redirect to login with return URL to come back to this page
      const redirectPath = `/teams/AcceptInvite/${token}`;
      router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        getApiUrl(`teams/invitations/${token}/accept/`),
        {
          method: 'POST',
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to accept invitation');
      }

      setSuccess(true);
      setTeamName(data.team?.name || 'the team');
      
      // Redirect to teams page after 2 seconds
      setTimeout(() => {
        router.push('/teams');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = () => {
    router.push('/teams');
  };

  // Show loading while fetching invitation details
  if (loadingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">
          <div>Loading invitation details...</div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to {teamName}!
          </h1>
          <p className="text-gray-600 mb-4">
            You have successfully joined the team.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to teams page...
          </p>
        </div>
      </div>
    );
  }

  // Main invitation page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center mb-6">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Team Invitation
          </h1>
          {invitationDetails ? (
            <div className="space-y-2">
              <p className="text-gray-600">
                <strong>{invitationDetails.invited_by?.username || 'A team member'}</strong> has invited you to join{" "}
                <strong>{invitationDetails.team?.name || 'a team'}</strong>.
              </p>
            </div>
          ) : (
            <p className="text-gray-600">
              You've been invited to join a team. Click the button below to accept the invitation.
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {!isAuthenticated && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 text-sm mb-2">
                You need to log in to accept this invitation.
              </p>
              <div className="flex gap-2 text-sm">
                <Link 
                  href={`/login?redirect=${encodeURIComponent(`/teams/AcceptInvite/${token}`)}`}
                  className="text-blue-600 hover:underline"
                >
                  Log in
                </Link>
                <span className="text-gray-400">|</span>
                <Link 
                  href={`/signup?redirect=${encodeURIComponent(`/teams/AcceptInvite/${token}`)}`}
                  className="text-blue-600 hover:underline"
                >
                  Sign up
                </Link>
              </div>
            </div>
          )}
          <Button
            variant="primary"
            fullWidth
            onClick={handleAcceptInvite}
            disabled={loading || !invitationDetails}
          >
            {loading ? 'Accepting...' : isAuthenticated ? 'Accept Invitation' : 'Log in to Accept'}
          </Button>

          <Button
            variant="secondary"
            fullWidth
            onClick={handleDecline}
            disabled={loading}
          >
            Decline
          </Button>
        </div>

        {invitationDetails && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500 space-y-1">
              <p>
                <span className="font-medium">Team:</span> {invitationDetails.team?.name}
              </p>
              {invitationDetails.team?.description && (
                <p>
                  <span className="font-medium">Description:</span> {invitationDetails.team.description}
                </p>
              )}
              <p>
                <span className="font-medium">Invited by:</span>{" "}
                {invitationDetails.invited_by?.username || 'Team owner'}
              </p>
              {invitationDetails.expires_at && (
                <p>
                  <span className="font-medium">Expires:</span>{" "}
                  {new Date(invitationDetails.expires_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}