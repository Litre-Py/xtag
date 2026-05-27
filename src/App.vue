<script setup>
import { ref, onMounted, watch } from 'vue'
import CardManager from './components/CardManager.vue'
import UwbScanner from './components/UwbScanner.vue'
import FileShare from './components/FileShare.vue'
import ParkingInfo from './components/ParkingInfo.vue'
import ResumeCard from './components/ResumeCard.vue'
import AIAnalysis from './components/AIAnalysis.vue'
import DeviceManager from './components/DeviceManager.vue'

const currentTab = ref('cards')
const currentTheme = ref('milk-coffee')
const showThemePicker = ref(false)

const tabs = [
  { id: 'cards', label: '卡片', icon: '💳' },
  { id: 'devices', label: '设备', icon: '🔗' },
  { id: 'uwb', label: 'UWB', icon: '📡' },
  { id: 'files', label: '文件', icon: '📁' },
  { id: 'parking', label: '停车', icon: '🅿️' },
  { id: 'resume', label: '简历', icon: '📋' },
  { id: 'ai', label: 'AI', icon: '🤖' },
]

const themes = [
  { id: 'milk-coffee', label: '奶咖', color: '#c8956c', bg: '#f5f0eb' },
  { id: 'dark', label: '深色', color: '#6c5ce7', bg: '#0c0c14' },
  { id: 'nord', label: '极地', color: '#88c0d0', bg: '#2e3440' },
  { id: 'sunset', label: '日落', color: '#e8789a', bg: '#1a1016' },
  { id: 'mint', label: '薄荷', color: '#4a9a6a', bg: '#f0f8f4' },
]

const components = {
  cards: CardManager,
  devices: DeviceManager,
  uwb: UwbScanner,
  files: FileShare,
  parking: ParkingInfo,
  resume: ResumeCard,
  ai: AIAnalysis,
}

function setTheme(themeId) {
  currentTheme.value = themeId
  document.documentElement.setAttribute('data-theme', themeId)
  localStorage.setItem('uwb_theme', themeId)
  showThemePicker.value = false
}

onMounted(() => {
  const saved = localStorage.getItem('uwb_theme')
  if (saved) setTheme(saved)
})
</script>

<template>
  <div class="app">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">💳</div>
        <span class="brand-text">XTag</span>
      </div>

      <nav class="sidebar-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['nav-item', { active: currentTab === tab.id }]"
          @click="currentTab = tab.id"
        >
          <span class="nav-icon">{{ tab.icon }}</span>
          <span class="nav-label">{{ tab.label }}</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <div class="theme-picker-wrap">
          <button class="theme-btn" @click="showThemePicker = !showThemePicker">
            <span class="theme-dot" :style="{ background: themes.find(t => t.id === currentTheme)?.color }"></span>
            <span>主题</span>
          </button>
          <div class="theme-dropdown" v-if="showThemePicker">
            <button
              v-for="t in themes"
              :key="t.id"
              :class="['theme-option', { active: currentTheme === t.id }]"
              @click="setTheme(t.id)"
            >
              <span class="theme-dot" :style="{ background: t.color }"></span>
              <span>{{ t.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <main class="main">
      <component :is="components[currentTab]" />
    </main>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  height: 100vh;
  background: var(--bg-primary);
}

/* ===== 侧边栏 ===== */
.sidebar {
  width: 200px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-brand {
  padding: 20px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--border);
}

.brand-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--accent), var(--accent-hover));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.brand-text {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.3px;
}

/* ===== 导航 ===== */
.sidebar-nav {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
}

.nav-item {
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  color: var(--text-secondary);
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 2px;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 600;
}

.nav-icon {
  font-size: 16px;
  width: 24px;
  text-align: center;
}

/* ===== 底部主题选择 ===== */
.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--border);
}

.theme-picker-wrap {
  position: relative;
}

.theme-btn {
  width: 100%;
  padding: 8px 12px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.theme-btn:hover {
  border-color: var(--border-hover);
  color: var(--text-primary);
}

.theme-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}

.theme-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  margin-bottom: 6px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 4px;
  box-shadow: var(--shadow);
  z-index: 100;
}

.theme-option {
  width: 100%;
  padding: 8px 10px;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.15s;
}

.theme-option:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.theme-option.active {
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 600;
}

/* ===== 主内容区 ===== */
.main {
  flex: 1;
  overflow-y: auto;
  background: var(--bg-primary);
}
</style>
