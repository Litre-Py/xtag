// 本地缓存服务 - 无网络时通过设备共享信息

interface CachedDevice {
  id: string
  name: string
  type: string
  category: 'personal' | 'commercial'  // 个人/商用
  protocol: 'uwb' | 'nearlink' | 'bluetooth' | 'wifi'  // 通信协议
  cardData: any
  position?: { x: number; y: number; z: number }
  lastSync: number
  lastSeen: number
  firstSeen: number          // 首次发现时间
  dwellTime: number          // 累计停留时长(毫秒)
  source: 'device' | 'server' | 'user'
  editable: boolean
  sharedAt?: number        // 分享时间
  sharedBy?: string        // 分享人设备ID
  sharedPosition?: { x: number; y: number; z: number }  // 分享时位置
  scannedDeviceCount?: number  // 扫描到的个人设备数量(商用)
  popularityScore?: number     // 热门评分
}

const CACHE_KEY = 'uwb_device_cache'
const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24小时过期

// 模拟本地存储
let localCache: Map<string, CachedDevice> = new Map()

// 加载缓存
async function loadCache(): Promise<Map<string, CachedDevice>> {
  try {
    const data = await chrome?.storage?.local?.get(CACHE_KEY)
    if (data?.[CACHE_KEY]) {
      localCache = new Map(Object.entries(data[CACHE_KEY]))
    }
  } catch (e) {
    console.warn('缓存加载失败:', e)
  }
  return localCache
}

// 保存缓存
async function saveCache(): Promise<void> {
  try {
    const obj = Object.fromEntries(localCache)
    await chrome?.storage?.local?.set({ [CACHE_KEY]: obj })
  } catch (e) {
    console.warn('缓存保存失败:', e)
  }
}

// 从设备获取信息并缓存（优先设备实时数据）
export async function cacheDeviceFromScan(
  deviceId: string,
  deviceInfo: any,
  sharerDeviceId?: string
): Promise<CachedDevice> {
  await loadCache()

  const existing = localCache.get(deviceId)
  const now = Date.now()
  const cached: CachedDevice = {
    id: deviceId,
    name: deviceInfo.name || existing?.name || '未知设备',
    type: deviceInfo.type || existing?.type || 'unknown',
    category: deviceInfo.category || existing?.category || 'personal',
    protocol: deviceInfo.protocol || existing?.protocol || 'uwb',
    cardData: deviceInfo.cardData || existing?.cardData || null,
    position: deviceInfo.position || existing?.position,
    lastSync: existing?.lastSync || 0,
    lastSeen: now,
    firstSeen: existing?.firstSeen || now,
    dwellTime: existing ? existing.dwellTime + (now - existing.lastSeen) : 0,
    source: 'device',
    editable: existing?.editable ?? true,
    sharedAt: existing?.sharedAt || now,
    sharedBy: sharerDeviceId || existing?.sharedBy || 'unknown',
    sharedPosition: existing?.sharedPosition || existing?.position,
    scannedDeviceCount: existing?.scannedDeviceCount || 0,
    popularityScore: existing?.popularityScore || 0,
  }

  localCache.set(deviceId, cached)
  await saveCache()
  return cached
}

// 从服务器同步信息（用于备份和补充）
export async function syncFromServer(deviceId: string, serverData: any): Promise<CachedDevice | null> {
  await loadCache()

  const existing = localCache.get(deviceId)
  // 如果设备有实时数据且比服务器新，保留设备数据
  if (existing && existing.source === 'device' && existing.lastSeen > (serverData.lastUpdate || 0)) {
    return existing
  }

  const cached: CachedDevice = {
    id: deviceId,
    name: serverData.name || existing?.name || '未知设备',
    type: serverData.type || existing?.type || 'unknown',
    cardData: serverData.cardData || existing?.cardData || null,
    position: serverData.position || existing?.position,
    lastSync: Date.now(),
    lastSeen: existing?.lastSeen || 0,
    source: 'server',
    editable: existing?.editable ?? true,
  }

  localCache.set(deviceId, cached)
  await saveCache()
  return cached
}

