import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'fs';
import axios from 'axios';

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    useContentSize: true,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      webSecurity: false,
    },
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)

// 本地缓存目录
const CACHE_DIR = path.join(app.getPath('userData'), 'offlineImages');

// 确保目录存在
function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

// 下载图片并保存
ipcMain.handle('cache/saveImages', async (_, urlList: string[]) => {
  ensureCacheDir();

  for (const url of urlList) {
    const filename = path.basename(url);
    const filePath = path.join(CACHE_DIR, filename);

    try {
      const res = await axios.get(url, { responseType: 'arraybuffer' });
      fs.writeFileSync(filePath, res.data);
    } catch (err) {
      console.log('下载失败：', url);
    }
  }

  return true;
});

// 获取缓存图片列表
ipcMain.handle('cache/getImages', async () => {
  ensureCacheDir();

  const files = fs.readdirSync(CACHE_DIR);
  return files.map(f => path.join(CACHE_DIR, f));
});

ipcMain.handle('cache:clear', async () => {
  try {
    if (fs.existsSync(CACHE_DIR)) {
      fs.rmSync(CACHE_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});
