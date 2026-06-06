import { Equipment, RentalRecord, AccessoryRecord, MaintenanceRecord, InventoryRecord } from '../types';

const toCSV = (data: Record<string, unknown>[], headers: string[]): string => {
  const headerRow = headers.join(',');
  const dataRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      const strValue = value !== undefined && value !== null ? String(value) : '';
      if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
        return `"${strValue.replace(/"/g, '""')}"`;
      }
      return strValue;
    }).join(',')
  );
  return [headerRow, ...dataRows].join('\n');
};

const downloadCSV = (csvContent: string, filename: string): void => {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportEquipments = (equipments: Equipment[]): { success: boolean; message: string } => {
  if (equipments.length === 0) {
    return { success: false, message: '暂无装备数据可导出' };
  }
  
  const headers = ['装备ID', '装备名称', '分类', '描述', '总库存', '可用库存', '租赁次数', '状态', '采购日期', '采购价格', '维护周期(天)', '上次维护日期'];
  const data = equipments.map(eq => ({
    '装备ID': eq.id,
    '装备名称': eq.name,
    '分类': eq.category,
    '描述': eq.description,
    '总库存': eq.totalStock,
    '可用库存': eq.availableStock,
    '租赁次数': eq.rentalCount,
    '状态': eq.status,
    '采购日期': eq.purchaseDate,
    '采购价格': eq.purchasePrice,
    '维护周期(天)': eq.maintenanceCycle,
    '上次维护日期': eq.lastMaintenanceDate
  }));
  
  const csv = toCSV(data, headers);
  downloadCSV(csv, `装备清单_${new Date().toISOString().split('T')[0]}.csv`);
  return { success: true, message: `成功导出 ${equipments.length} 条装备数据` };
};

export const exportRentals = (rentals: RentalRecord[], equipmentNames: Record<string, string>): { success: boolean; message: string } => {
  if (rentals.length === 0) {
    return { success: false, message: '暂无租赁记录可导出' };
  }
  
  const headers = ['记录ID', '装备名称', '租用人', '开始日期', '结束日期', '天数', '用途', '状态', '备注'];
  const data = rentals.map(r => ({
    '记录ID': r.id,
    '装备名称': equipmentNames[r.equipmentId] || r.equipmentId,
    '租用人': r.renterName,
    '开始日期': r.startDate,
    '结束日期': r.endDate,
    '天数': r.days,
    '用途': r.purpose,
    '状态': r.status,
    '备注': r.notes
  }));
  
  const csv = toCSV(data, headers);
  downloadCSV(csv, `租赁记录_${new Date().toISOString().split('T')[0]}.csv`);
  return { success: true, message: `成功导出 ${rentals.length} 条租赁记录` };
};

export const exportMaintenance = (records: MaintenanceRecord[], equipmentNames: Record<string, string>): { success: boolean; message: string } => {
  if (records.length === 0) {
    return { success: false, message: '暂无维护记录可导出' };
  }
  
  const headers = ['记录ID', '装备名称', '维护类型', '费用(元)', '维护日期', '操作人', '描述'];
  const data = records.map(m => ({
    '记录ID': m.id,
    '装备名称': equipmentNames[m.equipmentId] || m.equipmentId,
    '维护类型': m.type,
    '费用(元)': m.cost,
    '维护日期': m.date,
    '操作人': m.operator,
    '描述': m.description
  }));
  
  const csv = toCSV(data, headers);
  downloadCSV(csv, `维护记录_${new Date().toISOString().split('T')[0]}.csv`);
  return { success: true, message: `成功导出 ${records.length} 条维护记录` };
};

export const exportAccessories = (records: AccessoryRecord[], equipmentNames: Record<string, string>): { success: boolean; message: string } => {
  if (records.length === 0) {
    return { success: false, message: '暂无配件记录可导出' };
  }
  
  const headers = ['记录ID', '装备名称', '配件名称', '类型', '状态', '登记日期', '补充日期', '备注'];
  const data = records.map(a => ({
    '记录ID': a.id,
    '装备名称': equipmentNames[a.equipmentId] || a.equipmentId,
    '配件名称': a.name,
    '类型': a.type,
    '状态': a.status,
    '登记日期': a.reportedDate,
    '补充日期': a.replenishDate || '',
    '备注': a.notes
  }));
  
  const csv = toCSV(data, headers);
  downloadCSV(csv, `损耗配件_${new Date().toISOString().split('T')[0]}.csv`);
  return { success: true, message: `成功导出 ${records.length} 条配件记录` };
};

export const exportInventory = (records: InventoryRecord[], equipmentNames: Record<string, string>): { success: boolean; message: string } => {
  if (records.length === 0) {
    return { success: false, message: '暂无盘点记录可导出' };
  }
  
  const headers = ['记录ID', '装备名称', '盘点日期', '账面数量', '实盘数量', '状态', '盘点人', '备注'];
  const data = records.map(inv => ({
    '记录ID': inv.id,
    '装备名称': equipmentNames[inv.equipmentId] || inv.equipmentId,
    '盘点日期': inv.checkDate,
    '账面数量': inv.expectedCount,
    '实盘数量': inv.actualCount,
    '状态': inv.status,
    '盘点人': inv.checker,
    '备注': inv.notes
  }));
  
  const csv = toCSV(data, headers);
  downloadCSV(csv, `盘点记录_${new Date().toISOString().split('T')[0]}.csv`);
  return { success: true, message: `成功导出 ${records.length} 条盘点记录` };
};
