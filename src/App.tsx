import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout'
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  ProjectsPage,
  ProjectDetailPage,
  ProjectFinancePage,
  TasksPage,
  TeamPage,
  NotificationsPage,
  SettingsPage,
  CreateProjectPage,
  EditProjectPage,
  ProjectFilesPage,
  ProjectTimelinePage,
  SearchPage,
} from '@/pages'

function App() {
  console.log('📱 App component rendering...')
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/new" element={<CreateProjectPage />} />
            <Route path="/projects/:id/edit" element={<EditProjectPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/projects/:id/files" element={<ProjectFilesPage />} />
            <Route path="/projects/:id/timeline" element={<ProjectTimelinePage />} />
            <Route path="/projects/:id/finance" element={<ProjectFinancePage />} />
            <Route path="/projects/:id/tasks" element={<TasksPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

