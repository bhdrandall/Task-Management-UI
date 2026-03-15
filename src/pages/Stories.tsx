import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storiesApi, epicsApi } from '../services/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useCurrentProject } from '../context/ProjectContext';
import type { Story } from '../types';

export function Stories() {
  const queryClient = useQueryClient();
  const { currentProject } = useCurrentProject();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    acceptance_criteria: '',
    priority: 1,
    story_points: undefined as number | undefined,
    epic_id: undefined as number | undefined,
  });

  // Get epics for current project
  const { data: epics = [] } = useQuery({
    queryKey: ['epics', currentProject?.id],
    queryFn: () => epicsApi.list(currentProject?.id),
    enabled: !!currentProject,
  });

  const epicIds = epics.map(e => e.id);

  const { data: allStories = [], isLoading } = useQuery({
    queryKey: ['stories'],
    queryFn: () => storiesApi.list(),
  });

  // Filter stories by current project's epics
  const stories = currentProject
    ? allStories.filter(s => s.epic_id && epicIds.includes(s.epic_id))
    : allStories;

  const createMutation = useMutation({
    mutationFn: storiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Story> }) =>
      storiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: storiesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });

  const openModal = (story?: Story) => {
    if (story) {
      setEditingStory(story);
      setFormData({
        name: story.name,
        description: story.description || '',
        acceptance_criteria: story.acceptance_criteria || '',
        priority: story.priority,
        story_points: story.story_points,
        epic_id: story.epic_id,
      });
    } else {
      setEditingStory(null);
      setFormData({
        name: '',
        description: '',
        acceptance_criteria: '',
        priority: 1,
        story_points: undefined,
        epic_id: undefined,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStory(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStory) {
      updateMutation.mutate({ id: editingStory.id, data: formData });
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
        <h1 className="text-2xl font-bold text-gray-900">Stories</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Story
        </button>
      </div>

      {stories.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No stories yet. Create your first story!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Story</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Epic</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stories.map(story => (
                <tr key={story.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{story.name}</p>
                    <p className="text-sm text-gray-500 truncate max-w-md">
                      {story.description || 'No description'}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {epics.find(e => e.id === story.epic_id)?.name || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      story.status === 'done' ? 'bg-green-100 text-green-800' :
                      story.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {story.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {story.story_points || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(story)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(story.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">
              {editingStory ? 'Edit Story' : 'New Story'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Epic</label>
                  <select
                    value={formData.epic_id || ''}
                    onChange={e => setFormData({ ...formData, epic_id: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No epic</option>
                    {epics.map(epic => (
                      <option key={epic.id} value={epic.id}>{epic.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Acceptance Criteria</label>
                  <textarea
                    value={formData.acceptance_criteria}
                    onChange={e => setFormData({ ...formData, acceptance_criteria: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Story Points</label>
                    <input
                      type="number"
                      value={formData.story_points || ''}
                      onChange={e => setFormData({ ...formData, story_points: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
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
                  {editingStory ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
