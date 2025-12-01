import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardHome } from "@/pages/dashboard/DashboardHome";
import { AppointmentsPage } from "@/pages/dashboard/AppointmentsPage";
import { CallLogsPage } from "@/pages/dashboard/CallLogsPage";
import { BusinessesPage } from "@/pages/dashboard/BusinessesPage";
import { BusinessDetailPage } from "@/pages/dashboard/BusinessDetailPage";
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
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Dashboard routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="call-logs" element={<CallLogsPage />} />
            <Route path="businesses" element={<BusinessesPage />} />
            <Route path="businesses/:id" element={<BusinessDetailPage />} />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
