import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockAuthValue } from '../../test/utils/test-utils';
import BookNowButton from '../BookNowButton';

// Mock Stripe
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve({
    elements: vi.fn(() => ({
      create: vi.fn(),
    })),
    confirmPayment: vi.fn(),
    confirmCardPayment: vi.fn(),
  })),
}));

describe('BookNowButton', () => {
  const user = userEvent.setup();
  
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    cleanup(); // Clean up DOM after each test
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup(); // Clean up DOM after each test
  });

  const defaultProps = {
    tourId: 1,
    quantity: 1,
    travelDate: '2024-12-25',
    disabled: false
  };

  it('renders book now button with correct text', () => {
    render(<BookNowButton {...defaultProps} />, {
      authValue: mockAuthValue
    });
    
    expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<BookNowButton {...defaultProps} disabled={true} />, {
      authValue: mockAuthValue
    });
    
    expect(screen.getByRole('button', { name: /book now/i })).toBeDisabled();
  });

  it('handles different quantity values', () => {
    render(<BookNowButton {...defaultProps} quantity={3} />, {
      authValue: mockAuthValue
    });
    
    expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument();
  });

  it('shows loading state when booking is in progress', async () => {
    // Mock fetch to return a promise that resolves after a delay
    global.fetch.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ code: 0 })
      }), 100))
    );
    
    render(<BookNowButton {...defaultProps} />, {
      authValue: mockAuthValue
    });
    
    const button = screen.getByRole('button', { name: /book now/i });
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('works without authentication token', () => {
    render(<BookNowButton {...defaultProps} />, {
      authValue: { ...mockAuthValue, token: null }
    });
    
    expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument();
  });

  it('accepts travelDate prop without affecting disabled state', () => {
    render(<BookNowButton {...defaultProps} travelDate={undefined} />, {
      authValue: mockAuthValue
    });
    
    // The button should not be disabled just because travelDate is undefined
    // The disabled state is controlled by the disabled prop, not travelDate
    expect(screen.getByRole('button', { name: /book now/i })).not.toBeDisabled();
  });
});
