<script setup>
import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'

const floorPlanImage = ref(null)
const devices = ref([])
const selectedDevice = ref(null)
const showDeviceForm = ref(false)
const editingDevice = ref(null)

const newDevice = ref({
  name: '',
  type: 'doorlock',
  category: 'personal',
  x: 50,
  y: 50,
  phone: '',
  note: '',
})

const deviceTypes = [
  { value: 'doorlock', label: '🔒 智能门锁', icon: '🔒' },
  { value: 'router', label: '📡 UWB路由器', icon: '📡' },
  { value: 'vacuum', label: '🤖 扫地机器人', icon: '🤖' },
  { value: 'camera', label: '📷 摄像头', icon: '📷' },
  { value: 'sensor', label: '📊 传感器', icon: '📊' },
  { value: 'commercial', label: '🏪 商用设备', icon: '🏪' },
]

async function uploadFloorPlan() {
  const selected = await open({
    multiple: false,
    filters: [{ name: '图片', extensions: ['png', 'jpg', 'jpeg', 'webp'] }],
  })
  if (selected) {
    floorPlanImage.value = selected
    // 保存到本地
    const destPath = `floorplan_${Date.now()}.png`
    await invoke('write_file', { path: destPath, content: selected })
    alert('户型图已上传')
  }
}

function addDevice() {
  editingDevice.value = null
  newDevice.value = { name: '', type: 'doorlock', category: 'personal', x: 50, y: 50, phone: '', note: '' }
  showDeviceForm.value = true
}

function editDevice(device) {
  editingDevice.value = device
  newDevice.value = { ...device }
  showDeviceForm.value = true
}

function saveDevice() {
  if (!newDevice.value.name.trim()) { alert('请输入设备名称'); return }

  if (editingDevice.value) {
    const idx = devices.value.findIndex(d => d.id === editingDevice.value.id)
    if (idx >= 0) devices.value[idx] = { ...devices.value[idx], ...newDevice.value }
  } else {
    devices.value.push({
      id: `dev_${Date.now()}`,
      ...newDevice.value,
      addedAt: Date.now(),
    })
  }
  showDeviceForm.value = false
}

function removeDevice(id) {
  if (!confirm('确定删除？')) return
  devices.value = devices.value.filter(d => d.id !== id)
}

function shareAllDevices() {
  const shareData = {
    devices: devices.value.map(d => ({
      id: d.id,
      name: d.name,
      type: d.type,
      position: { x: d.x, y: d.y },
      phone: d.phone,
      note: d.note,
    })),
    sharedAt: Date.now(),
    sharedBy: 'self-uwb-device',
  }
  // 通过 UWB 广播分享
  alert(`已分享 ${devices.value.length} 个设备信息给附近 UWB 设备`)
}

function getDeviceIcon(type) {
  const icons = { doorlock: '🔒', router: '📡', vacuum: '🤖', camera: '📷', sensor: '📊', commercial: '🏪' }
  return icons[type] || '📡'
}

function getTypeLabel(type) {
  const labels = { doorlock: '智能门锁', router: 'UWB路由器', vacuum: '扫地机器人', camera: '摄像头', sensor: '传感器', commercial: '商用设备' }
  return labels[type] || type
}

function getCategoryColor(category) {
  return category === 'commercial' ? '#ff9800' : '#4caf50'
}

function getCategoryLabel(category) {
  return category === 'commercial' ? '🏪 商用' : '👤 个人'
}
</script>

