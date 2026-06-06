import { Equipment, RentalRecord, AccessoryRecord, MaintenanceRecord, InventoryRecord } from '../types';

export const mockEquipments: Equipment[] = [
  {
    id: 'eq-001',
    name: 'NatureHike 云尚2 双人帐篷',
    category: '帐篷',
    description: '轻量化双人帐篷，防风防雨，适合3-4季徒步露营使用。',
    totalStock: 10,
    availableStock: 6,
    rentalCount: 45,
    status: 'normal',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=green%20camping%20tent%20in%20forest%20outdoor%20gear&image_size=square',
    purchaseDate: '2024-03-15',
    purchasePrice: 899,
    maintenanceCycle: 30,
    lastMaintenanceDate: '2026-05-20'
  },
  {
    id: 'eq-002',
    name: '黑冰 B700 鸭绒睡袋',
    category: '睡袋',
    description: '舒适温度-5度，700蓬松度鸭绒填充，重量轻保暖性好。',
    totalStock: 15,
    availableStock: 12,
    rentalCount: 68,
    status: 'normal',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=warm%20sleeping%20bag%20camping%20gear%20orange&image_size=square',
    purchaseDate: '2024-05-10',
    purchasePrice: 659,
    maintenanceCycle: 60,
    lastMaintenanceDate: '2026-04-10'
  },
  {
    id: 'eq-003',
    name: '火枫 野火炉头套装',
    category: '炉具',
    description: '一体式炉头，高效节能，附带挡风板和收纳盒。',
    totalStock: 20,
    availableStock: 0,
    rentalCount: 120,
    status: 'out_of_stock',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=camping%20stove%20cookware%20outdoor%20equipment&image_size=square',
    purchaseDate: '2024-02-20',
    purchasePrice: 259,
    maintenanceCycle: 45,
    lastMaintenanceDate: '2026-05-01'
  },
  {
    id: 'eq-004',
    name: '山力士 星野营灯',
    category: '照明',
    description: 'LED露营灯，三档调光，USB充电，IPX5防水。',
    totalStock: 25,
    availableStock: 20,
    rentalCount: 89,
    status: 'normal',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=led%20camping%20lantern%20warm%20light%20outdoor&image_size=square',
    purchaseDate: '2024-06-01',
    purchasePrice: 129,
    maintenanceCycle: 90,
    lastMaintenanceDate: '2026-03-15'
  },
  {
    id: 'eq-005',
    name: '挪客 蛋卷桌',
    category: '桌椅',
    description: '铝合金蛋卷桌，便携折叠，承重50kg。',
    totalStock: 12,
    availableStock: 8,
    rentalCount: 56,
    status: 'maintenance',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=foldable%20camping%20table%20wooden%20outdoor&image_size=square',
    purchaseDate: '2024-04-12',
    purchasePrice: 399,
    maintenanceCycle: 60,
    lastMaintenanceDate: '2026-03-01'
  },
  {
    id: 'eq-006',
    name: '小鹰 气流 48L 登山包',
    category: '背包',
    description: '专业登山背包，空景背负系统，多口袋设计。',
    totalStock: 8,
    availableStock: 5,
    rentalCount: 34,
    status: 'normal',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hiking%20backpack%20outdoor%20gear%20green&image_size=square',
    purchaseDate: '2024-07-20',
    purchasePrice: 1099,
    maintenanceCycle: 90,
    lastMaintenanceDate: '2026-05-10'
  },
  {
    id: 'eq-007',
    name: '牧高笛 月亮椅',
    category: '桌椅',
    description: '折叠月亮椅，舒适包裹，牛津布面料，承重150kg。',
    totalStock: 18,
    availableStock: 10,
    rentalCount: 72,
    status: 'damaged',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=camping%20moon%20chair%20foldable%20outdoor&image_size=square',
    purchaseDate: '2024-05-25',
    purchasePrice: 199,
    maintenanceCycle: 60,
    lastMaintenanceDate: '2026-02-20'
  },
  {
    id: 'eq-008',
    name: '挪客 天幕 3x4m',
    category: '帐篷',
    description: '涂银天幕，防紫外线，可遮阳避雨，多种搭建方式。',
    totalStock: 6,
    availableStock: 3,
    rentalCount: 28,
    status: 'normal',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=camping%20tarp%20canopy%20outdoor%20shade&image_size=square',
    purchaseDate: '2024-08-10',
    purchasePrice: 459,
    maintenanceCycle: 45,
    lastMaintenanceDate: '2026-05-25'
  }
];

