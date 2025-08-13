import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '../../test/utils/test-utils';
import UserListModal from '../UserListModal';

// Mock the UserListForm component
vi.mock('../UserListForm.jsx', () => ({
  default: ({ onClose }) => (
    <div data-testid="user-list-form">
      <button onClick={onClose}>Close User List</button>
      <div>User List Form Content</div>
    </div>
  ),
}));

describe('UserListModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup(); // Clean up DOM after each test
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup(); // Clean up DOM after each test
  });

  it('renders modal without crashing', () => {
    render(<UserListModal open={true} onClose={() => {}} />);
    expect(screen.getByTestId('user-list-form')).toBeInTheDocument();
  });

  it('renders UserListForm component', () => {
    render(<UserListModal open={true} onClose={() => {}} />);
    expect(screen.getByTestId('user-list-form')).toBeInTheDocument();
  });

  it('passes onClose prop to UserListForm', () => {
    render(<UserListModal open={true} onClose={() => {}} />);
    expect(screen.getByText('Close User List')).toBeInTheDocument();
  });

  it('displays form content', () => {
    render(<UserListModal open={true} onClose={() => {}} />);
    expect(screen.getByText('User List Form Content')).toBeInTheDocument();
  });

  it('renders when open is true', () => {
    render(<UserListModal open={true} onClose={() => {}} />);
    expect(screen.getByTestId('user-list-form')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(<UserListModal open={false} onClose={() => {}} />);
    expect(screen.queryByTestId('user-list-form')).not.toBeInTheDocument();
  });

  it('handles undefined onClose prop', () => {
    render(<UserListModal open={true} />);
    expect(screen.getByTestId('user-list-form')).toBeInTheDocument();
  });

  it('handles null onClose prop', () => {
    render(<UserListModal open={true} onClose={null} />);
    expect(screen.getByTestId('user-list-form')).toBeInTheDocument();
  });

  it('renders modal structure correctly', () => {
    render(<UserListModal open={true} onClose={() => {}} />);
    const form = screen.getByTestId('user-list-form');
    expect(form).toBeInTheDocument();
    expect(form.parentElement).toBeInTheDocument();
  });

  it('handles rapid open/close state changes', () => {
    const { rerender } = render(<UserListModal open={true} onClose={() => {}} />);
    const userListForms = screen.getAllByTestId('user-list-form');
    expect(userListForms.length).toBeGreaterThan(0);

    rerender(<UserListModal open={false} onClose={() => {}} />);
    expect(screen.queryByTestId('user-list-form')).not.toBeInTheDocument();
  });
});
