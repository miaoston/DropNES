# 🛠️ DropNES 开发者指南 (Contributor Guide)

本文档面向希望了解 DropNES 技术架构或贡献代码的开发者。

## 📁 目录结构 (Project Structure)

- **`/src/`**: 核心源代码。
  - **`components/`**: 拟物化 UI 组件 (Emulator, Controller, Remote, Cartridge)。
  - **`utils/`**: 底层逻辑 (AudioWorklet 调度, 60FPS 锁帧, IndexedDB 管理)。
  - **`styles/`**: Tailwind CSS 入口与主题定义。
  - **`background.ts`**: Chrome 扩展 Service Worker。
  - **`audio-processor.ts`**: 独立的 AudioWorklet 处理器逻辑。
- **`/public/`**: 静态资源。
  - **`manifest.json`**: Chrome 扩展清单 (V3)。
  - **`logo.svg`**: 官方矢量 Logo 源文件。
- **`/scripts/`**: 开发工具脚本 (如图标生成器)。
- **`vite.config.ts`**: 多入口打包配置，确保后台脚本与主界面分离。

## ⚡ 核心技术栈 (Tech Stack)

- **Framework**: React 18 + TypeScript 5
- **Build Tool**: Vite 8 (配置了多入口编译)
- **Styling**: Tailwind CSS + Framer Motion (用于物理拖拽动画)
- **Emulation**: [jsnes](https://github.com/bfirsh/jsnes) (经过补丁修正)
- **Storage**: Browser IndexedDB (原生异步存储)

## 🛠️ 常用开发指令

```bash
# 安装依赖 (必须加此 flag 处理 peer deps 冲突)
npm install --legacy-peer-deps

# 启动开发服务器
npm run dev

# 运行代码规范检查
npm run lint

# TypeScript 类型检查
npm run typecheck

# 编译项目 (产物在 /dist)
npm run build
```

## 🧠 技术核心备忘 (Dev Notes)

1. **JSNES 修正**: 引擎在遇到无效指令时会尝试调用不存在的 `.stop()` 方法。我们在 `Emulator.tsx` 中注入了抛错拦截逻辑以防止浏览器卡死。
2. **AudioWorklet 加载**: 由于 Chrome 扩展的 CSP 限制，AudioWorklet 必须作为独立文件打包，并通过 `chrome.runtime.getURL` 加载。
3. **高刷屏适配**: 通过自定义 `FrameTimer` 计算 Delta Time，确保在 144Hz/240Hz 屏幕上游戏速度依然维持在标准 60.098 FPS。

## 🤝 致谢 (Acknowledgments)

- **[jsnes](https://github.com/bfirsh/jsnes)**: Core emulation engine.
- **[nesrom](https://github.com/dream1986/nesrom)**: Community game resource reference.
- **[Lucide Icons](https://lucide.dev/)**: Professional icon library.
