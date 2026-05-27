<script setup>
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'

const files = ref([])
const uploading = ref(false)

async function selectFile() {
  const selected = await open({ multiple: true })
  if (!selected) return

  for (const filePath of selected) {
    const name = filePath.split(/[/\\]/).pop()
    files.value.push({
      id: `file_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name,
      path: filePath,
      size: 0,
      sharedAt: Date.now(),
      status: 'ready',
    })
  }
}

function removeFile(id) {
  files.value = files.value.filter(f => f.id !== id)
}

function formatDate(ts) {
  return new Date(ts).toLocaleString('zh-CN')
}
</script>

<template>
  <div class="file-share">
    <div class="section-header">
      <h2>📁 文件分享</h2>
      <button class="primary-btn" @click="selectFile">+ 选择文件</button>
    </div>

    <div v-if="files.length === 0" class="empty-state">
      选择文件通过 UWB 分享给附近设备
    </div>

    <div class="file-list" v-else>
      <div v-for="file in files" :key="file.id" class="file-item">
        <div class="file-icon">📄</div>
        <div class="file-info">
          <div class="file-name">{{ file.name }}</div>
          <div class="file-meta">{{ formatDate(file.sharedAt) }}</div>
        </div>
        <button class="delete-btn" @click="removeFile(file.id)">✕</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.file-share { padding: 24px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.section-header h2 { font-size: 20px; font-weight: 700; color: var(--text-primary); }
.primary-btn {
  background: var(--accent); color: #fff; border: none; padding: 8px 16px;
  border-radius: var(--radius-sm); cursor: pointer; font-weight: 600; transition: background 0.2s;
}
.primary-btn:hover { background: var(--accent-hover); }
.empty-state { text-align: center; color: var(--text-muted); padding: 40px; }
.file-list { display: flex; flex-direction: column; gap: 8px; }
.file-item {
  background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 14px; display: flex; align-items: center; gap: 12px; transition: all 0.2s;
}
.file-item:hover { border-color: var(--border-hover); }
.file-icon { font-size: 24px; }
.file-info { flex: 1; }
.file-name { font-weight: 600; color: var(--text-primary); }
.file-meta { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.delete-btn {
  background: none; border: none; color: var(--text-muted); cursor: pointer;
  font-size: 16px; padding: 4px 8px; border-radius: 6px; transition: all 0.2s;
}
.delete-btn:hover { color: var(--red); background: var(--red-soft); }
</style>
