import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getStoredAuth, 
  setStoredAuth, 
  clearStoredAuth, 
  AuthState 
} from '@/lib/auth';
import { businessApi, Business } from '@/lib/business-api';

export interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  businessId: string | null;
  business: Business | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshBusiness: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>(getStoredAuth);
  const [isLoading, setIsLoading] = useState(true);
  const [business, setBusiness] = useState<Business | null>(null);

  const refreshBusiness = useCallback(async () => {
    if (!authState.isAuthenticated) return;
    
    try {
      const businessData = await businessApi.getBusiness();
      setBusiness(businessData);
    } catch (error) {
      console.error('Failed to fetch business:', error);
    }
  }, [authState.isAuthenticated]);

  useEffect(() => {
    const initAuth = async () => {
      const stored = getStoredAuth();
      setAuthState(stored);

      if (stored.isAuthenticated) {
        try {
          const businessData = await businessApi.getBusiness();
          setBusiness(businessData);
        } catch (error) {
          // Token might be invalid
          clearStoredAuth();
          setAuthState({ token: null, businessId: null, isAuthenticated: false });
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await businessApi.login(email, password);
      
      setStoredAuth(response.token, response.businessId);
      setAuthState({
        token: response.token,
        businessId: response.businessId,
        isAuthenticated: true,
      });
      setBusiness(response.business);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  const logout = useCallback(() => {
    clearStoredAuth();
    setAuthState({ token: null, businessId: null, isAuthenticated: false });
    setBusiness(null);
    navigate('/business/login');
  }, [navigate]);

  return {
    isAuthenticated: authState.isAuthenticated,
    isLoading,
    businessId: authState.businessId,
    business,
    login,
    logout,
    refreshBusiness,
  };
}
