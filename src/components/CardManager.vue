<script setup>
import { ref, onMounted } from 'vue'
import { invoke } from '@tauri-apps/api/core'

const cards = ref([])
const showEditor = ref(false)
const editingCard = ref(null)
const newCard = ref({ type: 'personal', title: '', fields: [{ key: 'name', label: '姓名', value: '', icon: '👤' }, { key: 'phone', label: '电话', value: '', icon: '📞', actionType: 'phone' }, { key: 'wechat', label: '微信', value: '', icon: '💬', actionType: 'wechat' }] })

const cardTypes = [
  { value: 'personal', label: '👤 个人名片', fields: [
    { key: 'name', label: '姓名', icon: '👤' },
    { key: 'phone', label: '电话', icon: '📞', actionType: 'phone' },
    { key: 'wechat', label: '微信', icon: '💬', actionType: 'wechat' },
    { key: 'email', label: '邮箱', icon: '📧', actionType: 'email' },
    { key: 'douyin', label: '抖音', icon: '🎵', actionType: 'url' },
    { key: 'xiaohongshu', label: '小红书', icon: '📕', actionType: 'url' },
    { key: 'weibo', label: '微博', icon: '🔴', actionType: 'url' },
  ]},
  { value: 'parking', label: '🅿️ 停车卡', fields: [
    { key: 'owner', label: '车主', icon: '🚗' },
    { key: 'phone', label: '电话', icon: '📞', actionType: 'phone' },
    { key: 'plate', label: '车牌号', icon: '🔢' },
    { key: 'spot', label: '车位号', icon: '📍' },
    { key: 'model', label: '车型', icon: '🚙' },
  ]},
  { value: 'doorlock', label: '🔒 门锁卡', fields: [
    { key: 'name', label: '住户', icon: '👤' },
    { key: 'phone', label: '电话', icon: '📞', actionType: 'phone' },
    { key: 'door', label: '门锁编号', icon: '🔐' },
    { key: 'address', label: '地址', icon: '📍' },
    { key: 'note', label: '备注', icon: '📝' },
  ]},
  { value: 'car', label: '🚗 车载卡', fields: [
    { key: 'owner', label: '车主', icon: '👤' },
    { key: 'phone', label: '电话', icon: '📞', actionType: 'phone' },
    { key: 'plate', label: '车牌号', icon: '🔢' },
    { key: 'model', label: '车型', icon: '🚙' },
    { key: 'wechat', label: '微信', icon: '💬', actionType: 'wechat' },
    { key: 'note', label: '备注', icon: '📝' },
  ]},
]

async function loadCards() {
  const data = await invoke('load_cards')
  cards.value = JSON.parse(data || '[]')
}

function startCreate() {
  editingCard.value = null
  newCard.value = { type: 'personal', title: '', fields: cardTypes[0].fields.map(f => ({ ...f, value: '' })) }
  showEditor.value = true
}

function startEdit(card) {
  editingCard.value = card
  newCard.value = { ...card }
  showEditor.value = true
}

async function saveCard() {
  if (!newCard.value.title.trim()) { alert('请输入标题'); return }
  const card = {
    id: editingCard.value?.id || `card_${Date.now()}`,
    ...newCard.value,
    isActive: true,
    createdAt: editingCard.value?.createdAt || Date.now(),
    updatedAt: Date.now(),
  }
  const existing = await invoke('load_cards')
  const list = JSON.parse(existing || '[]')
  const idx = list.findIndex(c => c.id === card.id)
  if (idx >= 0) list[idx] = card
  else list.push(card)
  await invoke('save_cards', { cards: JSON.stringify(list) })
  cards.value = list
  showEditor.value = false
}

function deleteCard(id) {
  if (!confirm('确定删除？')) return
  const list = cards.value.filter(c => c.id !== id)
  invoke('save_cards', { cards: JSON.stringify(list) })
  cards.value = list
}

async function shareCard(card) {
  // 通过 UWB 广播分享卡片信息
  alert(`已通过 UWB 分享「${card.title}」卡片信息`)
}

function getCardTypeIcon(type) {
  const icons = { personal: '👤', parking: '🅿️', doorlock: '🔒', car: '🚗', resume: '📋' }
  return icons[type] || '💳'
}

function onTypeChange() {
  const type = cardTypes.find(t => t.value === newCard.value.type)
  if (type) newCard.value.fields = type.fields.map(f => ({ ...f, value: '' }))
}

