import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CollegeProvider } from "@/contexts/CollegeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import StaffDashboard from "@/pages/staff/StaffDashboard";
import StaffAttendance from "@/pages/staff/StaffAttendance";
import StaffProgress from "@/pages/staff/StaffProgress";
import StaffMessages from "@/pages/staff/StaffMessages";
import StaffInsights from "@/pages/staff/StaffInsights";
import StaffProfile from "@/pages/staff/StaffProfile";
import StaffAcademicProgress from "@/pages/staff/StaffAcademicProgress";
import HodDashboard from "@/pages/hod/HodDashboard";
import HodStaffManagement from "@/pages/hod/HodStaffManagement";
import HodAttendance from "@/pages/hod/HodAttendance";
import HodProgress from "@/pages/hod/HodProgress";
import HodCommunication from "@/pages/hod/HodCommunication";
import HodAnalytics from "@/pages/hod/HodAnalytics";
import HodProfile from "@/pages/hod/HodProfile";
import HodDepartments from "@/pages/hod/HodDepartments";
import HodAcademicProgress from "@/pages/hod/HodAcademicProgress";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CollegeProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Staff Routes */}
              <Route path="/staff" element={<ProtectedRoute allowedRoles={["ROLE_STAFF", "ROLE_ASST_PROF"]}><StaffDashboard /></ProtectedRoute>} />
              <Route path="/staff/attendance" element={<ProtectedRoute allowedRoles={["ROLE_STAFF", "ROLE_ASST_PROF"]}><StaffAttendance /></ProtectedRoute>} />
              <Route path="/staff/progress" element={<ProtectedRoute allowedRoles={["ROLE_STAFF", "ROLE_ASST_PROF"]}><StaffProgress /></ProtectedRoute>} />
              <Route path="/staff/messages" element={<ProtectedRoute allowedRoles={["ROLE_STAFF", "ROLE_ASST_PROF"]}><StaffMessages /></ProtectedRoute>} />
              <Route path="/staff/insights" element={<ProtectedRoute allowedRoles={["ROLE_STAFF", "ROLE_ASST_PROF"]}><StaffInsights /></ProtectedRoute>} />
              <Route path="/staff/profile" element={<ProtectedRoute allowedRoles={["ROLE_STAFF", "ROLE_ASST_PROF"]}><StaffProfile /></ProtectedRoute>} />
              <Route path="/staff/academic" element={<ProtectedRoute allowedRoles={["ROLE_STAFF", "ROLE_ASST_PROF"]}><StaffAcademicProgress /></ProtectedRoute>} />

              {/* HOD Routes */}
              <Route path="/hod" element={<ProtectedRoute allowedRoles={["ROLE_HOD"]}><HodDashboard /></ProtectedRoute>} />
              <Route path="/hod/staff" element={<ProtectedRoute allowedRoles={["ROLE_HOD"]}><HodStaffManagement /></ProtectedRoute>} />
              <Route path="/hod/attendance" element={<ProtectedRoute allowedRoles={["ROLE_HOD"]}><HodAttendance /></ProtectedRoute>} />
              <Route path="/hod/progress" element={<ProtectedRoute allowedRoles={["ROLE_HOD"]}><HodProgress /></ProtectedRoute>} />
              <Route path="/hod/communication" element={<ProtectedRoute allowedRoles={["ROLE_HOD"]}><HodCommunication /></ProtectedRoute>} />
              <Route path="/hod/analytics" element={<ProtectedRoute allowedRoles={["ROLE_HOD"]}><HodAnalytics /></ProtectedRoute>} />
              <Route path="/hod/profile" element={<ProtectedRoute allowedRoles={["ROLE_HOD"]}><HodProfile /></ProtectedRoute>} />
              <Route path="/hod/departments" element={<ProtectedRoute allowedRoles={["ROLE_HOD"]}><HodDepartments /></ProtectedRoute>} />
              <Route path="/hod/academic" element={<ProtectedRoute allowedRoles={["ROLE_HOD"]}><HodAcademicProgress /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </CollegeProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
