import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../services/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Task, CreateTaskInput, UpdateTaskInput } from '../types';
import { TASK_STATUSES, TASK_TYPES, PRIORITIES } from '../types';

const statusColors: Record<string, string> = {
  todo: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  review: 'bg-blue-100 text-blue-800',
  done: 'bg-green-100 text-green-800',
  blocked: 'bg-red-100 text-red-800',
};

export function Tasks() {
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [formData, setFormData] = useState<CreateTaskInput>({
    name: '',
    description: '',
    task_type: 'development',
    status: 'todo',
    priority: 1,
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', statusFilter],
    queryFn: () => tasksApi.list(statusFilter ? { status: statusFilter } : undefined),
  });

  const createMutation = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskInput }) =>
      tasksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (selectedTask) {
        tasksApi.get(selectedTask.id).then(setSelectedTask);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tasksApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setSelectedTask(null);
    },
  });

  const openModal = (task?: Task) => {
    if (task) {
      setFormData({
        name: task.name,
        description: task.description || '',
        task_type: task.task_type,
        status: task.status,
        priority: task.priority,
        assigned_to: task.assigned_to,
        estimated_hours: task.estimated_hours,
      });
      setSelectedTask(task);
    } else {
      setFormData({
        name: '',
        description: '',
        task_type: 'development',
        status: 'todo',
        priority: 1,
      });
      setSelectedTask(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: '',
      description: '',
      task_type: 'development',
      status: 'todo',
      priority: 1,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTask && isModalOpen) {
      updateMutation.mutate({ id: selectedTask.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {TASK_STATUSES.map(status => (
              <option key={status} value={status}>{status.replace('_', ' ')}</option>
            ))}
          </select>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Task
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Task List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No tasks found
                  </td>
                </tr>
              ) : (
                tasks.map(task => (
                  <tr
                    key={task.id}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedTask?.id === task.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedTask(task)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{task.name}</p>
                      {task.assigned_to && (
                        <p className="text-sm text-gray-500">{task.assigned_to}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{task.task_type}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[task.status] || statusColors.todo}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {PRIORITIES.find(p => p.value === task.priority)?.label || 'Medium'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); openModal(task); }}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(task.id); }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Task Detail Panel */}
        <div className="bg-white rounded-lg shadow overflow-auto">
          {selectedTask ? (
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{selectedTask.name}</h2>
                <button
                  onClick={() => openModal(selectedTask)}
                  className="p-1 text-gray-400 hover:text-blue-600"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                  <select
                    value={selectedTask.status}
                    onChange={e => updateMutation.mutate({ 
                      id: selectedTask.id, 
                      data: { status: e.target.value } 
                    })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {TASK_STATUSES.map(status => (
                      <option key={status} value={status}>{status.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Description</label>
                  <p className="mt-1 text-gray-700">{selectedTask.description || 'No description'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Type</label>
                    <p className="mt-1 text-gray-700">{selectedTask.task_type}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Priority</label>
                    <p className="mt-1 text-gray-700">
                      {PRIORITIES.find(p => p.value === selectedTask.priority)?.label}
                    </p>
                  </div>
                </div>

                {selectedTask.assigned_to && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Assigned To</label>
                    <p className="mt-1 text-gray-700">{selectedTask.assigned_to}</p>
                  </div>
                )}

                {(selectedTask.estimated_hours || selectedTask.actual_hours) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Estimated</label>
                      <p className="mt-1 text-gray-700">{selectedTask.estimated_hours || '-'} hrs</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Actual</label>
                      <p className="mt-1 text-gray-700">{selectedTask.actual_hours || '-'} hrs</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Created</label>
                  <p className="mt-1 text-gray-700">
                    {format(new Date(selectedTask.created_at), 'PPp')}
                  </p>
                </div>

                {selectedTask.notes && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Notes</label>
                    <p className="mt-1 text-gray-700 whitespace-pre-wrap">{selectedTask.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              Select a task to view details
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">
              {selectedTask ? 'Edit Task' : 'New Task'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={formData.task_type}
                      onChange={e => setFormData({ ...formData, task_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {TASK_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {TASK_STATUSES.map(status => (
                        <option key={status} value={status}>{status.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={e => setFormData({ ...formData, priority: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {PRIORITIES.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                    <input
                      type="number"
                      value={formData.estimated_hours || ''}
                      onChange={e => setFormData({ ...formData, estimated_hours: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <input
                    type="text"
                    value={formData.assigned_to || ''}
                    onChange={e => setFormData({ ...formData, assigned_to: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
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
                  {selectedTask ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
