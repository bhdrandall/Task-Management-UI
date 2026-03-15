import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { ProjectProvider } from './context/ProjectContext';
import { Dashboard, Projects, Specifications, Development, Tasks, Stories, Epics } from './pages';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProjectProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="specifications" element={<Specifications />} />
              <Route path="development" element={<Development />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="stories" element={<Stories />} />
              <Route path="epics" element={<Epics />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ProjectProvider>
    </QueryClientProvider>
  );
}

export default App;
