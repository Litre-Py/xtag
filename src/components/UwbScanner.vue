<script setup>
import { ref, onUnmounted } from 'vue'
import { queryDeviceInfo, updateDevicePosition } from '../services/ServerAPI'
import { cacheDeviceFromScan, getAllCachedDevices, getCacheStats, getCommercialRanking, updateDwellTime } from '../services/CacheService'

// 扫描协议：uwb/nearlink/bluetooth/wifi
const protocol = ref('uwb')
// 扫描模式：active=主动扫描, passive=被动监听
const scanMode = ref('active')
const scanning = ref(false)
const devices = ref([])
const lastEvent = ref(null)
const deviceDetails = ref({})
const cacheStats = ref({ total: 0, deviceSynced: 0, needSync: 0 })
const selfPosition = ref({ x: 0, y: 0, z: 0 })
const commercialRanking = ref([])
const dwellTimers = ref({})

let scanTimer = null
let positionTimer = null

// 各协议模拟设备数据
const MOCK_DEVICES = {
  uwb: [
    { id: 'uwb-001', name: '张三的卡片', type: 'personal', category: 'personal', distance: 1.2, signal: -45, protocol: 'uwb' },
    { id: 'uwb-002', name: '李四的停车卡', type: 'parking', category: 'personal', distance: 2.5, signal: -52, protocol: 'uwb' },
    { id: 'uwb-003', name: '王五的简历', type: 'resume', category: 'personal', distance: 0.8, signal: -38, protocol: 'uwb' },
    { id: 'uwb-100', name: '星巴克门店', type: 'commercial', category: 'commercial', distance: 3.0, signal: -55, protocol: 'uwb' },
    { id: 'uwb-101', name: '商场入口', type: 'commercial', category: 'commercial', distance: 5.0, signal: -60, protocol: 'uwb' },
  ],
  nearlink: [
    { id: 'nl-001', name: '华为Mate 70', type: 'personal', category: 'personal', distance: 0.3, signal: -30, protocol: 'nearlink' },
    { id: 'nl-002', name: '华为Watch GT5', type: 'personal', category: 'personal', distance: 0.6, signal: -35, protocol: 'nearlink' },
    { id: 'nl-003', name: '华为FreeBuds Pro 4', type: 'personal', category: 'personal', distance: 0.4, signal: -32, protocol: 'nearlink' },
    { id: 'nl-004', name: '华为路由器BE7', type: 'personal', category: 'personal', distance: 4.0, signal: -48, protocol: 'nearlink' },
    { id: 'nl-100', name: '华为智能门锁', type: 'commercial', category: 'commercial', distance: 2.0, signal: -40, protocol: 'nearlink' },
    { id: 'nl-101', name: '华为智慧屏', type: 'commercial', category: 'commercial', distance: 3.5, signal: -45, protocol: 'nearlink' },
    { id: 'nl-102', name: '商场星闪信标', type: 'commercial', category: 'commercial', distance: 6.0, signal: -55, protocol: 'nearlink' },
  ],
  bluetooth: [
    { id: 'ble-001', name: 'AirPods Pro', type: 'personal', category: 'personal', distance: 0.5, signal: -35, protocol: 'bluetooth' },
    { id: 'ble-002', name: '小米手环8', type: 'personal', category: 'personal', distance: 1.0, signal: -42, protocol: 'bluetooth' },
    { id: 'ble-003', name: '华为蓝牙音箱', type: 'personal', category: 'personal', distance: 2.0, signal: -50, protocol: 'bluetooth' },
    { id: 'ble-100', name: '共享充电宝-怪兽', type: 'commercial', category: 'commercial', distance: 3.5, signal: -58, protocol: 'bluetooth' },
    { id: 'ble-101', name: '商场Beacon', type: 'commercial', category: 'commercial', distance: 8.0, signal: -72, protocol: 'bluetooth' },
    { id: 'ble-102', name: '便利店门禁', type: 'commercial', category: 'commercial', distance: 4.2, signal: -62, protocol: 'bluetooth' },
  ],
  wifi: [
    { id: 'wifi-001', name: 'TP-Link_A8F2', type: 'personal', category: 'personal', distance: 3.0, signal: -45, protocol: 'wifi' },
    { id: 'wifi-002', name: 'Redmi路由器', type: 'personal', category: 'personal', distance: 5.0, signal: -55, protocol: 'wifi' },
    { id: 'wifi-100', name: 'CMCC-FreeWiFi', type: 'commercial', category: 'commercial', distance: 10.0, signal: -65, protocol: 'wifi' },
    { id: 'wifi-101', name: '星巴克-WiFi', type: 'commercial', category: 'commercial', distance: 8.0, signal: -58, protocol: 'wifi' },
    { id: 'wifi-102', name: 'ChinaNet-5G', type: 'commercial', category: 'commercial', distance: 12.0, signal: -70, protocol: 'wifi' },
    { id: 'wifi-103', name: '商场访客网络', type: 'commercial', category: 'commercial', distance: 15.0, signal: -75, protocol: 'wifi' },
  ],
}

