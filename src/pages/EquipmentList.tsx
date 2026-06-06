import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, AlertTriangle, Wrench, Package } from 'lucide-react';
import { useStore } from '../store/useStore';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatCurrency } from '../utils/format';

const EquipmentList = () => {
  const navigate = useNavigate();
  const { equipments, isMaintenanceOverdue, hasMissingAccessories } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const categories = useMemo(() => {
    const cats = [...new Set(equipments.map(eq => eq.category))];
    return cats;
  }, [equipments]);

  const filteredEquipments = useMemo(() => {
    return equipments.filter(eq => {
      const matchSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = !categoryFilter || eq.category === categoryFilter;
      const matchStatus = !statusFilter || eq.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [equipments, searchTerm, categoryFilter, statusFilter]);

  return (
    <div>
      <PageHeader
        title="装备管理"
        description="管理所有露营装备的基础信息"
      />

      <div className="card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索装备名称或描述..."
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
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="select-field min-w-32"
              >
                <option value="">全部分类</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
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
              <option value="maintenance">维护中</option>
              <option value="damaged">损坏</option>
              <option value="out_of_stock">缺货</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  装备信息
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  分类
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  库存
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  租赁次数
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  提醒
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEquipments.map((equipment) => {
                const missingAcc = hasMissingAccessories(equipment.id);
                const maintOverdue = isMaintenanceOverdue(equipment.id);
                const outOfStock = equipment.availableStock === 0;
                
                return (
                  <tr 
                    key={equipment.id} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={equipment.imageUrl}
                            alt={equipment.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{equipment.name}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{equipment.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{equipment.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className={`font-medium ${outOfStock ? 'text-red-600' : 'text-gray-900'}`}>
                          {equipment.availableStock} / {equipment.totalStock}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{equipment.rentalCount} 次</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={equipment.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {missingAcc && (
                          <div 
                            className="p-1.5 bg-red-50 rounded-md"
                            title="配件缺失"
                          >
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          </div>
                        )}
                        {maintOverdue && (
                          <div 
                            className="p-1.5 bg-earth-50 rounded-md"
                            title="维护超期"
                          >
                            <Wrench className="w-4 h-4 text-earth-600" />
                          </div>
                        )}
                        {outOfStock && (
                          <div 
                            className="p-1.5 bg-gray-100 rounded-md"
                            title="库存为零"
                          >
                            <Package className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                        {!missingAcc && !maintOverdue && !outOfStock && (
                          <span className="text-sm text-gray-400">无</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/equipment/${equipment.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-forest-600 hover:bg-forest-50 rounded-md transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        详情
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredEquipments.length === 0 && (
          <div className="py-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">没有找到匹配的装备</p>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        共 {filteredEquipments.length} 件装备
      </div>
    </div>
  );
};

export default EquipmentList;
