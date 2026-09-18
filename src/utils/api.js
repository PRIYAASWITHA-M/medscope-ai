const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('medscope_token')
  const headers = new Headers(options.headers || {})

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}

export { API_BASE_URL }
