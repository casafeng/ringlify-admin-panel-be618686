import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Calendar, Filter, Search, X, User, Mail, Phone } from 'lucide-react';
import { businessApi, Appointment } from '@/lib/business-api';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export function BusinessAppointmentsPage() {
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchName, setSearchName] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const limit = 10;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['business-appointments', page, startDate, endDate, searchName],
    queryFn: () =>
      businessApi.getAppointments({
        page,
        limit,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        name: searchName || undefined,
      }),
  });

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchName('');
    setPage(1);
  };

  const hasActiveFilters = startDate || endDate || searchName;

  const columns = [
    {
      key: 'name',
      header: 'Customer',
      render: (apt: Appointment) => (
        <div>
          <p className="font-medium">{apt.name}</p>
          <p className="text-sm text-muted-foreground">{apt.phone}</p>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (apt: Appointment) => apt.email || '-',
    },
    {
      key: 'start',
      header: 'Date & Time',
      render: (apt: Appointment) => (
        <div>
          <p className="font-medium">
            {format(parseISO(apt.start), 'MMM d, yyyy')}
          </p>
          <p className="text-sm text-muted-foreground">
            {format(parseISO(apt.start), 'h:mm a')} - {format(parseISO(apt.end), 'h:mm a')}
          </p>
        </div>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (apt: Appointment) => {
        const start = parseISO(apt.start);
        const end = parseISO(apt.end);
        const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
        return `${minutes} min`;
      },
    },
  ];

  if (error) {
    return (
      <ErrorMessage
        title="Failed to load appointments"
        message={error instanceof Error ? error.message : 'An error occurred'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-description">View and manage your appointments</p>
        </div>
      </div>

      {/* Filters */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </CollapsibleTrigger>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear filters
            </Button>
          )}
        </div>

        <CollapsibleContent className="mt-4">
          <div className="grid gap-4 p-4 rounded-lg border border-border bg-muted/30 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchName}
                  onChange={(e) => { setSearchName(e.target.value); setPage(1); }}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        emptyMessage="No appointments found"
        rowKey={(apt) => apt.id}
        onRowClick={(apt) => setSelectedAppointment(apt)}
      />

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={data.pagination.totalPages}
          total={data.pagination.total}
          limit={limit}
          onPageChange={setPage}
        />
      )}

      {/* Appointment Details Modal */}
      <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Full information about this appointment
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-semibold">{selectedAppointment.name}</h3>
              </div>

              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedAppointment.phone}</p>
                  </div>
                </div>

                {selectedAppointment.email && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedAppointment.email}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium">
                      {format(parseISO(selectedAppointment.start), 'MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(selectedAppointment.start), 'h:mm a')} -{' '}
                      {format(parseISO(selectedAppointment.end), 'h:mm a')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">Appointment ID</p>
                <p className="font-mono text-xs">{selectedAppointment.id}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
