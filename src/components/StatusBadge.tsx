import { statusTextMap, getStatusColor } from '../utils/format';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge = ({ status, className = '' }: StatusBadgeProps) => {
  const text = statusTextMap[status] || status;
  const colorClass = getStatusColor(status);
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {text}
    </span>
  );
};

export default StatusBadge;
