import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import LoginPage from '@/features/auth/LoginPage';
import DashboardLayout from '@/features/layout/DashboardLayout';
import FleetDashboard from './features/fleet/FleetDashboard';
import ProjectDashboard from './features/projects/ProjectDashboard';
import AiRiskCenter from '@/features/ai-risk/AiRiskCenter';
import WorkforceDashboard from "./features/workforce/WorkforceDashboard";
import WorkerDashboard from "./features/workforce/WorkerDashboard.tsx";
import SystemAuditDashboard from "./features/admin/SystemAuditDashboard";
import AnalyticsDashboard from './features/admin/AnalyticsDashboard.tsx';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<FleetDashboard />} />
          <Route path="project/:id" element={<ProjectDashboard />} />
          <Route path="ai-risk-center" element={<AiRiskCenter />} />
          <Route path="workforce" element={<WorkforceDashboard />} />
          <Route path="worker-board" element={<WorkerDashboard />} />
          <Route path="audit-log" element={<SystemAuditDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;