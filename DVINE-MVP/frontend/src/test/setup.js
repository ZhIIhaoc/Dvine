import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia with better implementation
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
});

// Mock window.scroll
Object.defineProperty(window, 'scroll', {
  value: vi.fn(),
});

// Mock window.innerHeight and innerWidth
Object.defineProperty(window, 'innerHeight', {
  writable: true,
  value: 768,
});

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  value: 1024,
});

// Mock window.outerHeight and outerWidth
Object.defineProperty(window, 'outerHeight', {
  writable: true,
  value: 768,
});

Object.defineProperty(window, 'outerWidth', {
  writable: true,
  value: 1024,
});

// Mock Stripe
global.Stripe = vi.fn().mockImplementation(() => ({
  elements: vi.fn(() => ({
    create: vi.fn(),
  })),
  confirmPayment: vi.fn(),
  confirmCardPayment: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: vi.fn((key) => localStorageMock.store[key] || null),
  setItem: vi.fn((key, value) => {
    localStorageMock.store[key] = value;
  }),
  removeItem: vi.fn((key) => {
    delete localStorageMock.store[key];
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {};
  }),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  store: {},
  getItem: vi.fn((key) => sessionStorageMock.store[key] || null),
  setItem: vi.fn((key, value) => {
    sessionStorageMock.store[key] = value;
  }),
  removeItem: vi.fn((key) => {
    delete sessionStorageMock.store[key];
  }),
  clear: vi.fn(() => {
    sessionStorageMock.store = {};
  }),
};
global.sessionStorage = sessionStorageMock;

// Mock fetch
global.fetch = vi.fn();

// Mock @stripe/stripe-js
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve({
    elements: vi.fn(() => ({
      create: vi.fn(),
    })),
    confirmPayment: vi.fn(),
    confirmCardPayment: vi.fn(),
  })),
}));

// Enhanced cleanup function to ensure complete isolation
const enhancedCleanup = () => {
  // Clear all timers
  vi.clearAllTimers();
  
  // Clear all mocks
  vi.clearAllMocks();
  
  // Clear localStorage and sessionStorage
  localStorage.clear();
  sessionStorage.clear();
  
  // Clear fetch mock
  if (global.fetch) {
    global.fetch.mockClear();
  }
  
  // Clear any remaining DOM elements
  if (document.body) {
    document.body.innerHTML = '';
  }
  
  // Clear any remaining event listeners
  if (window.removeAllListeners) {
    window.removeAllListeners();
  }
};

// Make enhanced cleanup available globally
global.enhancedCleanup = enhancedCleanup;

// Override the default cleanup to use our enhanced version
import { cleanup as originalCleanup } from '@testing-library/react';
global.cleanup = () => {
  originalCleanup();
  enhancedCleanup();
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock Date.now for consistent testing
const mockDate = new Date('2024-01-01T00:00:00.000Z');
global.Date.now = vi.fn(() => mockDate.getTime());

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 0));
global.cancelAnimationFrame = vi.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');

// Mock FileReader
global.FileReader = vi.fn().mockImplementation(() => ({
  readAsDataURL: vi.fn(),
  readAsText: vi.fn(),
  onload: null,
  onerror: null,
  result: null,
}));
