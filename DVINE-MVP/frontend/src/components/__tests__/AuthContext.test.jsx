import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render as originalRender, screen, cleanup } from '@testing-library/react';
import { render } from '../../test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { AuthContext, useAuth } from '../AuthContext';

// Test component that uses the useAuth hook
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="token">{auth.token || 'no-token'}</span>
      <span data-testid="user-info">{auth.userInfo ? 'has-user' : 'no-user'}</span>
      <button 
        data-testid="set-token" 
        onClick={() => auth.setToken('test-token')}
      >
        Set Token
      </button>
      <button 
        data-testid="logout" 
        onClick={() => auth.logout()}
      >
        Logout
      </button>
      <button 
        data-testid="set-user" 
        onClick={() => auth.setUserInfo({ id: 1, name: 'Test User' })}
      >
        Set User
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    cleanup(); // Clean up DOM after each test
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup(); // Clean up DOM after each test
  });

  it('provides default values when no provider is present', () => {
    // Render without the custom wrapper to test default context values
    originalRender(<TestComponent />);
    
    expect(screen.getByTestId('token')).toHaveTextContent('no-token');
    expect(screen.getByTestId('user-info')).toHaveTextContent('no-user');
  });

  it('provides custom values when provider is present', () => {
    const mockAuthValue = {
      token: 'test-token',
      setToken: vi.fn(),
      logout: vi.fn(),
      userInfo: { id: 1, name: 'Test User' },
      setUserInfo: vi.fn(),
    };

    render(
      <AuthContext.Provider value={mockAuthValue}>
        <TestComponent />
      </AuthContext.Provider>
    );
    
    expect(screen.getByTestId('token')).toHaveTextContent('test-token');
    expect(screen.getByTestId('user-info')).toHaveTextContent('has-user');
  });

  it('calls setToken when set token button is clicked', async () => {
    const mockSetToken = vi.fn();
    const mockAuthValue = {
      token: null,
      setToken: mockSetToken,
      logout: vi.fn(),
      userInfo: null,
      setUserInfo: vi.fn(),
    };

    render(
      <AuthContext.Provider value={mockAuthValue}>
        <TestComponent />
      </AuthContext.Provider>
    );
    
    const setTokenButton = screen.getByTestId('set-token');
    setTokenButton.click();
    
    expect(mockSetToken).toHaveBeenCalledWith('test-token');
  });

  it('calls logout when logout button is clicked', async () => {
    const mockLogout = vi.fn();
    const mockAuthValue = {
      token: 'test-token',
      setToken: vi.fn(),
      logout: mockLogout,
      userInfo: { id: 1, name: 'Test User' },
      setUserInfo: vi.fn(),
    };

    render(
      <AuthContext.Provider value={mockAuthValue}>
        <TestComponent />
      </AuthContext.Provider>
    );
    
    const logoutButton = screen.getByTestId('logout');
    logoutButton.click();
    
    expect(mockLogout).toHaveBeenCalled();
  });

  it('calls setUserInfo when set user button is clicked', async () => {
    const mockSetUserInfo = vi.fn();
    const mockAuthValue = {
      token: null,
      setToken: vi.fn(),
      logout: vi.fn(),
      userInfo: null,
      setUserInfo: mockSetUserInfo,
    };

    render(
      <AuthContext.Provider value={mockAuthValue}>
        <TestComponent />
      </AuthContext.Provider>
    );
    
    const setUserButton = screen.getByTestId('set-user');
    setUserButton.click();
    
    expect(mockSetUserInfo).toHaveBeenCalledWith({ id: 1, name: 'Test User' });
  });

  it('useAuth hook returns context value', () => {
    const mockAuthValue = {
      token: 'test-token',
      setToken: vi.fn(),
      logout: vi.fn(),
      userInfo: { id: 1, name: 'Test User' },
      setUserInfo: vi.fn(),
    };

    render(
      <AuthContext.Provider value={mockAuthValue}>
        <TestComponent />
      </AuthContext.Provider>
    );
    
    // The component should render with the provided values
    expect(screen.getByTestId('token')).toHaveTextContent('test-token');
    expect(screen.getByTestId('user-info')).toHaveTextContent('has-user');
  });
});
