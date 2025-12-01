import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Phone, Filter, Calendar, X } from 'lucide-react';
import { businessApi, CallLog } from '@/lib/business-api';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'booked', label: 'Booked' },
  { value: 'suggested_alternatives', label: 'Alternatives' },
  { value: 'failed', label: 'Failed' },
  { value: 'unavailable', label: 'Unavailable' },
];

export function BusinessCallLogsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const limit = 10;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['business-call-logs', page, status, startDate, endDate],
    queryFn: () =>
      businessApi.getCallLogs({
        page,
        limit,
        status: status || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  });

  const clearFilters = () => {
    setStatus('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const hasActiveFilters = status || startDate || endDate;

  const columns = [
    {
      key: 'callerPhone',
      header: 'Caller',
      render: (call: CallLog) => (
        <div>
          <p className="font-medium">{call.callerName || 'Unknown'}</p>
          <p className="text-sm text-muted-foreground">{call.callerPhone}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (call: CallLog) => <StatusBadge status={call.status} />,
    },
    {
      key: 'requestedStart',
      header: 'Requested Time',
      render: (call: CallLog) =>
        call.requestedStart
          ? format(parseISO(call.requestedStart), 'MMM d, yyyy h:mm a')
          : '-',
    },
    {
      key: 'createdAt',
      header: 'Call Time',
      render: (call: CallLog) =>
        call.createdAt
          ? format(parseISO(call.createdAt), 'MMM d, yyyy h:mm a')
          : '-',
    },
  ];

  if (error) {
    return (
      <ErrorMessage
        title="Failed to load call logs"
        message={error instanceof Error ? error.message : 'An error occurred'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Call Logs</h1>
          <p className="page-description">View and manage your incoming calls</p>
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
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        emptyMessage="No call logs found"
        rowKey={(call) => call.id}
        onRowClick={(call) => setSelectedCall(call)}
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

      {/* Call Details Sheet */}
      <Sheet open={!!selectedCall} onOpenChange={(open) => !open && setSelectedCall(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Call Details</SheetTitle>
            <SheetDescription>
              Full information about this call
            </SheetDescription>
          </SheetHeader>

          {selectedCall && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <Phone className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Caller Name</p>
                    <p className="font-medium">{selectedCall.callerName || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedCall.callerPhone}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={selectedCall.status} />
                  </div>
                </div>

                {selectedCall.requestedStart && (
                  <div>
                    <p className="text-sm text-muted-foreground">Requested Time</p>
                    <p className="font-medium">
                      {format(parseISO(selectedCall.requestedStart), 'MMMM d, yyyy h:mm a')}
                    </p>
                  </div>
                )}

                {selectedCall.bookedStart && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Booked Start</p>
                      <p className="font-medium">
                        {format(parseISO(selectedCall.bookedStart), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    {selectedCall.bookedEnd && (
                      <div>
                        <p className="text-sm text-muted-foreground">Booked End</p>
                        <p className="font-medium">
                          {format(parseISO(selectedCall.bookedEnd), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {selectedCall.createdAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Call Time</p>
                    <p className="font-medium">
                      {format(parseISO(selectedCall.createdAt), 'MMMM d, yyyy h:mm a')}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground">Call ID</p>
                  <p className="font-mono text-xs">{selectedCall.id}</p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
