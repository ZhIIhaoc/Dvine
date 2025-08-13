import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '../../test/utils/test-utils';
import CreateCatalogueModal from '../CreateCatalogueModal';

// Mock the CreateCatalogueForm component
vi.mock('../CreateCatalogueForm.jsx', () => ({
  default: ({ onClose, ...rest }) => (
    <div data-testid="create-catalogue-form">
      <button onClick={onClose}>Close Form</button>
      <div>Form with {Object.keys(rest).length} additional props</div>
    </div>
  ),
}));

describe('CreateCatalogueModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup(); // Clean up DOM after each test
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup(); // Clean up DOM after each test
  });

  it('renders modal without crashing', () => {
    render(<CreateCatalogueModal open={true} onClose={() => {}} />);
    expect(screen.getByTestId('create-catalogue-form')).toBeInTheDocument();
  });

  it('renders CreateCatalogueForm component', () => {
    render(<CreateCatalogueModal open={true} onClose={() => {}} />);
    expect(screen.getByTestId('create-catalogue-form')).toBeInTheDocument();
  });

  it('passes onClose prop to CreateCatalogueForm', () => {
    render(<CreateCatalogueModal open={true} onClose={() => {}} />);
    expect(screen.getByText('Close Form')).toBeInTheDocument();
  });

  it('passes additional props to CreateCatalogueForm', () => {
    render(<CreateCatalogueModal open={true} onClose={() => {}} prop1="value1" prop2="value2" />);
    expect(screen.getByText('Form with 2 additional props')).toBeInTheDocument();
  });

  it('handles no additional props', () => {
    render(<CreateCatalogueModal open={true} onClose={() => {}} />);
    expect(screen.getByText('Form with 0 additional props')).toBeInTheDocument();
  });

  it('renders when open is true', () => {
    render(<CreateCatalogueModal open={true} onClose={() => {}} />);
    expect(screen.getByTestId('create-catalogue-form')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(<CreateCatalogueModal open={false} onClose={() => {}} />);
    expect(screen.queryByTestId('create-catalogue-form')).not.toBeInTheDocument();
  });

  it('handles multiple additional props', () => {
    render(
      <CreateCatalogueModal 
        open={true} 
        onClose={() => {}} 
        prop1="value1" 
        prop2="value2" 
        prop3="value3"
        prop4="value4"
      />
    );
    expect(screen.getByText('Form with 4 additional props')).toBeInTheDocument();
  });

  it('handles undefined props gracefully', () => {
    render(<CreateCatalogueModal open={true} onClose={() => {}} prop1={undefined} />);
    expect(screen.getByText('Form with 1 additional props')).toBeInTheDocument();
  });

  it('handles null props gracefully', () => {
    render(<CreateCatalogueModal open={true} onClose={() => {}} prop1={null} />);
    expect(screen.getByText('Form with 1 additional props')).toBeInTheDocument();
  });

  it('handles complex prop objects', () => {
    const complexProp = { nested: { value: 'test' } };
    render(<CreateCatalogueModal open={true} onClose={() => {}} complexProp={complexProp} />);
    expect(screen.getByText('Form with 1 additional props')).toBeInTheDocument();
  });
});
