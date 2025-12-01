import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, Phone, Building2, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function DashboardHome() {
  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['appointments-summary'],
    queryFn: () => api.getAppointments({ limit: 1 }),
  });

  const { data: callLogsData, isLoading: callLogsLoading } = useQuery({
    queryKey: ['call-logs-summary'],
    queryFn: () => api.getCallLogs({ limit: 1 }),
  });

  const { data: businessesData, isLoading: businessesLoading } = useQuery({
    queryKey: ['businesses-summary'],
    queryFn: () => api.getBusinesses(),
  });

  const stats = [
    {
      name: 'Total Appointments',
      value: appointmentsData?.pagination.total || 0,
      icon: Calendar,
      href: '/dashboard/appointments',
      loading: appointmentsLoading,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      name: 'Total Call Logs',
      value: callLogsData?.pagination.total || 0,
      icon: Phone,
      href: '/dashboard/call-logs',
      loading: callLogsLoading,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      name: 'Businesses',
      value: businessesData?.data.length || 0,
      icon: Building2,
      href: '/dashboard/businesses',
      loading: businessesLoading,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">
            Overview of your Ringlify admin panel
          </p>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {stats.map((stat) => (
          <motion.div key={stat.name} variants={item}>
            <Link to={stat.href}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.name}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  {stat.loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
                  )}
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2"
      >
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                to="/dashboard/businesses"
                className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="font-medium">Manage Businesses</div>
                <div className="text-sm text-muted-foreground">
                  Add, edit, or remove businesses
                </div>
              </Link>
              <Link
                to="/dashboard/appointments"
                className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="font-medium">View Appointments</div>
                <div className="text-sm text-muted-foreground">
                  Browse and filter appointments
                </div>
              </Link>
              <Link
                to="/dashboard/call-logs"
                className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="font-medium">Call Logs</div>
                <div className="text-sm text-muted-foreground">
                  Review call history and statuses
                </div>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Environment Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Configure these environment variables to connect to your backend:
              </p>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-muted font-mono text-sm">
                  <div className="text-muted-foreground"># Backend URL</div>
                  <div>VITE_BACKEND_URL=http://localhost:3000</div>
                </div>
                <div className="p-3 rounded-lg bg-muted font-mono text-sm">
                  <div className="text-muted-foreground"># Admin API Key</div>
                  <div>VITE_ADMIN_API_KEY=your-api-key</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