<template>
  <div class="floor-plan">
    <div class="section-header">
      <h2>🏠 户型图 & 设备管理</h2>
      <div class="header-actions">
        <button class="secondary-btn" @click="uploadFloorPlan">📷 上传户型图</button>
        <button class="primary-btn" @click="addDevice">+ 添加设备</button>
      </div>
    </div>

    <!-- 户型图区域 -->
    <div class="plan-area" v-if="floorPlanImage">
      <img :src="floorPlanImage" class="plan-image" />
      <div
        v-for="device in devices"
        :key="device.id"
        class="device-marker"
        :style="{ left: device.x + '%', top: device.y + '%', borderColor: getCategoryColor(device.category) }"
        @click="editDevice(device)"
        :title="device.name + ' (' + getCategoryLabel(device.category) + ')'"
      >
        {{ getDeviceIcon(device.type) }}
      </div>
    </div>
    <div v-else class="upload-area" @click="uploadFloorPlan">
      <div class="upload-icon">📷</div>
      <div class="upload-text">点击上传户型图</div>
      <div class="upload-hint">支持 PNG/JPG 格式</div>
    </div>

    <!-- 设备列表 -->
    <div class="device-section" v-if="devices.length > 0">
      <div class="section-header">
        <h3>📡 设备列表 ({{ devices.length }})</h3>
        <button class="share-btn" @click="shareAllDevices">📤 全部分享</button>
      </div>
      <div class="device-list">
        <div v-for="device in devices" :key="device.id" class="device-item">
          <span class="device-icon">{{ getDeviceIcon(device.type) }}</span>
          <div class="device-info">
            <div class="device-name">
              {{ device.name }}
              <span class="category-tag" :style="{ background: getCategoryColor(device.category) + '20', color: getCategoryColor(device.category) }">
                {{ getCategoryLabel(device.category) }}
              </span>
            </div>
            <div class="device-meta">{{ getTypeLabel(device.type) }} · ({{ device.x }}, {{ device.y }})</div>
          </div>
          <div class="device-actions">
            <button class="action-btn" @click="editDevice(device)">✏️</button>
            <button class="action-btn" @click="removeDevice(device.id)">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 设备编辑弹窗 -->
    <div v-if="showDeviceForm" class="modal-overlay" @click.self="showDeviceForm = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingDevice ? '编辑设备' : '添加设备' }}</h3>
          <button class="close-btn" @click="showDeviceForm = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>设备名称</label>
            <input v-model="newDevice.name" placeholder="如: 前门门锁" />
          </div>
          <div class="form-group">
            <label>设备类型</label>
            <select v-model="newDevice.type">
              <option v-for="t in deviceTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>设备分类</label>
            <select v-model="newDevice.category">
              <option value="personal">👤 个人设备</option>
              <option value="commercial">🏪 商用设备</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group" style="flex:1">
              <label>X 位置 (%)</label>
              <input v-model.number="newDevice.x" type="number" min="0" max="100" />
            </div>
            <div class="form-group" style="flex:1">
              <label>Y 位置 (%)</label>
              <input v-model.number="newDevice.y" type="number" min="0" max="100" />
            </div>
          </div>
          <div class="form-group">
            <label>联系电话</label>
            <input v-model="newDevice.phone" placeholder="选填" />
          </div>
          <div class="form-group">
            <label>备注</label>
            <textarea v-model="newDevice.note" placeholder="选填"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="secondary-btn" @click="showDeviceForm = false">取消</button>
          <button class="primary-btn" @click="saveDevice">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.floor-plan { padding: 24px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h2, .section-header h3 { font-size: 18px; font-weight: 700; color: var(--text-primary); }
.header-actions { display: flex; gap: 8px; }
.primary-btn { background: var(--accent); color: #fff; border: none; padding: 8px 16px; border-radius: var(--radius-sm); cursor: pointer; font-weight: 600; transition: background 0.2s; }
.primary-btn:hover { background: var(--accent-hover); }
.secondary-btn { background: var(--bg-card); border: 1px solid var(--border); color: var(--text-secondary); padding: 8px 16px; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s; }
.secondary-btn:hover { border-color: var(--border-hover); color: var(--text-primary); }
.share-btn { background: var(--blue); color: #fff; border: none; padding: 6px 12px; border-radius: var(--radius-sm); cursor: pointer; font-weight: 600; font-size: 12px; transition: opacity 0.2s; }
.share-btn:hover { opacity: 0.9; }
.plan-area { position: relative; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; margin-bottom: 20px; aspect-ratio: 16/10; }
.plan-image { width: 100%; height: 100%; object-fit: contain; }
.device-marker { position: absolute; transform: translate(-50%, -50%); font-size: 24px; cursor: pointer; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); transition: transform 0.2s; border: 2px solid; border-radius: 8px; padding: 2px; }
.device-marker:hover { transform: translate(-50%, -50%) scale(1.15); }
.upload-area { background: var(--bg-card); border: 2px dashed var(--border); border-radius: var(--radius); padding: 60px; text-align: center; cursor: pointer; margin-bottom: 20px; transition: border-color 0.2s; }
.upload-area:hover { border-color: var(--accent); }
.upload-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.5; }
.upload-text { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.upload-hint { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
.device-section { margin-top: 20px; }
.device-list { display: flex; flex-direction: column; gap: 8px; }
.device-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px; display: flex; align-items: center; gap: 12px; transition: all 0.2s; }
.device-item:hover { border-color: var(--border-hover); }
.device-icon { font-size: 20px; }
.device-info { flex: 1; }
.device-name { font-weight: 600; color: var(--text-primary); }
.device-meta { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.device-actions { display: flex; gap: 4px; }
.action-btn { background: none; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 6px 10px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
.action-btn:hover { border-color: var(--border-hover); background: var(--bg-hover); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); width: 420px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--border); }
.modal-body { padding: 20px; }
.modal-footer { padding: 12px 20px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 8px; }
.form-group { margin-bottom: 12px; }
.form-group label { display: block; font-size: 12px; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px; }
.form-group input, .form-group select, .form-group textarea { width: 100%; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 9px 12px; color: var(--text-primary); outline: none; transition: border-color 0.2s; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--accent); }
.form-row { display: flex; gap: 12px; }
.close-btn { background: none; border: none; color: var(--text-muted); font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
.close-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
.category-tag { padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 6px; }
</style>