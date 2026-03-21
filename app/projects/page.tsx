"use client";
import React, { useState, useEffect } from 'react';
import { FolderKanban, PencilLine, Plus, Trash2, Users, X } from 'lucide-react';
import Cookies from 'js-cookie';
import { useEmployeeRouteGuard } from '@/app/hooks/useEmployeeRouteGuard';

interface Project {
  id: number;
  name: string;
  description: string;
  type: string;
  creator: {
    id: number;
    username: string;
    email: string;
  };
  team_id: number | null;
  created_at: string;
}

interface NewProjectForm {
  name: string;
  description: string;
  type: string;
  team_id: string;
}

import { getApiUrl } from '@/constant/apiendpoints';

const ProjectsPage = () => {
  const { isEmployeeAllowed } = useEmployeeRouteGuard();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState<NewProjectForm>({
    name: '',
    description: '',
    type: 'individual',
    team_id: ''
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getAuthHeaders = () => {
    const token = Cookies.get("access_token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  };

  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(getApiUrl("/api/user/"), {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUserId(data.id);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  // Fetch projects - only user's own projects
  const fetchProjects = async () => {
    try {
      const response = await fetch(getApiUrl("/api/projects/"), {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        // Show all projects returned by the API (backend already filters by auth)
        setProjects(data);
      } else {
        showToast("Failed to load projects", "error");
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      showToast("Error loading projects", "error");
    }
  };

  useEffect(() => {
    if (!isEmployeeAllowed) return;
    fetchCurrentUser();
    fetchProjects();
  }, [isEmployeeAllowed]);

  if (!isEmployeeAllowed) {
    return null;
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(getApiUrl(`/api/projects/${id}/`), {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setProjects(projects.filter(p => p.id !== id));
        showToast("Project deleted successfully!", "success");
      } else {
        showToast("Failed to delete project", "error");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      showToast("Error deleting project", "error");
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setNewProject({
      name: project.name,
      description: project.description,
      type: project.type,
      team_id: project.team_id?.toString() || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateProject = async () => {
    if (!editingProject) return;

    setIsLoading(true);
    try {
      const projectData: any = {
        name: newProject.name,
        description: newProject.description,
        type: newProject.type,
      };

      if (newProject.type === 'group' && newProject.team_id) {
        projectData.team_id = parseInt(newProject.team_id);
      }

      const response = await fetch(getApiUrl(`/api/projects/${editingProject.id}/`), {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        fetchProjects();
        setShowEditModal(false);
        setEditingProject(null);
        showToast("Project updated successfully!", "success");
      } else {
        showToast("Failed to update project", "error");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      showToast("Error updating project", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewMembers = async (project: Project) => {
    setSelectedProject(project);
    setShowMembersModal(true);
    showToast("Loading members...", "success");
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      showToast('Please enter a project name', "error");
      return;
    }

    setIsLoading(true);

    try {
      const projectData: any = {
        name: newProject.name,
        description: newProject.description || '',
        type: newProject.type,
      };

      if (newProject.type === 'group' && newProject.team_id) {
        projectData.team_id = parseInt(newProject.team_id);
      }

      const response = await fetch(getApiUrl("/api/projects/"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        fetchProjects();
        setNewProject({ name: '', description: '', type: 'individual', team_id: '' });
        setShowNewProjectModal(false);
        showToast("Project created successfully!", "success");
      } else {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText };
        }
        
        const errorMsg = errorData.detail || 
                        errorData.name?.[0] || 
                        errorData.type?.[0] ||
                        "Failed to create project";
        showToast(errorMsg, "error");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      showToast("Error creating project", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="employee-page">
      {/* Toast Notification - FIXED: Using span for dynamic content */}
      {toast && (
        <div className={`fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="app-shell">
        <section className="employee-hero rounded-4xl px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-slate-500">Project management</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">My projects</h2>
              <p className="mt-3 text-base text-slate-600">
                Keep personal and team workstreams organized with clearer ownership, descriptions, and lifecycle control.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="surface-card rounded-[1.4rem] px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Total projects</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{projects.length}</div>
              </div>
              <div className="surface-card rounded-[1.4rem] px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Owned by you</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{projects.filter((project) => project.creator?.id === currentUserId).length}</div>
              </div>
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="inline-flex items-center gap-2 rounded-[1.4rem] bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                New project
              </button>
            </div>
          </div>
        </section>

        <section className="table-shell mt-8">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="section-title">All projects</h3>
              <p className="section-subtitle">A cleaner view of your active project portfolio and project-level actions.</p>
            </div>
            <div className="stat-pill">
              {projects.length} total projects
            </div>
          </div>

          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Created</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14">
                    <div className="empty-panel rounded-[1.25rem] px-6 py-10 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
                        <FolderKanban className="h-6 w-6" />
                      </div>
                      <div className="mt-4 text-lg font-semibold text-slate-900">No projects yet</div>
                      <div className="mt-2 text-sm text-slate-500">Create your first project to start tracking work in a more structured way.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="transition hover:bg-slate-50/70">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{project.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{project.description || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        project.type === 'group' 
                          ? 'bg-indigo-50 text-indigo-700' 
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {project.type === 'individual' ? 'Individual' : 'Group'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(project.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-100"
                          title="Edit project"
                        >
                          <PencilLine size={16} />
                          <span>Edit</span>
                        </button>
                        {project.type === 'group' && (
                          <button
                            onClick={() => handleViewMembers(project)}
                            className="inline-flex items-center gap-2 rounded-full border border-indigo-200 px-3 py-1.5 font-semibold text-indigo-700 transition hover:bg-indigo-50"
                            title="View members"
                          >
                            <Users size={16} />
                            <span>Members</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-3 py-1.5 font-semibold text-rose-700 transition hover:bg-rose-50"
                          title="Delete project"
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </section>
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="surface-card-strong w-full max-w-lg rounded-[1.6rem] p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-950">Create new project</h3>
                <p className="mt-1 text-sm text-slate-600">Set up a project with cleaner metadata and ownership.</p>
              </div>
              <button onClick={() => setShowNewProjectModal(false)} className="text-slate-500 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="pro-input"
                  placeholder="Enter project name"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="pro-textarea"
                  placeholder="Enter project description"
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Type
                </label>
                <select
                  value={newProject.type}
                  onChange={(e) => setNewProject({...newProject, type: e.target.value})}
                  className="pro-select"
                  disabled={isLoading}
                >
                  <option value="individual">Individual</option>
                  <option value="group">Group</option>
                </select>
              </div>

              {newProject.type === 'group' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Team ID (Optional)
                  </label>
                  <input
                    type="number"
                    value={newProject.team_id}
                    onChange={(e) => setNewProject({...newProject, team_id: e.target.value})}
                    className="pro-input"
                    placeholder="Enter team ID (optional)"
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowNewProjectModal(false);
                  setNewProject({ name: '', description: '', type: 'individual', team_id: '' });
                }}
                className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-300"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && editingProject && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="surface-card-strong w-full max-w-lg rounded-[1.6rem] p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-950">Edit project</h3>
                <p className="mt-1 text-sm text-slate-600">Update the details for {editingProject.name}.</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-500 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Project Name *</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="pro-input"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="pro-textarea"
                  rows={3}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Type</label>
                <select
                  value={newProject.type}
                  onChange={(e) => setNewProject({...newProject, type: e.target.value})}
                  className="pro-select"
                  disabled={isLoading}
                >
                  <option value="individual">Individual</option>
                  <option value="group">Group</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProject}
                className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-300"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && selectedProject && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="surface-card-strong w-full max-w-lg rounded-[1.6rem] p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-950">Members of {selectedProject.name}</h3>
                <p className="mt-1 text-sm text-slate-600">Current ownership and linked collaborators for this project.</p>
              </div>
              <button onClick={() => setShowMembersModal(false)} className="text-slate-500 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4">
                <p className="text-sm font-medium text-slate-900">{selectedProject.creator.email}</p>
                <p className="text-xs text-slate-500">Owner</p>
              </div>
              <p className="py-4 text-center text-sm text-slate-500">
                Additional members will appear here when team functionality is implemented
              </p>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowMembersModal(false)}
                className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