export const mockRentals: RentalRecord[] = [
  {
    id: 'rt-001',
    equipmentId: 'eq-001',
    renterName: '张三',
    startDate: '2026-06-01',
    endDate: '2026-06-03',
    days: 3,
    purpose: '周末徒步露营',
    status: 'returned',
    notes: '装备完好归还'
  },
  {
    id: 'rt-002',
    equipmentId: 'eq-001',
    renterName: '李四',
    startDate: '2026-06-05',
    endDate: '2026-06-07',
    days: 3,
    purpose: '亲子露营',
    status: 'active',
    notes: '预计周日下午归还'
  },
  {
    id: 'rt-003',
    equipmentId: 'eq-002',
    renterName: '王五',
    startDate: '2026-05-28',
    endDate: '2026-06-01',
    days: 5,
    purpose: '长线徒步',
    status: 'overdue',
    notes: '联系中，预计延迟2天归还'
  },
  {
    id: 'rt-004',
    equipmentId: 'eq-003',
    renterName: '赵六',
    startDate: '2026-06-03',
    endDate: '2026-06-05',
    days: 3,
    purpose: '团队团建',
    status: 'active',
    notes: '共租用4套炉具'
  },
  {
    id: 'rt-005',
    equipmentId: 'eq-004',
    renterName: '孙七',
    startDate: '2026-05-20',
    endDate: '2026-05-22',
    days: 3,
    purpose: '摄影采风',
    status: 'returned',
    notes: '电池续航良好'
  },
  {
    id: 'rt-006',
    equipmentId: 'eq-005',
    renterName: '周八',
    startDate: '2026-06-02',
    endDate: '2026-06-04',
    days: 3,
    purpose: '野餐聚会',
    status: 'returned',
    notes: '桌面有轻微划痕'
  },
  {
    id: 'rt-007',
    equipmentId: 'eq-006',
    renterName: '吴九',
    startDate: '2026-06-01',
    endDate: '2026-06-06',
    days: 6,
    purpose: '多日徒步穿越',
    status: 'active',
    notes: '专业驴友，装备经验丰富'
  },
  {
    id: 'rt-008',
    equipmentId: 'eq-007',
    renterName: '郑十',
    startDate: '2026-05-25',
    endDate: '2026-05-26',
    days: 2,
    purpose: '音乐节露营',
    status: 'returned',
    notes: '椅面有污渍，已清洗'
  },
  {
    id: 'rt-009',
    equipmentId: 'eq-008',
    renterName: '冯十一',
    startDate: '2026-06-04',
    endDate: '2026-06-06',
    days: 3,
    purpose: '生日派对',
    status: 'active',
    notes: '搭配地钉和风绳使用'
  },
  {
    id: 'rt-010',
    equipmentId: 'eq-001',
    renterName: '陈十二',
    startDate: '2026-05-15',
    endDate: '2026-05-17',
    days: 3,
    purpose: '摄影露营',
    status: 'returned',
    notes: '状况良好'
  }
];

export const mockAccessories: AccessoryRecord[] = [
  {
    id: 'acc-001',
    equipmentId: 'eq-001',
    name: '地钉',
    type: 'missing',
    status: 'pending',
    reportedDate: '2026-05-28',
    notes: '缺少2根铝合金地钉'
  },
  {
    id: 'acc-002',
    equipmentId: 'eq-001',
    name: '风绳',
    type: 'damaged',
    status: 'pending',
    reportedDate: '2026-06-02',
    notes: '一根风绳有磨损'
  },
  {
    id: 'acc-003',
    equipmentId: 'eq-003',
    name: '炉头密封圈',
    type: 'replaced',
    status: 'replenished',
    reportedDate: '2026-05-10',
    replenishDate: '2026-05-15',
    notes: '密封圈老化已更换'
  },
  {
    id: 'acc-004',
    equipmentId: 'eq-005',
    name: '桌脚橡胶垫',
    type: 'missing',
    status: 'pending',
    reportedDate: '2026-06-03',
    notes: '遗失1个橡胶脚垫'
  },
  {
    id: 'acc-005',
    equipmentId: 'eq-007',
    name: '椅面连接件',
    type: 'damaged',
    status: 'pending',
    reportedDate: '2026-05-30',
    notes: '塑料连接件断裂'
  },
  {
    id: 'acc-006',
    equipmentId: 'eq-006',
    name: '腰带扣',
    type: 'replaced',
    status: 'replenished',
    reportedDate: '2026-04-20',
    replenishDate: '2026-04-25',
    notes: '快挂扣损坏已更换'
  },
  {
    id: 'acc-007',
    equipmentId: 'eq-004',
    name: 'USB充电线',
    type: 'missing',
    status: 'replenished',
    reportedDate: '2026-05-05',
    replenishDate: '2026-05-08',
    notes: '充电线丢失已补配'
  }
];

