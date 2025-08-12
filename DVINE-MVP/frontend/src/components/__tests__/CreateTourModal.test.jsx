import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '../../test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { CreateTourModal } from '../CreateTourModal';

// Mock the CreateTourForm component
vi.mock('../CreateTourForm', () => ({
  default: ({ onClose, catalogueList }) => (
    <div data-testid="create-tour-form">
      <button onClick={onClose}>Close Form</button>
      <div>Form with {catalogueList?.length || 0} catalogues</div>
    </div>
  ),
}));

describe('CreateTourModal', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup(); // Clean up DOM after each test
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup(); // Clean up DOM after each test
  });

  it('renders modal without crashing', () => {
    render(<CreateTourModal open={true} onClose={() => {}} catalogueList={[]} />);
    expect(screen.getByTestId('create-tour-form')).toBeInTheDocument();
  });

  it('renders CreateTourForm component', () => {
    render(<CreateTourModal open={true} onClose={() => {}} catalogueList={[]} />);
    expect(screen.getByTestId('create-tour-form')).toBeInTheDocument();
  });

  it('passes onClose prop to CreateTourForm', async () => {
    const mockOnClose = vi.fn();
    render(<CreateTourModal open={true} onClose={mockOnClose} catalogueList={[]} />);
    
    const closeButton = screen.getByText('Close Form');
    await user.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('passes catalogueList prop to CreateTourForm', () => {
    const catalogueList = [
      { id: 1, title: 'Catalogue 1' },
      { id: 2, title: 'Catalogue 2' }
    ];
    render(<CreateTourModal open={true} onClose={() => {}} catalogueList={catalogueList} />);
    
    expect(screen.getByText('Form with 2 catalogues')).toBeInTheDocument();
  });

  it('handles empty catalogueList', () => {
    render(<CreateTourModal open={true} onClose={() => {}} catalogueList={[]} />);
    expect(screen.getByText('Form with 0 catalogues')).toBeInTheDocument();
  });

  it('handles undefined catalogueList', () => {
    render(<CreateTourModal open={true} onClose={() => {}} />);
    expect(screen.getByText('Form with 0 catalogues')).toBeInTheDocument();
  });

  it('handles null catalogueList', () => {
    render(<CreateTourModal open={true} onClose={() => {}} catalogueList={null} />);
    expect(screen.getByText('Form with 0 catalogues')).toBeInTheDocument();
  });

  it('renders when open is true', () => {
    render(<CreateTourModal open={true} onClose={() => {}} catalogueList={[]} />);
    expect(screen.getByTestId('create-tour-form')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(<CreateTourModal open={false} onClose={() => {}} catalogueList={[]} />);
    expect(screen.queryByTestId('create-tour-form')).not.toBeInTheDocument();
  });

  it('handles large catalogueList', () => {
    const largeCatalogueList = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      title: `Catalogue ${i + 1}`
    }));
    render(<CreateTourModal open={true} onClose={() => {}} catalogueList={largeCatalogueList} />);
    
    expect(screen.getByText('Form with 100 catalogues')).toBeInTheDocument();
  });

  it('passes all props correctly', () => {
    const mockOnClose = vi.fn();
    const catalogueList = [{ id: 1, title: 'Test Catalogue' }];
    
    render(<CreateTourModal open={true} onClose={mockOnClose} catalogueList={catalogueList} />);
    
    expect(screen.getByTestId('create-tour-form')).toBeInTheDocument();
    expect(screen.getByText('Form with 1 catalogues')).toBeInTheDocument();
  });
});
