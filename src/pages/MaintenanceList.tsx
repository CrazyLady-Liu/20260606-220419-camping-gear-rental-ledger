import { useState, useMemo } from 'react';
import { Plus, Search, DollarSign, Wrench, TrendingUp, Trophy } from 'lucide-react';
import { useStore } from '../store/useStore';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import EquipmentSelector from '../components/EquipmentSelector';
import EquipmentOverview from '../components/EquipmentOverview';
import { formatDate, formatCurrency, statusTextMap } from '../utils/format';

const MaintenanceList = () => {
  const { 
    maintenance, 
    equipments, 
    addMaintenance,
    isMaintenanceOverdue,
    selectedEquipmentId,
    setSelectedEquipmentId,
    getMaintenanceByEquipmentId
  } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    equipmentId: '',
    type: 'routine' as 'routine' | 'repair' | 'replacement',
    cost: '',
    date: new Date().toISOString().split('T')[0],
    operator: '',
    description: ''
  });

  const equipmentMap = useMemo(() => {
    const map: Record<string, string> = {};
    equipments.forEach(eq => {
      map[eq.id] = eq.name;
    });
    return map;
  }, [equipments]);

  const filteredMaintenance = useMemo(() => {
    const sourceRecords = selectedEquipmentId
      ? getMaintenanceByEquipmentId(selectedEquipmentId)
      : maintenance;
    
    return sourceRecords.filter(record => {
      const eqName = equipmentMap[record.equipmentId] || '';
      const matchSearch = 
        record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eqName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.operator.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = !typeFilter || record.type === typeFilter;
      return matchSearch && matchType;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [maintenance, equipmentMap, searchTerm, typeFilter, selectedEquipmentId, getMaintenanceByEquipmentId]);

  const stats = useMemo(() => {
    const data = filteredMaintenance;
    const totalCost = data.reduce((sum, m) => sum + m.cost, 0);
    const routineCount = data.filter(m => m.type === 'routine').length;
    const repairCount = data.filter(m => m.type === 'repair').length;
    const replacementCount = data.filter(m => m.type === 'replacement').length;
    const avgCost = data.length > 0 ? totalCost / data.length : 0;
    const maxCost = data.length > 0 ? Math.max(...data.map(m => m.cost)) : 0;
    
    const thisMonthCount = data.filter(m => {
      const mDate = new Date(m.date);
      const now = new Date();
      return mDate.getMonth() === now.getMonth() && mDate.getFullYear() === now.getFullYear();
    }).length;
    
    return {
      total: data.length,
      totalCost,
      routine: routineCount,
      repair: repairCount,
      replacement: replacementCount,
      avgCost,
      thisMonth: thisMonthCount,
      maxCost
    };
  }, [filteredMaintenance]);

  const costByType = useMemo(() => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.equipmentId || !formData.cost) {
      return;
    }
    
    addMaintenance({
      equipmentId: formData.equipmentId,
      type: formData.type,
      cost: parseFloat(formData.cost),
      date: formData.date,
      operator: formData.operator,
      description: formData.description
    });
    
    setIsModalOpen(false);
    setFormData({
      equipmentId: '',
      type: 'routine',
      cost: '',
      date: new Date().toISOString().split('T')[0],
      operator: '',
      description: ''
    });
  };

  const typeColors: Record<string, string> = {
    routine: 'bg-blue-100 text-blue-700',
    repair: 'bg-amber-100 text-amber-700',
    replacement: 'bg-purple-100 text-purple-700'
  };

  const typeIcons: Record<string, typeof Wrench> = {
    routine: Wrench,
    repair: Wrench,
    replacement: DollarSign
  };

  return (
    <div>
      <PageHeader
        title="维护费用"
        description="维护记录管理与费用核算"
        actions={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            登记维护
          </button>
        }
      />

      {selectedEquipmentId && <EquipmentOverview />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">累计费用</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(stats.totalCost)}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">维护次数</p>
              <p className="text-xl font-bold text-blue-600">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-earth-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-earth-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">本月维护</p>
              <p className="text-xl font-bold text-earth-600">{stats.thisMonth} 次</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">单次均费</p>
              <p className="text-xl font-bold text-purple-600">
                {stats.total > 0 ? formatCurrency(stats.avgCost) : '¥0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">常规保养</span>
            <span className={`text-xs px-2 py-1 rounded-full ${typeColors.routine}`}>
              {statusTextMap.routine}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(costByType.routine)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{stats.routine} 次</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">维修费用</span>
            <span className={`text-xs px-2 py-1 rounded-full ${typeColors.repair}`}>
              {statusTextMap.repair}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(costByType.repair)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{stats.repair} 次</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">配件更换</span>
            <span className={`text-xs px-2 py-1 rounded-full ${typeColors.replacement}`}>
              {statusTextMap.replacement}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(costByType.replacement)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{stats.replacement} 次</p>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索装备、操作人或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <EquipmentSelector className="min-w-48" />
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="select-field min-w-32"
            >
              <option value="">全部类型</option>
              <option value="routine">常规保养</option>
              <option value="repair">维修</option>
              <option value="replacement">配件更换</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {filteredMaintenance.length === 0 ? (
          <EmptyState 
            title="暂无匹配记录" 
            description={
              searchTerm || typeFilter || selectedEquipmentId
                ? "当前筛选条件下没有找到维护记录，请尝试调整筛选条件"
                : "点击右上角按钮登记新的维护记录"
            }
            icon="search"
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredMaintenance.map((record) => {
              const TypeIcon = typeIcons[record.type] || Wrench;
              
              return (
                <div
                  key={record.id}
                  className="p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColors[record.type]}`}>
                        <TypeIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">
                            {equipmentMap[record.equipmentId] || record.equipmentId}
                          </h3>
                          <StatusBadge status={record.type} />
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{record.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>操作人：{record.operator || '-'}</span>
                          <span>日期：{formatDate(record.date)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xl font-bold text-earth-600">
                        {formatCurrency(record.cost)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        共 {filteredMaintenance.length} 条记录
        {filteredMaintenance.length > 0 && (
          <span className="ml-4">
            合计费用：
            <span className="font-medium text-earth-600">
              {formatCurrency(stats.totalCost)}
            </span>
          </span>
        )}
        {selectedEquipmentId && (
          <span className="ml-4">
            （已筛选装备，
            <button 
              onClick={() => setSelectedEquipmentId(null)}
              className="text-forest-600 hover:underline"
            >
              清除筛选
            </button>
            ）
          </span>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="登记维护记录"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              选择装备 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.equipmentId}
              onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
              className="select-field"
              required
            >
              <option value="">请选择装备</option>
              {equipments.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.name}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                维护类型
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'routine' | 'repair' | 'replacement' })}
                className="select-field"
              >
                <option value="routine">常规保养</option>
                <option value="repair">维修</option>
                <option value="replacement">配件更换</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                费用 (元) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="input-field"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                维护日期
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                操作人
              </label>
              <input
                type="text"
                value={formData.operator}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                className="input-field"
                placeholder="请输入操作人姓名"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              维护描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field min-h-20"
              placeholder="描述维护内容和详情"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              确认登记
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaintenanceList;
