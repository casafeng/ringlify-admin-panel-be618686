import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Phone, Filter, X, ChevronRight } from 'lucide-react';
import { api, CallLog } from '@/lib/api';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'booked', label: 'Booked' },
  { value: 'suggested_alternatives', label: 'Alternatives' },
  { value: 'failed', label: 'Failed' },
  { value: 'unavailable', label: 'Unavailable' },
];

export function CallLogsPage() {
  const [page, setPage] = useState(1);
  const [businessId, setBusinessId] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<CallLog | null>(null);
  const limit = 10;

  const { data: businessesData } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => api.getBusinesses(),
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['call-logs', page, businessId, status, startDate, endDate],
    queryFn: () =>
      api.getCallLogs({
        page,
        limit,
        businessId: businessId || undefined,
        status: status || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  });

  const clearFilters = () => {
    setBusinessId('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const hasFilters = businessId || status || startDate || endDate;

  const columns = [
    {
      key: 'callerPhone',
      header: 'Caller',
      render: (item: CallLog) => (
        <div>
          <div className="font-mono text-sm">{item.callerPhone}</div>
          {item.callerName && (
            <div className="text-sm text-muted-foreground">{item.callerName}</div>
          )}
        </div>
      ),
    },
    {
      key: 'business',
      header: 'Business',
      render: (item: CallLog) => item.business.name,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: CallLog) => <StatusBadge status={item.status} />,
    },
    {
      key: 'requestedStart',
      header: 'Requested Time',
      render: (item: CallLog) =>
        item.requestedStart
          ? format(new Date(item.requestedStart), 'MMM d, h:mm a')
          : '-',
    },
    {
      key: 'bookedStart',
      header: 'Booked Time',
      render: (item: CallLog) =>
        item.bookedStart
          ? format(new Date(item.bookedStart), 'MMM d, h:mm a')
          : '-',
    },
    {
      key: 'actions',
      header: '',
      render: (item: CallLog) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLog(item);
          }}
        >
          <ChevronRight className="h-4 w-4" />
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
            <Phone className="h-6 w-6" />
            Call Logs
          </h1>
          <p className="page-description">
            View call history and booking statuses
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <Filter className="h-4 w-4 text-muted-foreground" />

        <div className="flex-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
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
          message={error instanceof Error ? error.message : 'Failed to load call logs'}
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
            emptyMessage="No call logs found"
            rowKey={(item) => item.id}
            onRowClick={(item) => setSelectedLog(item)}
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

      {/* Call Log Detail Drawer */}
      <Sheet open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Call Log Details</SheetTitle>
          </SheetHeader>
          {selectedLog && (
            <div className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={selectedLog.status} />
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Caller Phone</Label>
                  <p className="font-mono">{selectedLog.callerPhone}</p>
                </div>

                {selectedLog.callerName && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Caller Name</Label>
                    <p>{selectedLog.callerName}</p>
                  </div>
                )}

                <div>
                  <Label className="text-xs text-muted-foreground">Business</Label>
                  <p>{selectedLog.business.name}</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {selectedLog.business.phoneNumber}
                  </p>
                </div>

                {selectedLog.requestedStart && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Requested Time</Label>
                    <p>{format(new Date(selectedLog.requestedStart), 'MMMM d, yyyy h:mm a')}</p>
                  </div>
                )}

                {selectedLog.bookedStart && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Booked Time</Label>
                    <p>
                      {format(new Date(selectedLog.bookedStart), 'MMMM d, yyyy h:mm a')}
                      {selectedLog.bookedEnd && (
                        <> - {format(new Date(selectedLog.bookedEnd), 'h:mm a')}</>
                      )}
                    </p>
                  </div>
                )}

                {selectedLog.createdAt && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Created At</Label>
                    <p>{format(new Date(selectedLog.createdAt), 'MMMM d, yyyy h:mm a')}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <Label className="text-xs text-muted-foreground">Log ID</Label>
                <p className="font-mono text-sm break-all">{selectedLog.id}</p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
