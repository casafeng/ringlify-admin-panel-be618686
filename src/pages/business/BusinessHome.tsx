import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Phone, Calendar, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { businessApi } from '@/lib/business-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

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

export function BusinessHome() {
  const { data: business, isLoading: businessLoading } = useQuery({
    queryKey: ['business'],
    queryFn: () => businessApi.getBusiness(),
  });

  const { data: todayStats, isLoading: statsLoading } = useQuery({
    queryKey: ['today-stats'],
    queryFn: () => businessApi.getTodayStats(),
  });

  const { data: recentCalls, isLoading: callsLoading } = useQuery({
    queryKey: ['recent-calls'],
    queryFn: () => businessApi.getCallLogs({ limit: 5 }),
  });

  const { data: upcomingAppointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['upcoming-appointments'],
    queryFn: () => {
      const today = new Date().toISOString();
      return businessApi.getAppointments({ startDate: today, limit: 5 });
    },
  });

  const formatAppointmentDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return `Today at ${format(date, 'h:mm a')}`;
    if (isTomorrow(date)) return `Tomorrow at ${format(date, 'h:mm a')}`;
    return format(date, 'MMM d, h:mm a');
  };

  return (
    <div className="space-y-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {businessLoading ? 'Loading...' : `Welcome, ${business?.name || 'Business'}`}
          </h1>
          <p className="page-description">
            Here's what's happening with your business today
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Calls
              </CardTitle>
              <div className="p-2 rounded-lg bg-info/10">
                <Phone className="h-5 w-5 text-info" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <div className="text-3xl font-bold">{todayStats?.calls || 0}</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Appointments
              </CardTitle>
              <div className="p-2 rounded-lg bg-success/10">
                <Calendar className="h-5 w-5 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <div className="text-3xl font-bold">{todayStats?.appointments || 0}</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Appointments
              </CardTitle>
              <div className="p-2 rounded-lg bg-warning/10">
                <TrendingUp className="h-5 w-5 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <div className="text-3xl font-bold">
                  {upcomingAppointments?.pagination.total || 0}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Calls
              </CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              {callsLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <div className="text-3xl font-bold">
                  {recentCalls?.pagination.total || 0}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 lg:grid-cols-2"
      >
        {/* Recent Calls */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-muted-foreground" />
                Recent Calls
              </CardTitle>
              <Link 
                to="/business/calls" 
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {callsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : recentCalls?.data.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Phone className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No calls yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCalls?.data.slice(0, 5).map((call) => (
                    <div
                      key={call.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">
                          {call.callerName || call.callerPhone}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {call.createdAt
                            ? format(parseISO(call.createdAt), 'MMM d, h:mm a')
                            : 'Unknown time'}
                        </p>
                      </div>
                      <StatusBadge status={call.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Appointments */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                Upcoming Appointments
              </CardTitle>
              <Link 
                to="/business/appointments" 
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : upcomingAppointments?.data.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No upcoming appointments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments?.data.slice(0, 5).map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{apt.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {apt.phone}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-primary">
                          {formatAppointmentDate(apt.start)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Quick Tips */}
      <motion.div variants={item} initial="hidden" animate="show">
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Keep Your Knowledge Base Updated</h3>
                <p className="text-sm text-muted-foreground">
                  Make sure to keep your business hours, services, and policies up to date in the{' '}
                  <Link to="/business/knowledge-base" className="text-primary hover:underline">
                    Knowledge Base
                  </Link>{' '}
                  section for accurate AI responses.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
