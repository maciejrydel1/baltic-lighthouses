import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LighthousesClient } from '@/components/LighthousesClient';
import { mockLighthouses } from '@/test/fixtures';
import { Lighthouse } from '@/types/lighthouse';

// Zamockowany Globe3D — renderuje przyciski dla każdej latarni, symulując klik w marker.
vi.mock('@/components/Globe3D', () => ({
  Globe3D: ({
    lighthouses,
    onSelect,
  }: {
    lighthouses: Lighthouse[];
    onSelect: (l: Lighthouse) => void;
  }) => (
    <div data-testid="globe-3d">
      {lighthouses.map((l) => (
        <button key={l.id} onClick={() => onSelect(l)}>
          {l.name}
        </button>
      ))}
    </div>
  ),
}));

describe('LighthousesClient', () => {
  it('renders title and total lighthouse count', () => {
    render(<LighthousesClient lighthouses={mockLighthouses} />);

    expect(screen.getByText('Latarnie Bałtyku')).toBeInTheDocument();
    expect(
      screen.getByText(`${mockLighthouses.length} latarni morskich na Morzu Bałtyckim`)
    ).toBeInTheDocument();
  });

  it('filters lighthouses by search query', async () => {
    render(<LighthousesClient lighthouses={mockLighthouses} />);

    const input = screen.getByLabelText('Wyszukaj latarnię');
    await userEvent.type(input, 'Hel');

    expect(screen.getByText('Hel')).toBeInTheDocument();
    expect(screen.queryByText('Świnoujście')).not.toBeInTheDocument();
  });

  it('filters lighthouses by country', async () => {
    render(<LighthousesClient lighthouses={mockLighthouses} />);

    await userEvent.click(screen.getByText('Finlandia'));

    expect(screen.getByText('Bengtskär')).toBeInTheDocument();
    expect(screen.queryByText('Świnoujście')).not.toBeInTheDocument();
  });

  it('opens panel when a lighthouse is selected', async () => {
    render(<LighthousesClient lighthouses={mockLighthouses} />);

    await userEvent.click(screen.getByText('Świnoujście'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Latarnia Morska Świnoujście')).toBeInTheDocument();
  });

  it('closes panel when close button clicked', async () => {
    render(<LighthousesClient lighthouses={mockLighthouses} />);

    await userEvent.click(screen.getByText('Świnoujście'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Zamknij panel'));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
