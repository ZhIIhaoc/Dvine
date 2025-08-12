import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockFetchResponse, mockFetchError } from '../../test/utils/test-utils';
import { logout, isAuthenticated, getAccessToken, getRefreshToken, forceLogout } from '../authUtils';

// Mock the SubmitLogout function
vi.mock('../../endpoints/SubmitLogout.js', () => ({
  default: vi.fn()
}));

describe('Auth Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Token Management', () => {
    it('should get access token from localStorage', () => {
      localStorage.setItem('accessToken', 'test-token');
      expect(getAccessToken()).toBe('test-token');
    });

    it('should get refresh token from localStorage', () => {
      localStorage.setItem('refreshToken', 'refresh-token');
      expect(getRefreshToken()).toBe('refresh-token');
    });

    it('should check if user is authenticated', () => {
      localStorage.setItem('accessToken', 'test-token');
      expect(isAuthenticated()).toBe(true);
    });

    it('should return false when no token exists', () => {
      localStorage.removeItem('accessToken');
      expect(isAuthenticated()).toBe(false);
    });

    it('should return false for empty token', () => {
      localStorage.setItem('accessToken', '');
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('Logout Function', () => {
    it('should handle successful logout with token', async () => {
      const mockSetToken = vi.fn();
      const mockNavigate = vi.fn();
      const mockShowSnackbar = vi.fn();
      
      localStorage.setItem('accessToken', 'test-token');
      
      // Mock successful logout response
      const mockResponse = {
        json: vi.fn().mockResolvedValue({ code: 0 })
      };
      
      const SubmitLogout = (await import('../../endpoints/SubmitLogout.js')).default;
      SubmitLogout.mockResolvedValue(mockResponse);
      
      await logout(mockSetToken, mockNavigate, mockShowSnackbar);
      
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(mockSetToken).toHaveBeenCalledWith(null);
      expect(mockShowSnackbar).toHaveBeenCalledWith('Logout successful', 'success');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should handle logout without token', async () => {
      const mockSetToken = vi.fn();
      const mockNavigate = vi.fn();
      const mockShowSnackbar = vi.fn();
      
      localStorage.removeItem('accessToken');
      
      await logout(mockSetToken, mockNavigate, mockShowSnackbar);
      
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(mockSetToken).toHaveBeenCalledWith(null);
      expect(mockShowSnackbar).toHaveBeenCalledWith('Logged out', 'info');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Force Logout Function', () => {
    it('should clear all data and redirect', async () => {
      const mockSetToken = vi.fn();
      const mockNavigate = vi.fn();
      const mockShowSnackbar = vi.fn();
      
      localStorage.setItem('accessToken', 'test-token');
      localStorage.setItem('refreshToken', 'refresh-token');
      localStorage.setItem('Email', 'test@example.com');
      
      await forceLogout(mockSetToken, mockNavigate, mockShowSnackbar, 'Custom message');
      
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('Email')).toBeNull();
      expect(mockSetToken).toHaveBeenCalledWith(null);
      expect(mockShowSnackbar).toHaveBeenCalledWith('Custom message', 'warning');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should use default message when none provided', async () => {
      const mockSetToken = vi.fn();
      const mockNavigate = vi.fn();
      const mockShowSnackbar = vi.fn();
      
      await forceLogout(mockSetToken, mockNavigate, mockShowSnackbar);
      
      expect(mockShowSnackbar).toHaveBeenCalledWith('Session expired', 'warning');
    });
  });

  describe('Error Handling', () => {
    it('should handle logout API errors gracefully', async () => {
      const mockSetToken = vi.fn();
      const mockNavigate = vi.fn();
      const mockShowSnackbar = vi.fn();
      
      localStorage.setItem('accessToken', 'test-token');
      
      // Mock API error
      const SubmitLogout = (await import('../../endpoints/SubmitLogout.js')).default;
      SubmitLogout.mockRejectedValue(new Error('Network error'));
      
      await logout(mockSetToken, mockNavigate, mockShowSnackbar);
      
      // Should still clear local storage even if API fails
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(mockSetToken).toHaveBeenCalledWith(null);
      expect(mockShowSnackbar).toHaveBeenCalledWith('Logged out', 'info');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
