import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  store: {
    get: (key: string) => ipcRenderer.invoke('store:get', key),
    set: (key: string, value: unknown) => ipcRenderer.invoke('store:set', key, value),
    delete: (key: string) => ipcRenderer.invoke('store:delete', key),
  },
  tracker: {
    getAppInfo: (): Promise<{ app: string; browser_url: string | null }> =>
      ipcRenderer.invoke('tracker:get-app-info'),
    getIdleSeconds: (): Promise<number> =>
      ipcRenderer.invoke('tracker:get-idle-seconds'),
  },
  tray: {
    setStatus: (status: 'focused' | 'distracted' | 'idle'): Promise<void> =>
      ipcRenderer.invoke('tray:set-status', status),
  },
})