// 当前协议的模拟设备
const currentMockDevices = ref([])

// 协议配置
const protocols = [
  { id: 'uwb', label: '📡 UWB', color: 'var(--accent)' },
  { id: 'nearlink', label: '✨ 星闪', color: '#a855f7' },
  { id: 'bluetooth', label: '🔵 蓝牙', color: '#3b82f6' },
  { id: 'wifi', label: '📶 WiFi', color: '#22c55e' },
]

// 加载缓存设备
async function loadCachedDevices() {
  const cachedDevices = await getAllCachedDevices()
  for (const cd of cachedDevices) {
    devices.value.push({
      id: cd.id, name: cd.name, type: cd.type, category: cd.category || 'personal',
      distance: cd.position ? Math.sqrt((cd.position.x || 0) ** 2 + (cd.position.y || 0) ** 2) : 5,
      signal: -50, discoveredAt: cd.lastSeen, _cached: true,
      dwellTime: cd.dwellTime || 0, protocol: cd.protocol || 'uwb',
    })
    deviceDetails.value[cd.id] = cd
  }
}

// 开始扫描
async function startScan() {
  scanning.value = true
  devices.value = []
  lastEvent.value = null
  deviceDetails.value = {}
  cacheStats.value = await getCacheStats()
  commercialRanking.value = await getCommercialRanking()

  // 加载缓存
  await loadCachedDevices()

  // 加载当前协议的模拟设备
  currentMockDevices.value = [...MOCK_DEVICES[protocol.value]]
  let idx = 0

  // 根据协议调整扫描间隔
  const interval = protocol.value === 'uwb' ? 2000 : protocol.value === 'bluetooth' ? 3000 : 4000

  scanTimer = setInterval(async () => {
    if (idx < currentMockDevices.value.length) {
      const mock = currentMockDevices.value[idx]
      const device = { ...mock, discoveredAt: Date.now(), scanType: scanMode.value }
      devices.value.push(device)
      lastEvent.value = { type: scanMode.value === 'active' ? 'active_discovered' : 'passive_received', device, time: new Date() }

      const cached = await cacheDeviceFromScan(device.id, { name: device.name, type: device.type, category: device.category, protocol: device.protocol })
      deviceDetails.value[device.id] = cached
      startDwellTracking(device.id)

      await updateDevicePosition({ deviceId: device.id, x: Math.random() * 20, y: Math.random() * 20, z: 0, timestamp: Date.now() })
      idx++
    } else {
      for (const d of devices.value) {
        d.distance = Math.max(0.3, d.distance + (Math.random() - 0.5) * 0.5)
        d.signal = d.signal + Math.round((Math.random() - 0.5) * 5)
        await updateDevicePosition({ deviceId: d.id, x: Math.random() * 20, y: Math.random() * 20, z: 0, timestamp: Date.now() })
      }
    }
    updateSelfPosition()
    commercialRanking.value = await getCommercialRanking()
    cacheStats.value = await getCacheStats()
  }, interval)
}

