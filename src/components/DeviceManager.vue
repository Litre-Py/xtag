<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAllCachedDevices, updateUserCard, getCachedDevice, setDeviceCategory, getCommercialRanking } from '../services/CacheService'
import { syncDeviceToServer, updateDevicePosition } from '../services/ServerAPI'

const boundDevices = ref([])
const showEditor = ref(false)
const editingDevice = ref(null)
const editForm = ref({ name: '', type: 'personal', category: 'personal', fields: {} })
const commercialRanking = ref([])

const SELF_DEVICE_ID = 'self-uwb-device'

const personalDevices = computed(() => boundDevices.value.filter(d => d.category !== 'commercial'))
const commercialDevices = computed(() => boundDevices.value.filter(d => d.category === 'commercial'))

async function loadDevices() {
  boundDevices.value = await getAllCachedDevices()
  commercialRanking.value = await getCommercialRanking()
}

function startEdit(device) {
  editingDevice.value = device
  editForm.value = {
    name: device.name || '',
    type: device.type || 'personal',
    category: device.category || 'personal',
    fields: { ...(device.cardData || {}) },
  }
  showEditor.value = true
}

async function saveEdit() {
  if (!editingDevice.value) return
  await updateUserCard(editingDevice.value.id, editForm.value.fields)
  await setDeviceCategory(editingDevice.value.id, editForm.value.category)
  await syncDeviceToServer(editingDevice.value.id, editForm.value.fields)
  await loadDevices()
  showEditor.value = false
}

function bindNewDevice() {
  const id = `uwb-${Date.now()}`
  editingDevice.value = { id, name: '新设备', type: 'personal', category: 'personal', cardData: {} }
  editForm.value = { name: '新设备', type: 'personal', category: 'personal', fields: {} }
  showEditor.value = true
}

async function shareDevice(device) {
  await updateDevicePosition({
    deviceId: device.id,
    x: 0, y: 0, z: 0,
    timestamp: Date.now(),
  })
  alert(`已分享设备: ${device.name}`)
}

async function toggleCategory(device) {
  const newCategory = device.category === 'commercial' ? 'personal' : 'commercial'
  await setDeviceCategory(device.id, newCategory)
  await loadDevices()
}

function formatDate(ts) {
  return ts ? new Date(ts).toLocaleString('zh-CN') : '-'
}

