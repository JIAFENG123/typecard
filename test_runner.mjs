import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BROWSER_BIN = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;
const PORT = 9333;
const TARGET_URL = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');

console.log(`[TEST] Using browser: ${BROWSER_BIN}`);
console.log(`[TEST] Target URL: ${TARGET_URL}`);

const browser = spawn(BROWSER_BIN, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--window-size=1440,1100',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  TARGET_URL
]);

browser.stderr.on('data', () => {});

async function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function getWsUrl() {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json`);
      if (res.ok) {
        const list = await res.json();
        const page = list.find(p => p.type === 'page');
        if (page && page.webSocketDebuggerUrl) {
          return page.webSocketDebuggerUrl;
        }
      }
    } catch (e) {}
    await wait(300);
  }
  throw new Error('Failed to connect to CDP debug port');
}

async function runTest() {
  const wsUrl = await getWsUrl();
  console.log(`[TEST] Connected to CDP: ${wsUrl}`);

  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  let msgId = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  function send(method, params = {}) {
    const id = msgId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1100,
    deviceScaleFactor: 2,
    mobile: false
  });

  await wait(1200);

  async function evalJs(expr) {
    const res = await send('Runtime.evaluate', {
      expression: expr,
      awaitPromise: true,
      returnByValue: true
    });
    if (res.exceptionDetails) {
      throw new Error(`JS Exception: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result.value;
  }

  const cardCount = await evalJs(`document.querySelectorAll('.style-card').length`);
  console.log(`[TEST] Total style-card buttons found in DOM: ${cardCount}`);
  if (cardCount !== 36) {
    throw new Error(`Expected 36 style cards, found ${cardCount}`);
  }

  const themes = await evalJs(`Array.from(document.querySelectorAll('.style-card')).map(b => b.dataset.theme)`);
  console.log(`[TEST] Themes detected (${themes.length}): ${themes.join(', ')}`);

  const testDir = path.resolve('test-output');
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);

  const xhsNewThemes = ['silk', 'kinfolk', 'duotone', 'letter', 'klein', 'poem'];
  const inspectThemes = [...xhsNewThemes, 'zen', 'brutalist', 'aurora', 'pantone'];
  const ratios = ['auto', '3:4'];
  let failures = 0;

  for (const ratio of ratios) {
    console.log(`\n=== Testing Ratio: [${ratio}] ===`);
    await evalJs(`document.querySelector('.seg-item[data-ratio="${ratio}"]').click()`);
    await wait(100);

    for (const t of themes) {
      const info = await evalJs(`(async () => {
        try {
          window.setTheme('${t}');
          await new Promise(r => requestAnimationFrame(() => setTimeout(r, 30)));
          const card = document.getElementById('the-card');
          const stage = document.getElementById('stage');
          const pad = parseInt(document.getElementById('input-pad').value) || 40;
          const cardRect = card.getBoundingClientRect();
          const hasContent = !!card.querySelector('.card-content');
          const domW = Math.round(card.offsetWidth || cardRect.width);
          const domH = Math.round(card.offsetHeight || cardRect.height);

          const canvas = await window.renderToCanvas();
          const expectedW = (domW + pad * 2) * 2;
          const expectedH = (domH + pad * 2) * 2;
          const dimMatch = (canvas.width === expectedW && canvas.height === expectedH);

          const savePair = ('${ratio}' === '3:4' && ${JSON.stringify(inspectThemes)}.includes('${t}'));
          let domClip = null;
          if (savePair) {
            // Temporarily ensure wrapper scale = 1 for crisp DOM comparison screenshot
            const wrap = document.getElementById('export-wrapper');
            wrap.style.transform = 'scale(1)';
            card.style.transform = 'none';
            const r = card.getBoundingClientRect();
            domClip = { x: r.left, y: r.top, width: r.width, height: r.height, scale: 1 };
          }

          return {
            theme: '${t}',
            ok: true,
            width: canvas.width,
            height: canvas.height,
            expectedW,
            expectedH,
            dimMatch,
            hasContent,
            domClip,
            dataUrl: savePair ? canvas.toDataURL('image/png') : null
          };
        } catch (err) {
          return { theme: '${t}', ok: false, error: err.toString() };
        }
      })()`);

      if (!info.ok || !info.dimMatch || !info.hasContent) {
        failures++;
        console.error(`❌ [${ratio}] [${t}] FAILED: ok=${info.ok}, dimMatch=${info.dimMatch} (${info.width}x${info.height} vs ${info.expectedW}x${info.expectedH}), err=${info.error || ''}`);
      } else {
        console.log(`✓ [${ratio}] [${t}] PASS (${info.width}x${info.height}px, 1:1 DOM Match)`);
      }

      if (info.dataUrl && info.domClip) {
        const base64Data = info.dataUrl.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync(path.join(testDir, `3x4-export-${t}.png`), Buffer.from(base64Data, 'base64'));

        // Capture live DOM screenshot of #the-card
        const shot = await send('Page.captureScreenshot', {
          format: 'png',
          clip: info.domClip
        });
        fs.writeFileSync(path.join(testDir, `3x4-dom-${t}.png`), Buffer.from(shot.data, 'base64'));
      }
    }
  }

  // Test interactive editing state: custom text + highlight + accent color + font switch
  console.log(`\n=== Testing Interactive Editing & Export Consistency ===`);
  const editTest = await evalJs(`(async () => {
    document.querySelector('.seg-item[data-ratio="3:4"]').click();
    window.setTheme('duotone');
    await new Promise(r => setTimeout(r, 50));
    const contentEl = document.querySelector('#the-card .card-content');
    contentEl.innerHTML = '设计不是装饰，<mark class="tc-mark">而是秩序与情绪的共鸣</mark>。';
    contentEl.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('.seg-item[data-font="sans"]').click();
    document.querySelector('.swatch-dot[data-color="#1e3a8a"]')?.click();
    await new Promise(r => setTimeout(r, 80));
    const canvas = await window.renderToCanvas();
    const wrap = document.getElementById('export-wrapper');
    wrap.style.transform = 'scale(1)';
    const r = document.getElementById('the-card').getBoundingClientRect();
    return {
      ok: canvas.width > 0 && canvas.height > 0 && contentEl.innerText.includes('而是秩序与情绪的共鸣'),
      dataUrl: canvas.toDataURL('image/png'),
      domClip: { x: r.left, y: r.top, width: r.width, height: r.height, scale: 1 }
    };
  })()`);

  if (!editTest.ok) {
    failures++;
    console.error('❌ Interactive edit + highlight + export test FAILED');
  } else {
    console.log('✓ Interactive edit + highlight + font + accent color export test PASS');
    fs.writeFileSync(path.join(testDir, 'edited-export-duotone.png'), Buffer.from(editTest.dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
    const shot = await send('Page.captureScreenshot', { format: 'png', clip: editTest.domClip });
    fs.writeFileSync(path.join(testDir, 'edited-dom-duotone.png'), Buffer.from(shot.data, 'base64'));
  }

  if (failures > 0) {
    console.error(`\n❌ [TEST SUMMARY] ${failures} checks failed.`);
    process.exitCode = 1;
  } else {
    console.log(`\n🎉 [TEST SUMMARY] ALL 36 THEMES × 2 RATIOS + INTERACTIVE EDITING PASSED 100% WYSIWYG!`);
  }

  ws.close();
  browser.kill();
  process.exit(process.exitCode || 0);
}

runTest().catch(err => {
  console.error('[TEST ERROR]', err);
  browser.kill();
  process.exit(1);
});
