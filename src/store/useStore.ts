import { create } from 'zustand';
import { 
  Equipment, 
  RentalRecord, 
  AccessoryRecord, 
  MaintenanceRecord, 
  InventoryRecord 
} from '../types';
import { 
  mockEquipments, 
  mockRentals, 
  mockAccessories, 
  mockMaintenance, 
  mockInventory 
} from '../data/mockData';

interface InventoryAccessoryItem {
  name: string;
  type: 'missing' | 'damaged';
  notes: string;
}

interface InventoryMaintenanceItem {
  type: 'routine' | 'repair' | 'replacement';
  description: string;
  cost: number;
  operator: string;
}

interface PerformInventoryData {
  equipmentId: string;
  checkDate: string;
  expectedCount: number;
  actualCount: number;
  status: 'normal' | 'abnormal' | 'missing';
  checker: string;
  notes: string;
  updateStock?: boolean;
  accessories?: InventoryAccessoryItem[];
  maintenance?: InventoryMaintenanceItem;
}

interface StoreState {
  equipments: Equipment[];
  rentals: RentalRecord[];
  accessories: AccessoryRecord[];
  maintenance: MaintenanceRecord[];
  inventory: InventoryRecord[];
  selectedEquipmentId: string | null;
  
  setSelectedEquipmentId: (id: string | null) => void;
  
  addRental: (rental: Omit<RentalRecord, 'id'>) => void;
  updateRentalStatus: (id: string, status: RentalRecord['status']) => void;
  
  addAccessory: (accessory: Omit<AccessoryRecord, 'id'>) => void;
  updateAccessoryStatus: (id: string, status: AccessoryRecord['status'], replenishDate?: string) => void;
  
  addMaintenance: (maintenance: Omit<MaintenanceRecord, 'id'>) => void;
  
  addInventory: (inventory: Omit<InventoryRecord, 'id'>) => void;
  performInventoryCheck: (data: PerformInventoryData) => {
    inventoryId: string;
    accessoryIds: string[];
    maintenanceId?: string;
  };
  
  getEquipmentById: (id: string) => Equipment | undefined;
  getRentalsByEquipmentId: (equipmentId: string) => RentalRecord[];
  getAccessoriesByEquipmentId: (equipmentId: string) => AccessoryRecord[];
  getMaintenanceByEquipmentId: (equipmentId: string) => MaintenanceRecord[];
  getInventoryByEquipmentId: (equipmentId: string) => InventoryRecord[];
  getAccessoriesByInventoryId: (inventoryId: string) => AccessoryRecord[];
  getMaintenanceByInventoryId: (inventoryId: string) => MaintenanceRecord[];
  
  hasMissingAccessories: (equipmentId: string) => boolean;
  isMaintenanceOverdue: (equipmentId: string) => boolean;
  isOutOfStock: (equipmentId: string) => boolean;
  hasDuplicateInventoryThisMonth: (equipmentId: string, checkDate: string) => boolean;
}

const generateId = (prefix: string) => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const parseDate = (dateStr: string) => new Date(dateStr).getTime();

