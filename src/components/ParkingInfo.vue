<script setup>
import { ref } from 'vue'

const lots = ref([
  { id: 1, name: '万达广场停车场', total: 500, available: 127, rate: 8, ev: true, spots: [] },
  { id: 2, name: '国贸中心地下车库', total: 800, available: 203, rate: 10, ev: true, spots: [] },
  { id: 3, name: '中关村科技园', total: 300, available: 45, rate: 6, ev: false, spots: [] },
])

function getAvailabilityColor(available, total) {
  const ratio = available / total
  if (ratio > 0.3) return 'var(--green)'
  if (ratio > 0.1) return 'var(--orange)'
  return 'var(--red)'
}

function getProgress(available, total) {
  return Math.round((available / total) * 100)
}
</script>

<template>
  <div class="parking-info">
    <div class="section-header">
      <h2>🅿️ 停车场信息</h2>
    </div>

    <div class="lot-list">
      <div v-for="lot in lots" :key="lot.id" class="lot-card">
        <div class="lot-header">
          <div class="lot-name">{{ lot.name }}</div>
          <div class="lot-availability" :style="{ color: getAvailabilityColor(lot.available, lot.total) }">
            {{ lot.available }} 空位
          </div>
        </div>
        <div class="lot-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: getProgress(lot.available, lot.total) + '%', background: getAvailabilityColor(lot.available, lot.total) }"></div>
          </div>
          <div class="lot-meta">
            <span>¥{{ lot.rate }}/时</span>
            <span>{{ lot.total }} 总车位</span>
            <span v-if="lot.ev">⚡ 充电桩</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.parking-info { padding: 24px; }
.section-header { margin-bottom: 20px; }
.section-header h2 { font-size: 20px; font-weight: 700; color: var(--text-primary); }
.lot-list { display: flex; flex-direction: column; gap: 10px; }
.lot-card {
  background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 16px; transition: all 0.2s;
}
.lot-card:hover { border-color: var(--border-hover); }
.lot-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.lot-name { font-weight: 600; font-size: 15px; color: var(--text-primary); }
.lot-availability { font-size: 18px; font-weight: 700; }
.progress-bar { height: 6px; background: var(--bg-input); border-radius: 3px; margin-bottom: 10px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
.lot-meta { display: flex; gap: 16px; font-size: 12px; color: var(--text-muted); }
</style>
