import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Eye, FileCode2 } from 'lucide-react';
import { workflowsApi } from '../services/api';
import { useCurrentProject } from '../context/ProjectContext';
import { BpmnViewer } from '../components/BpmnViewer';
import type { Workflow, CreateWorkflowInput } from '../types';

export function Specifications() {
  const queryClient = useQueryClient();
  const { currentProject } = useCurrentProject();
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateWorkflowInput>({
    name: '',
    description: '',
    workflow_type: 'specification',
  });

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflows', 'specification', currentProject?.id],
    queryFn: () => workflowsApi.list({ 
      project_id: currentProject?.id, 
      workflow_type: 'specification' 
    }),
    enabled: !!currentProject,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateWorkflowInput) => workflowsApi.create({
      ...data,
      project_id: currentProject?.id,
      workflow_type: 'specification',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      setIsCreating(false);
      setFormData({ name: '', description: '', workflow_type: 'specification' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: workflowsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      setSelectedWorkflow(null);
    },
  });

  if (!currentProject) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <FileCode2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Project Selected</h2>
          <p className="text-gray-500">Select a project from the sidebar to view specifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Specifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Product behavior workflows for {currentProject.name}
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Specification
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Workflow List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow overflow-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Product Specifications</h2>
            <p className="text-xs text-gray-500 mt-1">User flows and system behavior</p>
          </div>
          
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : workflows.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileCode2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No specifications yet</p>
              <p className="text-sm mt-1">Create one to define product behavior</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {workflows.map((workflow) => (
                <li
                  key={workflow.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedWorkflow?.id === workflow.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedWorkflow(workflow)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{workflow.name}</p>
                      {workflow.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{workflow.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Version {workflow.version} • {workflow.status}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-2">
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
                          if (confirm('Delete this specification?')) {
                            deleteMutation.mutate(workflow.id);
                          }
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
              {selectedWorkflow ? selectedWorkflow.name : 'Select a Specification'}
            </h2>
            {selectedWorkflow?.description && (
              <p className="text-sm text-gray-500 mt-1">{selectedWorkflow.description}</p>
            )}
          </div>
          <div className="flex-1 p-4 min-h-0">
            {selectedWorkflow?.bpmn_xml ? (
              <BpmnViewer xml={selectedWorkflow.bpmn_xml} className="h-full" />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="text-center">
                  <FileCode2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {selectedWorkflow 
                      ? 'No BPMN diagram available' 
                      : 'Select a specification to view its diagram'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">New Specification</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(formData);
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
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
