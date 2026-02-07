import { ApiError, AuthError } from './errors.js';

export class HttpClient {
  private baseUrl: string;
  private token: string | null;

  constructor(baseUrl: string, token?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = token || null;
  }

  setToken(token: string | null): void {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken(): void {
    this.token = null;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async request<T = unknown>(
    method: string,
    endpoint: string,
    data?: Record<string, unknown> | null,
    query?: Record<string, string | number>,
    useAuth = true
  ): Promise<T> {
    let url = this.baseUrl + endpoint;

    if (query && Object.keys(query).length > 0) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      }
      const queryString = params.toString();
      if (queryString) {
        url += '?' + queryString;
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (useAuth && this.token) {
      headers['Authorization'] = this.token;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (data !== null && data !== undefined && ['POST', 'PATCH', 'PUT'].includes(method)) {
      options.body = JSON.stringify(data);
    }

    let response: Response;
    try {
      response = await fetch(url, options);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new ApiError(`Request failed: ${message}`, { details: { method, endpoint } });
    }

    const text = await response.text();

    let decoded: T | { message?: string } | undefined;
    try {
      decoded = text ? JSON.parse(text) : undefined;
    } catch {
      decoded = undefined;
    }

    if (!response.ok) {
      const message =
        (decoded && typeof decoded === 'object' && 'message' in decoded && decoded.message) ||
        `HTTP error ${response.status}`;
      if (response.status === 401 || response.status === 403) {
        throw new AuthError(message, {
          statusCode: response.status,
          details: { method, endpoint, response: decoded },
        });
      }

      throw new ApiError(message, {
        statusCode: response.status,
        details: { method, endpoint, response: decoded },
      });
    }

    return decoded as T;
  }

  async authenticate(email: string, password: string): Promise<string | null> {
    const response = await this.request<{ token?: string }>(
      'POST',
      '/api/collections/_superusers/auth-with-password',
      {
        identity: email,
        password: password,
      },
      undefined,
      false
    );

    this.token = response.token || null;
    return this.token;
  }
}
