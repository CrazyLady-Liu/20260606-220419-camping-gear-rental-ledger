import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CalendarClock, 
  Wrench, 
  DollarSign, 
  ClipboardList,
  AlertTriangle,
  Package,
  Clock,
  User
} from 'lucide-react';
import { useStore } from '../store/useStore';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { formatDate, formatCurrency, statusTextMap } from '../utils/format';

type TabType = 'rentals' | 'accessories' | 'maintenance' | 'inventory';

const EquipmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('rentals');
  
  const {
    getEquipmentById,
    getRentalsByEquipmentId,
    getAccessoriesByEquipmentId,
    getMaintenanceByEquipmentId,
    getInventoryByEquipmentId,
    isMaintenanceOverdue,
    hasMissingAccessories
  } = useStore();

  const equipment = id ? getEquipmentById(id) : undefined;
  const rentals = id ? getRentalsByEquipmentId(id) : [];
  const accessories = id ? getAccessoriesByEquipmentId(id) : [];
  const maintenanceRecords = id ? getMaintenanceByEquipmentId(id) : [];
  const inventoryRecords = id ? getInventoryByEquipmentId(id) : [];

  if (!equipment) {
    return (
      <div className="py-12">
        <EmptyState 
          title="装备不存在"
          description="未找到对应的装备信息，请返回装备列表查看"
          action={
            <button onClick={() => navigate('/equipment')} className="btn-primary">
              返回装备列表
            </button>
          }
        />
      </div>
    );
  }

  const maintOverdue = isMaintenanceOverdue(equipment.id);
  const missingAcc = hasMissingAccessories(equipment.id);
  const outOfStock = equipment.availableStock === 0;

  const tabs = [
    { id: 'rentals' as TabType, label: '租赁记录', icon: CalendarClock, count: rentals.length },
    { id: 'accessories' as TabType, label: '损耗配件', icon: Wrench, count: accessories.length },
    { id: 'maintenance' as TabType, label: '维护费用', icon: DollarSign, count: maintenanceRecords.length },
    { id: 'inventory' as TabType, label: '盘点记录', icon: ClipboardList, count: inventoryRecords.length },
  ];

  const totalMaintCost = maintenanceRecords.reduce((sum, m) => sum + m.cost, 0);

  return (
    <div>
      <button
        onClick={() => navigate('/equipment')}
        className="flex items-center gap-2 text-gray-600 hover:text-forest-600 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回装备列表
      </button>

      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-48 h-48 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
            <img
              src={equipment.imageUrl}
              alt={equipment.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{equipment.name}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <StatusBadge status={equipment.status} />
                  <span className="text-sm text-gray-500">{equipment.category}</span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mt-4">{equipment.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">可用库存</p>
                <p className={`text-xl font-bold ${outOfStock ? 'text-red-600' : 'text-gray-900'}`}>
                  {equipment.availableStock}
                  <span className="text-sm font-normal text-gray-500"> / {equipment.totalStock}</span>
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">累计租赁</p>
                <p className="text-xl font-bold text-gray-900">{equipment.rentalCount} 次</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">采购价格</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(equipment.purchasePrice)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">累计维护费</p>
                <p className="text-xl font-bold text-earth-600">{formatCurrency(totalMaintCost)}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              {missingAcc && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-700">有配件缺失待补充</span>
                </div>
              )}
              {maintOverdue && (
                <div className="flex items-center gap-2 px-3 py-2 bg-earth-50 border border-earth-200 rounded-lg">
                  <Wrench className="w-4 h-4 text-earth-600" />
                  <span className="text-sm text-earth-700">维护已超期</span>
                </div>
              )}
              {outOfStock && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">当前无库存</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100">
              <div>
                <p className="text-sm text-gray-500">采购日期</p>
                <p className="text-gray-900 mt-0.5">{formatDate(equipment.purchaseDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">维护周期</p>
                <p className="text-gray-900 mt-0.5">{equipment.maintenanceCycle} 天</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">上次维护</p>
                <p className="text-gray-900 mt-0.5">{formatDate(equipment.lastMaintenanceDate)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors
                    ${isActive 
                      ? 'border-forest-600 text-forest-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-forest-100 text-forest-700' : 'bg-gray-100 text-gray-600'}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'rentals' && (
            <div>
              {rentals.length === 0 ? (
                <EmptyState title="暂无租赁记录" description="该装备还没有租赁记录" />
              ) : (
                <div className="space-y-3">
                  {rentals.map((rental) => (
                    <div
                      key={rental.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{rental.renterName}</p>
                          <p className="text-sm text-gray-500">{rental.purpose}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">租赁时间</p>
                          <p className="text-gray-900">
                            {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                          </p>
                          <p className="text-sm text-gray-500">共 {rental.days} 天</p>
                        </div>
                        <StatusBadge status={rental.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'accessories' && (
            <div>
              {accessories.length === 0 ? (
                <EmptyState title="暂无配件记录" description="该装备还没有配件损耗记录" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accessories.map((acc) => (
                    <div
                      key={acc.id}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        acc.status === 'pending' 
                          ? 'border-red-200 bg-red-50/50' 
                          : 'border-gray-100 bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{acc.name}</h4>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {statusTextMap[acc.type] || acc.type}
                          </p>
                        </div>
                        <StatusBadge status={acc.status} />
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200/50">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">登记日期</span>
                          <span className="text-gray-700">{formatDate(acc.reportedDate)}</span>
                        </div>
                        {acc.replenishDate && (
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-500">补充日期</span>
                            <span className="text-gray-700">{formatDate(acc.replenishDate)}</span>
                          </div>
                        )}
                      </div>
                      {acc.notes && (
                        <p className="text-sm text-gray-500 mt-2">{acc.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div>
              {maintenanceRecords.length === 0 ? (
                <EmptyState title="暂无维护记录" description="该装备还没有维护记录" />
              ) : (
                <div className="space-y-3">
                  {maintenanceRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {statusTextMap[record.type] || record.type}
                          </p>
                          <p className="text-sm text-gray-500">{record.description}</p>
                          <p className="text-xs text-gray-400 mt-1">操作人：{record.operator}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-earth-600">
                          {formatCurrency(record.cost)}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(record.date)}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-4 bg-forest-50 rounded-lg mt-4">
                    <span className="font-medium text-gray-900">累计维护费用</span>
                    <span className="text-xl font-bold text-forest-600">
                      {formatCurrency(totalMaintCost)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'inventory' && (
            <div>
              {inventoryRecords.length === 0 ? (
                <EmptyState title="暂无盘点记录" description="该装备还没有盘点记录" />
              ) : (
                <div className="space-y-3">
                  {inventoryRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <ClipboardList className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            盘点 - {formatDate(record.checkDate)}
                          </p>
                          <p className="text-sm text-gray-500">盘点人：{record.checker}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">账面 / 实盘</p>
                          <p className={`font-medium ${record.expectedCount !== record.actualCount ? 'text-red-600' : 'text-gray-900'}`}>
                            {record.expectedCount} / {record.actualCount}
                          </p>
                        </div>
                        <StatusBadge status={record.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetail;
