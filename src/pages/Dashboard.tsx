import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  CalendarClock, 
  Wrench, 
  DollarSign, 
  ClipboardList, 
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../store/useStore';
import PageHeader from '../components/PageHeader';

const Dashboard = () => {
  const navigate = useNavigate();
  const { equipments, rentals, accessories, maintenance, isMaintenanceOverdue, hasMissingAccessories } = useStore();

  const totalEquipments = equipments.length;
  const activeRentals = rentals.filter(r => r.status === 'active').length;
  const thisMonthRentals = rentals.filter(r => {
    const rentalDate = new Date(r.startDate);
    const now = new Date();
    return rentalDate.getMonth() === now.getMonth() && rentalDate.getFullYear() === now.getFullYear();
  }).length;
  
  const maintenanceOverdueCount = equipments.filter(eq => isMaintenanceOverdue(eq.id)).length;
  const pendingAccessories = accessories.filter(a => a.status === 'pending').length;
  const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + m.cost, 0);
  const outOfStockCount = equipments.filter(eq => eq.availableStock === 0).length;

  const statCards = [
    {
      title: '装备总数',
      value: totalEquipments,
      icon: Package,
      color: 'from-forest-500 to-forest-600',
      bgLight: 'bg-forest-50',
      textColor: 'text-forest-600'
    },
    {
      title: '在租数量',
      value: activeRentals,
      icon: CalendarClock,
      color: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: '本月租赁',
      value: thisMonthRentals,
      icon: TrendingUp,
      color: 'from-earth-500 to-earth-600',
      bgLight: 'bg-earth-50',
      textColor: 'text-earth-600'
    },
    {
      title: '待维护',
      value: maintenanceOverdueCount,
      icon: Wrench,
      color: 'from-red-500 to-red-600',
      bgLight: 'bg-red-50',
      textColor: 'text-red-600'
    }
  ];

  const quickActions = [
    { title: '装备管理', desc: '查看和管理所有装备', icon: Package, path: '/equipment', color: 'from-forest-500 to-forest-700' },
    { title: '租赁记录', desc: '外出使用次数统计', icon: CalendarClock, path: '/rentals', color: 'from-blue-500 to-blue-700' },
    { title: '损耗配件', desc: '配件缺失登记管理', icon: Wrench, path: '/accessories', color: 'from-earth-500 to-earth-700' },
    { title: '维护费用', desc: '维护成本核算', icon: DollarSign, path: '/maintenance', color: 'from-emerald-500 to-emerald-700' },
    { title: '盘点记录', desc: '收纳盘点登记', icon: ClipboardList, path: '/inventory', color: 'from-purple-500 to-purple-700' },
    { title: '统计报表', desc: '数据统计与导出', icon: BarChart3, path: '/reports', color: 'from-rose-500 to-rose-700' },
  ];

  const alerts = [];
  if (pendingAccessories > 0) {
    alerts.push({
      type: 'warning',
      title: '配件待补充',
      message: `有 ${pendingAccessories} 件配件缺失待补充`,
      path: '/accessories'
    });
  }
  if (maintenanceOverdueCount > 0) {
    alerts.push({
      type: 'error',
      title: '维护超期提醒',
      message: `有 ${maintenanceOverdueCount} 件装备维护已超期`,
      path: '/maintenance'
    });
  }
  if (outOfStockCount > 0) {
    alerts.push({
      type: 'info',
      title: '库存为零',
      message: `有 ${outOfStockCount} 件装备当前无库存`,
      path: '/equipment'
    });
  }

  return (
    <div>
      <PageHeader
        title="仪表板"
        description="露营装备租赁管理概览"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="card p-5 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`w-12 h-12 ${card.bgLight} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {alerts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">异常提醒</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alerts.map((alert, index) => {
              const colors = {
                warning: {
                  border: 'border-earth-200',
                  bg: 'bg-earth-50',
                  icon: AlertTriangle,
                  iconColor: 'text-earth-600'
                },
                error: {
                  border: 'border-red-200',
                  bg: 'bg-red-50',
                  icon: XCircle,
                  iconColor: 'text-red-600'
                },
                info: {
                  border: 'border-blue-200',
                  bg: 'bg-blue-50',
                  icon: AlertTriangle,
                  iconColor: 'text-blue-600'
                }
              };
              const colorConfig = colors[alert.type as keyof typeof colors];
              const Icon = colorConfig.icon;
              
              return (
                <div
                  key={index}
                  onClick={() => navigate(alert.path)}
                  className={`card p-4 border-l-4 ${colorConfig.border} cursor-pointer hover:shadow-md transition-all duration-200`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`${colorConfig.bg} p-2 rounded-lg`}>
                      <Icon className={`w-5 h-5 ${colorConfig.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{alert.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{alert.message}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">功能模块</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={index}
                onClick={() => navigate(action.path)}
                className="card p-5 cursor-pointer group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-forest-700 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{action.desc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-forest-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">费用统计</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">累计维护费用</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ¥{totalMaintenanceCost.toLocaleString()}
              </p>
            </div>
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">维护记录数</span>
              <span className="font-medium text-gray-900">{maintenance.length} 条</span>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">库存状况</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">装备种类</span>
              <span className="font-medium">{totalEquipments} 种</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">有库存</span>
              <span className="font-medium text-emerald-600">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                {totalEquipments - outOfStockCount} 种
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">无库存</span>
              <span className="font-medium text-red-600">
                <XCircle className="w-4 h-4 inline mr-1" />
                {outOfStockCount} 种
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">待补充配件</span>
              <span className="font-medium text-earth-600">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                {pendingAccessories} 件
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
