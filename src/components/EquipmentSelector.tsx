import { Package, ChevronDown, X } from 'lucide-react';
import { useStore } from '../store/useStore';

interface EquipmentSelectorProps {
  showAllOption?: boolean;
  className?: string;
}

const EquipmentSelector = ({ showAllOption = true, className = '' }: EquipmentSelectorProps) => {
  const { equipments, selectedEquipmentId, setSelectedEquipmentId } = useStore();
  
  const selectedEquipment = equipments.find(eq => eq.id === selectedEquipmentId);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <Package className="w-4 h-4 text-gray-400" />
      </div>
      <select
        value={selectedEquipmentId || ''}
        onChange={(e) => setSelectedEquipmentId(e.target.value || null)}
        className="select-field pl-10 pr-8 appearance-none cursor-pointer"
      >
        {showAllOption && <option value="">全部装备</option>}
        {equipments.map(eq => (
          <option key={eq.id} value={eq.id}>
            {eq.name}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
};

export default EquipmentSelector;
