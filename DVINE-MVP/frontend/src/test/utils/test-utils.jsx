import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AuthContext } from '../../components/AuthContext';
import { lightTheme } from '../../theme';
import { vi } from 'vitest';

// Mock data for tests
export const mockTour = {
  tourId: 1,
  title: 'Test Tour',
  destination: 'Test Destination',
  description: 'Test description',
  regularPrice: 100.00,
  premiumPrice: 80.00,
  primaryImageUrl: 'https://example.com/image.jpg',
  catalogueId: 1,
  catalogueTitle: 'Test Catalogue',
  creatorNickName: 'Test Creator',
  createTime: '2024-01-01T00:00:00Z',
  updateTime: '2024-01-01T00:00:00Z'
};

export const mockUser = {
  userId: 1,
  email: 'test@example.com',
  nickName: 'TestUser',
  firstName: 'Test',
  lastName: 'User',
  permission: 0,
  avatar: 'https://example.com/avatar.jpg',
  createTime: '2024-01-01T00:00:00Z',
  updateTime: '2024-01-01T00:00:00Z'
};

export const mockAuthValue = {
  token: 'mock-token',
  setToken: vi.fn(),
  logout: vi.fn(),
  userInfo: mockUser,
  setUserInfo: vi.fn()
};

// Custom render function that matches the real app hierarchy
const AllTheProviders = ({ children, authValue = mockAuthValue, theme = lightTheme }) => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <AuthContext.Provider value={authValue}>
            {children}
          </AuthContext.Provider>
        </LocalizationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

const customRender = (ui, options = {}) => {
  const { authValue, theme, ...renderOptions } = options;
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders authValue={authValue} theme={theme}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

export const mockBooking = {
  bookingId: 1,
  userId: 1,
  tourId: 1,
  bookingReference: 'DVINE-2024-000001',
  quantity: 2,
  unitPrice: 100.00,
  totalAmount: 200.00,
  currency: 'AUD',
  travelDate: '2024-12-25',
  status: 'PENDING',
  customerNotes: 'Test notes',
  createTime: '2024-01-01T00:00:00Z',
  updateTime: '2024-01-01T00:00:00Z'
};

// Mock API responses
export const mockApiResponses = {
  success: { code: 0, data: {}, msg: 'Success' },
  error: { code: 1, data: null, msg: 'Error occurred' },
};

// Helper function to mock fetch responses
export const mockFetchResponse = (response, status = 200) => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
    })
  );
};

// Helper function to mock fetch errors
export const mockFetchError = (error = 'Network error') => {
  global.fetch = vi.fn(() => Promise.reject(new Error(error)));
};

// Helper function to wait for async operations
export const waitForAsync = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));
