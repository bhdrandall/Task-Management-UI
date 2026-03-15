import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { epicsApi } from '../services/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useCurrentProject } from '../context/ProjectContext';
import type { Epic } from '../types';

export function Epics() {
  const queryClient = useQueryClient();
  const { currentProject } = useCurrentProject();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEpic, setEditingEpic] = useState<Epic | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 1,
    project_id: undefined as number | undefined,
  });

  const { data: epics = [], isLoading } = useQuery({
    queryKey: ['epics', currentProject?.id],
    queryFn: () => epicsApi.list(currentProject?.id),
    enabled: !!currentProject,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Epic>) => epicsApi.create({
      ...data,
      project_id: currentProject?.id,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epics'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Epic> }) =>
      epicsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epics'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: epicsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epics'] });
    },
  });

  const openModal = (epic?: Epic) => {
    if (epic) {
      setEditingEpic(epic);
      setFormData({
        name: epic.name,
        description: epic.description || '',
        priority: epic.priority,
        project_id: epic.project_id,
      });
    } else {
      setEditingEpic(null);
      setFormData({
        name: '',
        description: '',
        priority: 1,
        project_id: undefined,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEpic(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEpic) {
      updateMutation.mutate({ id: editingEpic.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Epics</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Epic
        </button>
      </div>

      {epics.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No epics yet. Create your first epic!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {epics.map(epic => (
            <div key={epic.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{epic.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(epic)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(epic.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                {epic.description || 'No description'}
              </p>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span className={`px-2 py-1 rounded-full ${
                  epic.status === 'done' ? 'bg-green-100 text-green-800' :
                  epic.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {epic.status}
                </span>
                <span>
                  {currentProject?.name || 'No project'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingEpic ? 'Edit Epic' : 'New Epic'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                  <input
                    type="text"
                    value={currentProject?.name || 'No project selected'}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Low</option>
                    <option value={1}>Medium</option>
                    <option value={2}>High</option>
                    <option value={3}>Critical</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingEpic ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
