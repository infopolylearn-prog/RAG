const DEFAULT_API_BASE_URL = 'https://edumentor-backend-fbe9.onrender.com';

export function getApiBaseUrl() {
  return process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL;
}

export function getApiUrl(path = '') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}

export async function apiFetch(path, options = {}, token) {
  const headers = { ...(options.headers || {}) };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(getApiUrl(path), {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type') || '';
  const responseData = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  return { response, data: responseData };
}

