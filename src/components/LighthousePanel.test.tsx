import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LighthousePanel } from '@/components/LighthousePanel';
import { mockLighthouses } from '@/test/fixtures';

describe('LighthousePanel', () => {
  it('does not render when no lighthouse is selected', () => {
    const { container } = render(
      <LighthousePanel lighthouse={null} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders lighthouse details', () => {
    const lighthouse = mockLighthouses[0];
    render(<LighthousePanel lighthouse={lighthouse} onClose={() => {}} />);

    expect(screen.getByText(lighthouse.name)).toBeInTheDocument();
    expect(screen.getByText('Polska')).toBeInTheDocument();
    expect(screen.getByText('Aktywna')).toBeInTheDocument();
    expect(screen.getByText('1857')).toBeInTheDocument();
    expect(screen.getByText('65 m')).toBeInTheDocument();
    expect(screen.getByText('26 Mm')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const handleClose = vi.fn();
    render(<LighthousePanel lighthouse={mockLighthouses[0]} onClose={handleClose} />);

    const closeButton = screen.getByLabelText('Zamknij panel');
    await userEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders Wikipedia link when available', () => {
    const lighthouse = mockLighthouses[0];
    render(<LighthousePanel lighthouse={lighthouse} onClose={() => {}} />);

    const link = screen.getByText('Wikipedia');
    expect(link).toHaveAttribute('href', lighthouse.wikipediaUrl);
    expect(link).toHaveAttribute('target', '_blank');
  });
});
