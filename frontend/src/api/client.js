const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function getCsrfFromCookie() {
  const matches = document.cookie.match(/(?:^|; )csrftoken=([^;]+)/)
  return matches ? decodeURIComponent(matches[1]) : ''
}

async function request(path, options = {}) {
  const customHeaders = options.headers || {}

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    cache: import.meta.env.DEV ? 'no-store' : 'default',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...customHeaders,
    },
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await response.json() : null

  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || 'Request failed')
  }

  return payload
}

export async function fetchCsrf() {
  return request('/auth/csrf/', { method: 'GET' })
}

export async function signup(data) {
  const csrf = getCsrfFromCookie()
  return request('/auth/signup/', {
    method: 'POST',
    headers: { 'X-CSRFToken': csrf },
    body: JSON.stringify(data),
  })
}

export async function login(data) {
  const csrf = getCsrfFromCookie()
  return request('/auth/login/', {
    method: 'POST',
    headers: { 'X-CSRFToken': csrf },
    body: JSON.stringify(data),
  })
}

export async function logout() {
  const csrf = getCsrfFromCookie()
  return request('/auth/logout/', {
    method: 'POST',
    headers: { 'X-CSRFToken': csrf },
  })
}

export async function me() {
  return request('/auth/me/', { method: 'GET' })
}

export async function updateMe(data) {
  const csrf = getCsrfFromCookie()
  return request('/auth/me/', {
    method: 'PATCH',
    headers: { 'X-CSRFToken': csrf },
    body: JSON.stringify(data),
  })
}

export async function fetchMeals() {
  return request('/meals/', { method: 'GET' })
}

export async function fetchOrders() {
  return request('/orders/', { method: 'GET' })
}

export async function createOrder(orderData) {
  const csrf = getCsrfFromCookie()
  return request('/orders/', {
    method: 'POST',
    headers: { 'X-CSRFToken': csrf },
    body: JSON.stringify(orderData),
  })
}

export async function cancelOrder(orderNumber) {
  const csrf = getCsrfFromCookie()
  return request(`/orders/${orderNumber}/cancel/`, {
    method: 'POST',
    headers: { 'X-CSRFToken': csrf },
  })
}

export async function processGcashPayment(orderNumber, paymentData) {
  const csrf = getCsrfFromCookie()
  return request(`/orders/${orderNumber}/payment/gcash/`, {
    method: 'POST',
    headers: { 'X-CSRFToken': csrf },
    body: JSON.stringify(paymentData),
  })
}

export async function adminFetchOrders() {
  return request('/admin/orders/', { method: 'GET' })
}

export async function adminOrderAction(orderId, action) {
  const csrf = getCsrfFromCookie()
  return request(`/admin/orders/${orderId}/action/`, {
    method: 'POST',
    headers: { 'X-CSRFToken': csrf },
    body: JSON.stringify({ action }),
  })
}

export async function adminFetchPayments() {
  return request('/admin/payments/', { method: 'GET' })
}

export async function adminConfirmPayment(paymentId) {
  const csrf = getCsrfFromCookie()
  return request(`/admin/payments/${paymentId}/confirm/`, {
    method: 'POST',
    headers: { 'X-CSRFToken': csrf },
  })
}

export async function adminDeletePayment(paymentId) {
  const csrf = getCsrfFromCookie()
  return request(`/admin/payments/${paymentId}/`, {
    method: 'DELETE',
    headers: { 'X-CSRFToken': csrf },
  })
}
