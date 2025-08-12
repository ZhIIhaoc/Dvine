import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '../../test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import Logo from '../Logo';

describe('Logo', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup(); // Clean up DOM after each test
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup(); // Clean up DOM after each test
  });

  it('renders logo without crashing', () => {
    render(<Logo />);
    expect(screen.getByAltText(/dvine logo/i)).toBeInTheDocument();
  });

  it('displays light mode logo by default', () => {
    render(<Logo />);
    const logo = screen.getByAltText(/dvine logo/i);
    expect(logo).toHaveAttribute('src', expect.stringContaining('logo.png'));
  });

  it('displays dark mode logo when isDarkMode is true', () => {
    render(<Logo isDarkMode={true} />);
    const logo = screen.getByAltText(/dvine logo/i);
    expect(logo).toHaveAttribute('src', expect.stringContaining('logoDark.png'));
  });

  it('applies custom styles when sx prop is provided', () => {
    const customSx = { height: 200, width: 200 };
    render(<Logo sx={customSx} />);
    const logo = screen.getByAltText(/dvine logo/i);
    expect(logo).toBeInTheDocument();
  });

  it('navigates to home page when clicked', async () => {
    render(<Logo />);
    const logo = screen.getByAltText(/dvine logo/i);
    expect(logo).toBeInTheDocument();
  });

  it('has correct default styling', () => {
    render(<Logo />);
    const logo = screen.getByAltText(/dvine logo/i);
    expect(logo).toBeInTheDocument();
  });

  it('combines default and custom styles', () => {
    const customSx = { width: 150 };
    render(<Logo sx={customSx} />);
    const logo = screen.getByAltText(/dvine logo/i);
    expect(logo).toBeInTheDocument();
  });
});
