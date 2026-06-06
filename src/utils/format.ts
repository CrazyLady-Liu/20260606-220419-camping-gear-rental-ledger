export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const formatCurrency = (amount: number): string => {
  return `¥${amount.toFixed(2)}`;
};

export const statusTextMap: Record<string, string> = {
  normal: '正常',
  maintenance: '维护中',
  damaged: '损坏',
  out_of_stock: '缺货',
  active: '租赁中',
  returned: '已归还',
  overdue: '已逾期',
  pending: '待补充',
  replenished: '已补充',
  routine: '常规保养',
  repair: '维修',
  replacement: '配件更换',
  abnormal: '异常',
  missing: '缺失'
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    normal: 'bg-emerald-100 text-emerald-700',
    maintenance: 'bg-amber-100 text-amber-700',
    damaged: 'bg-red-100 text-red-700',
    out_of_stock: 'bg-red-100 text-red-700',
    active: 'bg-blue-100 text-blue-700',
    returned: 'bg-emerald-100 text-emerald-700',
    overdue: 'bg-red-100 text-red-700',
    pending: 'bg-amber-100 text-amber-700',
    replenished: 'bg-emerald-100 text-emerald-700',
    routine: 'bg-blue-100 text-blue-700',
    repair: 'bg-amber-100 text-amber-700',
    replacement: 'bg-purple-100 text-purple-700',
    abnormal: 'bg-amber-100 text-amber-700',
    missing: 'bg-red-100 text-red-700'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-700';
};

export const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const daysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
};

export const isSameMonth = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
};

export const isDateOverdue = (dateStr: string, days: number): boolean => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return diff > days * 24 * 60 * 60 * 1000;
};
