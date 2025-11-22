"use client";
import React, { useState, useEffect } from 'react';
import { Trash2, Users, Edit2, X } from 'lucide-react';
import Cookies from 'js-cookie';

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

import { API_BASE_URL, getApiUrl } from '@/constant/apiendpoints';

const ProjectsPage = () => {
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
      const response = await fetch(getApiUrl("user/"), {
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
      const response = await fetch(getApiUrl("projects/"), {
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
    fetchProjects();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(getApiUrl(`projects/${id}/`), {
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

      const response = await fetch(getApiUrl(`projects/${editingProject.id}/`), {
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

      const response = await fetch(getApiUrl("projects/"), {
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
    <div className="container mx-auto px-6 py-8">
      {/* Toast Notification - FIXED: Using span for dynamic content */}
      {toast && (
        <div className={`fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">My Projects</h2>
        <button
          onClick={() => setShowNewProjectModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
        >
          <span>+</span>
          <span>New Project</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">All Projects</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No projects yet. Create your first project to get started!
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{project.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{project.description || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        project.type === 'group' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {project.type === 'individual' ? 'Individual' : 'Group'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(project.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEdit(project)}
                          className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                          title="Edit project"
                        >
                          <Edit2 size={16} />
                          <span>Edit</span>
                        </button>
                        {project.type === 'group' && (
                          <button
                            onClick={() => handleViewMembers(project)}
                            className="text-purple-600 hover:text-purple-800 flex items-center space-x-1"
                            title="View members"
                          >
                            <Users size={16} />
                            <span>Members</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="text-red-600 hover:text-red-800 flex items-center space-x-1"
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
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Create New Project</h3>
              <button onClick={() => setShowNewProjectModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Enter project name"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Enter project description"
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={newProject.type}
                  onChange={(e) => setNewProject({...newProject, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  disabled={isLoading}
                >
                  <option value="individual">Individual</option>
                  <option value="group">Group</option>
                </select>
              </div>

              {newProject.type === 'group' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team ID (Optional)
                  </label>
                  <input
                    type="number"
                    value={newProject.team_id}
                    onChange={(e) => setNewProject({...newProject, team_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Enter team ID (optional)"
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowNewProjectModal(false);
                  setNewProject({ name: '', description: '', type: 'individual', team_id: '' });
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-gray-400"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Edit Project</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md text-black"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md text-black"
                  rows={3}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newProject.type}
                  onChange={(e) => setNewProject({...newProject, type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md text-black"
                  disabled={isLoading}
                >
                  <option value="individual">Individual</option>
                  <option value="group">Group</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProject}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-gray-400"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Members of {selectedProject.name}</h3>
              <button onClick={() => setShowMembersModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-900">{selectedProject.creator.email}</p>
                <p className="text-xs text-gray-500">Owner</p>
              </div>
              <p className="text-sm text-gray-500 text-center py-4">
                Additional members will appear here when team functionality is implemented
              </p>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowMembersModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
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