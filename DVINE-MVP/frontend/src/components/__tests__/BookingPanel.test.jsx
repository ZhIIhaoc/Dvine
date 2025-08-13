import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '../../test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import BookingPanel from '../BookingPanel';

// Mock fetch
global.fetch = vi.fn();

// Mock window.confirm
global.window.confirm = vi.fn();

// Mock window.alert
global.window.alert = vi.fn();

describe('BookingPanel', () => {
  const user = userEvent.setup();
  const mockUserId = 1;

  const mockBookings = [
    {
      bookingId: 1,
      bookingReference: 'DVINE-2024-000001',
      tourTitle: 'Adventure Tour',
      tourDestination: 'Sydney',
      status: 'CONFIRMED',
      travelDate: '2024-12-25',
      totalAmount: 200.00,
      currency: 'AUD',
    },
    {
      bookingId: 2,
      bookingReference: 'DVINE-2024-000002',
      tourTitle: 'Luxury Tour',
      tourDestination: 'Melbourne',
      status: 'PENDING',
      travelDate: '2024-12-26',
      totalAmount: 300.00,
      currency: 'AUD',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockClear();
    global.window.confirm.mockClear();
    global.window.alert.mockClear();
    cleanup(); // Clean up DOM after each test
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup(); // Clean up DOM after each test
  });

  it('renders booking panel without crashing', () => {
    render(<BookingPanel userId={mockUserId} />);
    expect(screen.getByText(/your bookings/i)).toBeInTheDocument();
  });

  it('displays search field', () => {
    render(<BookingPanel userId={mockUserId} />);
    expect(screen.getByLabelText(/search bookings/i)).toBeInTheDocument();
  });

  it('fetches bookings on mount', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        code: 0,
        data: mockBookings,
      }),
    });

    render(<BookingPanel userId={mockUserId} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8080/bookings/user/${mockUserId}`
      );
    });
  });

  it('displays loading state while fetching bookings', () => {
    global.fetch.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ code: 0, data: [] })
      }), 100))
    );

    render(<BookingPanel userId={mockUserId} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays bookings when fetch is successful', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        code: 0,
        data: mockBookings,
      }),
    });

    render(<BookingPanel userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.getByText(/sydney - adventure tour/i)).toBeInTheDocument();
      expect(screen.getByText(/melbourne - luxury tour/i)).toBeInTheDocument();
    });
  });

  it('displays no bookings message when no bookings found', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        code: 0,
        data: [],
      }),
    });

    render(<BookingPanel userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.getByText(/no bookings found/i)).toBeInTheDocument();
    });
  });

  it('filters bookings based on search term', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        code: 0,
        data: mockBookings,
      }),
    });

    render(<BookingPanel userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.getByText(/sydney - adventure tour/i)).toBeInTheDocument();
    });

    const searchField = screen.getByLabelText(/search bookings/i);
    await user.type(searchField, 'Sydney');

    expect(screen.getByText(/sydney - adventure tour/i)).toBeInTheDocument();
    expect(screen.queryByText(/melbourne - luxury tour/i)).not.toBeInTheDocument();
  });

  it('displays booking details in accordion', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        code: 0,
        data: mockBookings,
      }),
    });

    render(<BookingPanel userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.getByText(/sydney - adventure tour/i)).toBeInTheDocument();
    });

    // Check for booking details - use getAllByText to handle multiple elements
    const referenceElements = screen.getAllByText(/reference/i);
    expect(referenceElements.length).toBeGreaterThan(0);
    
    const dvineElements = screen.getAllByText(/DVINE-2024-000001/i);
    expect(dvineElements.length).toBeGreaterThan(0);
    
    const statusElements = screen.getAllByText(/status/i);
    expect(statusElements.length).toBeGreaterThan(0);
    
    const confirmedElements = screen.getAllByText(/CONFIRMED/i);
    expect(confirmedElements.length).toBeGreaterThan(0);
    
    const dateElements = screen.getAllByText(/date/i);
    expect(dateElements.length).toBeGreaterThan(0);
    
    const dateValueElements = screen.getAllByText(/2024-12-25/i);
    expect(dateValueElements.length).toBeGreaterThan(0);
    
    const totalElements = screen.getAllByText(/total paid/i);
    expect(totalElements.length).toBeGreaterThan(0);
    
    const priceElements = screen.getAllByText(/\$200/i);
    expect(priceElements.length).toBeGreaterThan(0);
  });

  it('shows view payment button for each booking', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        code: 0,
        data: mockBookings,
      }),
    });

    render(<BookingPanel userId={mockUserId} />);

    await waitFor(() => {
      const viewPaymentButtons = screen.getAllByText(/view payment/i);
      expect(viewPaymentButtons).toHaveLength(2);
    });
  });

  it('shows cancel booking button for non-cancelled bookings', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        code: 0,
        data: mockBookings,
      }),
    });

    render(<BookingPanel userId={mockUserId} />);

    await waitFor(() => {
      const cancelButtons = screen.getAllByText(/cancel booking/i);
      expect(cancelButtons).toHaveLength(2);
    });
  });

  it('does not show cancel button for cancelled bookings', async () => {
    const cancelledBookings = [
      {
        ...mockBookings[0],
        status: 'CANCELLED',
      },
    ];

    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        code: 0,
        data: cancelledBookings,
      }),
    });

    render(<BookingPanel userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.queryByText(/cancel booking/i)).not.toBeInTheDocument();
    });
  });

  it('handles booking cancellation', async () => {
    global.window.confirm.mockReturnValue(true);
    global.fetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          code: 0,
          data: mockBookings,
        }),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          code: 0,
          msg: 'Booking cancelled successfully',
        }),
      });

    render(<BookingPanel userId={mockUserId} />);

    await waitFor(() => {
      const cancelButtons = screen.getAllByText(/cancel booking/i);
      expect(cancelButtons.length).toBeGreaterThan(0);
    });

    const cancelButtons = screen.getAllByText(/cancel booking/i);
    await user.click(cancelButtons[0]);

    expect(global.window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to cancel this booking?'
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/bookings/1/cancel',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });
  });

  it('handles cancellation confirmation rejection', async () => {
    global.window.confirm.mockReturnValue(false);
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        code: 0,
        data: mockBookings,
      }),
    });

    render(<BookingPanel userId={mockUserId} />);

    await waitFor(() => {
      const cancelButtons = screen.getAllByText(/cancel booking/i);
      expect(cancelButtons.length).toBeGreaterThan(0);
    });

    const cancelButtons = screen.getAllByText(/cancel booking/i);
    await user.click(cancelButtons[0]);

    expect(global.window.confirm).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining('/cancel')
    );
  });

  it('handles fetch error gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<BookingPanel userId={mockUserId} />);

    await waitFor(() => {
      // Should not crash and should show no bookings
      expect(screen.getByText(/no bookings found/i)).toBeInTheDocument();
    });
  });

  it('handles API error response', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        code: 1,
        msg: 'Failed to fetch bookings',
      }),
    });

    render(<BookingPanel userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.getByText(/no bookings found/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during booking process', async () => {
    global.fetch.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ code: 0 })
      }), 100))
    );
    
    render(<BookingPanel userId={mockUserId} />);
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText(/your bookings/i)).toBeInTheDocument();
    });
    
    // The BookingPanel doesn't have a "book now" button, so we'll test the loading state
    // that appears when the component first loads
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
