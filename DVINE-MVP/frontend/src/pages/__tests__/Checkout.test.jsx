import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '../../test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import Checkout from '../Checkout';

// Mock data
const mockAuthValue = {
  token: 'test-token',
  user: { userId: 1, email: 'test@example.com' },
  setToken: vi.fn(),
  logout: vi.fn(),
};

const mockTour = {
  tourId: 1,
  title: 'Test Tour',
  destination: 'Test Destination',
  description: 'Test Description',
  regularPrice: 100,
  premiumPrice: 80,
  images: ['image1.jpg'],
  catalogueId: 1,
  catalogueName: 'Test Catalogue',
  creatorId: 1,
  creatorName: 'Test Creator',
  status: 'APPROVED',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

// Mock the Logo component
vi.mock('../../components/Logo.jsx', () => ({
  default: () => <div data-testid="logo">DVINE Logo</div>
}));

// Mock the MessageAlert component
vi.mock('../../components/MessageAlert.jsx', () => ({
  default: ({ open, message, severity, onClose }) => (
    open ? (
      <div data-testid="message-alert" data-severity={severity}>
        {message}
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
  ),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the fetchTourById function
vi.mock('../../endpoints/CatalogueEndpoints', () => ({
  fetchTourById: vi.fn(),
}));

// Mock MUI DatePicker to avoid window.matchMedia issues
vi.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({ label, value, onChange }) => (
    <div data-testid="date-picker">
      <label>{label}</label>
      <input 
        type="date" 
        value={value ? value.toISOString().split('T')[0] : ''} 
        onChange={(e) => onChange && onChange(new Date(e.target.value))}
      />
    </div>
  ),
}));

// Mock remove-markdown
vi.mock('remove-markdown', () => ({
  default: (text) => text,
}));

describe('Checkout', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockNavigate.mockClear();
    cleanup(); // Clean up DOM after each test
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup(); // Clean up DOM after each test
  });

  it('renders checkout page with loading state initially', () => {
    render(<Checkout />, {
      authValue: mockAuthValue
    });
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays tour information when loaded successfully', async () => {
    const { fetchTourById } = await import('../../endpoints/CatalogueEndpoints');
    fetchTourById.mockResolvedValue({ code: 0, data: mockTour });
    
    render(<Checkout />, {
      authValue: mockAuthValue
    });
    
    await waitFor(() => {
      expect(screen.getByText('Checkout')).toBeInTheDocument();
    });
    
    expect(screen.getByText(mockTour.title)).toBeInTheDocument();
    expect(screen.getByText(mockTour.destination)).toBeInTheDocument();
  });

  it('shows error message when tour is not found', async () => {
    const { fetchTourById } = await import('../../endpoints/CatalogueEndpoints');
    fetchTourById.mockResolvedValue({ code: 1, data: null });
    
    render(<Checkout />, {
      authValue: mockAuthValue
    });
    
    await waitFor(() => {
      expect(screen.getByText('Tour not found.')).toBeInTheDocument();
    });
  });

  it('displays back button with correct navigation', async () => {
    const { fetchTourById } = await import('../../endpoints/CatalogueEndpoints');
    fetchTourById.mockResolvedValue({ code: 0, data: mockTour });
    
    render(<Checkout />, {
      authValue: mockAuthValue
    });
    
    await waitFor(() => {
      expect(screen.getByText('Back to Experience Page')).toBeInTheDocument();
    });
  });

  it('handles empty tour description', async () => {
    const tourWithoutDescription = {
      ...mockTour,
      description: ''
    };
    
    const { fetchTourById } = await import('../../endpoints/CatalogueEndpoints');
    fetchTourById.mockResolvedValue({ code: 0, data: tourWithoutDescription });
    
    render(<Checkout />, {
      authValue: mockAuthValue
    });
    
    await waitFor(() => {
      expect(screen.getByText('Checkout')).toBeInTheDocument();
      expect(screen.getByText(tourWithoutDescription.title)).toBeInTheDocument();
    });
  });

  it('displays date picker and quantity input', async () => {
    const { fetchTourById } = await import('../../endpoints/CatalogueEndpoints');
    fetchTourById.mockResolvedValue({ code: 0, data: mockTour });
    
    render(<Checkout />, {
      authValue: mockAuthValue
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('date-picker')).toBeInTheDocument();
      expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const { fetchTourById } = await import('../../endpoints/CatalogueEndpoints');
    // Mock API returning error response
    fetchTourById.mockResolvedValue({ code: 1, data: null, message: 'Tour not found' });
    
    render(<Checkout />, {
      authValue: mockAuthValue
    });
    
    await waitFor(() => {
      expect(screen.getByText('Tour not found.')).toBeInTheDocument();
    });
  });
});
