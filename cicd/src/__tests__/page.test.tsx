import React from 'react';
import { render } from '@testing-library/react';
import Home from '../app/page';

describe('Home Page', () => {
  it('renders without crashing', () => {
    const { container } = render(<Home />);
    expect(container).toBeTruthy();
  });

  it('contains hello world heading', () => {
    const { container } = render(<Home />);
    const heading = container.querySelector('h1');
    expect(heading).not.toBeNull();
    expect(heading?.textContent).toMatch(/hello world! 🌍/i);
  });
});
