<div align="center">
  <img src="public/logo.svg" width="128" height="128" alt="DropNES Logo" />
  <h1>✨ DropNES</h1>
  <p><strong>把红白机搬进 Chrome：纯净、硬核、沉浸式的浏览器扩展模拟器</strong></p>
  <p>Bring Your Own Game. Relive Your Childhood. No Strings Attached.</p>
  <p>
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white">
    <img alt="Chrome Extension" src="https://img.shields.io/badge/Chrome%20Extension-MV3-4285F4?logo=googlechrome&logoColor=white">
    <img alt="Build" src="https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white">
    <img alt="License" src="https://img.shields.io/badge/License-GPL--3.0-blue.svg">
  </p>
</div>

---

### [English Content Below](#english-version)

## 📺 为什么要做 DropNES？

现在的模拟器虽然多，但总觉得少了点灵魂。DropNES 不想做一个冷冰冰的网页工具，我们想找回的是那种坐在电视机前、对着卡带吹口气再插进去的纯粹快乐。

DropNES 坚持 Bring Your Own Game (BYOG) 原则：我们为你打造了最顶级的复古硬件环境——可自由拖拽的 144Hz 锁帧电视、物理质感的遥控器以及手感极佳的手柄。而游戏的灵魂 ROM，全由你来掌控。

## ✨ 核心玩点

- **🕹️ 极致拟物交互**：电视机、手柄、甚至那个 90 年代的红外遥控器，全都像真家伙一样，你想摆哪就摆哪。
- **📼 动态卡带封面**：最近游玩记录会变成一盘盘散落在桌面上的实体卡带，甚至会自动抓拍游戏瞬间作为卡带贴纸。
- **⚡ 丝滑极客性能**：
  - **零延迟声音**：基于现代 AudioWorklet 驱动，还原最清脆的 8-bit 方波。
  - **精准锁帧**：内置 FrameTimer 硬件级同步，不管你是 60Hz 还是 240Hz 的电竞屏，游戏永远跑在最完美的 60.098 FPS。
- **💾 进度永不丢失**：支持 .dnes 格式一键导出备份，配合 IndexedDB 核动力存储，想存多少游戏都没压力。
- **🌍 全球通用**：中英文双语一键切换，自带按键防冲突检测，支持双人对战。

## 🛠️ 快速上手

1. **下载并编译**：
   ```bash
   git clone https://github.com/miaoston/DropNES.git
   npm install --legacy-peer-deps
   npm run build
   ```
2. **载入 Chrome**：
   - 打开扩展管理页面 `chrome://extensions/`。
   - 开启 **开发者模式**。
   - 点击 **加载解压的扩展程序**，选中项目中的 `dist/` 文件夹。
3. **开玩**：点击图标弹出界面，直接把你的 .nes 文件丢进去！

> 💡 **想要参与开发？** 请查看 [CONTRIBUTION.md](./CONTRIBUTION.md) 了解项目架构。

## 📜 法律与许可 (Legal & License)

- **License**: 本项目采用 **GPLv3** 开源协议发布。
- **Disclaimer**: DropNES 仅供技术交流与学习。我们不分发任何受版权保护的游戏 ROM。请支持并购买正版游戏。

---

<a name="english-version"></a>

## 📺 Project Vision

DropNES is built for those who find standard emulators a bit too clinical. It’s a fully immersive, skeuomorphic time machine in your browser. We provide the high-fidelity virtual living room—complete with a draggable TV, physical console, and IR remote—while you provide the ROMs. True to the Bring Your Own Game (BYOG) spirit, the platform is yours to command.

## ✨ Key Features

- **🕹️ Skeuomorphic Interaction**: The TV, Console, Gamepads, and that 90s IR Remote are all draggable and interactive.
- **📼 Dynamic Cartridges**: Your history is represented by physical-looking cartridges on your desk, automatically capturing in-game screenshots as labels.
- **⚡ Engineering Excellence**:
  - **Zero-Latency Audio**: Powered by modern AudioWorklet technology.
  - **Frame-Perfect Sync**: FrameTimer ensures a rock-solid 60.098 FPS regardless of your monitor's refresh rate (e.g., 144Hz/240Hz).
- **💾 Robust Save System**: Export/Import via .dnes files and infinite persistent storage using IndexedDB.
- **🌍 Global Ready**: Seamless toggle between Chinese and English, with built-in smart key conflict detection.

## 🛠️ Installation

1. **Build from source**:
   ```bash
   git clone https://github.com/miaoston/DropNES.git
   npm install --legacy-peer-deps
   npm run build
   ```
2. **Load Extension**:
   - Navigate to `chrome://extensions/` in Chrome.
   - Enable **Developer mode**.
   - Click **Load unpacked** and select the `dist/` folder.
3. **Go!**: Click the icon and drop your .nes files to start the time machine.

> 💡 **For Developers**: Check out [CONTRIBUTION.md](./CONTRIBUTION.md) for project structure and dev notes.

## 📜 Legal & License

- **License**: Released under the **GPLv3** License.
- **Disclaimer**: DropNES is for educational and nostalgic purposes. We do not distribute copyrighted ROMs. Please support official releases.
