import { useState, useMemo } from 'react';
import { Plus, Search, CalendarClock, User, ArrowRight, TrendingUp, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import EquipmentSelector from '../components/EquipmentSelector';
import EquipmentOverview from '../components/EquipmentOverview';
import { formatDate, daysBetween } from '../utils/format';

const RentalList = () => {
  const { 
    rentals, 
    equipments, 
    addRental, 
    updateRentalStatus,
    selectedEquipmentId,
    setSelectedEquipmentId,
    getRentalsByEquipmentId
  } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    equipmentId: '',
    renterName: '',
    startDate: '',
    endDate: '',
    purpose: '',
    notes: ''
  });

  const openModal = () => {
    setFormData({
      equipmentId: selectedEquipmentId || '',
      renterName: '',
      startDate: '',
      endDate: '',
      purpose: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const equipmentMap = useMemo(() => {
    const map: Record<string, string> = {};
    equipments.forEach(eq => {
      map[eq.id] = eq.name;
    });
    return map;
  }, [equipments]);

  const availableEquipments = useMemo(() => {
    return equipments.filter(eq => eq.availableStock > 0);
  }, [equipments]);

  const filteredRentals = useMemo(() => {
    const sourceRentals = selectedEquipmentId 
      ? getRentalsByEquipmentId(selectedEquipmentId)
      : rentals;
    
    return sourceRentals.filter(rental => {
      const eqName = equipmentMap[rental.equipmentId] || '';
      const matchSearch = 
        rental.renterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eqName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.purpose.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = !statusFilter || rental.status === statusFilter;
      return matchSearch && matchStatus;
    }).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [rentals, equipmentMap, searchTerm, statusFilter, selectedEquipmentId, getRentalsByEquipmentId]);

  const stats = useMemo(() => {
    const data = filteredRentals;
    const activeCount = data.filter(r => r.status === 'active').length;
    const returnedCount = data.filter(r => r.status === 'returned').length;
    const overdueCount = data.filter(r => r.status === 'overdue').length;
    const totalDays = data.reduce((sum, r) => sum + r.days, 0);
    const avgDays = data.length > 0 ? (totalDays / data.length).toFixed(1) : '0';
    
    return {
      total: data.length,
      active: activeCount,
      returned: returnedCount,
      overdue: overdueCount,
      totalDays,
      avgDays
    };
  }, [filteredRentals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.equipmentId || !formData.renterName || !formData.startDate || !formData.endDate) {
      return;
    }
    
    const days = daysBetween(formData.startDate, formData.endDate);
    
    addRental({
      equipmentId: formData.equipmentId,
      renterName: formData.renterName,
      startDate: formData.startDate,
      endDate: formData.endDate,
      days,
      purpose: formData.purpose,
      status: 'active',
      notes: formData.notes
    });
    
    setIsModalOpen(false);
    setFormData({
      equipmentId: '',
      renterName: '',
      startDate: '',
      endDate: '',
      purpose: '',
      notes: ''
    });
  };

  const handleReturn = (id: string) => {
    updateRentalStatus(id, 'returned');
  };

  return (
    <div>
      <PageHeader
        title="租赁记录"
        description="外出使用次数统计与租赁管理"
        actions={
          <button 
            onClick={openModal}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新增租赁
          </button>
        }
      />

      {selectedEquipmentId && <EquipmentOverview />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <CalendarClock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">总记录数</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">租赁中</p>
              <p className="text-xl font-bold text-emerald-600">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">累计天数</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalDays}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">已逾期</p>
              <p className="text-xl font-bold text-red-600">{stats.overdue}</p>
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
                placeholder="搜索租用人、装备或用途..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <EquipmentSelector className="min-w-48" />
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-field min-w-32"
            >
              <option value="">全部状态</option>
              <option value="active">租赁中</option>
              <option value="returned">已归还</option>
              <option value="overdue">已逾期</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {filteredRentals.length === 0 ? (
          <EmptyState 
            title="暂无匹配记录" 
            description={
              searchTerm || statusFilter || selectedEquipmentId
                ? "当前筛选条件下没有找到记录，请尝试调整筛选条件"
                : "点击右上角按钮添加新的租赁记录"
            }
            icon="search"
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredRentals.map((rental) => (
              <div
                key={rental.id}
                className="p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CalendarClock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">
                          {equipmentMap[rental.equipmentId] || rental.equipmentId}
                        </h3>
                        <StatusBadge status={rental.status} />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{rental.renterName}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-sm text-gray-500">{rental.purpose}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <span>{formatDate(rental.startDate)}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span>{formatDate(rental.endDate)}</span>
                        <span className="text-gray-400">({rental.days}天)</span>
                      </div>
                      {rental.notes && (
                        <p className="text-sm text-gray-400 mt-2">备注：{rental.notes}</p>
                      )}
                    </div>
                  </div>
                  
                  {rental.status === 'active' && (
                    <button
                      onClick={() => handleReturn(rental.id)}
                      className="px-4 py-2 text-sm font-medium text-forest-600 bg-forest-50 hover:bg-forest-100 rounded-lg transition-colors"
                    >
                      确认归还
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        共 {filteredRentals.length} 条记录
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
        title="新增租赁记录"
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
              {availableEquipments.map(eq => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} (可用: {eq.availableStock})
                </option>
              ))}
            </select>
            {availableEquipments.length === 0 && (
              <p className="text-sm text-red-500 mt-1">当前没有可用库存的装备</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              租用人 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.renterName}
              onChange={(e) => setFormData({ ...formData, renterName: e.target.value })}
              className="input-field"
              placeholder="请输入租用人姓名"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                开始日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                结束日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              使用用途
            </label>
            <input
              type="text"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="input-field"
              placeholder="例如：周末徒步露营"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field min-h-24"
              placeholder="其他需要记录的信息"
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
              disabled={availableEquipments.length === 0}
            >
              确认登记
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RentalList;