// 停止扫描
function stopScan() {
  scanning.value = false
  if (scanTimer) { clearInterval(scanTimer); scanTimer = null }
  if (positionTimer) { clearInterval(positionTimer); positionTimer = null }
  stopDwellTracking()
}

// 切换协议时重置
function switchProtocol(p) {
  protocol.value = p
  if (scanning.value) {
    stopScan()
    startScan()
  }
}

// 追踪设备停留时间
function startDwellTracking(deviceId) {
  if (dwellTimers.value[deviceId]) return
  dwellTimers.value[deviceId] = setInterval(async () => {
    await updateDwellTime(deviceId, 1000)
    const device = devices.value.find(d => d.id === deviceId)
    if (device) device.dwellTime = (device.dwellTime || 0) + 1000
  }, 1000)
}

function stopDwellTracking() {
  for (const id of Object.keys(dwellTimers.value)) {
    clearInterval(dwellTimers.value[id])
    delete dwellTimers.value[id]
  }
}

function formatDwellTime(ms) {
  if (!ms) return '0s'
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m${seconds % 60}s`
}

function getCategoryLabel(category) {
  return category === 'commercial' ? '🏪 商用' : '👤 个人'
}

function getCategoryColor(category) {
  return category === 'commercial' ? 'var(--orange)' : 'var(--green)'
}

function getProtocolIcon(p) {
  const icons = { uwb: '📡', nearlink: '✨', bluetooth: '🔵', wifi: '📶' }
  return icons[p] || '📡'
}

function getProtocolLabel(p) {
  const labels = { uwb: 'UWB', nearlink: '星闪', bluetooth: '蓝牙', wifi: 'WiFi' }
  return labels[p] || p
}

function updateSelfPosition() {
  selfPosition.value = {
    x: Math.round((Math.random() * 20) * 100) / 100,
    y: Math.round((Math.random() * 20) * 100) / 100,
    z: 0,
  }
}

function getDistanceColor(d) {
  if (d < 1.5) return 'var(--green)'
  if (d < 3) return 'var(--orange)'
  return 'var(--red)'
}

function getTypeIcon(type) {
  const icons = { personal: '👤', parking: '🅿️', resume: '📋' }
  return icons[type] || '📡'
}

// 获取信号强度等级
function getSignalLevel(signal) {
  if (signal > -40) return '极强'
  if (signal > -55) return '强'
  if (signal > -70) return '中'
  return '弱'
}

onUnmounted(stopScan)
</script>

<template>
  <div class="scanner">
    <div class="section-header">
      <h2>📡 设备扫描</h2>
      <div class="header-actions">
        <button :class="['scan-btn', { scanning }]" @click="scanning ? stopScan() : startScan()">
          {{ scanning ? '⏹️ 停止' : '▶️ 开始扫描' }}
        </button>
      </div>
    </div>

    <!-- 协议选择 -->
    <div class="protocol-bar">
      <button
        v-for="p in protocols"
        :key="p.id"
        :class="['protocol-chip', { active: protocol === p.id }]"
        @click="switchProtocol(p.id)"
      >
        <span class="protocol-icon">{{ p.label.split(' ')[0] }}</span>
        <span>{{ p.label.split(' ')[1] }}</span>
        <span class="protocol-count" v-if="scanning && protocol === p.id">
          {{ devices.filter(d => d.protocol === p.id).length }}
        </span>
      </button>
    </div>

    <!-- 扫描模式 -->
    <div class="mode-bar">
      <div class="mode-toggle">
        <button :class="['mode-btn', { active: scanMode === 'active' }]" @click="scanMode = 'active'">📡 主动</button>
        <button :class="['mode-btn', { active: scanMode === 'passive' }]" @click="scanMode = 'passive'">👂 被动</button>
      </div>
      <div class="mode-info">
        <span class="mode-label">{{ getProtocolLabel(protocol) }}协议</span>
        <span class="mode-dot" :style="{ background: protocols.find(p => p.id === protocol)?.color }"></span>
      </div>
    </div>

    <!-- 自身位置 -->
    <div class="self-position" v-if="scanning">
      <span class="pos-label">📍 自身位置</span>
      <span class="pos-value">X: {{ selfPosition.x }} Y: {{ selfPosition.y }}</span>
    </div>

    <!-- 最新事件 -->
    <div v-if="lastEvent" class="event-bar">
      <span class="event-dot"></span>
      {{ lastEvent.type === 'active_discovered' ? '📡 发现' : '👂 接收' }}:
      {{ lastEvent.device.name }} ({{ lastEvent.device.distance.toFixed(1) }}m)
    </div>

    <!-- 缓存统计 -->
    <div class="cache-bar" v-if="cacheStats.total > 0">
      <span class="cache-label">📦 缓存</span>
      <span>{{ cacheStats.total }} 设备</span>
      <span class="cache-synced">✅ {{ cacheStats.deviceSynced }} 已同步</span>
      <span class="cache-pending" v-if="cacheStats.needSync > 0">⏳ {{ cacheStats.needSync }} 待同步</span>
    </div>

    <!-- 商用设备热门排名 -->
    <div v-if="commercialRanking.length > 0" class="ranking-section">
      <div class="ranking-header">
        <span class="ranking-icon">🏆</span>
        <span class="ranking-title">商用设备热门排名</span>
      </div>
      <div v-for="(device, index) in commercialRanking" :key="device.id" class="ranking-item">
        <span class="rank-badge" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
        <span class="rank-name">{{ device.name }}</span>
        <span class="rank-score">🔥 {{ device.popularityScore || 0 }}</span>
        <span class="rank-count">👥 {{ device.scannedDeviceCount || 0 }}人</span>
        <span class="rank-dwell">⏱️ {{ formatDwellTime(device.dwellTime) }}</span>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="devices.length === 0" class="empty-state">
      {{ scanning ? '扫描中...' : '选择协议并开始扫描' }}
    </div>

    <!-- 设备列表 -->
    <div class="device-list" v-else>
      <div v-for="device in devices" :key="device.id" class="device-item">
        <div class="device-icon" :style="{ color: getDistanceColor(device.distance) }">
          {{ getTypeIcon(device.type) }}
        </div>
        <div class="device-info">
          <div class="device-name">
            {{ device.name }}
            <span class="protocol-tag">{{ getProtocolIcon(device.protocol) }}</span>
            <span class="category-tag" :style="{ background: getCategoryColor(device.category) + '20', color: getCategoryColor(device.category) }">
              {{ getCategoryLabel(device.category) }}
            </span>
          </div>
          <div class="device-meta">
            <span class="meta-item">{{ device.distance.toFixed(1) }}m</span>
            <span class="meta-sep">·</span>
            <span class="meta-item">{{ device.signal }}dBm</span>
            <span class="meta-sep">·</span>
            <span class="meta-item">{{ getSignalLevel(device.signal) }}</span>
            <span class="scan-badge" v-if="device.scanType">{{ device.scanType === 'active' ? '主动' : '被动' }}</span>
          </div>
          <div class="device-dwell" v-if="device.dwellTime > 0">
            ⏱️ 停留: {{ formatDwellTime(device.dwellTime) }}
          </div>
          <div v-if="deviceDetails[device.id]" class="device-detail">
            <span class="detail-tag">已同步</span>
            {{ deviceDetails[device.id].cardData?.name || deviceDetails[device.id].cardData?.owner || '' }}
          </div>
        </div>
        <div class="device-distance" :style="{ color: getDistanceColor(device.distance) }">
          {{ device.distance.toFixed(1) }}m
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scanner { padding: 24px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h2 { font-size: 20px; font-weight: 700; color: var(--text-primary); }

/* 协议选择 */
.protocol-bar { display: flex; gap: 8px; margin-bottom: 12px; }
.protocol-chip {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px 12px; background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); cursor: pointer; transition: all 0.2s;
  font-size: 13px; font-weight: 500; color: var(--text-secondary);
}
.protocol-chip:hover { border-color: var(--border-hover); color: var(--text-primary); }
.protocol-chip.active { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); font-weight: 600; }
.protocol-icon { font-size: 16px; }
.protocol-count {
  background: var(--accent); color: #fff; font-size: 10px; font-weight: 700;
  padding: 1px 6px; border-radius: 10px; min-width: 18px; text-align: center;
}

/* 模式选择 */
.mode-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.mode-toggle { display: flex; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; }
.mode-btn { background: none; border: none; color: var(--text-muted); padding: 8px 14px; font-size: 12px; cursor: pointer; transition: all 0.2s; }
.mode-btn.active { background: var(--accent); color: #fff; }
.mode-info { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); }
.mode-dot { width: 8px; height: 8px; border-radius: 50%; }

/* 扫描按钮 */
.scan-btn { background: var(--accent); color: #fff; border: none; padding: 8px 16px; border-radius: var(--radius-sm); cursor: pointer; font-weight: 600; transition: all 0.2s; }
.scan-btn.scanning { background: var(--red); animation: pulse 1.5s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }

/* 状态栏 */
.self-position { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 10px; font-size: 12px; color: var(--text-secondary); display: flex; align-items: center; gap: 10px; }
.pos-label { font-weight: 600; color: var(--text-primary); }
.pos-value { font-family: monospace; color: var(--accent); }
.event-bar { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 10px; font-size: 12px; color: var(--text-secondary); display: flex; align-items: center; gap: 8px; }
.event-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); animation: pulse 1s infinite; }
.empty-state { text-align: center; color: var(--text-muted); padding: 40px; }
.cache-bar { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 10px; font-size: 12px; color: var(--text-secondary); display: flex; align-items: center; gap: 10px; }
.cache-label { font-weight: 600; color: var(--text-primary); }
.cache-synced { color: var(--green); }
.cache-pending { color: var(--orange); }

/* 排名 */
.ranking-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px; margin-bottom: 12px; }
.ranking-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.ranking-icon { font-size: 18px; }
.ranking-title { font-weight: 600; font-size: 14px; color: var(--text-primary); }
.ranking-item { display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-input); border-radius: var(--radius-sm); margin-bottom: 6px; }
.rank-badge { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; background: var(--border); color: var(--text-muted); }
.rank-1 { background: var(--orange); color: #fff; }
.rank-2 { background: var(--blue); color: #fff; }
.rank-3 { background: var(--green); color: #fff; }
.rank-name { flex: 1; font-weight: 600; font-size: 13px; color: var(--text-primary); }
.rank-score { color: var(--orange); font-size: 12px; }
.rank-count { color: var(--green); font-size: 12px; }
.rank-dwell { color: var(--accent); font-size: 12px; }

/* 设备列表 */
.device-list { display: flex; flex-direction: column; gap: 8px; }
.device-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px; display: flex; align-items: center; gap: 12px; transition: all 0.2s; }
.device-item:hover { border-color: var(--border-hover); }
.device-icon { font-size: 24px; }
.device-info { flex: 1; }
.device-name { font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.protocol-tag { font-size: 12px; }
.category-tag { padding: 2px 6px; border-radius: 4px; font-size: 10px; }
.device-meta { font-size: 12px; color: var(--text-muted); margin-top: 4px; display: flex; align-items: center; gap: 4px; }
.meta-item { }
.meta-sep { color: var(--border); }
.device-detail { font-size: 11px; color: var(--green); margin-top: 4px; }
.detail-tag { background: var(--green-soft); color: var(--green); padding: 1px 6px; border-radius: 4px; font-size: 10px; margin-right: 4px; }
.device-distance { font-size: 18px; font-weight: 700; }
.scan-badge { background: var(--accent-soft); color: var(--accent); padding: 1px 6px; border-radius: 4px; font-size: 10px; margin-left: 4px; }
.device-dwell { font-size: 11px; color: var(--orange); margin-top: 2px; }
</style>
