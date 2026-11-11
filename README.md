# 🎴 TypeCard — 社交美学卡片工坊 (Social Aesthetic Card Studio)

> 一款优雅、极简、高质感的排版生成器。专为小红书、Instagram、X (Twitter)、即刻与微信朋友圈打造的美学金句与图文卡片工具。纯前端客户端渲染，零数据上传，超高清导出。

🌐 **在线体验 (Live Demo)**: [https://jiafeng123.github.io/typecard/](https://jiafeng123.github.io/typecard/)

---

## ✨ 核心特性

- 🎨 **30 款独家设计美学主题（覆盖先锋艺术、东方水墨、纸质刊物、复古物语与光影声像）**：
  - 🌌 **空间琉璃** (Spatial Liquid Glass) — *Apple VisionOS / Cosmos.so 质感，深空渐变与悬浮光感*
  - 🎋 **枯山水印** (Wabi-Sabi Vermilion) — *东方宣纸淡墨与朱砂方印，静谧枯山水意境*
  - ⚡ **野兽锋芒** (Neo-Brutalist Acid) — *东京 TDC / 高对比荧光酸性黄硬核排版*
  - 🎙️ **声波电台** (Audio Wave Station) — *动态音频波形柱与时间码，深夜调频质感*
  - 🏛️ **当代展录** (Biennale Monograph) — *威尼斯双年展 / 白盒子画廊官方大图录*
  - 🌿 **博物标本** (Herbarium Field Note) — *羊皮纸标本框、植物拉丁名与田野手记*
  - 📰 **纽时大报** (Broadsheet Drop Cap)
  - 📖 **顶级月刊** (Editorial Vogue)
  - 📐 **包豪斯海报** (Weimar 1923 Art)
  - 🧭 **工程蓝图** (Cyanotype CAD)
  - 🛫 **头等登机牌** (First Class Pass)
  - 🖼️ **美术馆展签** (MoMA Curatorial)
  - 💻 **复古麦金塔** (Macintosh OS 1984)
  - 🥂 **黑金烫印函** (Haute Couture Foil)
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
- ⚡ **2x/3x 超高清无损导出**：基于 Canvas 2D 高精度几何与字形矢量绘制，导出超清 PNG，支持一键写入系统剪贴板。
- 🧪 **自动化测试保障**：内置全格式 Headless CDP 端到端渲染自测试管线，保证 100% 介质 Canvas 渲染零白屏、零报错。
- 🔒 **100% 隐私安全**：纯本地 Client-side 运算，无需任何后端，不收集任何用户输入。

---

## 🚀 本地运行与自测

无需安装任何繁琐依赖，直接双击运行或启动轻量本地服务器：

```bash
# 启动本地服务
npx serve .

# 运行全套 30 种格式自动化端到端测试
node test_runner.mjs
```

---

## 🛠️ 技术栈

- **Vanilla HTML5 / Modern CSS3**（CSS 变量、Flex/Grid 排版、3D Perspective Transform、Glassmorphism 拟物材质）
- **Native Canvas 2D 渲染管线**（高保真多倍超采样几何与文字排版）
- **Web Fonts**（Playfair Display, JetBrains Mono, Noto Serif 等字体衬线排版）

---

## 📄 License

MIT License © 2026 [Jia Feng](https://github.com/JIAFENG123)