function formatDwellTime(ms) {
  if (!ms) return '0s'
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m`
}

function getCategoryColor(category) {
  return category === 'commercial' ? '#ff9800' : '#4caf50'
}

function getCategoryLabel(category) {
  return category === 'commercial' ? '🏪 商用' : '👤 个人'
}

onMounted(loadDevices)
</script>

<template>
  <div class="device-manager">
    <div class="section-header">
      <h2>🔗 设备管理</h2>
      <button class="primary-btn" @click="bindNewDevice">+ 绑定新设备</button>
    </div>

    <div class="device-stats">
      <div class="stat-card">
        <div class="stat-value">{{ boundDevices.length }}</div>
        <div class="stat-label">已绑定</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: #4caf50">{{ personalDevices.length }}</div>
        <div class="stat-label">👤 个人设备</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: #ff9800">{{ commercialDevices.length }}</div>
        <div class="stat-label">🏪 商用设备</div>
      </div>
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

    <div v-if="boundDevices.length === 0" class="empty-state">暂无绑定设备</div>

    <div class="device-list" v-else>
      <div v-for="device in boundDevices" :key="device.id" class="device-item">
        <div class="device-icon">{{ device.type === 'personal' ? '👤' : device.type === 'parking' ? '🅿️' : device.type === 'commercial' ? '🏪' : '📋' }}</div>
        <div class="device-info">
          <div class="device-name">
            {{ device.name }}
            <span class="category-tag" :style="{ background: getCategoryColor(device.category) + '20', color: getCategoryColor(device.category) }">
              {{ getCategoryLabel(device.category) }}
            </span>
          </div>
          <div class="device-meta">
            {{ device.type }} ·
            分享: {{ formatDate(device.sharedAt) }} ·
            来自: {{ device.sharedBy || '本机' }}
          </div>
          <div class="device-meta" v-if="device.sharedPosition">
            📍 位置: ({{ device.sharedPosition.x }}, {{ device.sharedPosition.y }})
          </div>
          <div class="device-meta" v-if="device.dwellTime > 0">
            ⏱️ 停留: {{ formatDwellTime(device.dwellTime) }}
          </div>
        </div>
        <div class="device-actions">
          <button class="action-btn toggle" @click="toggleCategory(device)" :title="device.category === 'commercial' ? '切换为个人' : '切换为商用'">
            {{ device.category === 'commercial' ? '👤' : '🏪' }}
          </button>
          <button class="action-btn edit" @click="startEdit(device)">✏️</button>
          <button class="action-btn share" @click="shareDevice(device)">📤</button>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <div v-if="showEditor" class="modal-overlay" @click.self="showEditor = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingDevice?.id ? '编辑设备' : '绑定新设备' }}</h3>
          <button class="close-btn" @click="showEditor = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>设备名称</label>
            <input v-model="editForm.name" placeholder="输入设备名称" />
          </div>
          <div class="form-group">
            <label>设备类型</label>
            <select v-model="editForm.type">
              <option value="personal">👤 个人名片</option>
              <option value="parking">🅿️ 停车卡</option>
              <option value="resume">📋 简历</option>
            </select>
          </div>
          <div class="form-group">
            <label>设备分类</label>
            <select v-model="editForm.category">
              <option value="personal">👤 个人设备</option>
              <option value="commercial">🏪 商用设备</option>
            </select>
          </div>
          <div class="form-group">
            <label>备注信息</label>
            <textarea v-model="editForm.fields.note" placeholder="输入备注"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="secondary-btn" @click="showEditor = false">取消</button>
          <button class="primary-btn" @click="saveEdit">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.device-manager { padding: 24px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.section-header h2 { font-size: 20px; font-weight: 700; color: var(--text-primary); }
.primary-btn { background: var(--accent); color: #fff; border: none; padding: 8px 16px; border-radius: var(--radius-sm); cursor: pointer; font-weight: 600; transition: background 0.2s; }
.primary-btn:hover { background: var(--accent-hover); }
.secondary-btn { background: var(--bg-card); border: 1px solid var(--border); color: var(--text-secondary); padding: 8px 16px; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s; }
.secondary-btn:hover { border-color: var(--border-hover); color: var(--text-primary); }
.empty-state { text-align: center; color: var(--text-muted); padding: 40px; }
.device-stats { display: flex; gap: 10px; margin-bottom: 20px; }
.stat-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; flex: 1; text-align: center; }
.stat-value { font-size: 24px; font-weight: 700; color: var(--accent); }
.stat-label { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
.device-list { display: flex; flex-direction: column; gap: 8px; }
.device-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px; display: flex; align-items: center; gap: 12px; transition: all 0.2s; }
.device-item:hover { border-color: var(--border-hover); }
.device-icon { font-size: 24px; }
.device-info { flex: 1; }
.device-name { font-weight: 600; color: var(--text-primary); }
.device-meta { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.device-actions { display: flex; gap: 4px; }
.action-btn { background: none; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 6px 10px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
.action-btn:hover { border-color: var(--border-hover); background: var(--bg-hover); }
.action-btn.toggle { border-color: var(--orange); color: var(--orange); }
.action-btn.toggle:hover { background: var(--orange-soft); }
.category-tag { padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 6px; }
.ranking-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; margin-bottom: 20px; }
.ranking-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.ranking-icon { font-size: 20px; }
.ranking-title { font-weight: 600; font-size: 15px; color: var(--text-primary); }
.ranking-item { display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-input); border-radius: var(--radius-sm); margin-bottom: 8px; }
.rank-badge { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; background: var(--border); color: var(--text-muted); }
.rank-1 { background: var(--orange); color: #fff; }
.rank-2 { background: var(--blue); color: #fff; }
.rank-3 { background: var(--green); color: #fff; }
.rank-name { flex: 1; font-weight: 600; font-size: 13px; color: var(--text-primary); }
.rank-score { color: var(--orange); font-size: 12px; }
.rank-count { color: var(--green); font-size: 12px; }
.rank-dwell { color: var(--accent); font-size: 12px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); width: 400px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--border); }
.modal-body { padding: 20px; }
.modal-footer { padding: 12px 20px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 8px; }
.form-group { margin-bottom: 12px; }
.form-group label { display: block; font-size: 12px; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px; }
.form-group input, .form-group select, .form-group textarea { width: 100%; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 9px 12px; color: var(--text-primary); outline: none; transition: border-color 0.2s; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--accent); }
.close-btn { background: none; border: none; color: var(--text-muted); font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
.close-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
</style>
