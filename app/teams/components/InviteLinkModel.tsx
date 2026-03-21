import { Team } from "../index/type";
import { Button } from "../../components/Button";

interface InviteLinkModalProps {
  isOpen: boolean;
  team: Team | null;
  invitationLink: string;
  onClose: () => void;
  onCopy: () => void;
  onEmail: () => void;
}

// Icon components
const CopyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

export function InviteLinkModal({
  isOpen,
  team,
  invitationLink,
  onClose,
  onCopy,
  onEmail,
}: InviteLinkModalProps) {
  if (!isOpen || !team) return null;

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="surface-card-strong w-full max-w-xl rounded-[1.6rem] p-6">
        <h2 className="text-xl font-bold text-slate-950">Invitation link ready</h2>

        <p className="mb-4 text-slate-600">
          Share this link with people you want to invite to <strong>{team.name}</strong>.{" "}
          They&apos;ll need to login to accept the invitation.
        </p>

        <div className="mb-4 break-all rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-mono text-slate-700">
          {invitationLink}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button 
            variant="primary" 
            icon={<CopyIcon />}
            onClick={onCopy}
          >
            Copy Link
          </Button>
          <Button 
            variant="success" 
            icon={<EmailIcon />}
            onClick={onEmail}
          >
            Email
          </Button>
        </div>

        <Button 
          variant="secondary" 
          fullWidth
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
  );
}
