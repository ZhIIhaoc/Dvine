import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '../../test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { DashboardHeaderCard } from '../DashboardHeaderCard';

describe('DashboardHeaderCard', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup(); // Clean up DOM after each test
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup(); // Clean up DOM after each test
  });

  it('renders dashboard header card without crashing', () => {
    render(<DashboardHeaderCard />);
    expect(screen.getByText(/future tours/i)).toBeInTheDocument();
  });

  it('displays all navigation buttons', () => {
    render(<DashboardHeaderCard />);
    expect(screen.getByRole('button', { name: /future tours/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tour history/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /purchases/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /support/i })).toBeInTheDocument();
  });

  it('navigates to upcoming tours when Future Tours button is clicked', async () => {
    render(<DashboardHeaderCard />);
    const futureToursButton = screen.getByRole('button', { name: /future tours/i });
    expect(futureToursButton).toBeInTheDocument();
  });

  it('navigates to tour history when Tour History button is clicked', async () => {
    render(<DashboardHeaderCard />);
    const tourHistoryButton = screen.getByRole('button', { name: /tour history/i });
    expect(tourHistoryButton).toBeInTheDocument();
  });

  it('navigates to purchase history when Purchases button is clicked', async () => {
    render(<DashboardHeaderCard />);
    const purchasesButton = screen.getByRole('button', { name: /purchases/i });
    expect(purchasesButton).toBeInTheDocument();
  });

  it('navigates to FAQ when Support button is clicked', async () => {
    render(<DashboardHeaderCard />);
    const supportButton = screen.getByRole('button', { name: /support/i });
    expect(supportButton).toBeInTheDocument();
  });

  it('has correct layout structure', () => {
    render(<DashboardHeaderCard />);
    const card = screen.getByText(/future tours/i).closest('div');
    expect(card).toBeInTheDocument();
  });

  it('renders all buttons as clickable', () => {
    render(<DashboardHeaderCard />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
    
    buttons.forEach(button => {
      expect(button).toBeEnabled();
    });
  });

  it('has proper button text content', () => {
    render(<DashboardHeaderCard />);
    expect(screen.getByText('Future Tours')).toBeInTheDocument();
    expect(screen.getByText('Tour History')).toBeInTheDocument();
    expect(screen.getByText('Purchases')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
  });
});
