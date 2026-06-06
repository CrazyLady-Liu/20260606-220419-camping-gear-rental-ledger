import { useState, useMemo } from 'react';
import { Plus, Search, Wrench, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { useStore } from '../store/useStore';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import EquipmentSelector from '../components/EquipmentSelector';
import EquipmentOverview from '../components/EquipmentOverview';
import { formatDate, statusTextMap } from '../utils/format';

const AccessoryList = () => {
  const { 
    accessories, 
    equipments, 
    addAccessory, 
    updateAccessoryStatus,
    selectedEquipmentId,
    setSelectedEquipmentId,
    getAccessoriesByEquipmentId
  } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    equipmentId: '',
    name: '',
    type: 'missing' as 'missing' | 'damaged' | 'replaced',
    reportedDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const equipmentMap = useMemo(() => {
    const map: Record<string, string> = {};
    equipments.forEach(eq => {
      map[eq.id] = eq.name;
    });
    return map;
  }, [equipments]);

  const filteredAccessories = useMemo(() => {
    const sourceAccessories = selectedEquipmentId
      ? getAccessoriesByEquipmentId(selectedEquipmentId)
      : accessories;
    
    return sourceAccessories.filter(acc => {
      const eqName = equipmentMap[acc.equipmentId] || '';
      const matchSearch = 
        acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eqName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.notes.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = !statusFilter || acc.status === statusFilter;
      const matchType = !typeFilter || acc.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    }).sort((a, b) => new Date(b.reportedDate).getTime() - new Date(a.reportedDate).getTime());
  }, [accessories, equipmentMap, searchTerm, statusFilter, typeFilter, selectedEquipmentId, getAccessoriesByEquipmentId]);

  const stats = useMemo(() => {
    const data = filteredAccessories;
    const pendingCount = data.filter(a => a.status === 'pending').length;
    const replenishedCount = data.filter(a => a.status === 'replenished').length;
    const missingCount = data.filter(a => a.type === 'missing').length;
    const damagedCount = data.filter(a => a.type === 'damaged').length;
    
    return {
      total: data.length,
      pending: pendingCount,
      replenished: replenishedCount,
      missing: missingCount,
      damaged: damagedCount
    };
  }, [filteredAccessories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.equipmentId || !formData.name) {
      return;
    }
    
    addAccessory({
      equipmentId: formData.equipmentId,
      name: formData.name,
      type: formData.type,
      status: 'pending',
      reportedDate: formData.reportedDate,
      notes: formData.notes
    });
    
    setIsModalOpen(false);
    setFormData({
      equipmentId: '',
      name: '',
      type: 'missing',
      reportedDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handleReplenish = (id: string) => {
    updateAccessoryStatus(id, 'replenished', new Date().toISOString().split('T')[0]);
  };

  const typeColors: Record<string, string> = {
    missing: 'bg-red-50 text-red-700 border-red-200',
    damaged: 'bg-amber-50 text-amber-700 border-amber-200',
    replaced: 'bg-purple-50 text-purple-700 border-purple-200'
  };

  const typeIcons: Record<string, typeof Wrench> = {
    missing: AlertTriangle,
    damaged: Wrench,
    replaced: CheckCircle
  };

  return (
    <div>
      <PageHeader
        title="损耗配件"
        description="配件缺失、损坏登记与补充管理"
        actions={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            登记损耗
          </button>
        }
      />

      {selectedEquipmentId && <EquipmentOverview />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">配件总数</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">待补充</p>
              <p className="text-xl font-bold text-red-600">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">已补充</p>
              <p className="text-xl font-bold text-emerald-600">{stats.replenished}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">损坏/缺失</p>
              <p className="text-xl font-bold text-amber-600">{stats.damaged + stats.missing}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索配件名称、装备或备注..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <EquipmentSelector className="min-w-48" />
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="select-field min-w-32"
            >
              <option value="">全部类型</option>
              <option value="missing">缺失</option>
              <option value="damaged">损坏</option>
              <option value="replaced">已更换</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-field min-w-32"
            >
              <option value="">全部状态</option>
              <option value="pending">待补充</option>
              <option value="replenished">已补充</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {filteredAccessories.length === 0 ? (
          <EmptyState 
            title="暂无配件记录" 
            description={selectedEquipmentId ? "该装备暂无配件损耗记录" : "点击右上角按钮登记新的配件损耗"}
            icon="inbox"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filteredAccessories.map((acc) => {
              const TypeIcon = typeIcons[acc.type] || Wrench;
              const isPending = acc.status === 'pending';
              
              return (
                <div
                  key={acc.id}
                  className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                    isPending 
                      ? 'border-red-200 bg-red-50/30' 
                      : 'border-gray-100 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[acc.type]}`}>
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{acc.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[acc.type]}`}>
                          {statusTextMap[acc.type]}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={acc.status} />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">所属装备</span>
                      <span className="text-gray-700 font-medium">
                        {equipmentMap[acc.equipmentId] || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">登记日期</span>
                      <span className="text-gray-700">{formatDate(acc.reportedDate)}</span>
                    </div>
                    {acc.replenishDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">补充日期</span>
                        <span className="text-emerald-600">{formatDate(acc.replenishDate)}</span>
                      </div>
                    )}
                  </div>
                  
                  {acc.notes && (
                    <p className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100">
                      {acc.notes}
                    </p>
                  )}
                  
                  {isPending && (
                    <button
                      onClick={() => handleReplenish(acc.id)}
                      className="w-full mt-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                      标记为已补充
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        共 {filteredAccessories.length} 条记录
        {selectedEquipmentId && (
          <span className="ml-2">
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
        title="登记配件损耗"
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              配件名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="例如：地钉、风绳、收纳袋等"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                损耗类型
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'missing' | 'damaged' | 'replaced' })}
                className="select-field"
              >
                <option value="missing">缺失</option>
                <option value="damaged">损坏</option>
                <option value="replaced">已更换</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                登记日期
              </label>
              <input
                type="date"
                value={formData.reportedDate}
                onChange={(e) => setFormData({ ...formData, reportedDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field min-h-20"
              placeholder="补充说明信息"
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

export default AccessoryList;
