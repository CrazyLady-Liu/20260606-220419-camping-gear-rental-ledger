import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  CalendarClock, 
  Wrench, 
  DollarSign, 
  ClipboardList,
  AlertTriangle,
  X,
  Eye
} from 'lucide-react';
import { useStore } from '../store/useStore';
import StatusBadge from './StatusBadge';
import { formatCurrency } from '../utils/format';

interface EquipmentOverviewProps {
  showCloseButton?: boolean;
}

const EquipmentOverview = ({ showCloseButton = true }: EquipmentOverviewProps) => {
  const navigate = useNavigate();
  const {
    selectedEquipmentId,
    setSelectedEquipmentId,
    getEquipmentById,
    getRentalsByEquipmentId,
    getAccessoriesByEquipmentId,
    getMaintenanceByEquipmentId,
    getInventoryByEquipmentId,
    hasMissingAccessories,
    isMaintenanceOverdue
  } = useStore();

  const equipment = selectedEquipmentId ? getEquipmentById(selectedEquipmentId) : null;
  
  if (!equipment) return null;

  const rentals = getRentalsByEquipmentId(equipment.id);
  const accessories = getAccessoriesByEquipmentId(equipment.id);
  const maintenanceRecords = getMaintenanceByEquipmentId(equipment.id);
  const inventoryRecords = getInventoryByEquipmentId(equipment.id);

  const missingAcc = hasMissingAccessories(equipment.id);
  const maintOverdue = isMaintenanceOverdue(equipment.id);
  const outOfStock = equipment.availableStock === 0;

  const activeRentals = rentals.filter(r => r.status === 'active').length;
  const pendingAccessories = accessories.filter(a => a.status === 'pending').length;
  const totalMaintCost = maintenanceRecords.reduce((sum, m) => sum + m.cost, 0);

  const stats = [
    { 
      label: '租赁次数', 
      value: equipment.rentalCount, 
      icon: CalendarClock, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      label: '在租数量', 
      value: activeRentals, 
      icon: CalendarClock, 
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    { 
      label: '待补配件', 
      value: pendingAccessories, 
      icon: Wrench, 
      color: pendingAccessories > 0 ? 'text-red-600' : 'text-gray-600',
      bgColor: pendingAccessories > 0 ? 'bg-red-50' : 'bg-gray-50'
    },
    { 
      label: '累计维护费', 
      value: `¥${totalMaintCost.toFixed(0)}`, 
      icon: DollarSign, 
      color: 'text-earth-600',
      bgColor: 'bg-earth-50'
    },
  ];

  return (
    <div className="card p-5 mb-6 bg-gradient-to-r from-forest-50 to-cream-50 border-forest-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-xl shadow-sm overflow-hidden flex-shrink-0">
            <img
              src={equipment.imageUrl}
              alt={equipment.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-gray-900">{equipment.name}</h3>
              <StatusBadge status={equipment.status} />
            </div>
            <p className="text-sm text-gray-500 mt-1">{equipment.category}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm">
                <span className="text-gray-500">库存：</span>
                <span className={`font-medium ${outOfStock ? 'text-red-600' : 'text-gray-900'}`}>
                  {equipment.availableStock} / {equipment.totalStock}
                </span>
              </span>
              {missingAcc && (
                <span className="flex items-center gap-1 text-xs text-red-600">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  配件缺失
                </span>
              )}
              {maintOverdue && (
                <span className="flex items-center gap-1 text-xs text-earth-600">
                  <Wrench className="w-3.5 h-3.5" />
                  维护超期
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/equipment/${equipment.id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-forest-600 hover:bg-white/60 rounded-md transition-colors"
          >
            <Eye className="w-4 h-4" />
            查看详情
          </button>
          {showCloseButton && (
            <button
              onClick={() => setSelectedEquipmentId(null)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/60 rounded-md transition-colors"
              title="清除筛选"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-lg p-3 hover:bg-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-forest-100/60">
        <ClipboardList className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-500">
          盘点记录：{inventoryRecords.length} 次
          {inventoryRecords.length > 0 && `，最近 ${inventoryRecords[inventoryRecords.length - 1]?.checkDate || ''}`}
        </span>
      </div>
    </div>
  );
};

export default EquipmentOverview;
