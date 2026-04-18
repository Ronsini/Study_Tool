export {}

declare global {
  interface Window {
    electron: {
      store: {
        get: (key: string) => Promise<unknown>
        set: (key: string, value: unknown) => Promise<void>
        delete: (key: string) => Promise<void>
      }
      tracker: {
        getAppInfo: () => Promise<{ app: string; browser_url: string | null }>
        getIdleSeconds: () => Promise<number>
      }
      tray: {
        setStatus: (status: 'focused' | 'distracted' | 'idle') => Promise<void>
      }
    }
  }
}
