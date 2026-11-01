// Browser-side API client. Talks only to our own /api routes — never to the database directly.
import { useCallback, useEffect, useRef, useState } from 'react'

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone

export async function api(path, { method = 'GET', body, signal } = {}) {
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      signal,
      credentials: 'same-origin',
      headers: { 'X-Timezone': TZ, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ApiError('Can’t reach PulseFit right now. Check your internet connection and try again.', 0, 'NETWORK')
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    /* non-JSON response */
  }
  if (!res.ok) {
    if (!data && res.status >= 500) {
      throw new ApiError('The PulseFit server isn’t responding. Make sure it’s running and try again.', res.status, 'SERVER_DOWN')
    }
    throw new ApiError(data?.error ?? `Request failed (${res.status})`, res.status, data?.code)
  }
  return data
}

/** Loads `path` on mount. Returns { data, error, loading, reload, setData }. */
export function useApiData(path) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const ctrl = useRef(null)

  const load = useCallback(async () => {
    ctrl.current?.abort()
    const c = new AbortController()
    ctrl.current = c
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await api(path, { signal: c.signal })
      if (!c.signal.aborted) setState({ data, error: null, loading: false })
    } catch (err) {
      if (err.name !== 'AbortError') setState((s) => ({ ...s, error: err, loading: false }))
    }
  }, [path])

  useEffect(() => {
    load()
    return () => ctrl.current?.abort()
  }, [load])

  const setData = useCallback((updater) => {
    setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater }))
  }, [])

  return { ...state, reload: load, setData }
}

export const initials = (name = '') =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?'

export const difficultyLevel = { Beginner: 1, Intermediate: 2, Advanced: 3 }