// 用户编辑信息（保存到本地 + 标记需要同步到服务器）
export async function updateUserCard(deviceId: string, cardData: any): Promise<CachedDevice | null> {
  await loadCache()
  const existing = localCache.get(deviceId)
  if (!existing) return null

  existing.cardData = { ...existing.cardData, ...cardData }
  existing.source = 'user'
  existing.editable = true
  existing.lastSync = 0 // 标记需要同步

  localCache.set(deviceId, existing)
  await saveCache()
  return existing
}

// 获取单个设备缓存
export async function getCachedDevice(deviceId: string): Promise<CachedDevice | null> {
  await loadCache()
  return localCache.get(deviceId) || null
}

// 获取所有缓存设备
export async function getAllCachedDevices(): Promise<CachedDevice[]> {
  await loadCache()
  return Array.from(localCache.values())
}

// 获取需要同步到服务器的设备（source=user 且 lastSync=0）
export async function getDevicesToSync(): Promise<CachedDevice[]> {
  await loadCache()
  return Array.from(localCache.values()).filter(d => d.source === 'user' && d.lastSync === 0)
}

// 标记设备已同步
export async function markSynced(deviceId: string): Promise<void> {
  await loadCache()
  const device = localCache.get(deviceId)
  if (device) {
    device.lastSync = Date.now()
    await saveCache()
  }
}

// 清理过期缓存
export async function cleanExpiredCache(): Promise<void> {
  await loadCache()
  const now = Date.now()
  for (const [id, device] of localCache) {
    if (now - device.lastSeen > CACHE_EXPIRY) {
      localCache.delete(id)
    }
  }
  await saveCache()
}

// 获取缓存统计
export async function getCacheStats(): Promise<{ total: number; deviceSynced: number; needSync: number }> {
  await loadCache()
  const devices = Array.from(localCache.values())
  return {
    total: devices.length,
    deviceSynced: devices.filter(d => d.source === 'device' && d.lastSync > 0).length,
    needSync: devices.filter(d => d.source === 'user' && d.lastSync === 0).length,
  }
}

// 商用设备记录扫描到的个人设备
export async function recordPersonalDeviceScan(
  commercialDeviceId: string,
  personalDeviceId: string
): Promise<void> {
  await loadCache()
  const device = localCache.get(commercialDeviceId)
  if (!device) return

  device.scannedDeviceCount = (device.scannedDeviceCount || 0) + 1
  device.lastSeen = Date.now()
  device.dwellTime = device.dwellTime + 3000  // 每次扫描增加3秒停留时间

  // 计算热门评分: 扫描设备数权重0.6 + 停留时间权重0.4
  const dwellMinutes = device.dwellTime / 60000
  device.popularityScore = Math.round(
    (device.scannedDeviceCount || 0) * 60 + Math.min(dwellMinutes, 60) * 40
  )

  localCache.set(commercialDeviceId, device)
  await saveCache()
}

// 更新设备停留时间
export async function updateDwellTime(deviceId: string, additionalMs: number): Promise<void> {
  await loadCache()
  const device = localCache.get(deviceId)
  if (!device) return

  device.dwellTime += additionalMs
  device.lastSeen = Date.now()

  // 重新计算热门评分
  if (device.category === 'commercial') {
    const dwellMinutes = device.dwellTime / 60000
    device.popularityScore = Math.round(
      (device.scannedDeviceCount || 0) * 60 + Math.min(dwellMinutes, 60) * 40
    )
  }

  localCache.set(deviceId, device)
  await saveCache()
}

// 设置设备分类
export async function setDeviceCategory(
  deviceId: string,
  category: 'personal' | 'commercial'
): Promise<void> {
  await loadCache()
  const device = localCache.get(deviceId)
  if (!device) return

  device.category = category
  localCache.set(deviceId, device)
  await saveCache()
}

// 获取商用设备热门排名
export async function getCommercialRanking(): Promise<CachedDevice[]> {
  await loadCache()
  return Array.from(localCache.values())
    .filter(d => d.category === 'commercial')
    .sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0))
}
