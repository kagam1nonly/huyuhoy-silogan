const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
let cachedCsrfToken = ''

function getCsrfFromCookie() {
  const matches = document.cookie.match(/(?:^|; )csrftoken=([^;]+)/)
  return matches ? decodeURIComponent(matches[1]) : ''
}

async function request(path, options = {}) {
  const customHeaders = options.headers || {}
  const isFormData = options.body instanceof FormData
  const baseHeaders = isFormData ? {} : { 'Content-Type': 'application/json' }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    cache: import.meta.env.DEV ? 'no-store' : 'default',
    ...options,
    headers: {
      ...baseHeaders,
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
  const payload = await request('/auth/csrf/', { method: 'GET' })
  if (payload?.csrfToken) {
    cachedCsrfToken = payload.csrfToken
  }
  return payload
}

async function resolveCsrfToken() {
  const cookieToken = getCsrfFromCookie()
  if (cookieToken) {
    cachedCsrfToken = cookieToken
    return cookieToken
  }

  if (cachedCsrfToken) {
    return cachedCsrfToken
  }

  const payload = await fetchCsrf()
  return payload?.csrfToken || ''
}

export async function signup(data) {
  const csrf = await resolveCsrfToken()
  return request('/auth/signup/', {
    method: 'POST',
    headers: { 'X-CSRFToken': csrf },
    body: JSON.stringify(data),
  })
}

export async function login(data) {
  const csrf = await resolveCsrfToken()
  return request('/auth/login/', {
    method: 'POST',
    headers: { 'X-CSRFToken': csrf },
    body: JSON.stringify(data),
  })
}

export async function logout() {
  const csrf = await resolveCsrfToken()
  return request('/auth/logout/', {
    method: 'POST',
    headers: { 'X-CSRFToken': csrf },
  })
}

export async function me() {
  return request('/auth/me/', { method: 'GET' })
}

export async function updateMe(data) {
  const csrf = await resolveCsrfToken()
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
  const csrf = await resolveCsrfToken()
  return request('/orders/', {
    method: 'POST',
    headers: { 'X-CSRFToken': csrf },
    body: JSON.stringify(orderData),
  })
}

export async function cancelOrder(orderNumber) {
  const csrf = await resolveCsrfToken()
  return request(`/orders/${orderNumber}/cancel/`, {
    method: 'POST',
    headers: { 'X-CSRFToken': csrf },
  })
}

export async function processGcashPayment(orderNumber, paymentData) {
  const csrf = await resolveCsrfToken()
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
  const csrf = await resolveCsrfToken()
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
  const csrf = await resolveCsrfToken()
  return request(`/admin/payments/${paymentId}/confirm/`, {
    method: 'POST',
    headers: { 'X-CSRFToken': csrf },
  })
}

export async function adminDeletePayment(paymentId) {
  const csrf = await resolveCsrfToken()
  return request(`/admin/payments/${paymentId}/`, {
    method: 'DELETE',
    headers: { 'X-CSRFToken': csrf },
  })
}

export async function adminFetchMeals() {
  return request('/admin/meals/', { method: 'GET' })
}

export async function adminCreateMeal(formData) {
  const csrf = await resolveCsrfToken()
  return request('/admin/meals/', {
    method: 'POST',
    headers: { 'X-CSRFToken': csrf },
    body: formData,
  })
}

export async function adminUpdateMeal(mealId, formData) {
  const csrf = await resolveCsrfToken()
  return request(`/admin/meals/${mealId}/`, {
    method: 'PATCH',
    headers: { 'X-CSRFToken': csrf },
    body: formData,
  })
}

export async function adminDeleteMeal(mealId) {
  const csrf = await resolveCsrfToken()
  return request(`/admin/meals/${mealId}/`, {
    method: 'DELETE',
    headers: { 'X-CSRFToken': csrf },
  })
}

export async function adminFetchUsers() {
  return request('/admin/users/', { method: 'GET' })
}

export async function adminUpdateUser(userId, data) {
  const csrf = await resolveCsrfToken()
  return request(`/admin/users/${userId}/`, {
    method: 'PATCH',
    headers: { 'X-CSRFToken': csrf },
    body: JSON.stringify(data),
  })
}

export async function adminDeleteUser(userId) {
  const csrf = await resolveCsrfToken()
  return request(`/admin/users/${userId}/`, {
    method: 'DELETE',
    headers: { 'X-CSRFToken': csrf },
  })
}
