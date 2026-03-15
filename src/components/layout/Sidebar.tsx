import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  FileCode2,
  GitBranch,
  ListTodo,
  BookOpen,
  Target,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useCurrentProject } from '../../context/ProjectContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
];

const projectNavItems = [
  { to: '/specifications', icon: FileCode2, label: 'Specifications' },
  { to: '/development', icon: GitBranch, label: 'Development Path' },
  { to: '/tasks', icon: ListTodo, label: 'Tasks' },
  { to: '/stories', icon: BookOpen, label: 'Stories' },
  { to: '/epics', icon: Target, label: 'Epics' },
];

export function Sidebar() {
  const { currentProject } = useCurrentProject();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ListTodo className="w-6 h-6 text-blue-400" />
          Task Manager
        </h1>
      </div>

      {/* Current Project Display */}
      <div className="p-4 border-b border-gray-800">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Project</p>
        {currentProject ? (
          <NavLink
            to="/projects"
            className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium truncate">{currentProject.name}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </NavLink>
        ) : (
          <NavLink
            to="/projects"
            className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-gray-400"
          >
            <span>Select a project</span>
            <ChevronDown className="w-4 h-4" />
          </NavLink>
        )}
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Project-specific navigation */}
        {currentProject && (
          <>
            <div className="mt-6 mb-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider px-3">Project Views</p>
            </div>
            <ul className="space-y-1">
              {projectNavItems.map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </>
        )}

        {!currentProject && (
          <div className="mt-6 px-3 py-4 bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-400 text-center">
              Select a project to view specifications, tasks, and more.
            </p>
          </div>
        )}
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <Settings className="w-5 h-5" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
