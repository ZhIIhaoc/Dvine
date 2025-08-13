import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '../../test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import PaymentDetailsModal from '../PaymentDetailsModal';

describe('PaymentDetailsModal', () => {
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

  it('renders modal without crashing', () => {
    render(<PaymentDetailsModal open={true} handleClose={() => {}} bookingId={1} token="test-token" />);
    expect(screen.getByText('Payment Details')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    global.fetch.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ code: 0, data: {} })
      }), 100))
    );
    
    render(<PaymentDetailsModal open={true} handleClose={() => {}} bookingId={1} token="test-token" />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('fetches payment details when opened', async () => {
    const mockPaymentData = {
      bookingReference: 'DVINE-2024-000001',
      amount: 200.00,
      currency: 'AUD',
      status: 'PAID',
      paymentMethod: 'Credit Card',
      paidAt: '2024-01-01T10:00:00Z',
      userEmail: 'test@example.com',
      refundAmount: 0
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ code: 0, data: mockPaymentData })
    });

    render(<PaymentDetailsModal open={true} handleClose={() => {}} bookingId={1} token="test-token" />);
    
    await waitFor(() => {
      expect(screen.getByTestId('payment-details')).toBeInTheDocument();
    });
  });

  it('displays payment details correctly', async () => {
    const mockPaymentData = {
      bookingReference: 'DVINE-2024-000001',
      amount: 200.00,
      currency: 'AUD',
      status: 'PAID',
      paymentMethod: 'Credit Card',
      paidAt: '2024-01-01T10:00:00Z',
      userEmail: 'test@example.com',
      refundAmount: 0
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ code: 0, data: mockPaymentData })
    });

    render(<PaymentDetailsModal open={true} handleClose={() => {}} bookingId={1} token="test-token" />);
    
    await waitFor(() => {
      expect(screen.getByTestId('reference')).toBeInTheDocument();
      expect(screen.getByTestId('amount')).toBeInTheDocument();
      expect(screen.getByTestId('status')).toBeInTheDocument();
      expect(screen.getByTestId('method')).toBeInTheDocument();
      expect(screen.getByTestId('user-email')).toBeInTheDocument();
      expect(screen.getByTestId('refunded')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ code: 1, msg: 'Payment not found' })
    });

    render(<PaymentDetailsModal open={true} handleClose={() => {}} bookingId={1} token="test-token" />);
    
    await waitFor(() => {
      expect(screen.getByTestId('no-payment-message')).toBeInTheDocument();
    });
  });

  it('handles network error gracefully', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));

    render(<PaymentDetailsModal open={true} handleClose={() => {}} bookingId={1} token="test-token" />);
    
    await waitFor(() => {
      expect(screen.getByTestId('no-payment-message')).toBeInTheDocument();
    });
  });

  it('calls handleClose when close button is clicked', async () => {
    const mockHandleClose = vi.fn();
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ code: 0, data: {} })
    });

    render(<PaymentDetailsModal open={true} handleClose={mockHandleClose} bookingId={1} token="test-token" />);
    
    await waitFor(() => {
      const closeButton = screen.getByTestId('close-button');
      return closeButton;
    });
    
    const closeButton = screen.getByTestId('close-button');
    await user.click(closeButton);
    
    expect(mockHandleClose).toHaveBeenCalled();
  });

  it('does not fetch when bookingId is not provided', () => {
    render(<PaymentDetailsModal open={true} handleClose={() => {}} token="test-token" />);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('does not fetch when modal is closed', () => {
    render(<PaymentDetailsModal open={false} handleClose={() => {}} bookingId={1} token="test-token" />);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('handles missing paidAt date', async () => {
    const mockPaymentData = {
      bookingReference: 'DVINE-2024-000001',
      amount: 200.00,
      currency: 'AUD',
      status: 'PAID',
      paymentMethod: 'Credit Card',
      paidAt: null,
      userEmail: 'test@example.com',
      refundAmount: 0
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ code: 0, data: mockPaymentData })
    });

    render(<PaymentDetailsModal open={true} handleClose={() => {}} bookingId={1} token="test-token" />);
    
    await waitFor(() => {
      expect(screen.getByTestId('paid-at')).toBeInTheDocument();
    });
  });

  it('handles refund amount correctly', async () => {
    const mockPaymentData = {
      bookingReference: 'DVINE-2024-000001',
      amount: 200.00,
      currency: 'AUD',
      status: 'REFUNDED',
      paymentMethod: 'Credit Card',
      paidAt: '2024-01-01T10:00:00Z',
      userEmail: 'test@example.com',
      refundAmount: 50.00
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ code: 0, data: mockPaymentData })
    });

    render(<PaymentDetailsModal open={true} handleClose={() => {}} bookingId={1} token="test-token" />);
    
    await waitFor(() => {
      expect(screen.getByTestId('refunded')).toBeInTheDocument();
    });
  });

  it('makes correct API call with bookingId and token', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ code: 0, data: {} })
    });

    render(<PaymentDetailsModal open={true} handleClose={() => {}} bookingId={123} token="auth-token" />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/payments/booking/123',
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'auth-token',
          },
        }
      );
    });
  });
});