export const mockMaintenance: MaintenanceRecord[] = [
  {
    id: 'mt-001',
    equipmentId: 'eq-001',
    type: 'routine',
    cost: 50,
    date: '2026-05-20',
    operator: '张师傅',
    description: '常规清洁保养，检查防水层'
  },
  {
    id: 'mt-002',
    equipmentId: 'eq-002',
    type: 'routine',
    cost: 30,
    date: '2026-04-10',
    operator: '李师傅',
    description: '睡袋晾晒消毒，蓬松度恢复'
  },
  {
    id: 'mt-003',
    equipmentId: 'eq-003',
    type: 'repair',
    cost: 80,
    date: '2026-05-01',
    operator: '王师傅',
    description: '更换阀门密封圈，疏通喷嘴'
  },
  {
    id: 'mt-004',
    equipmentId: 'eq-005',
    type: 'replacement',
    cost: 120,
    date: '2026-03-01',
    operator: '赵师傅',
    description: '更换破损桌面板'
  },
  {
    id: 'mt-005',
    equipmentId: 'eq-007',
    type: 'repair',
    cost: 45,
    date: '2026-02-20',
    operator: '孙师傅',
    description: '修复椅架焊点'
  },
  {
    id: 'mt-006',
    equipmentId: 'eq-006',
    type: 'routine',
    cost: 25,
    date: '2026-05-10',
    operator: '周师傅',
    description: '肩带加固，拉链润滑'
  },
  {
    id: 'mt-007',
    equipmentId: 'eq-004',
    type: 'replacement',
    cost: 60,
    date: '2026-03-15',
    operator: '吴师傅',
    description: '更换老化电池组'
  },
  {
    id: 'mt-008',
    equipmentId: 'eq-008',
    type: 'routine',
    cost: 40,
    date: '2026-05-25',
    operator: '郑师傅',
    description: '涂银层检查，接缝处重新压胶'
  }
];

export const mockInventory: InventoryRecord[] = [
  {
    id: 'inv-001',
    equipmentId: 'eq-001',
    checkDate: '2026-05-30',
    expectedCount: 10,
    actualCount: 10,
    status: 'normal',
    checker: '管理员A',
    notes: '库存正常，配件齐全'
  },
  {
    id: 'inv-002',
    equipmentId: 'eq-002',
    checkDate: '2026-05-30',
    expectedCount: 15,
    actualCount: 15,
    status: 'normal',
    checker: '管理员A',
    notes: '库存正常'
  },
  {
    id: 'inv-003',
    equipmentId: 'eq-003',
    checkDate: '2026-05-25',
    expectedCount: 20,
    actualCount: 19,
    status: 'abnormal',
    checker: '管理员B',
    notes: '少1套，正在查找中'
  },
  {
    id: 'inv-004',
    equipmentId: 'eq-004',
    checkDate: '2026-05-28',
    expectedCount: 25,
    actualCount: 25,
    status: 'normal',
    checker: '管理员B',
    notes: '库存正常'
  },
  {
    id: 'inv-005',
    equipmentId: 'eq-005',
    checkDate: '2026-05-20',
    expectedCount: 12,
    actualCount: 11,
    status: 'missing',
    checker: '管理员A',
    notes: '1套送修中'
  },
  {
    id: 'inv-006',
    equipmentId: 'eq-006',
    checkDate: '2026-05-15',
    expectedCount: 8,
    actualCount: 8,
    status: 'normal',
    checker: '管理员A',
    notes: '库存正常'
  },
  {
    id: 'inv-007',
    equipmentId: 'eq-007',
    checkDate: '2026-05-10',
    expectedCount: 18,
    actualCount: 17,
    status: 'abnormal',
    checker: '管理员B',
    notes: '1把椅子损坏待修'
  },
  {
    id: 'inv-008',
    equipmentId: 'eq-008',
    checkDate: '2026-05-22',
    expectedCount: 6,
    actualCount: 6,
    status: 'normal',
    checker: '管理员B',
    notes: '库存正常'
  }
];