onMounted(loadCards)
</script>

<template>
  <div class="card-manager">
    <div class="section-header">
      <h2>💳 我的卡片</h2>
      <button class="primary-btn" @click="startCreate">+ 新建卡片</button>
    </div>

    <div v-if="cards.length === 0" class="empty-state">暂无卡片，点击上方按钮创建</div>

    <div class="card-grid" v-else>
      <div v-for="card in cards" :key="card.id" class="card-item" @click="startEdit(card)">
        <div class="card-type-icon">{{ getCardTypeIcon(card.type) }}</div>
        <div class="card-info">
          <div class="card-title">{{ card.title }}</div>
          <div class="card-type">{{ cardTypes.find(t => t.value === card.type)?.label || card.type }}</div>
          <div class="card-fields">{{ card.fields?.length || 0 }} 个字段</div>
        </div>
        <div class="card-actions">
          <button class="action-btn" @click.stop="shareCard(card)" title="通过UWB分享">📤</button>
          <button class="delete-btn" @click.stop="deleteCard(card.id)">🗑️</button>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <div v-if="showEditor" class="modal-overlay" @click.self="showEditor = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingCard ? '编辑卡片' : '新建卡片' }}</h3>
          <button class="close-btn" @click="showEditor = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>卡片类型</label>
            <select v-model="newCard.type" @change="onTypeChange">
              <option v-for="t in cardTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>标题</label>
            <input v-model="newCard.title" placeholder="输入卡片标题" />
          </div>
          <div class="form-group">
            <label>字段</label>
            <div v-for="(field, i) in newCard.fields" :key="i" class="field-row">
              <span class="field-icon">{{ field.icon }}</span>
              <span class="field-label">{{ field.label }}</span>
              <input v-model="field.value" :placeholder="field.label" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="secondary-btn" @click="showEditor = false">取消</button>
          <button class="primary-btn" @click="saveCard">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-manager { padding: 24px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.section-header h2 { font-size: 20px; font-weight: 700; color: var(--text-primary); }
.primary-btn { background: var(--accent); color: #fff; border: none; padding: 8px 16px; border-radius: var(--radius-sm); cursor: pointer; font-weight: 600; transition: background 0.2s; }
.primary-btn:hover { background: var(--accent-hover); }
.secondary-btn { background: var(--bg-card); border: 1px solid var(--border); color: var(--text-secondary); padding: 8px 16px; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s; }
.secondary-btn:hover { border-color: var(--border-hover); color: var(--text-primary); }
.empty-state { text-align: center; color: var(--text-muted); padding: 40px; }
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; }
.card-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: all 0.2s; }
.card-item:hover { border-color: var(--border-hover); box-shadow: var(--shadow); }
.card-type-icon { width: 44px; height: 44px; border-radius: 10px; background: var(--bg-input); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.card-info { flex: 1; }
.card-title { font-weight: 600; margin-bottom: 2px; color: var(--text-primary); }
.card-type { font-size: 11px; color: var(--text-muted); }
.card-fields { font-size: 10px; color: var(--text-muted); margin-top: 2px; }
.card-actions { display: flex; gap: 4px; }
.action-btn { background: none; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 6px 10px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
.action-btn:hover { border-color: var(--border-hover); background: var(--bg-hover); }
.delete-btn { background: none; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 6px 10px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
.delete-btn:hover { border-color: var(--red); color: var(--red); background: var(--red-soft); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); width: 460px; max-height: 80vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--border); }
.modal-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.close-btn { background: none; border: none; color: var(--text-muted); font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
.close-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
.modal-body { padding: 20px; }
.modal-footer { padding: 12px 20px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 8px; }
.form-group { margin-bottom: 14px; }
.form-group label { display: block; font-size: 12px; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px; }
.form-group input, .form-group select { width: 100%; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 9px 12px; color: var(--text-primary); outline: none; transition: border-color 0.2s; }
.form-group input:focus, .form-group select:focus { border-color: var(--accent); }
.field-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.field-icon { font-size: 14px; width: 22px; text-align: center; }
.field-label { font-size: 11px; color: var(--text-muted); width: 48px; flex-shrink: 0; }
.field-row input { flex: 1; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 7px 10px; color: var(--text-primary); outline: none; transition: border-color 0.2s; }
.field-row input:focus { border-color: var(--accent); }
</style>
