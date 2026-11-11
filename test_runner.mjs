import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BROWSER_BIN = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;
const PORT = 9333;
const TARGET_URL = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');

console.log(`[TEST] Using browser: ${BROWSER_BIN}`);
console.log(`[TEST] Target URL: ${TARGET_URL}`);

// Spawn headless browser
const browser = spawn(BROWSER_BIN, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  TARGET_URL
]);

browser.stderr.on('data', d => {});

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

  // Enable Page & Runtime
  await send('Page.enable');
  await send('Runtime.enable');

  await wait(1000); // Allow fonts and DOM to settle

  // Evaluate script in browser
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

  // 1. Check style cards count
  const cardCount = await evalJs(`document.querySelectorAll('.style-card').length`);
  console.log(`[TEST] Total style-card buttons found in DOM: ${cardCount}`);
  if (cardCount !== 30) {
    throw new Error(`Expected 30 style cards, found ${cardCount}`);
  }

  // 2. Get list of all themes
  const themes = await evalJs(`Array.from(document.querySelectorAll('.style-card')).map(b => b.dataset.theme)`);
  console.log(`[TEST] Themes detected: ${themes.join(', ')}`);

  // 3. Test every theme
  const results = [];
  const testDir = path.resolve('test-output');
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);

  for (const t of themes) {
    const info = await evalJs(`(async () => {
      try {
        window.setTheme('${t}');
        const card = document.getElementById('the-card');
        const hasContent = !!card.querySelector('.card-content');
        const canvas = await window.renderToCanvas();
        const dataUrl = canvas.toDataURL('image/png');
        return {
          theme: '${t}',
          ok: true,
          width: canvas.width,
          height: canvas.height,
          hasContent,
          dataUrlLength: dataUrl.length,
          dataUrl: ('${['aurora', 'zen', 'brutalist', 'podcast', 'atelier', 'herbarium'].includes(t)}' === 'true') ? dataUrl : null
        };
      } catch (err) {
        return {
          theme: '${t}',
          ok: false,
          error: err.toString()
        };
      }
    })()`);

    if (!info.ok) {
      console.error(`❌ Theme [${t}] FAILED: ${info.error}`);
      results.push(info);
    } else {
      console.log(`✓ Theme [${t}] PASS (${info.width}x${info.height}px, PNG length: ${info.dataUrlLength})`);
      results.push(info);

      // Save screenshot for the 6 newly designed themes
      if (info.dataUrl) {
        const base64Data = info.dataUrl.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync(path.join(testDir, `theme-${t}.png`), Buffer.from(base64Data, 'base64'));
      }
    }
  }

  const failed = results.filter(r => !r.ok);
  if (failed.length > 0) {
    console.error(`\n❌ [TEST SUMMARY] ${failed.length} of ${themes.length} themes failed.`);
    process.exitCode = 1;
  } else {
    console.log(`\n🎉 [TEST SUMMARY] ALL ${themes.length} THEMES PASSED 100% CANVASES AND PREVIEWS!`);
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
