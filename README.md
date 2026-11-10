# 🎴 TypeCard — 社交美学卡片工坊 (Social Aesthetic Card Studio)

> 一款优雅、极简、高质感的排版生成器。专为小红书、Instagram、X (Twitter)、即刻与微信朋友圈打造的美学金句与图文卡片工具。纯前端客户端渲染，零数据上传，超高清导出。

🌐 **在线体验 (Live Demo)**: [https://jiafeng123.github.io/typecard/](https://jiafeng123.github.io/typecard/)

---

## ✨ 核心特性

- 🎨 **18 款独家设计美学主题**：
  - 📰 **纽时大报** (Broadsheet Drop Cap)
  - 📖 **顶级月刊** (Editorial Vogue)
  - ☕ **咖啡豆卡** (Origin Tasting Card)
  - 📌 **胶带便签** (Washi Tape Memo)
  - 💊 **精神处方** (Rx Creative Remedy)
  - 🗓️ **撕历金句** (365 Desk Tear-off)
  - 🎬 **宽银幕台词** (16:9 Movie Subtitle)
  - ⚡ **瑞士大字** (Swiss Bento Block)
  - 📦 **工业封签** (Hazard Stencil)
  - 🧵 **缝线白标** (Margiela Fabric)
  - ✈️ **航空信封** (Par Avion Postcard)
  - 🎞️ **胶片拍立得** (Tri-X Film Frame)
  - 🧾 **热敏小票** (Thermal Receipt)
  - 🎨 **潘通色卡** (Pantone Swatch)
  - 🎟️ **复古票根** (Cinema Stub)
  - 🏛️ **古典藏书票** (Ex Libris Folio)
  - 💿 **黑胶内页** (Vinyl Liner Notes)
  - 📼 **复古磁带** (Cassette Tape)
- 🪟 **真实 3D 视差微倾斜**：跟随鼠标或触摸流动的物理拟物光感与微倾斜（Parallax Tilt）。
- 🖼️ **多比例自动适配**：小红书竖屏 (3:4)、Instagram 方图 (1:1)、宽屏横图 (16:9)、自适应瀑布流。
- ⚡ **2x 超高清无损导出**：基于 Canvas 2D 高精度几何与字形矢量绘制，导出超清 PNG，支持一键写入系统剪贴板。
- 🔒 **100% 隐私安全**：单文件架构，纯本地 Client-side 运算，无需任何后端，不收集任何用户输入。

---

## 🚀 本地运行

无需安装任何繁琐依赖，直接双击运行或启动轻量本地服务器：

```bash
# 方式一：直接在浏览器中打开
open index.html # macOS
start index.html # Windows

# 方式二：使用 npx serve
npx serve .
```

---

## 🛠️ 技术栈

- **Vanilla HTML5 / Modern CSS3**（CSS 变量、Flex/Grid 排版、3D Perspective Transform、Glassmorphism 拟物材质）
- **Native Canvas 2D 渲染管线**（高保真多倍超采样几何与文字排版）
- **Web Fonts**（Playfair Display, JetBrains Mono, Noto Serif 等字体衬线排版）

---

## 📄 License

MIT License © 2026 [Jia Feng](https://github.com/JIAFENG123)
