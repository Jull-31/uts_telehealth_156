import { DEFAULT_CONFIG, getApiToken, getMahasiswa } from './config';

const BASE_URL = DEFAULT_CONFIG.apiUrl.replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(status, message, errors = null, data = null) {
    super(message || 'Terjadi kesalahan pada server');
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.data = data;
  }
}

/**
 * Universal API fetch helper
 * @param {string} path - API endpoint path, e.g. '/forms' or '/assessments'
 * @param {object} options - fetch options: method, body, headers, customToken, params
 */
export async function apiRequest(path, { method = 'GET', body, headers = {}, customToken, params } = {}) {
  const token = customToken !== undefined ? customToken : getApiToken();
  const mhs = getMahasiswa();

  // Normalize path
  let endpoint = path.startsWith('/') ? path : `/${path}`;

  // Query parameters handling
  const urlObj = new URL(`${BASE_URL}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        urlObj.searchParams.set(k, v);
      }
    });
  }

  // Auto inject NIM for endpoints that require it if missing
  if (endpoint === '/me' && !urlObj.searchParams.has('nim')) {
    urlObj.searchParams.set('nim', mhs.nim);
  }
  if (endpoint === '/assessments' && method === 'GET' && !urlObj.searchParams.has('nim')) {
    urlObj.searchParams.set('nim', mhs.nim);
  }
  if (endpoint.startsWith('/uts') && !endpoint.includes('/')) {
    // handled by caller with full path /uts/{nim}
  }

  const reqHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Skip token only for root / or /api public check if desired
  if (token && endpoint !== '/' && endpoint !== '/api') {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions = {
    method,
    headers: reqHeaders,
  };

  if (body !== undefined) {
    // If it's a POST /assessments and mahasiswa is not included, inject it
    if (endpoint === '/assessments' && method === 'POST' && typeof body === 'object') {
      if (!body.mahasiswa) {
        body = {
          ...body,
          mahasiswa: {
            nim: mhs.nim,
            nama: mhs.nama,
            kelas: mhs.kelas,
          },
        };
      }
    }
    fetchOptions.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(urlObj.toString(), fetchOptions);
  } catch (netErr) {
    throw new ApiError(
      0,
      'Gagal terhubung ke server. Periksa koneksi internet Anda.',
      null,
      null
    );
  }

  let json = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      json = await res.json();
    } catch (e) {
      json = null;
    }
  }

  if (!res.ok) {
    const errorMsg = json?.message || (res.status === 401 
      ? 'Koneksi ke layanan bermasalah (Token tidak valid atau belum diisi).' 
      : res.status === 409 
      ? 'Laporan ini sudah dikirim dan tidak dapat diubah.' 
      : res.status === 404 
      ? 'Data tidak ditemukan.' 
      : `Terjadi kesalahan (HTTP ${res.status})`);
      
    throw new ApiError(res.status, errorMsg, json?.errors || null, json?.data || null);
  }

  return json;
}

// Convenience methods
export const api = {
  // Public check
  checkHealth: () => apiRequest('/'),
  
  // Profile & UTS
  getMe: (nim) => apiRequest('/me', { params: nim ? { nim } : undefined }),
  getUtsStatus: (nim) => {
    const n = nim || getMahasiswa().nim;
    return apiRequest(`/uts/${n}`);
  },

  // Forms
  getForms: () => apiRequest('/forms'),
  getForm: (id) => apiRequest(`/forms/${id}`),
  validateForm: (id, answers, nim) => {
    const m = nim || getMahasiswa().nim;
    return apiRequest(`/forms/${id}/validate`, {
      method: 'POST',
      body: { nim: m, answers },
    });
  },

  // Assessments
  createAssessment: (payload) => apiRequest('/assessments', { method: 'POST', body: payload }),
  getAssessments: (params) => apiRequest('/assessments', { params }),
  getAssessment: (id) => apiRequest(`/assessments/${id}`),
  patchAssessment: (id, answers) => apiRequest(`/assessments/${id}`, { method: 'PATCH', body: { answers } }),
  putAssessment: (id, answers) => apiRequest(`/assessments/${id}`, { method: 'PUT', body: { answers } }),
  deleteAssessment: (id) => apiRequest(`/assessments/${id}`, { method: 'DELETE' }),
  submitAssessment: (id) => apiRequest(`/assessments/${id}/submit`, { method: 'POST' }),
  getAssessmentHasil: (id) => apiRequest(`/assessments/${id}/hasil`),
  getAssessmentStatus: (id) => apiRequest(`/assessments/${id}/status`),
  
  // Clarification reply
  replyClarification: (id, clarificationId, jawaban) =>
    apiRequest(`/assessments/${id}/clarifications/${clarificationId}/reply`, {
      method: 'POST',
      body: { jawaban },
    }),
};
