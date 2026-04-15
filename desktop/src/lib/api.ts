const BASE_URL = 'http://localhost:8000'

async function getToken(): Promise<string | null> {
  return (await window.electron.store.get('access_token')) as string | null
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  authenticated = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (authenticated) {
    const token = await getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail ?? 'Request failed')
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

// Auth
export const api = {
  auth: {
    register: (email: string, name: string, password: string) =>
      request<{ access_token: string; refresh_token: string; token_type: string }>(
        '/auth/register',
        { method: 'POST', body: JSON.stringify({ email, name, password }) },
        false
      ),
    login: (email: string, password: string) =>
      request<{ access_token: string; refresh_token: string; token_type: string }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) },
        false
      ),
    refresh: (refresh_token: string) =>
      request<{ access_token: string }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token }),
      }, false),
  },

  users: {
    me: () => request<{ id: string; email: string; name: string; subscription: string; daily_goal_min: number }>('/users/me'),
  },

  subjects: {
    list: () => request<{ id: string; name: string; color: string }[]>('/subjects'),
    create: (name: string, color: string) =>
      request<{ id: string; name: string; color: string }>('/subjects', {
        method: 'POST',
        body: JSON.stringify({ name, color }),
      }),
  },

  sessions: {
    start: (payload: {
      subject_id: string
      topic: string
      study_mode: string
      duration_goal_min: number
      goal: string
    }) => request<{ id: string; started_at: string }>('/sessions/start', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
    stop: (session_id: string) =>
      request<{ total_minutes: number; real_focus_min: number; focus_score: number; ai_feedback: string }>(
        '/sessions/stop',
        { method: 'POST', body: JSON.stringify({ session_id }) }
      ),
  },

  activity: {
    post: (payload: {
      session_id: string
      face_present: boolean
      looking_at_screen: boolean
      phone_detected: boolean
      active_app: string
      window_switches: number
      idle_seconds: number
    }) =>
      request<{ is_focused: boolean; focus_score: number; distraction_type: string | null; fire_checkin: boolean }>(
        '/activity',
        { method: 'POST', body: JSON.stringify(payload) }
      ),
  },

  checkins: {
    answer: (checkin_id: string, answer: string) =>
      request<{ is_correct: boolean; feedback: string }>('/checkins/answer', {
        method: 'POST',
        body: JSON.stringify({ checkin_id, answer }),
      }),
  },
}
