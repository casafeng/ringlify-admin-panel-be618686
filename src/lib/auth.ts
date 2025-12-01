// Authentication utilities for Business Dashboard

const TOKEN_KEY = 'business_jwt_token';
const BUSINESS_ID_KEY = 'business_id';

export interface AuthState {
  token: string | null;
  businessId: string | null;
  isAuthenticated: boolean;
}

export function getStoredAuth(): AuthState {
  const token = localStorage.getItem(TOKEN_KEY);
  const businessId = localStorage.getItem(BUSINESS_ID_KEY);
  
  return {
    token,
    businessId,
    isAuthenticated: !!token && !!businessId,
  };
}

export function setStoredAuth(token: string, businessId: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(BUSINESS_ID_KEY, businessId);
}

export function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(BUSINESS_ID_KEY);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getBusinessId(): string | null {
  return localStorage.getItem(BUSINESS_ID_KEY);
}
