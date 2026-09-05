const BASE_URL = '/api';

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Minimal fetch wrapper: unwraps the API's `{ data }` envelope,
 * throws a friendly `ApiError` for non-2xx responses.
 */
async function request(path, options) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, options);
  } catch {
    throw new ApiError('Could not reach the server. Is the backend running?', 0, 'NETWORK_ERROR');
  }

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const error = body?.error ?? {};
    throw new ApiError(error.message || `Request failed (${res.status})`, res.status, error.code);
  }

  return body?.data ?? body;
}

/** GET wrapper. */
export function apiGet(path) {
  return request(path);
}

/** POST JSON wrapper. */
export function apiPost(path, payload) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}