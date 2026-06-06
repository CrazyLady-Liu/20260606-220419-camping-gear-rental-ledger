import { useState, useMemo } from 'react';
import { 
  Download, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Package,
  DollarSign,
  CalendarClock,
  Wrench,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useStore } from '../store/useStore';
import PageHeader from '../components/PageHeader';
import EquipmentSelector from '../components/EquipmentSelector';
import EquipmentOverview from '../components/EquipmentOverview';
import { 
  exportEquipments, 
  exportRentals, 
  exportMaintenance, 
  exportAccessories, 
  exportInventory 
} from '../utils/export';
import { formatCurrency, statusTextMap } from '../utils/format';

const Reports = () => {
  const { 
    equipments, 
    rentals, 
    accessories, 
    maintenance, 
    inventory,
    selectedEquipmentId,
    setSelectedEquipmentId,
    getRentalsByEquipmentId,
    getAccessoriesByEquipmentId,
    getMaintenanceByEquipmentId,
    getInventoryByEquipmentId,
    getEquipmentById
  } = useStore();
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [exportType, setExportType] = useState('equipment');

  const equipmentNames = useMemo(() => {
    const map: Record<string, string> = {};
    equipments.forEach(eq => {
      map[eq.id] = eq.name;
    });
    return map;
  }, [equipments]);

  const filteredEquipments = useMemo(() => {
    if (selectedEquipmentId) {
      const eq = getEquipmentById(selectedEquipmentId);
      return eq ? [eq] : [];
    }
    return equipments;
  }, [equipments, selectedEquipmentId, getEquipmentById]);

  const filteredRentals = useMemo(() => {
    return selectedEquipmentId 
      ? getRentalsByEquipmentId(selectedEquipmentId)
      : rentals;
  }, [rentals, selectedEquipmentId, getRentalsByEquipmentId]);

  const filteredAccessories = useMemo(() => {
    return selectedEquipmentId 
      ? getAccessoriesByEquipmentId(selectedEquipmentId)
      : accessories;
  }, [accessories, selectedEquipmentId, getAccessoriesByEquipmentId]);

  const filteredMaintenance = useMemo(() => {
    return selectedEquipmentId 
      ? getMaintenanceByEquipmentId(selectedEquipmentId)
      : maintenance;
  }, [maintenance, selectedEquipmentId, getMaintenanceByEquipmentId]);

  const filteredInventory = useMemo(() => {
    return selectedEquipmentId 
      ? getInventoryByEquipmentId(selectedEquipmentId)
      : inventory;
  }, [inventory, selectedEquipmentId, getInventoryByEquipmentId]);

  const topRentalEquipments = useMemo(() => {
    return [...filteredEquipments]
      .sort((a, b) => b.rentalCount - a.rentalCount)
      .slice(0, 5);
  }, [filteredEquipments]);

  const maintenanceByType = useMemo(() => {
    const result: Record<string, number> = {
      routine: 0,
      repair: 0,
      replacement: 0
    };
    filteredMaintenance.forEach(m => {
      result[m.type] = (result[m.type] || 0) + m.cost;
    });
    return result;
  }, [filteredMaintenance]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; total: number }> = {};
    filteredEquipments.forEach(eq => {
      if (!stats[eq.category]) {
        stats[eq.category] = { count: 0, total: 0 };
      }
      stats[eq.category].count += 1;
      stats[eq.category].total += eq.totalStock;
    });
    return stats;
  }, [filteredEquipments]);

  const totalMaintCost = filteredMaintenance.reduce((sum, m) => sum + m.cost, 0);
  const totalRentalDays = filteredRentals.reduce((sum, r) => sum + r.days, 0);
  const pendingAccessories = filteredAccessories.filter(a => a.status === 'pending').length;

  const showExportMessage = (type: 'success' | 'error' | 'warning', text: string) => {
    setExportMessage({ type, text });
    setTimeout(() => setExportMessage(null), 3000);
  };

  const handleExport = () => {
    let result;
    
    switch (exportType) {
      case 'equipment':
        result = exportEquipments(filteredEquipments);
        break;
      case 'rentals':
        result = exportRentals(filteredRentals, equipmentNames);
        break;
      case 'maintenance':
        result = exportMaintenance(filteredMaintenance, equipmentNames);
        break;
      case 'accessories':
        result = exportAccessories(filteredAccessories, equipmentNames);
        break;
      case 'inventory':
        result = exportInventory(filteredInventory, equipmentNames);
        break;
      default:
        result = { success: false, message: '未知的导出类型' };
    }

    if (result.success) {
      showExportMessage('success', result.message);
    } else {
      showExportMessage('warning', result.message);
    }
  };

  const isExportEmpty = () => {
    switch (exportType) {
      case 'equipment':
        return filteredEquipments.length === 0;
      case 'rentals':
        return filteredRentals.length === 0;
      case 'maintenance':
        return filteredMaintenance.length === 0;
      case 'accessories':
        return filteredAccessories.length === 0;
      case 'inventory':
        return filteredInventory.length === 0;
      default:
        return true;
    }
  };

  const maxRentalCount = Math.max(...topRentalEquipments.map(e => e.rentalCount), 1);

  const exportOptions = [
    { value: 'equipment', label: '装备清单', icon: Package, count: filteredEquipments.length },
    { value: 'rentals', label: '租赁记录', icon: CalendarClock, count: filteredRentals.length },
    { value: 'maintenance', label: '维护记录', icon: DollarSign, count: filteredMaintenance.length },
    { value: 'accessories', label: '损耗配件', icon: Wrench, count: filteredAccessories.length },
    { value: 'inventory', label: '盘点记录', icon: FileText, count: filteredInventory.length },
  ];

  return (
    <div>
      <PageHeader
        title="统计报表"
        description="数据统计分析与 CSV 导出"
      />

      {selectedEquipmentId && <EquipmentOverview />}

      <div className="card p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">装备筛选：</span>
            <EquipmentSelector className="min-w-48" />
          </div>
          {selectedEquipmentId && (
            <button
              onClick={() => setSelectedEquipmentId(null)}
              className="text-sm text-forest-600 hover:text-forest-700 hover:underline"
            >
              清除筛选，查看全部统计
            </button>
          )}
        </div>
      </div>

      {exportMessage && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          exportMessage.type === 'success' 
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
            : exportMessage.type === 'warning'
            ? 'bg-amber-50 border border-amber-200 text-amber-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {exportMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {exportMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-forest-600" />
              <h3 className="font-semibold text-gray-900">租赁次数排行</h3>
            </div>
            <div className="space-y-4">
              {topRentalEquipments.map((eq, index) => (
                <div key={eq.id} className="flex items-center gap-4">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-earth-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-amber-700 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{eq.name}</span>
                      <span className="text-sm text-gray-500">{eq.rentalCount} 次</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-forest-500 to-forest-600 rounded-full transition-all duration-500"
                        style={{ width: `${(eq.rentalCount / maxRentalCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-earth-600" />
              <h3 className="font-semibold text-gray-900">维护费用构成</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(maintenanceByType).map(([type, cost]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{statusTextMap[type] || type}</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(cost)}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">总计</span>
                  <span className="font-bold text-earth-600">{formatCurrency(totalMaintCost)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">关键指标</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">装备种类</span>
                <span className="text-lg font-bold text-gray-900">{filteredEquipments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">累计租赁天数</span>
                <span className="text-lg font-bold text-blue-600">{totalRentalDays} 天</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">待补充配件</span>
                <span className={`text-lg font-bold ${pendingAccessories > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {pendingAccessories} 件
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Package className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">装备分类统计</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.entries(categoryStats).map(([category, stats]) => (
            <div key={category} className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.count}</p>
              <p className="text-sm text-gray-500">{category}</p>
              <p className="text-xs text-gray-400 mt-1">共 {stats.total} 件</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Download className="w-5 h-5 text-forest-600" />
          <h3 className="font-semibold text-gray-900">数据导出</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {exportOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = exportType === option.value;
            const isEmpty = option.count === 0;
            
            return (
              <button
                key={option.value}
                onClick={() => setExportType(option.value)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected 
                    ? 'border-forest-500 bg-forest-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                } ${isEmpty ? 'opacity-60' : ''}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                  isSelected ? 'bg-forest-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className={`font-medium ${isSelected ? 'text-forest-700' : 'text-gray-900'}`}>
                  {option.label}
                </p>
                <p className={`text-sm mt-1 ${isEmpty ? 'text-red-500' : 'text-gray-500'}`}>
                  {option.count} 条
                  {isEmpty && ' (空)'}
                </p>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="font-medium text-gray-900">
              导出 {exportOptions.find(o => o.value === exportType)?.label}
            </p>
            <p className="text-sm text-gray-500">
              {isExportEmpty() 
                ? '当前数据为空，导出将生成空文件' 
                : `共 ${exportOptions.find(o => o.value === exportType)?.count} 条数据，点击按钮导出 CSV 文件`}
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={isExportEmpty()}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
              isExportEmpty()
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-forest-600 text-white hover:bg-forest-700 shadow-sm hover:shadow'
            }`}
          >
            <Download className="w-4 h-4" />
            导出 CSV
          </button>
        </div>

        {isExportEmpty() && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              提示：当前选择的导出数据为空，导出按钮已禁用。请先添加相关数据后再进行导出。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
