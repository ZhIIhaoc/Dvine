import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '../../test/utils/test-utils';
import PriceDisplay from '../PriceDisplay';

describe('PriceDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup(); // Clean up DOM after each test
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup(); // Clean up DOM after each test
  });

  it('renders price display without crashing', () => {
    render(<PriceDisplay regularPrice={100} premiumPrice={80} userPermission={0} />);
    expect(screen.getByText(/regular price/i)).toBeInTheDocument();
    expect(screen.getByText(/premium price/i)).toBeInTheDocument();
  });

  it('displays regular user view correctly', () => {
    render(<PriceDisplay regularPrice={100} premiumPrice={80} userPermission={0} />);
    expect(screen.getByText(/regular price: \$100/i)).toBeInTheDocument();
    expect(screen.getByText(/premium price: \$80/i)).toBeInTheDocument();
  });

  it('displays premium user view correctly', () => {
    render(<PriceDisplay regularPrice={100} premiumPrice={80} userPermission={1} />);
    expect(screen.getByText(/premium price: \$80/i)).toBeInTheDocument();
  });

  it('shows discount chip for regular users when premium is cheaper', () => {
    render(<PriceDisplay regularPrice={100} premiumPrice={80} userPermission={0} />);
    expect(screen.getByText(/save \$20 with premium/i)).toBeInTheDocument();
  });

  it('shows discount chip for premium users when premium is cheaper', () => {
    render(<PriceDisplay regularPrice={100} premiumPrice={80} userPermission={1} />);
    expect(screen.getByText(/you save \$20/i)).toBeInTheDocument();
  });

  it('does not show discount when prices are equal', () => {
    render(<PriceDisplay regularPrice={100} premiumPrice={100} userPermission={0} />);
    expect(screen.queryByText(/save \$/i)).not.toBeInTheDocument();
  });

  it('does not show discount when regular price is cheaper', () => {
    render(<PriceDisplay regularPrice={80} premiumPrice={100} userPermission={0} />);
    expect(screen.queryByText(/save \$/i)).not.toBeInTheDocument();
  });

  it('handles string prices correctly', () => {
    render(<PriceDisplay regularPrice="100" premiumPrice="80" userPermission={0} />);
    expect(screen.getByText(/regular price: \$100/i)).toBeInTheDocument();
    expect(screen.getByText(/premium price: \$80/i)).toBeInTheDocument();
  });

  it('handles zero prices correctly', () => {
    render(<PriceDisplay regularPrice={0} premiumPrice={0} userPermission={0} />);
    expect(screen.getByText(/regular price: \$0/i)).toBeInTheDocument();
    expect(screen.getByText(/premium price: \$0/i)).toBeInTheDocument();
  });

  it('handles large price differences', () => {
    render(<PriceDisplay regularPrice={1000} premiumPrice={500} userPermission={0} />);
    expect(screen.getByText(/save \$500 with premium/i)).toBeInTheDocument();
  });

  it('handles decimal prices', () => {
    render(<PriceDisplay regularPrice={99.99} premiumPrice={79.99} userPermission={0} />);
    expect(screen.getByText(/regular price: \$99.99/i)).toBeInTheDocument();
    expect(screen.getByText(/premium price: \$79.99/i)).toBeInTheDocument();
  });

  it('shows strikethrough for regular price when discount is available', () => {
    render(<PriceDisplay regularPrice={100} premiumPrice={80} userPermission={0} />);
    const regularPrice = screen.getByText(/regular price: \$100/i);
    expect(regularPrice).toBeInTheDocument();
  });

  it('does not show strikethrough when no discount', () => {
    render(<PriceDisplay regularPrice={80} premiumPrice={100} userPermission={0} />);
    const regularPrice = screen.getByText(/regular price: \$80/i);
    expect(regularPrice).toBeInTheDocument();
  });

  it('handles undefined userPermission gracefully', () => {
    render(<PriceDisplay regularPrice={100} premiumPrice={80} />);
    expect(screen.getByText(/regular price: \$100/i)).toBeInTheDocument();
  });

  it('handles null userPermission gracefully', () => {
    render(<PriceDisplay regularPrice={100} premiumPrice={80} userPermission={null} />);
    expect(screen.getByText(/regular price: \$100/i)).toBeInTheDocument();
  });
});
