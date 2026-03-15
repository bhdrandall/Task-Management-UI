import { useQuery } from '@tanstack/react-query';
import { projectsApi, tasksApi, workflowsApi } from '../services/api';
import { 
  FolderKanban, 
  GitBranch, 
  ListTodo, 
  CheckCircle2,
  Clock,
  AlertCircle 
} from 'lucide-react';

export function Dashboard() {
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.list(),
  });

  const { data: workflows = [] } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowsApi.list(),
  });

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'done');

  const stats = [
    { label: 'Projects', value: projects.length, icon: FolderKanban, color: 'bg-blue-500' },
    { label: 'Workflows', value: workflows.length, icon: GitBranch, color: 'bg-purple-500' },
    { label: 'Total Tasks', value: tasks.length, icon: ListTodo, color: 'bg-gray-500' },
    { label: 'To Do', value: todoTasks.length, icon: Clock, color: 'bg-yellow-500' },
    { label: 'In Progress', value: inProgressTasks.length, icon: AlertCircle, color: 'bg-orange-500' },
    { label: 'Completed', value: completedTasks.length, icon: CheckCircle2, color: 'bg-green-500' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
            <div className={`${color} p-3 rounded-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Tasks</h2>
          {tasks.length === 0 ? (
            <p className="text-gray-500">No tasks yet</p>
          ) : (
            <ul className="space-y-3">
              {tasks.slice(0, 5).map(task => (
                <li key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{task.name}</p>
                    <p className="text-sm text-gray-500">{task.task_type}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    task.status === 'done' ? 'bg-green-100 text-green-800' :
                    task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    task.status === 'blocked' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Projects</h2>
          {projects.length === 0 ? (
            <p className="text-gray-500">No projects yet</p>
          ) : (
            <ul className="space-y-3">
              {projects.slice(0, 5).map(project => (
                <li key={project.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{project.name}</p>
                  <p className="text-sm text-gray-500">{project.description || 'No description'}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
