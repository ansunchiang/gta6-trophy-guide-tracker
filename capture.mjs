import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const shots = JSON.parse(await readFile(join(root, 'shots.json'), 'utf8'));
const chromePath = process.env.CHROME_BIN ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const scratch = await mkdtemp(join(tmpdir(), 'leonida-atlas-'));
const server = spawn(process.execPath, ['serve.ts', '--port', '0'], { cwd: root, stdio: ['ignore', 'pipe', 'inherit'] });
let chrome;
let socket;

async function until(read, label) {
  let lastError;
  for (let tries = 0; tries < 100; tries++) {
    try {
      const result = await read();
      if (result) return result;
    } catch (error) {
      lastError = error;
    }
    await delay(50);
  }
  throw new Error(`Timed out waiting for ${label}`, { cause: lastError });
}

function protocol(client) {
  let nextId = 0;
  const pending = new Map();
  client.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    clearTimeout(request.timeout);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  });
  return (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const timeout = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`Chrome did not answer ${method}`));
    }, 5_000);
    pending.set(id, { resolve, reject, timeout });
    client.send(JSON.stringify({ id, method, params }));
  });
}

async function stop(process) {
  if (!process || process.exitCode !== null || process.signalCode !== null || !process.pid) return;
  const exited = once(process, 'exit');
  process.kill();
  await exited;
}

try {
  const [output] = await once(server.stdout, 'data');
  const origin = new URL(String(output).trim());
  chrome = spawn(chromePath, [
    '--headless=new', '--disable-background-networking', '--disable-sync', '--no-first-run',
    '--remote-debugging-port=0', `--user-data-dir=${scratch}`, 'about:blank'
  ], { stdio: 'ignore' });
  let launchError;
  chrome.on('error', error => { launchError = error; });
  const port = await until(async () => {
    if (launchError) throw launchError;
    const text = await readFile(join(scratch, 'DevToolsActivePort'), 'utf8');
    return text.split('\n')[0];
  }, 'headless Chrome');
  const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then(response => response.json());
  socket = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await once(socket, 'open');
  const send = protocol(socket);
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.result.description);
    return result.result.value;
  };
  await send('Page.enable');
  for (const shot of shots) {
    await send('Emulation.setDeviceMetricsOverride', { ...shot.viewport, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: 'about:blank' });
    await send('Storage.clearDataForOrigin', { origin: origin.origin, storageTypes: 'local_storage' });
    await send('Page.navigate', { url: new URL(shot.path, origin).href });
    await until(() => evaluate('document.querySelectorAll(".row-select").length === 55'), 'trophy checklist');
    for (const selector of shot.click) {
      await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
    }
    await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
    const shotData = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    const bytes = Buffer.from(shotData.data, 'base64');
    if (bytes.length > 262_144) throw new Error(`${shot.file} exceeds the screenshot size cap.`);
    await writeFile(join(root, 'screenshots', shot.file), bytes);
    console.log(`${shot.file} · ${bytes.length} bytes`);
  }
} finally {
  socket?.close();
  await Promise.all([stop(chrome), stop(server)]);
  await rm(scratch, { recursive: true, force: true });
}
