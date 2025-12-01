import { cn } from '@/lib/utils';

type Status = 'pending' | 'booked' | 'suggested_alternatives' | 'failed' | 'unavailable';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  booked: {
    label: 'Booked',
    className: 'status-booked',
  },
  pending: {
    label: 'Pending',
    className: 'status-pending',
  },
  failed: {
    label: 'Failed',
    className: 'status-failed',
  },
  unavailable: {
    label: 'Unavailable',
    className: 'status-unavailable',
  },
  suggested_alternatives: {
    label: 'Alternatives',
    className: 'status-suggested_alternatives',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={cn('status-badge', config.className, className)}>
      {config.label}
    </span>
  );
}
