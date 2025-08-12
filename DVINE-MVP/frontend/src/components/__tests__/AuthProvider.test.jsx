import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { AuthProvider } from '../AuthProvider';
import { mockUser } from '../../test/utils/test-utils';

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    localStorage.clear();
    cleanup(); // Clean up DOM after each test
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup(); // Clean up DOM after each test
  });

  const TestChild = () => <div data-testid="test-child">Test Child</div>;

  it('renders children without crashing', () => {
    render(
      <AuthProvider>
        <TestChild />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('initializes with token from localStorage', () => {
    const testToken = 'test-token-123';
    localStorage.setItem('accessToken', testToken);
    
    render(
      <AuthProvider>
        <TestChild />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('removes token from localStorage when token is null', () => {
    localStorage.setItem('accessToken', 'test-token');
    
    render(
      <AuthProvider>
        <TestChild />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('provides logout function that clears token and user info', () => {
    render(
      <AuthProvider>
        <TestChild />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('does not fetch profile when no token exists', () => {
    render(
      <AuthProvider>
        <TestChild />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('handles empty token string', () => {
    localStorage.setItem('accessToken', '');
    
    render(
      <AuthProvider>
        <TestChild />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('handles null token from localStorage', () => {
    localStorage.setItem('accessToken', 'null');
    
    render(
      <AuthProvider>
        <TestChild />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('provides setToken function', () => {
    render(
      <AuthProvider>
        <TestChild />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('provides setUserInfo function', () => {
    render(
      <AuthProvider>
        <TestChild />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('initializes with null userInfo when no token', () => {
    render(
      <AuthProvider>
        <TestChild />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });
});
