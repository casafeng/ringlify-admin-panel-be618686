import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar, Filter, X, Eye } from 'lucide-react';
import { api, Appointment } from '@/lib/api';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function AppointmentsPage() {
  const [page, setPage] = useState(1);
  const [businessId, setBusinessId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const limit = 10;

  const { data: businessesData } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => api.getBusinesses(),
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['appointments', page, businessId, startDate, endDate],
    queryFn: () =>
      api.getAppointments({
        page,
        limit,
        businessId: businessId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  });

  const clearFilters = () => {
    setBusinessId('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const hasFilters = businessId || startDate || endDate;

  const columns = [
    {
      key: 'name',
      header: 'Customer',
      render: (item: Appointment) => (
        <div>
          <div className="font-medium">{item.name}</div>
          <div className="text-sm text-muted-foreground">{item.email || '-'}</div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (item: Appointment) => (
        <span className="font-mono text-sm">{item.phone}</span>
      ),
    },
    {
      key: 'business',
      header: 'Business',
      render: (item: Appointment) => item.business.name,
    },
    {
      key: 'start',
      header: 'Date & Time',
      render: (item: Appointment) => (
        <div>
          <div>{format(new Date(item.start), 'MMM d, yyyy')}</div>
          <div className="text-sm text-muted-foreground">
            {format(new Date(item.start), 'h:mm a')} -{' '}
            {format(new Date(item.end), 'h:mm a')}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (item: Appointment) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedAppointment(item);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
      className: 'w-12',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Appointments
          </h1>
          <p className="page-description">
            View and manage all scheduled appointments
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <Filter className="h-4 w-4 text-muted-foreground" />
        
        <div className="flex-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Business</Label>
            <Select value={businessId} onValueChange={(v) => { setBusinessId(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="All businesses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All businesses</SelectItem>
                {businessesData?.data.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <ErrorMessage
          message={error instanceof Error ? error.message : 'Failed to load appointments'}
          onRetry={() => refetch()}
        />
      )}

      {/* Table */}
      {!error && (
        <>
          <DataTable
            columns={columns}
            data={data?.data || []}
            loading={isLoading}
            emptyMessage="No appointments found"
            rowKey={(item) => item.id}
            onRowClick={(item) => setSelectedAppointment(item)}
          />

          {data?.pagination && data.pagination.total > 0 && (
            <Pagination
              page={page}
              totalPages={data.pagination.totalPages}
              total={data.pagination.total}
              limit={limit}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* Appointment Detail Modal */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Customer Name</Label>
                  <p className="font-medium">{selectedAppointment.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <p className="font-mono">{selectedAppointment.phone}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p>{selectedAppointment.email || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Business</Label>
                  <p>{selectedAppointment.business.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <p>{format(new Date(selectedAppointment.start), 'MMMM d, yyyy')}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Time</Label>
                  <p>
                    {format(new Date(selectedAppointment.start), 'h:mm a')} -{' '}
                    {format(new Date(selectedAppointment.end), 'h:mm a')}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Label className="text-xs text-muted-foreground">Appointment ID</Label>
                <p className="font-mono text-sm">{selectedAppointment.id}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