export const useStore = create<StoreState>((set, get) => ({
  equipments: mockEquipments,
  rentals: mockRentals,
  accessories: mockAccessories,
  maintenance: mockMaintenance,
  inventory: mockInventory,
  selectedEquipmentId: null,
  
  setSelectedEquipmentId: (id) => set({ selectedEquipmentId: id }),
  
  addRental: (rental) => {
    const newRental: RentalRecord = {
      ...rental,
      id: generateId('rt')
    };
    set((state) => {
      const updatedEquipments = state.equipments.map(eq => {
        if (eq.id === rental.equipmentId) {
          const newAvailable = Math.max(0, eq.availableStock - 1);
          return {
            ...eq,
            availableStock: newAvailable,
            rentalCount: eq.rentalCount + 1,
            status: newAvailable === 0 ? 'out_of_stock' as const : eq.status
          };
        }
        return eq;
      });
      return {
        rentals: [...state.rentals, newRental],
        equipments: updatedEquipments
      };
    });
  },
  
  updateRentalStatus: (id, status) => {
    set((state) => {
      const rental = state.rentals.find(r => r.id === id);
      if (!rental) return state;
      
      let updatedEquipments = state.equipments;
      if (rental.status === 'active' && (status === 'returned' || status === 'overdue')) {
        updatedEquipments = state.equipments.map(eq => {
          if (eq.id === rental.equipmentId) {
            const newAvailable = Math.min(eq.totalStock, eq.availableStock + 1);
            return {
              ...eq,
              availableStock: newAvailable,
              status: eq.status === 'out_of_stock' ? 'normal' as const : eq.status
            };
          }
          return eq;
        });
      }
      
      return {
        rentals: state.rentals.map(r => r.id === id ? { ...r, status } : r),
        equipments: updatedEquipments
      };
    });
  },
  
  addAccessory: (accessory) => {
    const newAccessory: AccessoryRecord = {
      ...accessory,
      id: generateId('acc')
    };
    set((state) => ({
      accessories: [...state.accessories, newAccessory]
    }));
  },
  
  updateAccessoryStatus: (id, status, replenishDate) => {
    set((state) => ({
      accessories: state.accessories.map(a => 
        a.id === id 
          ? { ...a, status, replenishDate: replenishDate || a.replenishDate } 
          : a
      )
    }));
  },
  
  addMaintenance: (record) => {
    const newRecord: MaintenanceRecord = {
      ...record,
      id: generateId('mt')
    };
    set((state) => {
      const updatedEquipments = state.equipments.map(eq => {
        if (eq.id === record.equipmentId) {
          return {
            ...eq,
            lastMaintenanceDate: record.date
          };
        }
        return eq;
      });
      return {
        maintenance: [...state.maintenance, newRecord],
        equipments: updatedEquipments
      };
    });
  },
  
  addInventory: (record) => {
    const newRecord: InventoryRecord = {
      ...record,
      id: generateId('inv')
    };
    set((state) => ({
      inventory: [...state.inventory, newRecord]
    }));
  },
  
  performInventoryCheck: (data) => {
    const inventoryId = generateId('inv');
    const accessoryIds: string[] = [];
    let maintenanceId: string | undefined;
    
    const newInventory: InventoryRecord = {
      id: inventoryId,
      equipmentId: data.equipmentId,
      checkDate: data.checkDate,
      expectedCount: data.expectedCount,
      actualCount: data.actualCount,
      status: data.status,
      checker: data.checker,
      notes: data.notes,
      generatedAccessoryIds: [],
      generatedMaintenanceIds: []
    };
    
    const newAccessories: AccessoryRecord[] = [];
    if (data.accessories && data.accessories.length > 0) {
      data.accessories.forEach(acc => {
        const accId = generateId('acc');
        accessoryIds.push(accId);
        newAccessories.push({
          id: accId,
          equipmentId: data.equipmentId,
          name: acc.name,
          type: acc.type,
          status: 'pending',
          reportedDate: data.checkDate,
          notes: acc.notes,
          sourceInventoryId: inventoryId
        });
      });
      newInventory.generatedAccessoryIds = accessoryIds;
    }
    
    let newMaintenance: MaintenanceRecord | undefined;
    if (data.maintenance) {
      maintenanceId = generateId('mt');
      newMaintenance = {
        id: maintenanceId,
        equipmentId: data.equipmentId,
        type: data.maintenance.type,
        cost: data.maintenance.cost,
        date: data.checkDate,
        operator: data.maintenance.operator,
        description: data.maintenance.description,
        sourceInventoryId: inventoryId
      };
      newInventory.generatedMaintenanceIds = [maintenanceId];
    }
    
    set((state) => {
      let updatedEquipments = state.equipments;
      
      if (data.updateStock) {
        updatedEquipments = state.equipments.map(eq => {
          if (eq.id === data.equipmentId) {
            let newStatus = eq.status;
            let newAvailable = eq.availableStock;
            
            if (data.status === 'missing' || data.actualCount === 0) {
              newStatus = 'out_of_stock';
              newAvailable = 0;
            } else if (data.status === 'abnormal') {
              newAvailable = Math.max(0, data.actualCount);
              if (newAvailable === 0) {
                newStatus = 'out_of_stock';
              }
            }
            
            if (data.maintenance && data.maintenance.type === 'repair') {
              newStatus = 'maintenance';
            }
            
            return {
              ...eq,
              totalStock: data.expectedCount,
              availableStock: newAvailable,
              status: newStatus,
              lastMaintenanceDate: data.maintenance ? data.checkDate : eq.lastMaintenanceDate
            };
          }
          return eq;
        });
      }
      
      return {
        inventory: [...state.inventory, newInventory],
        accessories: [...state.accessories, ...newAccessories],
        maintenance: newMaintenance ? [...state.maintenance, newMaintenance] : state.maintenance,
        equipments: updatedEquipments
      };
    });
    
    return {
      inventoryId,
      accessoryIds,
      maintenanceId
    };
  },
  
  getEquipmentById: (id) => {
    return get().equipments.find(eq => eq.id === id);
  },
  
  getRentalsByEquipmentId: (equipmentId) => {
    return get().rentals.filter(r => r.equipmentId === equipmentId);
  },
  
  getAccessoriesByEquipmentId: (equipmentId) => {
    return get().accessories.filter(a => a.equipmentId === equipmentId);
  },
  
  getMaintenanceByEquipmentId: (equipmentId) => {
    return get().maintenance.filter(m => m.equipmentId === equipmentId);
  },
  
  getInventoryByEquipmentId: (equipmentId) => {
    return get().inventory.filter(i => i.equipmentId === equipmentId);
  },
  
  getAccessoriesByInventoryId: (inventoryId) => {
    return get().accessories.filter(a => a.sourceInventoryId === inventoryId);
  },
  
  getMaintenanceByInventoryId: (inventoryId) => {
    return get().maintenance.filter(m => m.sourceInventoryId === inventoryId);
  },
  
  hasMissingAccessories: (equipmentId) => {
    return get().accessories.some(
      a => a.equipmentId === equipmentId && a.status === 'pending'
    );
  },
  
  isMaintenanceOverdue: (equipmentId) => {
    const equipment = get().equipments.find(eq => eq.id === equipmentId);
    if (!equipment) return false;
    
    const lastMaintTime = parseDate(equipment.lastMaintenanceDate);
    const now = Date.now();
    const cycleDays = equipment.maintenanceCycle * 24 * 60 * 60 * 1000;
    
    return now - lastMaintTime > cycleDays;
  },
  
  isOutOfStock: (equipmentId) => {
    const equipment = get().equipments.find(eq => eq.id === equipmentId);
    return equipment ? equipment.availableStock === 0 : false;
  },
  
  hasDuplicateInventoryThisMonth: (equipmentId, checkDate) => {
    const checkDateObj = new Date(checkDate);
    const checkYear = checkDateObj.getFullYear();
    const checkMonth = checkDateObj.getMonth();
    
    return get().inventory.some(inv => {
      if (inv.equipmentId !== equipmentId) return false;
      const invDate = new Date(inv.checkDate);
      return invDate.getFullYear() === checkYear && invDate.getMonth() === checkMonth;
    });
  }
}));
