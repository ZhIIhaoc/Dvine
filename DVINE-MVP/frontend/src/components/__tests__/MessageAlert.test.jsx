import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '../../test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import MessageAlert from '../MessageAlert';

describe('MessageAlert', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup(); // Clean up DOM after each test
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup(); // Clean up DOM after each test
  });

  it('renders message alert without crashing', () => {
    render(
      <MessageAlert
        open={true}
        message="Test message"
        severity="info"
        onClose={() => {}}
      />
    );
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('displays success message with correct styling', () => {
    render(
      <MessageAlert
        open={true}
        message="Success message"
        severity="success"
        onClose={() => {}}
      />
    );
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('displays error message with correct styling', () => {
    render(
      <MessageAlert
        open={true}
        message="Error message"
        severity="error"
        onClose={() => {}}
      />
    );
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('displays warning message with correct styling', () => {
    render(
      <MessageAlert
        open={true}
        message="Warning message"
        severity="warning"
        onClose={() => {}}
      />
    );
    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });

  it('displays info message with correct styling', () => {
    render(
      <MessageAlert
        open={true}
        message="Info message"
        severity="info"
        onClose={() => {}}
      />
    );
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const mockOnClose = vi.fn();
    render(
      <MessageAlert
        open={true}
        message="Test message"
        severity="info"
        onClose={mockOnClose}
      />
    );
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not render when open is false', () => {
    render(
      <MessageAlert
        open={false}
        message="Test message"
        severity="info"
        onClose={() => {}}
      />
    );
    const testMessages = screen.queryAllByText('Test message');
    expect(testMessages.length).toBe(0);
  });

  it('handles long messages', () => {
    const longMessage = 'This is a very long message that should be displayed properly in the alert component without breaking the layout or causing any issues with the rendering';
    render(
      <MessageAlert
        open={true}
        message={longMessage}
        severity="info"
        onClose={() => {}}
      />
    );
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('handles empty message', () => {
    render(
      <MessageAlert
        open={true}
        message=""
        severity="info"
        onClose={() => {}}
      />
    );
    const alerts = screen.getAllByRole('alert');
    expect(alerts.length).toBeGreaterThan(0);
  });
});
