// // teams/components/InviteUserModal.tsx
// import { useState } from "react";
// import { Team } from "../index/type";

// interface InviteUserModalProps {
//   isOpen: boolean;
//   team: Team | null;
//   onClose: () => void;
//   onInvite: (email: string) => Promise<boolean>;
//   isLoading: boolean;
// }

// export function InviteUserModal({ isOpen, team, onClose, onInvite, isLoading }: InviteUserModalProps) {
//   const [email, setEmail] = useState("");
//   const [error, setError] = useState("");

//   if (!isOpen || !team) return null;

//   const validateEmail = (value: string) => {
//     // simple email regex
//     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
//   };

//   const handleInvite = async () => {
//     setError("");
//     const trimmed = email.trim();
//     if (!trimmed) {
//       setError("Email is required");
//       return;
//     }
//     if (!validateEmail(trimmed)) {
//       setError("Please enter a valid email address");
//       return;
//     }

//     const success = await onInvite(trimmed);
//     if (success) {
//       setEmail("");
//       onClose();
//     } else {
//       setError("Failed to send invitation. Try again.");
//     }
//   };

//   const handleClose = () => {
//     setEmail("");
//     setError("");
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-96">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-bold text-gray-900">Invite to {team.name}</h2>
//           <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         <p className="text-gray-600 mb-4 text-sm">Send an invite by email to join <strong>{team.name}</strong>.</p>

//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             placeholder="user@example.com"
//             className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             autoFocus
//           />
//           {error && <div className="text-sm text-red-500 mt-2">{error}</div>}
//         </div>

//         <div className="flex gap-2">
//           <button
//             onClick={handleInvite}
//             disabled={isLoading}
//             className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
//           >
//             {isLoading ? "Inviting..." : "Send Invite"}
//           </button>
//           <button
//             onClick={handleClose}
//             className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
