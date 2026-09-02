// --- FILE: frontend/src/api/client.js ---

/**
 * Utility to extract cookie value by name
 */
export function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const BASE_URL = '/api';

/**
 * Centralized HTTP request client with CSRF protection and error normalization
 */
export async function apiClient(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  
  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  // Attach CSRF token on mutating requests
  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
  }

  // Handle FormData vs JSON payloads
  let body = options.body;
  if (body && !(body instanceof FormData) && typeof body === 'object') {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const config = {
    ...options,
    method,
    headers,
    credentials: options.credentials || 'include',
    body,
  };

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return { success: true };
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorObj = {
        status: response.status,
        success: false,
        message: data?.message || data?.detail || 'An unexpected error occurred.',
        errors: data?.errors || (typeof data === 'object' && !data?.message ? data : null),
        data: data,
      };
      throw errorObj;
    }

    return data;
  } catch (err) {
    if (err.status) {
      throw err;
    }
    // Network or parse error
    throw {
      status: 0,
      success: false,
      message: err.message || 'Unable to connect to server. Please check your connection.',
      errors: null,
    };
  }
}
