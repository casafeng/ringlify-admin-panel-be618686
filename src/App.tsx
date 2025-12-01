import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Admin Dashboard
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardHome } from "@/pages/dashboard/DashboardHome";
import { AppointmentsPage } from "@/pages/dashboard/AppointmentsPage";
import { CallLogsPage } from "@/pages/dashboard/CallLogsPage";
import { BusinessesPage } from "@/pages/dashboard/BusinessesPage";
import { BusinessDetailPage } from "@/pages/dashboard/BusinessDetailPage";

// Business Dashboard
import { BusinessLayout } from "@/components/layout/BusinessLayout";
import { LoginPage } from "@/pages/business/LoginPage";
import { SignupPage } from "@/pages/business/SignupPage";
import { OnboardingPage } from "@/pages/business/OnboardingPage";
import { BusinessHome } from "@/pages/business/BusinessHome";
import { BusinessCallLogsPage } from "@/pages/business/BusinessCallLogsPage";
import { BusinessAppointmentsPage } from "@/pages/business/BusinessAppointmentsPage";
import { KnowledgeBasePage } from "@/pages/business/KnowledgeBasePage";
import { SettingsPage } from "@/pages/business/SettingsPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Redirect root to admin dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Admin Dashboard routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="call-logs" element={<CallLogsPage />} />
            <Route path="businesses" element={<BusinessesPage />} />
            <Route path="businesses/:id" element={<BusinessDetailPage />} />
          </Route>

          {/* Business Dashboard routes */}
          <Route path="/business/login" element={<LoginPage />} />
          <Route path="/business/signup" element={<SignupPage />} />
          <Route path="/business/setup" element={<OnboardingPage />} />
          <Route
            path="/business"
            element={
              <ProtectedRoute>
                <BusinessLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<BusinessHome />} />
            <Route path="calls" element={<BusinessCallLogsPage />} />
            <Route path="appointments" element={<BusinessAppointmentsPage />} />
            <Route path="knowledge-base" element={<KnowledgeBasePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
