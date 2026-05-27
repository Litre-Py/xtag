# XTag - 近场连接应用

基于 Tauri 2.0 + Vue 3 的近场设备连接与管理应用，支持 UWB、蓝牙、WiFi、星闪（NearLink）多种通信协议。

## 功能特性

### 核心功能

- **💳 卡片管理** - 创建和管理个人名片、停车卡、门锁卡、车载卡
- **🔗 设备管理** - 绑定和管理 UWB/蓝牙/WiFi/星闪设备
- **📡 多协议扫描** - 支持 UWB、蓝牙 BLE、WiFi、星闪协议扫描
- **📁 文件分享** - 通过近场协议分享文件
- **🅿️ 停车信息** - 显示停车场实时信息
- **📋 简历编辑** - Markdown 简历编辑器
- **🤖 AI 助手** - 集成 AI 分析功能

### 通信协议

| 协议 | 说明 | 特点 |
|------|------|------|
| UWB | 超宽带通信 | 高精度定位 |
| 蓝牙 | BLE 低功耗蓝牙 | 低功耗、广兼容 |
| WiFi | 无线局域网 | 高带宽 |
| 星闪 | NearLink | 超低延迟、华为生态 |

### 主题系统

- 🥛 奶咖色（默认）
- 🌙 深色
- ❄️ 极地
- 🌅 日落
- 🌿 薄荷

## 技术栈

- **前端框架**: Vue 3 + Composition API
- **桌面框架**: Tauri 2.0
- **构建工具**: Vite 5
- **UI 风格**: 简约时尚，支持多主题

## 项目结构

```
xtag-app/
├── src/
│   ├── App.vue              # 主应用入口
│   ├── main.js              # 入口文件
│   ├── styles.css           # 全局样式 + 主题变量
│   └── components/
│       ├── CardManager.vue      # 卡片管理
│       ├── DeviceManager.vue    # 设备管理
│       ├── UwbScanner.vue       # 多协议扫描
│       ├── FileShare.vue        # 文件分享
│       ├── ParkingInfo.vue      # 停车信息
│       ├── ResumeCard.vue       # 简历编辑
│       ├── AIAnalysis.vue       # AI 助手
│       └── FloorPlan.vue        # 户型图
├── src-tauri/               # Tauri 后端
├── package.json
└── vite.config.js
```

## 开发

### 环境要求

- Node.js 18+
- Rust 1.70+
- Tauri CLI 2.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev          # 启动 Vite 开发服务器
npm run tauri dev    # 启动 Tauri 开发模式
```

### 构建

```bash
npm run build
npm run tauri build
```

## 主题定制

在 `src/styles.css` 中定义主题变量：

```css
[data-theme="custom"] {
  --bg-primary: #ffffff;
  --accent: #your-color;
  /* ... */
}
```

## 许可证

MIT
