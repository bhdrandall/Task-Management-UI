// API Types matching the Task Management API

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Workflow {
  id: number;
  project_id?: number;
  name: string;
  description?: string;
  bpmn_xml?: string;
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface Epic {
  id: number;
  project_id?: number;
  name: string;
  description?: string;
  status: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface Story {
  id: number;
  epic_id?: number;
  workflow_id?: number;
  bpmn_element_id?: string;
  name: string;
  description?: string;
  acceptance_criteria?: string;
  status: string;
  priority: number;
  story_points?: number;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  story_id?: number;
  workflow_id?: number;
  bpmn_element_id?: string;
  name: string;
  description?: string;
  task_type: string;
  status: string;
  priority: number;
  estimated_hours?: number;
  actual_hours?: number;
  assigned_to?: string;
  labels?: string[];
  dependencies?: number[];
  blocked_by?: number[];
  git_branch?: string;
  git_pr_url?: string;
  git_commit_sha?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface TaskActivity {
  id: number;
  task_id: number;
  activity_type: string;
  description: string;
  old_value?: string;
  new_value?: string;
  created_by?: string;
  created_at: string;
}

// Form types
export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface CreateTaskInput {
  name: string;
  description?: string;
  task_type?: string;
  status?: string;
  priority?: number;
  story_id?: number;
  workflow_id?: number;
  assigned_to?: string;
  estimated_hours?: number;
}

export interface UpdateTaskInput {
  name?: string;
  description?: string;
  task_type?: string;
  status?: string;
  priority?: number;
  assigned_to?: string;
  estimated_hours?: number;
  actual_hours?: number;
  notes?: string;
}

export interface CreateWorkflowInput {
  name: string;
  description?: string;
  project_id?: number;
  bpmn_xml?: string;
}

// Status and type constants
export const TASK_STATUSES = ['todo', 'in_progress', 'review', 'done', 'blocked'] as const;
export const TASK_TYPES = ['development', 'bug', 'documentation', 'testing', 'design', 'research'] as const;
export const PRIORITIES = [
  { value: 0, label: 'Low' },
  { value: 1, label: 'Medium' },
  { value: 2, label: 'High' },
  { value: 3, label: 'Critical' },
] as const;
