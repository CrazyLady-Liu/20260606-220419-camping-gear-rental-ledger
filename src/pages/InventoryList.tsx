import { useState, useMemo } from 'react';
import { Plus, Search, Filter, ClipboardList, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { formatDate, statusTextMap, isSameMonth } from '../utils/format';

const InventoryList = () => {
  const { 
    inventory, 
    equipments, 
    addInventory,
    hasDuplicateInventoryThisMonth,
    selectedEquipmentId,
    setSelectedEquipmentId
  } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState(selectedEquipmentId || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [pendingData, setPendingData] = useState<{
    equipmentId: string;
    checkDate: string;
    expectedCount: number;
    actualCount: number;
    status: 'normal' | 'abnormal' | 'missing';
    checker: string;
    notes: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    equipmentId: '',
    checkDate: new Date().toISOString().split('T')[0],
    expectedCount: '',
    actualCount: '',
    checker: '',
    notes: ''
  });

  const equipmentMap = useMemo(() => {
    const map: Record<string, string> = {};
    equipments.forEach(eq => {
      map[eq.id] = eq.name;
    });
    return map;
  }, [equipments]);

  const getEquipmentStock = (equipmentId: string) => {
    const eq = equipments.find(e => e.id === equipmentId);
    return eq ? eq.totalStock : 0;
  };

  const filteredInventory = useMemo(() => {
    return inventory.filter(record => {
      const eqName = equipmentMap[record.equipmentId] || '';
      const matchSearch = 
        eqName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.checker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.notes.toLowerCase().includes(searchTerm.toLowerCase());
      const matchEquipment = !equipmentFilter || record.equipmentId === equipmentFilter;
      const matchStatus = !statusFilter || record.status === statusFilter;
      return matchSearch && matchEquipment && matchStatus;
    }).sort((a, b) => new Date(b.checkDate).getTime() - new Date(a.checkDate).getTime());
  }, [inventory, equipmentMap, searchTerm, equipmentFilter, statusFilter]);

  const normalCount = inventory.filter(i => i.status === 'normal').length;
  const abnormalCount = inventory.filter(i => i.status === 'abnormal').length;
  const missingCount = inventory.filter(i => i.status === 'missing').length;

  const handleEquipmentChange = (equipmentId: string) => {
    const stock = getEquipmentStock(equipmentId);
    setFormData({
      ...formData,
      equipmentId,
      expectedCount: stock ? String(stock) : ''
    });
  };

  const determineStatus = (expected: number, actual: number): 'normal' | 'abnormal' | 'missing' => {
    if (actual === expected) return 'normal';
    if (actual === 0) return 'missing';
    return 'abnormal';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.equipmentId || !formData.expectedCount || !formData.actualCount) {
      return;
    }

    const expectedCount = parseInt(formData.expectedCount);
    const actualCount = parseInt(formData.actualCount);
    const status = determineStatus(expectedCount, actualCount);

    const data = {
      equipmentId: formData.equipmentId,
      checkDate: formData.checkDate,
      expectedCount,
      actualCount,
      status,
      checker: formData.checker,
      notes: formData.notes
    };

    if (hasDuplicateInventoryThisMonth(formData.equipmentId, formData.checkDate)) {
      setPendingData(data);
      setShowWarning(true);
    } else {
      submitInventory(data);
    }
  };

  const submitInventory = (data: typeof pendingData) => {
    if (!data) return;
    
    addInventory(data);
    
    setIsModalOpen(false);
    setShowWarning(false);
    setPendingData(null);
    setFormData({
      equipmentId: '',
      checkDate: new Date().toISOString().split('T')[0],
      expectedCount: '',
      actualCount: '',
      checker: '',
      notes: ''
    });
  };

  const handleConfirmSubmit = () => {
    if (pendingData) {
      submitInventory(pendingData);
    }
  };

  const handleCancelWarning = () => {
    setShowWarning(false);
    setPendingData(null);
  };

  const statusIcons: Record<string, typeof CheckCircle> = {
    normal: CheckCircle,
    abnormal: AlertTriangle,
    missing: XCircle
  };

  const statusColors: Record<string, string> = {
    normal: 'bg-emerald-50 border-emerald-200',
    abnormal: 'bg-amber-50 border-amber-200',
    missing: 'bg-red-50 border-red-200'
  };

  return (
    <div>
      <PageHeader
        title="盘点记录"
        description="收纳盘点登记与状态追踪"
        actions={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新增盘点
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">盘点正常</p>
              <p className="text-2xl font-bold text-emerald-600">{normalCount}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">盘点异常</p>
              <p className="text-2xl font-bold text-amber-600">{abnormalCount}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">物品缺失</p>
              <p className="text-2xl font-bold text-red-600">{missingCount}</p>
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
                placeholder="搜索装备、盘点人或备注..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={equipmentFilter}
                onChange={(e) => {
                  setEquipmentFilter(e.target.value);
                  setSelectedEquipmentId(e.target.value || null);
                }}
                className="select-field min-w-40"
              >
                <option value="">全部装备</option>
                {equipments.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.name}</option>
                ))}
              </select>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-field min-w-32"
            >
              <option value="">全部状态</option>
              <option value="normal">正常</option>
              <option value="abnormal">异常</option>
              <option value="missing">缺失</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {filteredInventory.length === 0 ? (
          <EmptyState 
            title="暂无盘点记录" 
            description="点击右上角按钮新增盘点记录"
            icon="inbox"
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredInventory.map((record) => {
              const StatusIcon = statusIcons[record.status] || ClipboardList;
              const diff = record.actualCount - record.expectedCount;
              
              return (
                <div
                  key={record.id}
                  className={`p-5 transition-colors ${statusColors[record.status]} border-l-4`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                        <StatusIcon className={`w-6 h-6 ${
                          record.status === 'normal' ? 'text-emerald-600' :
                          record.status === 'abnormal' ? 'text-amber-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">
                            {equipmentMap[record.equipmentId] || record.equipmentId}
                          </h3>
                          <StatusBadge status={record.status} />
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>盘点日期：{formatDate(record.checkDate)}</span>
                          <span>盘点人：{record.checker || '-'}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm">
                            <span className="text-gray-500">账面：</span>
                            <span className="font-medium text-gray-900">{record.expectedCount}</span>
                          </span>
                          <span className="text-sm">
                            <span className="text-gray-500">实盘：</span>
                            <span className={`font-medium ${
                              record.actualCount === record.expectedCount 
                                ? 'text-emerald-600' 
                                : 'text-red-600'
                            }`}>
                              {record.actualCount}
                            </span>
                          </span>
                          {diff !== 0 && (
                            <span className={`text-sm font-medium ${
                              diff > 0 ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                              ({diff > 0 ? '+' : ''}{diff})
                            </span>
                          )}
                        </div>
                        {record.notes && (
                          <p className="text-sm text-gray-500 mt-2">备注：{record.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        共 {filteredInventory.length} 条记录
      </div>

      <Modal
        isOpen={isModalOpen && !showWarning}
        onClose={() => setIsModalOpen(false)}
        title="新增盘点记录"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              选择装备 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.equipmentId}
              onChange={(e) => handleEquipmentChange(e.target.value)}
              className="select-field"
              required
            >
              <option value="">请选择装备</option>
              {equipments.map(eq => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} (库存: {eq.totalStock})
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                盘点日期
              </label>
              <input
                type="date"
                value={formData.checkDate}
                onChange={(e) => setFormData({ ...formData, checkDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                盘点人
              </label>
              <input
                type="text"
                value={formData.checker}
                onChange={(e) => setFormData({ ...formData, checker: e.target.value })}
                className="input-field"
                placeholder="请输入盘点人姓名"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                账面数量 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.expectedCount}
                onChange={(e) => setFormData({ ...formData, expectedCount: e.target.value })}
                className="input-field"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                实盘数量 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.actualCount}
                onChange={(e) => setFormData({ ...formData, actualCount: e.target.value })}
                className="input-field"
                min="0"
                required
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
              placeholder="盘点备注说明"
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

      <Modal
        isOpen={showWarning}
        onClose={handleCancelWarning}
        title="重复盘点提醒"
        size="md"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">本月已有盘点记录</h3>
          <p className="text-gray-500 mb-6">
            该装备本月已经进行过盘点，确定要再次盘点吗？
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleCancelWarning}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              onClick={handleConfirmSubmit}
              className="btn-primary"
            >
              确认提交
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InventoryList;
