import api from "../api/axios";

export const getProjects = async () => {
  return await api.get("/projects");
};

export const createProject = async (projectData) => {
  return await api.post("/projects", projectData);
};

export const deleteProject = async (projectId) => {
  return await api.delete(`/projects/${projectId}`);
};

export const addMember = async (projectId, memberData) => {
  return await api.put(`/projects/${projectId}/members`, memberData);
};