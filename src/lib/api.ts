// API Client for Ringlify Admin API
// Configure these in your environment:
// VITE_BACKEND_URL - Base URL of your backend
// VITE_ADMIN_API_KEY - Admin API key for authentication

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY || '';

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

export interface ApiError {
  error: string;
  message: string;
}

class ApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = BACKEND_URL;
    this.apiKey = ADMIN_API_KEY;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Request failed',
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.message || 'Request failed');
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Appointments
  async getAppointments(params: {
    page?: number;
    limit?: number;
    businessId?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{ data: Appointment[]; pagination: PaginationResult }> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.businessId) searchParams.set('businessId', params.businessId);
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);

    const query = searchParams.toString();
    return this.request(`/admin/appointments${query ? `?${query}` : ''}`);
  }

  // Call Logs
  async getCallLogs(params: {
    page?: number;
    limit?: number;
    businessId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{ data: CallLog[]; pagination: PaginationResult }> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.businessId) searchParams.set('businessId', params.businessId);
    if (params.status) searchParams.set('status', params.status);
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);

    const query = searchParams.toString();
    return this.request(`/admin/call-logs${query ? `?${query}` : ''}`);
  }

  // Businesses
  async getBusinesses(): Promise<{ data: Business[] }> {
    return this.request('/admin/businesses');
  }

  async getBusiness(id: string): Promise<Business> {
    return this.request(`/admin/businesses/${id}`);
  }

  async createBusiness(data: {
    name: string;
    phoneNumber: string;
    timezone?: string;
    description?: string;
    knowledgeBase?: Record<string, unknown>;
  }): Promise<Business> {
    return this.request('/admin/businesses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBusiness(
    id: string,
    data: {
      name?: string;
      phoneNumber?: string;
      timezone?: string;
      description?: string;
    }
  ): Promise<Business> {
    return this.request(`/admin/businesses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBusiness(id: string): Promise<void> {
    return this.request(`/admin/businesses/${id}`, {
      method: 'DELETE',
    });
  }

  async updateKnowledgeBase(
    id: string,
    knowledgeBase: Record<string, unknown>
  ): Promise<Business> {
    return this.request(`/admin/businesses/${id}/kb`, {
      method: 'POST',
      body: JSON.stringify({ knowledgeBase }),
    });
  }
}

export const api = new ApiClient();
