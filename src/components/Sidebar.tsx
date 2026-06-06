import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  CalendarClock, 
  Wrench, 
  DollarSign, 
  ClipboardList, 
  BarChart3,
  Tent
} from 'lucide-react';

const navItems = [
  { path: '/', label: '仪表板', icon: LayoutDashboard },
  { path: '/equipment', label: '装备管理', icon: Package },
  { path: '/rentals', label: '租赁记录', icon: CalendarClock },
  { path: '/accessories', label: '损耗配件', icon: Wrench },
  { path: '/maintenance', label: '维护费用', icon: DollarSign },
  { path: '/inventory', label: '盘点记录', icon: ClipboardList },
  { path: '/reports', label: '统计报表', icon: BarChart3 },
];

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-forest-700 min-h-screen flex flex-col shadow-xl">
      <div className="p-6 border-b border-forest-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-forest-500 rounded-lg flex items-center justify-center">
            <Tent className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">露营装备台账</h1>
            <p className="text-forest-300 text-xs">租赁管理系统</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${active 
                      ? 'bg-forest-500 text-white shadow-md' 
                      : 'text-forest-200 hover:bg-forest-600 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-forest-600">
        <div className="bg-forest-600/50 rounded-lg p-4">
          <p className="text-forest-300 text-sm">管理员</p>
          <p className="text-white font-medium">admin@camping.com</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
