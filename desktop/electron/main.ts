import { app, BrowserWindow, ipcMain, Tray, nativeImage, powerMonitor } from 'electron'
import path from 'path'
import { execSync } from 'child_process'
import Store from 'electron-store'

const store = new Store()

const isDev = process.env.NODE_ENV === 'development'

let tray: Tray | null = null

// ── Tray icon helpers ────────────────────────────────────────────────────────

function makeDotIcon(hex: string): Electron.NativeImage {
  const size = 16
  const buf = Buffer.alloc(size * size * 4, 0)
  const cx = size / 2
  const cy = size / 2
  const r = (size / 2) - 1
  const [rr, gg, bb] = hexToRgb(hex)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx + 0.5
      const dy = y - cy + 0.5
      if (dx * dx + dy * dy <= r * r) {
        const i = (y * size + x) * 4
        buf[i] = rr; buf[i + 1] = gg; buf[i + 2] = bb; buf[i + 3] = 255
      }
    }
  }
  return nativeImage.createFromBuffer(buf, { width: size, height: size })
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const TRAY_COLORS = {
  focused:    '#2dd4bf',
  distracted: '#fbbf24',
  idle:       '#6b7280',
} as const

type TrayStatus = keyof typeof TRAY_COLORS

// ── App / browser tracking ───────────────────────────────────────────────────

// Browsers we know how to query for the active tab URL via AppleScript
const BROWSER_URL_SCRIPTS: Record<string, string> = {
  'Google Chrome':  'tell application "Google Chrome" to return URL of active tab of front window',
  'Safari':         'tell application "Safari" to return URL of current tab of front window',
  'Arc':            'tell application "Arc" to return URL of active tab of front window',
  'Brave Browser':  'tell application "Brave Browser" to return URL of active tab of front window',
  'Firefox':        'tell application "Firefox" to return URL of active tab of front window',
  'Microsoft Edge': 'tell application "Microsoft Edge" to return URL of active tab of front window',
}

function runAppleScript(script: string, timeoutMs = 500): string {
  return execSync(`osascript -e '${script}'`, { timeout: timeoutMs }).toString().trim()
}

// Returns the frontmost app name and (if it's a known browser) the active tab URL.
function getAppInfo(): { app: string; browser_url: string | null } {
  if (process.platform !== 'darwin') return { app: 'unknown', browser_url: null }
  try {
    const appName = runAppleScript(
      'tell application "System Events" to get name of first application process whose frontmost is true'
    )
    if (!appName) return { app: 'unknown', browser_url: null }

    let browser_url: string | null = null
    const urlScript = BROWSER_URL_SCRIPTS[appName]
    if (urlScript) {
      try {
        browser_url = runAppleScript(urlScript) || null
      } catch {
        // Browser open but no window/tab — not an error
      }
    }

    return { app: appName, browser_url }
  } catch {
    return { app: 'unknown', browser_url: null }
  }
}

// ── Window creation ──────────────────────────────────────────────────────────

function createWindow() {
  const win = new BrowserWindow({
    width: 660,
    height: 720,
    minWidth: 560,
    minHeight: 600,
    resizable: false,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0a0a0a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

function createTray() {
  const icon = makeDotIcon(TRAY_COLORS.idle)
  icon.setTemplateImage(false)
  tray = new Tray(icon)
  tray.setToolTip('Study Tool')
}

app.whenReady().then(() => {
  createWindow()
  createTray()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// ── IPC: token storage ───────────────────────────────────────────────────────
ipcMain.handle('store:get', (_event, key: string) => store.get(key))
ipcMain.handle('store:set', (_event, key: string, value: unknown) => store.set(key, value))
ipcMain.handle('store:delete', (_event, key: string) => store.delete(key))

// ── IPC: app + browser URL tracking ─────────────────────────────────────────
ipcMain.handle('tracker:get-app-info', () => getAppInfo())

// ── IPC: keyboard/mouse idle time ────────────────────────────────────────────
// Returns seconds since the last keyboard or mouse event (system-wide).
ipcMain.handle('tracker:get-idle-seconds', () => powerMonitor.getSystemIdleTime())

// ── IPC: tray status ─────────────────────────────────────────────────────────
ipcMain.handle('tray:set-status', (_event, status: TrayStatus) => {
  if (!tray) return
  const color = TRAY_COLORS[status] ?? TRAY_COLORS.idle
  const icon = makeDotIcon(color)
  icon.setTemplateImage(false)
  tray.setImage(icon)
  tray.setToolTip(`Study Tool — ${status}`)
})
