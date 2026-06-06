export interface Equipment {
  id: string;
  name: string;
  category: string;
  description: string;
  totalStock: number;
  availableStock: number;
  rentalCount: number;
  status: 'normal' | 'maintenance' | 'damaged' | 'out_of_stock';
  imageUrl: string;
  purchaseDate: string;
  purchasePrice: number;
  maintenanceCycle: number;
  lastMaintenanceDate: string;
}

export interface RentalRecord {
  id: string;
  equipmentId: string;
  renterName: string;
  startDate: string;
  endDate: string;
  days: number;
  purpose: string;
  status: 'active' | 'returned' | 'overdue';
  notes: string;
}

export interface AccessoryRecord {
  id: string;
  equipmentId: string;
  name: string;
  type: 'missing' | 'damaged' | 'replaced';
  status: 'pending' | 'replenished';
  reportedDate: string;
  replenishDate?: string;
  notes: string;
  sourceInventoryId?: string;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  type: 'routine' | 'repair' | 'replacement';
  cost: number;
  date: string;
  operator: string;
  description: string;
  sourceInventoryId?: string;
}

export interface InventoryRecord {
  id: string;
  equipmentId: string;
  checkDate: string;
  expectedCount: number;
  actualCount: number;
  status: 'normal' | 'abnormal' | 'missing';
  checker: string;
  notes: string;
  generatedAccessoryIds?: string[];
  generatedMaintenanceIds?: string[];
}

export type EquipmentCategory = 
  | '帐篷' 
  | '睡袋' 
  | '炉具' 
  | '照明' 
  | '桌椅' 
  | '背包' 
  | '其他';

export type PageType = 
  | 'dashboard' 
  | 'equipment' 
  | 'rentals' 
  | 'accessories' 
  | 'maintenance' 
  | 'inventory' 
  | 'reports';
