import axios from 'axios';
import type {
  Project, Workflow, Epic, Story, Task, TaskActivity,
  CreateProjectInput, CreateTaskInput, UpdateTaskInput, CreateWorkflowInput
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_KEY = import.meta.env.VITE_API_KEY || 'task-mgmt-api-key-2026';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  },
});

// Projects
export const projectsApi = {
  list: () => api.get<Project[]>('/projects').then(r => r.data),
  get: (id: number) => api.get<Project>(`/projects/${id}`).then(r => r.data),
  create: (data: CreateProjectInput) => api.post<Project>('/projects', data).then(r => r.data),
  update: (id: number, data: Partial<CreateProjectInput>) => api.put<Project>(`/projects/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/projects/${id}`),
};

// Workflows
export const workflowsApi = {
  list: (projectId?: number) => {
    const params = projectId ? { project_id: projectId } : {};
    return api.get<Workflow[]>('/workflows', { params }).then(r => r.data);
  },
  get: (id: number) => api.get<Workflow>(`/workflows/${id}`).then(r => r.data),
  create: (data: CreateWorkflowInput) => api.post<Workflow>('/workflows', data).then(r => r.data),
  update: (id: number, data: Partial<CreateWorkflowInput>) => api.put<Workflow>(`/workflows/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/workflows/${id}`),
};

// Epics
export const epicsApi = {
  list: (projectId?: number) => {
    const params = projectId ? { project_id: projectId } : {};
    return api.get<Epic[]>('/epics', { params }).then(r => r.data);
  },
  get: (id: number) => api.get<Epic>(`/epics/${id}`).then(r => r.data),
  create: (data: Partial<Epic>) => api.post<Epic>('/epics', data).then(r => r.data),
  update: (id: number, data: Partial<Epic>) => api.put<Epic>(`/epics/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/epics/${id}`),
};

// Stories
export const storiesApi = {
  list: (epicId?: number) => {
    const params = epicId ? { epic_id: epicId } : {};
    return api.get<Story[]>('/stories', { params }).then(r => r.data);
  },
  get: (id: number) => api.get<Story>(`/stories/${id}`).then(r => r.data),
  create: (data: Partial<Story>) => api.post<Story>('/stories', data).then(r => r.data),
  update: (id: number, data: Partial<Story>) => api.put<Story>(`/stories/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/stories/${id}`),
};

// Tasks
export const tasksApi = {
  list: (filters?: { status?: string; story_id?: number; workflow_id?: number }) => {
    return api.get<Task[]>('/tasks', { params: filters }).then(r => r.data);
  },
  get: (id: number) => api.get<Task>(`/tasks/${id}`).then(r => r.data),
  create: (data: CreateTaskInput) => api.post<Task>('/tasks', data).then(r => r.data),
  update: (id: number, data: UpdateTaskInput) => api.put<Task>(`/tasks/${id}`, data).then(r => r.data),
  updateStatus: (id: number, status: string) => api.patch<Task>(`/tasks/${id}/status`, { status }).then(r => r.data),
  delete: (id: number) => api.delete(`/tasks/${id}`),
  getNext: () => api.get<Task>('/tasks/next').then(r => r.data),
  getActivity: (id: number) => api.get<TaskActivity[]>(`/tasks/${id}/activity`).then(r => r.data),
  addActivity: (id: number, data: { activity_type: string; description: string }) => 
    api.post<TaskActivity>(`/tasks/${id}/activity`, data).then(r => r.data),
};

export default api;
