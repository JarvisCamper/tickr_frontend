"use client";

import { useEffect, useRef, useState } from "react";
import { safeFetch } from "../utils/apiHelper";

interface Team {
  id: number;
  name: string;
  owner: { username: string };
  created_at: string;
  members_count?: number;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const data = await safeFetch("/admin/api/teams/");
    
    if (data) {
      setTeams(Array.isArray(data) ? data : data.results || []);
    } else {
      setTeams([]);
    }
    setLoading(false);
  };

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
        <p className="text-gray-600 mt-2">Manage all teams in the system</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Team Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Members</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTeams.map((team) => (
                <tr key={team.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{team.name}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{team.owner.username}</td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 font-medium">{team.members_count || 0}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(team.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTeams.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No teams found</p>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-600">
        Showing {filteredTeams.length} of {teams.length} teams
      </div>
    </div>
  );
}
