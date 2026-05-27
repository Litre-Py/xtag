// 服务器 API 服务 - 查询设备信息、更新位置和编辑信息

interface DeviceInfo {
  id: string;
  name: string;
  type: string;
  cardData?: any;
  position?: { x: number; y: number; z: number };
  lastUpdate?: number;
  ownerEdited?: any;
}

interface PositionUpdate {
  deviceId: string;
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

interface CardUpdate {
  deviceId: string;
  cardData: any;
  timestamp: number;
}

// 模拟服务器 API（实际项目中替换为真实 API 调用）
const MOCK_DB: Map<string, DeviceInfo> = new Map();

// 初始化模拟数据
MOCK_DB.set('uwb-001', {
  id: 'uwb-001', name: '张三的卡片', type: 'personal',
  cardData: { name: '张三', phone: '13800138000', wechat: 'zhangsan' },
  position: { x: 10.5, y: 20.3, z: 0 },
  lastUpdate: Date.now() - 300000,
});
MOCK_DB.set('uwb-002', {
  id: 'uwb-002', name: '李四的停车卡', type: 'parking',
  cardData: { owner: '李四', plate: '京A12345', spot: 'A-12' },
  position: { x: 5.2, y: 15.8, z: 0 },
  lastUpdate: Date.now() - 600000,
});
MOCK_DB.set('uwb-003', {
  id: 'uwb-003', name: '王五的简历', type: 'resume',
  cardData: { name: '王五', skills: ['Vue', 'React', 'Node.js'] },
  position: { x: 8.1, y: 12.4, z: 0 },
  lastUpdate: Date.now() - 900000,
});

// 查询设备信息
export async function queryDeviceInfo(deviceId: string): Promise<DeviceInfo | null> {
  // 模拟 API 延迟
  await new Promise(r => setTimeout(r, 200));
  return MOCK_DB.get(deviceId) || null;
}

// 批量查询设备信息
export async function queryDevicesInfo(deviceIds: string[]): Promise<Map<string, DeviceInfo>> {
  await new Promise(r => setTimeout(r, 300));
  const result = new Map();
  for (const id of deviceIds) {
    const info = MOCK_DB.get(id);
    if (info) result.set(id, info);
  }
  return result;
}

// 更新设备位置信息
export async function updateDevicePosition(update: PositionUpdate): Promise<boolean> {
  await new Promise(r => setTimeout(r, 100));
  const device = MOCK_DB.get(update.deviceId);
  if (!device) return false;
  device.position = { x: update.x, y: update.y, z: update.z };
  device.lastUpdate = update.timestamp;
  return true;
}

// 更新设备卡片编辑信息
export async function updateDeviceCard(update: CardUpdate): Promise<boolean> {
  await new Promise(r => setTimeout(r, 100));
  const device = MOCK_DB.get(update.deviceId);
  if (!device) return false;
  device.ownerEdited = update.cardData;
  device.lastUpdate = update.timestamp;
  return true;
}

// 获取所有设备列表
export async function getAllDevices(): Promise<DeviceInfo[]> {
  await new Promise(r => setTimeout(r, 200));
  return Array.from(MOCK_DB.values());
}

// 更新自身设备位置
export async function updateSelfPosition(position: { x: number; y: number; z: number }): Promise<boolean> {
  await new Promise(r => setTimeout(r, 50))
  console.log('[ServerAPI] 自身位置已更新:', position)
  return true
}

// 同步设备信息到服务器（备份用户编辑的数据）
export async function syncDeviceToServer(deviceId: string, cardData: any, position?: { x: number; y: number; z: number }): Promise<boolean> {
  await new Promise(r => setTimeout(r, 100))
  const device = MOCK_DB.get(deviceId)
  if (device) {
    device.ownerEdited = cardData
    if (position) device.position = position
    device.lastUpdate = Date.now()
    return true
  }
  return false
}
