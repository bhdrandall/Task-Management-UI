import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowsApi, projectsApi } from '../services/api';
import { Plus, Eye, Trash2 } from 'lucide-react';
import { BpmnViewer } from '../components/BpmnViewer';
import type { Workflow, CreateWorkflowInput } from '../types';

export function Workflows() {
  const queryClient = useQueryClient();
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateWorkflowInput>({ name: '', description: '' });

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowsApi.list(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: workflowsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      setIsModalOpen(false);
      setFormData({ name: '', description: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: workflowsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      if (selectedWorkflow) setSelectedWorkflow(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Workflow
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Workflow List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow overflow-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">All Workflows</h2>
          </div>
          {workflows.length === 0 ? (
            <div className="p-4 text-gray-500 text-center">No workflows yet</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {workflows.map(workflow => (
                <li
                  key={workflow.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedWorkflow?.id === workflow.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedWorkflow(workflow)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{workflow.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {workflow.description || 'No description'}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Version {workflow.version} • {workflow.status}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWorkflow(workflow);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(workflow.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* BPMN Viewer */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow flex flex-col min-h-0">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">
              {selectedWorkflow ? selectedWorkflow.name : 'Select a workflow'}
            </h2>
          </div>
          <div className="flex-1 p-4 min-h-0">
            {selectedWorkflow?.bpmn_xml ? (
              <BpmnViewer xml={selectedWorkflow.bpmn_xml} className="h-full" />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                {selectedWorkflow ? 'No BPMN diagram available' : 'Select a workflow to view its diagram'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">New Workflow</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project
                </label>
                <select
                  value={formData.project_id || ''}
                  onChange={e => setFormData({ ...formData, project_id: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">No project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
