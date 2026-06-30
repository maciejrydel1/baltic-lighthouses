import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from '@/components/FilterBar';
import { LighthouseFilters } from '@/lib/filters';

describe('FilterBar', () => {
  const defaultFilters: LighthouseFilters = {
    countries: [],
    statuses: [],
    constructionCategories: [],
  };

  it('renders all filter sections', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        availableCountries={['PL', 'FI', 'EE']}
        onChange={() => {}}
      />
    );

    expect(screen.getByText('Kraj')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Typ konstrukcji')).toBeInTheDocument();
  });

  it('toggles country filter', async () => {
    const handleChange = vi.fn();
    render(
      <FilterBar
        filters={defaultFilters}
        availableCountries={['PL', 'FI']}
        onChange={handleChange}
      />
    );

    await userEvent.click(screen.getByText('Polska'));
    expect(handleChange).toHaveBeenCalledWith({
      countries: ['PL'],
      statuses: [],
      constructionCategories: [],
    });
  });

  it('toggles status filter', async () => {
    const handleChange = vi.fn();
    render(
      <FilterBar
        filters={defaultFilters}
        availableCountries={['PL']}
        onChange={handleChange}
      />
    );

    await userEvent.click(screen.getByText('Aktywna'));
    expect(handleChange).toHaveBeenCalledWith({
      countries: [],
      statuses: ['active'],
      constructionCategories: [],
    });
  });

  it('shows clear button when filters are active', () => {
    render(
      <FilterBar
        filters={{ ...defaultFilters, countries: ['PL'] }}
        availableCountries={['PL']}
        onChange={() => {}}
      />
    );

    expect(screen.getByText('Wyczyść')).toBeInTheDocument();
  });

  it('clears all filters when clear button clicked', async () => {
    const handleChange = vi.fn();
    render(
      <FilterBar
        filters={{ ...defaultFilters, countries: ['PL'], statuses: ['active'] }}
        availableCountries={['PL']}
        onChange={handleChange}
      />
    );

    await userEvent.click(screen.getByText('Wyczyść'));
    expect(handleChange).toHaveBeenCalledWith(defaultFilters);
  });

  it('displays result count', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        availableCountries={['PL', 'FI']}
        resultCount={2}
        totalCount={5}
        onChange={() => {}}
      />
    );

    expect(screen.getByText(/Wyniki:/)).toHaveTextContent('Wyniki: 2 / 5');
  });
});
