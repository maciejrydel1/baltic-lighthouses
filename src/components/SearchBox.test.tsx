import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBox } from '@/components/SearchBox';

// Wrapper ze stanem — potrzebny do testowania wpisywania w kontrolowany input.
function ControlledSearchBox({
  initialValue = '',
  onChange,
}: {
  initialValue?: string;
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <SearchBox
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    />
  );
}

describe('SearchBox', () => {
  it('renders input with placeholder', () => {
    render(<SearchBox value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Wyszukaj latarnię')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Szukaj latarni...')).toBeInTheDocument();
  });

  it('calls onChange when typing', async () => {
    const handleChange = vi.fn();
    render(<ControlledSearchBox onChange={handleChange} />);

    const input = screen.getByLabelText('Wyszukaj latarnię');
    await userEvent.type(input, 'Hel');

    expect(handleChange).toHaveBeenCalledTimes(3);
    expect(handleChange).toHaveBeenLastCalledWith('Hel');
  });

  it('clears value when clear button is clicked', async () => {
    const handleChange = vi.fn();
    render(<SearchBox value="Hel" onChange={handleChange} />);

    const clearButton = screen.getByLabelText('Wyczyść wyszukiwanie');
    await userEvent.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith('');
  });

  it('uses custom placeholder', () => {
    render(<SearchBox value="" onChange={() => {}} placeholder="Test" />);
    expect(screen.getByPlaceholderText('Test')).toBeInTheDocument();
  });
});
