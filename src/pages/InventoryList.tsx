import { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  ClipboardList, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Package,
  Wrench,
  ChevronDown,
  ChevronUp,
  Trash2,
  Settings,
  Link2
} from 'lucide-react';
import { useStore } from '../store/useStore';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import EquipmentSelector from '../components/EquipmentSelector';
import EquipmentOverview from '../components/EquipmentOverview';
import { formatDate, statusTextMap, isSameMonth } from '../utils/format';

interface AccessoryFormItem {
  name: string;
  type: 'missing' | 'damaged';
  notes: string;
}

interface MaintenanceFormData {
  enabled: boolean;
  type: 'routine' | 'repair' | 'replacement';
  description: string;
  cost: string;
  operator: string;
}

const InventoryList = () => {
  const { 
    inventory, 
    equipments, 
    addInventory,
    performInventoryCheck,
    hasDuplicateInventoryThisMonth,
    selectedEquipmentId,
    setSelectedEquipmentId,
    getInventoryByEquipmentId,
    getAccessoriesByInventoryId,
    getMaintenanceByInventoryId
  } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingData, setPendingData] = useState<{
    equipmentId: string;
    checkDate: string;
    expectedCount: number;
    actualCount: number;
    status: 'normal' | 'abnormal' | 'missing';
    checker: string;
    notes: string;
    updateStock: boolean;
    accessories: AccessoryFormItem[];
    maintenance: MaintenanceFormData;
  } | null>(null);

  const getDefaultFormData = () => {
    const selectedEq = selectedEquipmentId 
      ? equipments.find(e => e.id === selectedEquipmentId)
      : null;
    
    return {
      equipmentId: selectedEquipmentId || '',
      checkDate: new Date().toISOString().split('T')[0],
      expectedCount: selectedEq ? String(selectedEq.totalStock) : '',
      actualCount: '',
      checker: '',
      notes: '',
      updateStock: false,
      accessories: [] as AccessoryFormItem[],
      maintenance: {
        enabled: false,
        type: 'routine' as const,
        description: '',
        cost: '',
        operator: ''
      }
    };
  };
  
  const [formData, setFormData] = useState(getDefaultFormData());

  const openModal = () => {
    setFormData(getDefaultFormData());
    setIsModalOpen(true);
  };

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
    const sourceInventory = selectedEquipmentId 
      ? getInventoryByEquipmentId(selectedEquipmentId)
      : inventory;
    
    return sourceInventory.filter(record => {
      const eqName = equipmentMap[record.equipmentId] || '';
      const matchSearch = 
        eqName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.checker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.notes.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = !statusFilter || record.status === statusFilter;
      return matchSearch && matchStatus;
    }).sort((a, b) => new Date(b.checkDate).getTime() - new Date(a.checkDate).getTime());
  }, [inventory, equipmentMap, searchTerm, statusFilter, selectedEquipmentId, getInventoryByEquipmentId]);

  const stats = useMemo(() => {
    const data = filteredInventory;
    const normalCount = data.filter(i => i.status === 'normal').length;
    const abnormalCount = data.filter(i => i.status === 'abnormal').length;
    const missingCount = data.filter(i => i.status === 'missing').length;
    const totalCount = data.length;
    const normalRate = totalCount > 0 ? ((normalCount / totalCount) * 100).toFixed(1) : '0';
    
    const withAccessories = data.filter(i => i.generatedAccessoryIds && i.generatedAccessoryIds.length > 0).length;
    const withMaintenance = data.filter(i => i.generatedMaintenanceIds && i.generatedMaintenanceIds.length > 0).length;
    
    return {
      total: totalCount,
      normal: normalCount,
      abnormal: abnormalCount,
      missing: missingCount,
      normalRate,
      withAccessories,
      withMaintenance
    };
  }, [filteredInventory]);

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

  const addAccessoryItem = () => {
    setFormData({
      ...formData,
      accessories: [...formData.accessories, { name: '', type: 'missing', notes: '' }]
    });
  };

  const removeAccessoryItem = (index: number) => {
    setFormData({
      ...formData,
      accessories: formData.accessories.filter((_, i) => i !== index)
    });
  };

  const updateAccessoryItem = (index: number, field: keyof AccessoryFormItem, value: string) => {
    const newAccessories = [...formData.accessories];
    (newAccessories[index] as any)[field] = value;
    setFormData({ ...formData, accessories: newAccessories });
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
      notes: formData.notes,
      updateStock: formData.updateStock,
      accessories: formData.accessories.filter(a => a.name.trim() !== ''),
      maintenance: formData.maintenance
    };

    if (hasDuplicateInventoryThisMonth(formData.equipmentId, formData.checkDate)) {
      setPendingData(data as any);
      setShowWarning(true);
    } else {
      submitInventory(data as any);
    }
  };

  const submitInventory = (data: typeof pendingData) => {
    if (!data) return;
    
    const maintData = data.maintenance.enabled ? {
      type: data.maintenance.type,
      description: data.maintenance.description,
      cost: parseFloat(data.maintenance.cost) || 0,
      operator: data.maintenance.operator
    } : undefined;
    
    performInventoryCheck({
      equipmentId: data.equipmentId,
      checkDate: data.checkDate,
      expectedCount: data.expectedCount,
      actualCount: data.actualCount,
      status: data.status,
      checker: data.checker,
      notes: data.notes,
      updateStock: data.updateStock,
      accessories: data.accessories,
      maintenance: maintData
    });
    
    setIsModalOpen(false);
    setShowWarning(false);
    setPendingData(null);
    setFormData({
      equipmentId: '',
      checkDate: new Date().toISOString().split('T')[0],
      expectedCount: '',
      actualCount: '',
      checker: '',
      notes: '',
      updateStock: false,
      accessories: [],
      maintenance: {
        enabled: false,
        type: 'routine',
        description: '',
        cost: '',
        operator: ''
      }
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

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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
            onClick={openModal}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新增盘点
          </button>
        }
      />

      {selectedEquipmentId && <EquipmentOverview />}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">总盘点数</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">盘点正常</p>
              <p className="text-xl font-bold text-emerald-600">{stats.normal}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">盘点异常</p>
              <p className="text-xl font-bold text-amber-600">{stats.abnormal}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">物品缺失</p>
              <p className="text-xl font-bold text-red-600">{stats.missing}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-earth-50 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-earth-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">产生配件问题</p>
              <p className="text-xl font-bold text-earth-600">{stats.withAccessories}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">产生维护记录</p>
              <p className="text-xl font-bold text-purple-600">{stats.withMaintenance}</p>
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
            <EquipmentSelector className="min-w-48" />
            
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
            title="暂无匹配记录" 
            description={
              searchTerm || statusFilter || selectedEquipmentId
                ? "当前筛选条件下没有找到盘点记录，请尝试调整筛选条件"
                : "点击右上角按钮新增盘点记录"
            }
            icon="search"
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredInventory.map((record) => {
              const StatusIcon = statusIcons[record.status] || ClipboardList;
              const diff = record.actualCount - record.expectedCount;
              const isExpanded = expandedId === record.id;
              const relatedAccessories = getAccessoriesByInventoryId(record.id);
              const relatedMaintenance = getMaintenanceByInventoryId(record.id);
              const hasRelations = relatedAccessories.length > 0 || relatedMaintenance.length > 0;
              
              return (
                <div key={record.id} className="transition-colors">
                  <div
                    className={`p-5 cursor-pointer ${statusColors[record.status]} border-l-4`}
                    onClick={() => hasRelations && toggleExpand(record.id)}
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
                          
                          {hasRelations && (
                            <div className="flex items-center gap-4 mt-3">
                              {relatedAccessories.length > 0 && (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-earth-100 text-earth-700 rounded-full">
                                  <Wrench className="w-3 h-3" />
                                  配件问题 {relatedAccessories.length} 项
                                </span>
                              )}
                              {relatedMaintenance.length > 0 && (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                  <Settings className="w-3 h-3" />
                                  维护记录 {relatedMaintenance.length} 条
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {hasRelations && (
                        <div className="flex-shrink-0 ml-4">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {isExpanded && hasRelations && (
                    <div className="bg-gray-50 px-5 py-4 border-t border-gray-200">
                      {relatedAccessories.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-earth-600" />
                            关联配件问题
                          </h4>
                          <div className="space-y-2">
                            {relatedAccessories.map(acc => (
                              <div key={acc.id} className="bg-white p-3 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">{acc.name}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                      acc.type === 'missing' 
                                        ? 'bg-red-100 text-red-700' 
                                        : acc.type === 'damaged'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-blue-100 text-blue-700'
                                    }`}>
                                      {statusTextMap[acc.type] || acc.type}
                                    </span>
                                  </div>
                                  <StatusBadge status={acc.status} />
                                </div>
                                {acc.notes && (
                                  <p className="text-sm text-gray-500 mt-1">{acc.notes}</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                  登记日期：{formatDate(acc.reportedDate)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {relatedMaintenance.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-purple-600" />
                            关联维护记录
                          </h4>
                          <div className="space-y-2">
                            {relatedMaintenance.map(maint => (
                              <div key={maint.id} className="bg-white p-3 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">{statusTextMap[maint.type] || maint.type}</span>
                                    <span className="text-sm text-gray-500">· {maint.operator}</span>
                                  </div>
                                  <span className="font-bold text-earth-600">¥{maint.cost}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{maint.description}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  维护日期：{formatDate(maint.date)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        共 {filteredInventory.length} 条记录
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
        isOpen={isModalOpen && !showWarning}
        onClose={() => setIsModalOpen(false)}
        title="新增盘点记录"
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
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
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="updateStock"
              checked={formData.updateStock}
              onChange={(e) => setFormData({ ...formData, updateStock: e.target.checked })}
              className="w-4 h-4 text-forest-600 rounded border-gray-300 focus:ring-forest-500"
            />
            <label htmlFor="updateStock" className="text-sm text-gray-700 cursor-pointer">
              <span className="font-medium">同步更新装备库存状态</span>
              <span className="text-gray-500 ml-1">（盘点异常/缺失时自动更新库存和状态）</span>
            </label>
          </div>
          
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-earth-600" />
                配件问题登记
              </h4>
              <button
                type="button"
                onClick={addAccessoryItem}
                className="text-sm text-forest-600 hover:text-forest-700 font-medium"
              >
                + 添加配件
              </button>
            </div>
            
            {formData.accessories.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-lg">
                暂无配件问题，点击上方按钮添加
              </p>
            ) : (
              <div className="space-y-3">
                {formData.accessories.map((acc, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">配件名称</label>
                          <input
                            type="text"
                            value={acc.name}
                            onChange={(e) => updateAccessoryItem(index, 'name', e.target.value)}
                            className="input-field text-sm"
                            placeholder="如：地钉、风绳"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">问题类型</label>
                          <select
                            value={acc.type}
                            onChange={(e) => updateAccessoryItem(index, 'type', e.target.value)}
                            className="select-field text-sm"
                          >
                            <option value="missing">缺失</option>
                            <option value="damaged">损坏</option>
                          </select>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAccessoryItem(index)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-2">
                      <label className="block text-xs text-gray-500 mb-1">备注</label>
                      <input
                        type="text"
                        value={acc.notes}
                        onChange={(e) => updateAccessoryItem(index, 'notes', e.target.value)}
                        className="input-field text-sm"
                        placeholder="问题描述说明"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="enableMaintenance"
                checked={formData.maintenance.enabled}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  maintenance: { ...formData.maintenance, enabled: e.target.checked } 
                })}
                className="w-4 h-4 text-forest-600 rounded border-gray-300 focus:ring-forest-500"
              />
              <label htmlFor="enableMaintenance" className="font-medium text-gray-900 flex items-center gap-2 cursor-pointer">
                <Settings className="w-4 h-4 text-purple-600" />
                登记维护记录
              </label>
            </div>
            
            {formData.maintenance.enabled && (
              <div className="p-4 bg-purple-50 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">维护类型</label>
                    <select
                      value={formData.maintenance.type}
                      onChange={(e) => setFormData({
                        ...formData,
                        maintenance: { ...formData.maintenance, type: e.target.value as any }
                      })}
                      className="select-field text-sm"
                    >
                      <option value="routine">常规保养</option>
                      <option value="repair">维修</option>
                      <option value="replacement">配件更换</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">维护费用（元）</label>
                    <input
                      type="number"
                      value={formData.maintenance.cost}
                      onChange={(e) => setFormData({
                        ...formData,
                        maintenance: { ...formData.maintenance, cost: e.target.value }
                      })}
                      className="input-field text-sm"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">维护人</label>
                  <input
                    type="text"
                    value={formData.maintenance.operator}
                    onChange={(e) => setFormData({
                      ...formData,
                      maintenance: { ...formData.maintenance, operator: e.target.value }
                    })}
                    className="input-field text-sm"
                    placeholder="请输入维护人姓名"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">维护说明</label>
                  <textarea
                    value={formData.maintenance.description}
                    onChange={(e) => setFormData({
                      ...formData,
                      maintenance: { ...formData.maintenance, description: e.target.value }
                    })}
                    className="input-field text-sm min-h-20"
                    placeholder="描述维护内容和处理方式"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              盘点备注
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
