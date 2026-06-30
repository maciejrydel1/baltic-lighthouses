import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import React from 'react';

// Mock next/image — w testach nie potrzebujemy optymalizacji obrazów Next.js.
vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) => {
    const { fill, priority, ...rest } = props;
    return React.createElement('img', { ...rest, alt: props.alt || '' });
  },
}));
