// Business API Client with JWT Authentication
// Environment variables:
// VITE_BACKEND_URL - Base URL of your backend

import { getAuthToken, getBusinessId, clearStoredAuth } from './auth';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Business {
  id: string;
  name: string;
  phoneNumber: string;
  timezone: string;
  description?: string;
  knowledgeBase?: Record<string, unknown>;
  _count?: {
    appointments: number;
    callLogs: number;
  };
}

export interface Appointment {
  id: string;
  name: string;
  phone: string;
  email?: string;
  start: string;
  end: string;
  business: {
    id: string;
    name: string;
    phoneNumber: string;
  };
}

export interface CallLog {
  id: string;
  callerPhone: string;
  callerName?: string;
  status: 'pending' | 'booked' | 'suggested_alternatives' | 'failed' | 'unavailable';
  requestedStart?: string;
  bookedStart?: string;
  bookedEnd?: string;
  createdAt?: string;
  business: {
    id: string;
    name: string;
    phoneNumber: string;
  };
}

export interface LoginResponse {
  token: string;
  businessId: string;
  business: Business;
}

export interface SignupResponse {
  id: string;
  name: string;
  email: string;
  token: string;
}

export interface ApiError {
  error: string;
  message: string;
}

class BusinessApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = BACKEND_URL;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (response.status === 401) {
      clearStoredAuth();
      window.location.href = '/business/login';
      throw new Error('Unauthorized - Please login again');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Request failed',
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.message || 'Request failed');
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

// Authentication
  async login(email: string, password: string): Promise<LoginResponse> {
    return this.request('/auth/business/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Signup
  async signup(name: string, email: string, password: string): Promise<SignupResponse> {
    return this.request('/auth/business/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  // Get current business info
  async getBusiness(): Promise<Business> {
    const businessId = getBusinessId();
    if (!businessId) throw new Error('No business ID found');
    return this.request(`/admin/businesses/${businessId}`);
  }

  // Update business settings
  async updateBusiness(data: {
    name?: string;
    phoneNumber?: string;
    timezone?: string;
    description?: string;
  }): Promise<Business> {
    const businessId = getBusinessId();
    if (!businessId) throw new Error('No business ID found');
    return this.request(`/admin/businesses/${businessId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Update knowledge base
  async updateKnowledgeBase(knowledgeBase: Record<string, unknown>): Promise<Business> {
    const businessId = getBusinessId();
    if (!businessId) throw new Error('No business ID found');
    return this.request(`/admin/businesses/${businessId}/kb`, {
      method: 'POST',
      body: JSON.stringify({ knowledgeBase }),
    });
  }

  // Get appointments for this business
  async getAppointments(params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    name?: string;
  } = {}): Promise<{ data: Appointment[]; pagination: PaginationResult }> {
    const businessId = getBusinessId();
    if (!businessId) throw new Error('No business ID found');

    const searchParams = new URLSearchParams();
    searchParams.set('businessId', businessId);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);

    const query = searchParams.toString();
    const result = await this.request<{ data: Appointment[]; pagination: PaginationResult }>(
      `/admin/appointments${query ? `?${query}` : ''}`
    );

    // Filter by name client-side if provided (since API might not support it)
    if (params.name) {
      const nameLower = params.name.toLowerCase();
      result.data = result.data.filter(apt => 
        apt.name.toLowerCase().includes(nameLower)
      );
    }

    return result;
  }

  // Get call logs for this business
  async getCallLogs(params: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{ data: CallLog[]; pagination: PaginationResult }> {
    const businessId = getBusinessId();
    if (!businessId) throw new Error('No business ID found');

    const searchParams = new URLSearchParams();
    searchParams.set('businessId', businessId);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.status) searchParams.set('status', params.status);
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);

    const query = searchParams.toString();
    return this.request(`/admin/call-logs${query ? `?${query}` : ''}`);
  }

  // Get today's stats
  async getTodayStats(): Promise<{ calls: number; appointments: number }> {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const [callsResult, appointmentsResult] = await Promise.all([
      this.getCallLogs({ startDate: today, endDate: tomorrow, limit: 1 }),
      this.getAppointments({ startDate: today, endDate: tomorrow, limit: 1 }),
    ]);

    return {
      calls: callsResult.pagination.total,
      appointments: appointmentsResult.pagination.total,
    };
  }
}

export const businessApi = new BusinessApiClient();
