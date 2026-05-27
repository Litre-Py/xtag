<script setup>
import { ref, computed } from 'vue'
import { marked } from 'marked'
import { invoke } from '@tauri-apps/api/core'

const markdown = ref(`# 个人简历

## 基本信息
- **姓名**: 请填写
- **电话**: 请填写
- **邮箱**: 请填写

## 专业技能
- 技能1
- 技能2
- 技能3

## 工作经历
### 公司名称 | 职位
*2020 - 至今*
- 工作内容描述

## 教育背景
### 学校名称 | 专业
*2016 - 2020*

## 项目经验
### 项目名称
- 项目描述
- 个人职责
- 项目成果
`)

const showPreview = ref(true)
const renderedHtml = computed(() => marked(markdown.value))

async function saveResume() {
  const id = `resume_${Date.now()}`
  await invoke('save_resume', { id, markdown: markdown.value, skills: [] })
  alert('简历已保存')
}

function exportMarkdown() {
  const blob = new Blob([markdown.value], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'resume.md'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="resume-card">
    <div class="section-header">
      <h2>📋 简历编辑器</h2>
      <div class="header-actions">
        <button class="secondary-btn" @click="showPreview = !showPreview">
          {{ showPreview ? '编辑' : '预览' }}
        </button>
        <button class="secondary-btn" @click="exportMarkdown">📥 导出</button>
        <button class="primary-btn" @click="saveResume">💾 保存</button>
      </div>
    </div>

    <div class="editor-layout">
      <div class="editor-pane" v-show="!showPreview">
        <textarea v-model="markdown" class="markdown-input" placeholder="# 输入 Markdown 内容..."></textarea>
      </div>
      <div class="preview-pane" v-show="showPreview">
        <div class="markdown-content" v-html="renderedHtml"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.resume-card { padding: 24px; height: 100%; display: flex; flex-direction: column; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.section-header h2 { font-size: 20px; font-weight: 700; color: var(--text-primary); }
.header-actions { display: flex; gap: 8px; }
.primary-btn {
  background: var(--accent); color: #fff; border: none; padding: 8px 16px;
  border-radius: var(--radius-sm); cursor: pointer; font-weight: 600; transition: background 0.2s;
}
.primary-btn:hover { background: var(--accent-hover); }
.secondary-btn {
  background: var(--bg-card); border: 1px solid var(--border); color: var(--text-secondary);
  padding: 8px 16px; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s;
}
.secondary-btn:hover { border-color: var(--border-hover); color: var(--text-primary); }
.editor-layout { flex: 1; display: flex; gap: 16px; min-height: 0; }
.editor-pane, .preview-pane {
  flex: 1; background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); overflow: hidden;
}
.markdown-input {
  width: 100%; height: 100%; background: transparent; border: none;
  color: var(--text-primary); padding: 16px;
  font-family: 'SF Mono', 'Fira Code', monospace; font-size: 13px;
  line-height: 1.6; resize: none; outline: none;
}
.preview-pane { padding: 16px; overflow-y: auto; }
.markdown-content { font-size: 14px; line-height: 1.8; color: var(--text-primary); }
.markdown-content h1 { font-size: 24px; margin: 16px 0 8px; font-weight: 700; }
.markdown-content h2 { font-size: 20px; margin: 14px 0 6px; color: var(--accent); font-weight: 700; }
.markdown-content h3 { font-size: 16px; margin: 12px 0 4px; font-weight: 600; }
.markdown-content ul { padding-left: 20px; margin: 8px 0; }
.markdown-content li { margin: 4px 0; color: var(--text-secondary); }
.markdown-content strong { color: var(--accent); }
.markdown-content em { color: var(--text-muted); }
.markdown-content p { margin: 6px 0; }
.markdown-content a { color: var(--accent); }
.markdown-content blockquote {
  border-left: 3px solid var(--accent); padding-left: 12px;
  margin: 8px 0; color: var(--text-muted); font-style: italic;
}
.markdown-content code {
  background: var(--bg-input); padding: 2px 6px; border-radius: 4px;
  font-size: 12px; color: var(--accent);
}
.markdown-content pre {
  background: var(--bg-input); padding: 12px; border-radius: var(--radius-sm);
  overflow-x: auto; margin: 8px 0;
}
.markdown-content pre code { background: none; padding: 0; }
.markdown-content table {
  width: 100%; border-collapse: collapse; margin: 8px 0;
}
.markdown-content th, .markdown-content td {
  border: 1px solid var(--border); padding: 8px 12px; text-align: left;
}
.markdown-content th { background: var(--bg-input); font-weight: 600; }
</style>
