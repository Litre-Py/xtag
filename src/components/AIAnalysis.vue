<script setup>
import { ref } from 'vue'

const apiKey = ref('')
const apiUrl = ref('https://api-inference.modelscope.cn/v1/')
const modelName = ref('Qwen/Qwen3.5-35B-A3B')
const loading = ref(false)
const result = ref('')

async function analyze() {
  const prompt = document.querySelector('.prompt-input')?.value
  if (!prompt?.trim()) { alert('请输入分析内容'); return }
  if (!apiKey.value) { alert('请先配置 API Key'); return }

  loading.value = true
  result.value = ''

  try {
    const url = apiUrl.value.endsWith('/chat/completions') ? apiUrl.value : apiUrl.value + 'chat/completions'
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey.value}` },
      body: JSON.stringify({
        model: modelName.value,
        max_tokens: 2048,
        temperature: 0.7,
        messages: [
          { role: 'system', content: '你是 UWB Card 的 AI 助手，帮助用户分析数据、生成内容。' },
          { role: 'user', content: prompt },
        ],
      }),
    })
    const data = await resp.json()
    result.value = data.choices?.[0]?.message?.content || data.content?.[0]?.text || '无法解析响应'
  } catch (e) {
    result.value = `请求失败: ${e.message}`
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="ai-analysis">
    <div class="section-header">
      <h2>🤖 AI 助手</h2>
    </div>

    <div class="settings-card">
      <div class="form-group">
        <label>API Key</label>
        <input v-model="apiKey" type="password" placeholder="输入 API Key" />
      </div>
      <div class="form-group">
        <label>API 地址</label>
        <input v-model="apiUrl" placeholder="https://api-inference.modelscope.cn/v1/" />
      </div>
      <div class="form-group">
        <label>模型</label>
        <input v-model="modelName" placeholder="Qwen/Qwen3.5-35B-A3B" />
      </div>
    </div>

    <div class="prompt-card">
      <textarea class="prompt-input" placeholder="输入分析内容，例如：&#10;分析最近的市场趋势&#10;帮我写一段产品描述&#10;总结以下数据..."></textarea>
      <button class="primary-btn" @click="analyze" :disabled="loading">
        {{ loading ? '分析中...' : '🤖 开始分析' }}
      </button>
    </div>

    <div v-if="result" class="result-card">
      <div class="result-header">分析结果</div>
      <div class="result-content" v-html="result.replace(/\n/g, '<br>')"></div>
    </div>
  </div>
</template>

<style scoped>
.ai-analysis { padding: 24px; }
.section-header { margin-bottom: 20px; }
.section-header h2 { font-size: 20px; font-weight: 700; color: var(--text-primary); }
.settings-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; margin-bottom: 16px; }
.form-group { margin-bottom: 12px; }
.form-group label { display: block; font-size: 12px; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px; }
.form-group input { width: 100%; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 9px 12px; color: var(--text-primary); outline: none; transition: border-color 0.2s; }
.form-group input:focus { border-color: var(--accent); }
.prompt-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; margin-bottom: 16px; }
.prompt-input { width: 100%; min-height: 120px; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px; color: var(--text-primary); font-size: 13px; line-height: 1.6; resize: vertical; outline: none; margin-bottom: 10px; transition: border-color 0.2s; }
.prompt-input:focus { border-color: var(--accent); }
.primary-btn { width: 100%; background: var(--accent); color: #fff; border: none; padding: 10px; border-radius: var(--radius-sm); cursor: pointer; font-weight: 600; transition: background 0.2s; }
.primary-btn:hover { background: var(--accent-hover); }
.primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.result-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; }
.result-header { font-size: 14px; font-weight: 600; margin-bottom: 10px; color: var(--accent); }
.result-content { font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
</style>
